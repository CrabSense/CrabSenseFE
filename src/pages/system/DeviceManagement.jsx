import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import systemAdminService from "../../services/systemAdminService";
import { SystemPageHeader, SystemState } from "../../components/system/SystemChrome";
import DeviceStats from "./devices/DeviceStats";
import DeviceFilters from "./devices/DeviceFilters";
import DeviceTable from "./devices/DeviceTable";
import DeviceDetailDrawer from "./devices/DeviceDetailDrawer";
import AddDeviceWizard from "./devices/AddDeviceWizard";
import { duplicateSummary, mapDeviceRows } from "./devices/rows";
import { deviceKind } from "./deviceModel";

function DeviceManagement({ kind = "all" }) {
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locationError, setLocationError] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(kind);
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [firmwareFilter, setFirmwareFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(null);
  const [tabRequest, setTabRequest] = useState(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [deviceRows, sensorRows, areaRows, scheduleRows] = await Promise.all([
        systemAdminService.getDevices(),
        systemAdminService.getSensorInventory({}),
        systemAdminService.getDeviceLocations().then(value => { setLocationError(""); return value; }).catch(err => { setLocationError(err?.message || "Không tải được khu/dãy."); return null; }),
        systemAdminService.getRecordingSchedules().catch(() => []),
      ]);
      setDevices(deviceRows);
      setSensors(sensorRows);
      if (areaRows !== null) setAreas(areaRows);
      setSchedules(scheduleRows);
    } catch (loadError) {
      setError(loadError?.message || "Không tải được danh sách thiết bị.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => mapDeviceRows(devices, sensors).filter(row => kind === "all" || row.type === kind), [devices, sensors, kind]);
  const areaOptions = useMemo(
    () => [...new Set(rows.map((row) => row.area).filter(Boolean))].sort(),
    [rows],
  );
  const firmwareOptions = useMemo(
    () => [...new Set(rows.map((row) => row.firmware).filter(Boolean))].sort(),
    [rows],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const typeOk = typeFilter === "all" || row.type === typeFilter;
      const statusOk = statusFilter === "all"
        || row.statusKey === statusFilter
        || (statusFilter === "warning" && row.issues.length > 0);
      const areaOk = areaFilter === "all" || row.area === areaFilter;
      const firmwareOk = firmwareFilter === "all" || row.firmware === firmwareFilter;
      const haystack = `${row.code} ${row.name} ${row.ip} ${row.mac}`.toLowerCase();
      return typeOk && statusOk && areaOk && firmwareOk && (!needle || haystack.includes(needle));
    });
  }, [areaFilter, firmwareFilter, query, rows, statusFilter, typeFilter]);

  const exportCsv = () => {
    const header = ["code", "name", "type", "location", "ip", "mac", "status", "lastSeen", "firmware"];
    const lines = filtered.map((row) => header.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "crabsense-devices.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openDrawer = (row, tab) => {
    setSelected(row);
    setTabRequest({ tab, nonce: Date.now() });
  };

  const confirmPending = async () => {
    if (!pending) return;
    const { type, row } = pending;
    setError("");
    try {
      if (type === "restart") {
        await systemAdminService.restartDevice(row.id);
        setNotice(row.statusKey === "offline"
          ? `Đã xếp lệnh khởi động lại ${row.code}.`
          : `Đã gửi lệnh khởi động lại ${row.code}.`);
      }
      if (type === "firmware") {
        if (!pending.firmware?.trim()) {
          setNotice("Nhập phiên bản firmware.");
          return;
        }
        await systemAdminService.updateFirmware(row.id, pending.firmware.trim());
        setNotice(`Đã ghi firmware ${pending.firmware.trim()} cho ${row.code}.`);
      }
      if (type === "copy") {
        if (!pending.targetId) {
          setNotice("Chọn thiết bị nhận cấu hình.");
          return;
        }
        if (row.source === "sensor") {
          const [source,target]=await Promise.all([systemAdminService.getSensorConfiguration(row.id),systemAdminService.getSensorConfiguration(pending.targetId)]);
          if(source.samplingIntervalSeconds==null) throw new Error("Sensor nguồn chưa có chu kỳ lấy mẫu.");
          await systemAdminService.saveSensorConfiguration(pending.targetId,{samplingIntervalSeconds:source.samplingIntervalSeconds,disconnectTimeoutSeconds:source.disconnectTimeoutSeconds,expectedVersion:target.configurationVersion});
        } else {
          await systemAdminService.updateDevice(pending.targetId, {
            resolution: row.raw.resolution || "",
            note: row.raw.note || row.raw.notes || "",
          });
        }
        setNotice(`Đã sao chép thông số từ ${row.code}. Mã, IP và MAC không được sao chép.`);
      }
      if (type === "disable") {
        if (row.source === "sensor") await systemAdminService.disableSensor(row.id);
        else await systemAdminService.disableDevice(row.id);
        setNotice(`${row.code} đã vô hiệu hóa.`);
      }
      if (type === "enable") {
        if (row.source === "sensor") await systemAdminService.enableSensor(row.id);
        else if (row.type === "camera") await systemAdminService.enableCamera(row.id);
        else await systemAdminService.updateDevice(row.id, { status: "Online" });
        setNotice(row.type === "camera" ? `${row.code} đã cho phép hoạt động; chờ heartbeat xác thực.` : `${row.code} đã được kích hoạt lại.`);
      }
      if (type === "remove") {
        if (row.source === "sensor") await systemAdminService.deleteSensor(row.id);
        else await systemAdminService.deleteDevice(row.id);
        if (selected?.id === row.id) setSelected(null);
        setNotice(`${row.code} đã được gỡ. Audit log đã ghi với thiết bị.`);
      }
      setPending(null);
      load(true);
    } catch (actionError) {
      setNotice(actionError?.message || "Thao tác thất bại.");
    }
  };

  const onAction = async (row, action) => {
    if(row.source==="sensor" && ["view","latest","diagnostics","abnormal","logs","config","assign","calibrate","sample"].includes(action)){
      const tab=["logs"].includes(action)?"events":["config","assign","calibrate","sample"].includes(action)?"config":"list";
      navigate("/system/devices/sensors?sensorId="+encodeURIComponent(row.id)+"&tab="+tab+(action==="assign"?"&edit=1":""));return;
    }
    const tabs = {
      view: "info",
      preview: "info",
      latest: "info",
      io: "info",
      relay: "info",
      actuators: "info",
      mapping: "info",
      config: "config",
      assign: "config",
      stream: "config",
      calibrate: "config",
      diagnostics: "diagnostics",
      abnormal: "diagnostics",
      heartbeat: "diagnostics",
      logs: "logs",
    };
    if (tabs[action]) {
      openDrawer(row, tabs[action]);
      return;
    }
    if (action === "recording") {
      navigate("/system/cameras");
      return;
    }
    if (action === "rtsp") {
      try {
        const result = await systemAdminService.testConnection(row.id);
        setNotice(result?.message || "Đã kiểm tra kết nối.");
        openDrawer(row, "diagnostics");
      } catch (actionError) {
        setNotice(actionError?.message || "Không kiểm tra được luồng.");
      }
      return;
    }
    if (["restart", "firmware", "copy", "disable", "enable", "remove"].includes(action)) {
      setPending({
        type: action,
        row,
        firmware: row.firmware || "",
        targetId: "",
      });
    }
  };

  const schedule = schedules.find((item) => item.deviceId === selected?.id);
  const copyTargets = pending?.type !== "copy" ? [] : pending.row.source === "sensor"
    ? sensors.filter((item) => item.id !== pending.row.id && item.sensorType === pending.row.raw.sensorType)
    : devices.filter((item) => item.id !== pending.row.id && deviceKind(item) === pending.row.type && (pending.row.type === "camera" || item.deviceType === pending.row.raw.deviceType));
  const issues = duplicateSummary(devices);

  return (
    <div className="system-workspace system-device-workspace mx-auto flex w-full min-w-0 max-w-[1800px] items-start gap-4 text-[#153b56]">
      <div className="min-w-0 w-full flex-1">
        <SystemPageHeader title={({ camera: "Quản lý Camera", sensor: "Quản lý Sensor", controller: "Quản lý Controller" })[kind] || "Quản lý thiết bị"} description="Quản lý đăng ký, cấu hình và trạng thái thiết bị. Lịch ghi hình nằm ở tab riêng." actions={<>
          <button type="button" onClick={() => load(true)} className="system-secondary-button">Làm mới</button>
          <button type="button" onClick={exportCsv} className="system-secondary-button">Xuất dữ liệu</button>
          <button type="button" disabled={Boolean(locationError)} onClick={() => setCreating(true)} className="system-primary-button">+ Thêm thiết bị</button>
        </>} />
        <SystemState loading={loading} error={error} onRetry={() => load()}>
          <div className="space-y-4">
            {locationError && <p role="alert" className="rounded-xl border border-[#edd29b] bg-[#fff7df] p-3 text-sm text-[#95600d]">Chưa tải được danh sách khu/dãy: {locationError}. Tạm khóa thêm thiết bị và thay đổi vị trí; các thiết bị hiện có vẫn xem được.</p>}
            {notice ? <p className="rounded-2xl border border-[#a4d5c5] bg-[#e8f6ee] px-4 py-3 text-sm text-[#286454]">{notice}</p> : null}
            {issues.codes.length || issues.ips.length ? (
              <div className="rounded-2xl border border-[#edd29b] bg-[#fff7df] p-4 text-sm text-[#95600d]">
                {issues.codes.map((list) => (
                  <p key={list[0].deviceCode}>Mã {list[0].deviceCode} có {list.length} bản ghi. Gỡ bản trùng. Bản ghi mới với cùng mã sẽ bị từ chối.</p>
                ))}
                {issues.ips.map((list) => (
                  <p key={list[0].ipAddress}>IP {list[0].ipAddress} đang dùng chung bởi {list.map((item) => item.deviceCode).join(", ")}.</p>
                ))}
              </div>
            ) : null}
            {kind === "all" ? <DeviceStats
              rows={rows}
              activeType={typeFilter}
              onSelect={(type) => {
                setTypeFilter(type);
                setPage(1);
              }}
            /> : null}
            <DeviceFilters
              query={query}
              onQuery={(value) => { setQuery(value); setPage(1); }}
              typeFilter={typeFilter}
              fixedType={kind !== "all"}
              onType={(value) => { setTypeFilter(value); setPage(1); }}
              statusFilter={statusFilter}
              onStatus={(value) => { setStatusFilter(value); setPage(1); }}
              areaFilter={areaFilter}
              onArea={(value) => { setAreaFilter(value); setPage(1); }}
              firmwareFilter={firmwareFilter}
              onFirmware={(value) => { setFirmwareFilter(value); setPage(1); }}
              areas={areaOptions}
              firmwares={firmwareOptions}
            />
            <section className="system-panel rounded-xl border border-[#dcebe8] bg-white p-4">
              <DeviceTable
                rows={filtered}
                page={page}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={(size) => { setPageSize(size); setPage(1); }}
                selectedId={selected?.id}
                onOpen={(row) => openDrawer(row, "info")}
                onAction={onAction}
              />
            </section>
          </div>
        </SystemState>
      </div>
      {selected ? (
        <DeviceDetailDrawer
          row={selected}
          areas={areas}
          locationsAvailable={!locationError}
          schedule={schedule}
          tabRequest={tabRequest}
          onClose={() => setSelected(null)}
          onChanged={() => load(true)}
        />
      ) : null}
      {creating ? (
        <AddDeviceWizard
          initialKind={kind === "all" ? undefined : kind}
          areas={areas}
          devices={devices}
          sensors={sensors}
          onClose={() => setCreating(false)}
          onCreated={() => load(true)}
        />
      ) : null}
      {pending ? (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#dcebe8] bg-white p-5">
            <h2 className="text-lg font-bold">{pending.row.code}</h2>
            {pending.type === "restart" ? <p className="mt-2 text-sm text-[#355b6a]">Gửi lệnh restart. Nếu thiết bị offline, lệnh nằm trong hàng đợi.</p> : null}
            {pending.type === "firmware" ? (
              <label className="mt-3 block text-xs text-[#526f79]">
                Phiên bản firmware
                <input value={pending.firmware} onChange={(event) => setPending({ ...pending, firmware: event.target.value })} className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm text-[#153b56]" />
              </label>
            ) : null}
            {pending.type === "copy" ? (
              <label className="mt-3 block text-xs text-[#526f79]">
                Thiết bị nhận
                <select value={pending.targetId} onChange={(event) => setPending({ ...pending, targetId: event.target.value })} className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm">
                  <option value="">Chọn thiết bị cùng loại</option>
                  {copyTargets.map((item) => <option key={item.id} value={item.id}>{item.deviceCode || item.sensorCode}</option>)}
                </select>
              </label>
            ) : null}
            {pending.type === "disable" ? <p className="mt-2 text-sm text-[#355b6a]">Vô hiệu hóa {pending.row.code}. Thiết bị ngừng tham gia cho đến khi được kích hoạt lại.</p> : null}
            {pending.type === "enable" ? <p className="mt-2 text-sm text-[#355b6a]">Kích hoạt lại {pending.row.code}.</p> : null}
            {pending.type === "remove" ? (
              <p className="mt-2 text-sm text-[#b93838]">
                Gỡ {pending.row.code}? Sensor gắn: {pending.row.raw.sensorCount ?? 0}. Actuator gắn: {pending.row.raw.actuatorCount ?? 0}. Các liên kết được tách trước khi xóa.
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setPending(null)} className="rounded-xl border border-[#c9dfd9] px-3 py-2 text-sm">Hủy</button>
              <button type="button" onClick={confirmPending} className={pending.type === "remove" || pending.type === "disable" ? "rounded-xl bg-[#b93838] px-3 py-2 text-sm font-bold text-white" : "rounded-xl bg-[#147e75] px-3 py-2 text-sm font-bold text-white"}>Xác nhận</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

DeviceManagement.propTypes = { kind: PropTypes.oneOf(["all", "camera", "sensor", "controller"]) };

export default DeviceManagement;
