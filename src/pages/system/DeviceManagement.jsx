import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import systemAdminService from "../../services/systemAdminService";
import farmingService from "../../services/farmingService";
import { SystemState } from "../../components/system/SystemChrome";
import DeviceStats from "./devices/DeviceStats";
import DeviceFilters from "./devices/DeviceFilters";
import DeviceTable from "./devices/DeviceTable";
import DeviceDetailDrawer from "./devices/DeviceDetailDrawer";
import AddDeviceWizard from "./devices/AddDeviceWizard";
import { duplicateSummary, mapDeviceRows } from "./devices/rows";
import { deviceKind } from "./deviceModel";

function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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
        systemAdminService.getSensors(),
        farmingService.getAreas({ isActive: true }).catch(() => []),
        systemAdminService.getRecordingSchedules().catch(() => []),
      ]);
      setDevices(deviceRows);
      setSensors(sensorRows);
      setAreas(areaRows);
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

  const rows = useMemo(() => mapDeviceRows(devices, sensors), [devices, sensors]);
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
          await systemAdminService.updateSensor(pending.targetId, {
            sensorType: row.raw.sensorType,
            unit: row.raw.unit,
            minThreshold: row.raw.minThreshold,
            maxThreshold: row.raw.maxThreshold,
          });
        } else {
          await systemAdminService.updateDevice(pending.targetId, {
            resolution: row.raw.resolution || "",
            note: row.raw.note || row.raw.notes || "",
          });
        }
        setNotice(`Đã sao chép thông số từ ${row.code}. Mã, IP và MAC không được sao chép.`);
      }
      if (type === "disable") {
        if (row.source === "sensor") await systemAdminService.updateSensor(row.id, { isActive: false });
        else await systemAdminService.disableDevice(row.id);
        setNotice(`${row.code} đã vô hiệu hóa.`);
      }
      if (type === "enable") {
        if (row.source === "sensor") await systemAdminService.updateSensor(row.id, { isActive: true });
        else await systemAdminService.updateDevice(row.id, { status: "Online" });
        setNotice(`${row.code} đã được kích hoạt lại.`);
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
    <div className="mx-auto flex w-full min-w-0 max-w-[1600px] items-start gap-4 text-[#F4F7F4]">
      <div className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.6px]">Quản lý thiết bị</h1>
            <p className="mt-1 max-w-[640px] text-sm text-[#9AAB9E]">
              Camera, cảm biến và bộ điều khiển đang có trên API. Lịch ghi hình chi tiết nằm ở Camera & Ghi hình.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => load(true)} className="h-10 rounded-xl border border-white/15 px-3 text-sm">Làm mới</button>
            <button type="button" onClick={exportCsv} className="h-10 rounded-xl border border-white/15 px-3 text-sm">Xuất dữ liệu</button>
            <button type="button" onClick={() => setCreating(true)} className="h-10 rounded-xl bg-[#77FF00] px-3 text-sm font-bold text-[#071007]">+ Thêm thiết bị</button>
          </div>
        </div>
        <SystemState loading={loading} error={error} onRetry={() => load()}>
          <div className="space-y-4">
            {notice ? <p className="rounded-2xl border border-[#77FF00]/30 bg-[#132015] px-4 py-3 text-sm text-[#D5E4D8]">{notice}</p> : null}
            {issues.codes.length || issues.ips.length ? (
              <div className="rounded-2xl border border-[#F5C451]/40 bg-[#2A2410] p-4 text-sm text-[#F5C451]">
                {issues.codes.map((list) => (
                  <p key={list[0].deviceCode}>Mã {list[0].deviceCode} có {list.length} bản ghi. Gỡ bản trùng. Bản ghi mới với cùng mã sẽ bị từ chối.</p>
                ))}
                {issues.ips.map((list) => (
                  <p key={list[0].ipAddress}>IP {list[0].ipAddress} đang dùng chung bởi {list.map((item) => item.deviceCode).join(", ")}.</p>
                ))}
              </div>
            ) : null}
            <DeviceStats
              rows={rows}
              activeType={typeFilter}
              onSelect={(type) => {
                setTypeFilter(type);
                setPage(1);
              }}
            />
            <DeviceFilters
              query={query}
              onQuery={(value) => { setQuery(value); setPage(1); }}
              typeFilter={typeFilter}
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
            <section className="rounded-2xl border border-white/10 bg-[#101810] p-4">
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
          schedule={schedule}
          tabRequest={tabRequest}
          onClose={() => setSelected(null)}
          onChanged={() => load(true)}
        />
      ) : null}
      {creating ? (
        <AddDeviceWizard
          areas={areas}
          devices={devices}
          sensors={sensors}
          onClose={() => setCreating(false)}
          onCreated={() => load(true)}
        />
      ) : null}
      {pending ? (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101810] p-5">
            <h2 className="text-lg font-bold">{pending.row.code}</h2>
            {pending.type === "restart" ? <p className="mt-2 text-sm text-[#C6D7C9]">Gửi lệnh restart. Nếu thiết bị offline, lệnh nằm trong hàng đợi.</p> : null}
            {pending.type === "firmware" ? (
              <label className="mt-3 block text-xs text-[#9AAB9E]">
                Phiên bản firmware
                <input value={pending.firmware} onChange={(event) => setPending({ ...pending, firmware: event.target.value })} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]" />
              </label>
            ) : null}
            {pending.type === "copy" ? (
              <label className="mt-3 block text-xs text-[#9AAB9E]">
                Thiết bị nhận
                <select value={pending.targetId} onChange={(event) => setPending({ ...pending, targetId: event.target.value })} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm">
                  <option value="">Chọn thiết bị cùng loại</option>
                  {copyTargets.map((item) => <option key={item.id} value={item.id}>{item.deviceCode || item.sensorCode}</option>)}
                </select>
              </label>
            ) : null}
            {pending.type === "disable" ? <p className="mt-2 text-sm text-[#C6D7C9]">Vô hiệu hóa {pending.row.code}. Thiết bị ngừng tham gia cho đến khi được kích hoạt lại.</p> : null}
            {pending.type === "enable" ? <p className="mt-2 text-sm text-[#C6D7C9]">Kích hoạt lại {pending.row.code}.</p> : null}
            {pending.type === "remove" ? (
              <p className="mt-2 text-sm text-[#FFB4B4]">
                Gỡ {pending.row.code}? Sensor gắn: {pending.row.raw.sensorCount ?? 0}. Actuator gắn: {pending.row.raw.actuatorCount ?? 0}. Các liên kết được tách trước khi xóa.
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setPending(null)} className="rounded-xl border border-white/15 px-3 py-2 text-sm">Hủy</button>
              <button type="button" onClick={confirmPending} className={pending.type === "remove" || pending.type === "disable" ? "rounded-xl bg-[#FF8D8D] px-3 py-2 text-sm font-bold text-[#1A0909]" : "rounded-xl bg-[#77FF00] px-3 py-2 text-sm font-bold text-[#071007]"}>Xác nhận</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DeviceManagement;
