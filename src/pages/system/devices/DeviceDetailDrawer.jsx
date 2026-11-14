import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import systemAdminService from "../../../services/systemAdminService";
import { formatAgo, STATUS_LABEL } from "./rows";
import { formatWhen, statusClass } from "../deviceModel";

const TABS = [
  ["info", "Thông tin"],
  ["config", "Cấu hình"],
  ["diagnostics", "Chẩn đoán"],
  ["logs", "Nhật ký"],
];

const CONFIG_ACTIONS = ["UpdateDevice", "UpdateFirmware", "CreateDevice", "DisableDevice", "DeleteDevice", "TestConnection"];

function DeviceDetailDrawer({ row, areas, locationsAvailable = true, schedule, tabRequest, onClose, onChanged }) {
  const [tab, setTab] = useState("info");
  const [detail, setDetail] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [config, setConfig] = useState(null);
  const [pendingDanger, setPendingDanger] = useState(null);
  const [firmwareDraft, setFirmwareDraft] = useState("");
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (tabRequest?.tab) setTab(tabRequest.tab);
  }, [tabRequest]);

  useEffect(() => {
    setDetail(null);
    setDiagnostics(null);
    setLogs([]);
    setLogsLoaded(false);
    setError("");
    setNotice("");
    setPendingDanger(null);
    setConnection(null);
    setFirmwareDraft(row.firmware || "");
    if (row.source !== "device") {
      setConfig(null);
      return undefined;
    }
    setConfig({
      name: row.raw.name || "",
      ipAddress: row.raw.ipAddress || "",
      macAddress: row.raw.macAddress || "",
      installationLocation: row.raw.installationLocation || "",
      farmingAreaId: row.raw.farmingAreaId || "",
      farmingRowId: row.raw.farmingRowId || "",
      streamUrl: row.raw.streamUrl || "",
      snapshotUrl: row.raw.snapshotUrl || "",
      resolution: row.raw.resolution || "",
    });
    let active = true;
    systemAdminService.getDevice(row.id).then((value) => {
      if (active) setDetail(value);
    }).catch((loadError) => {
      if (active) setError(loadError?.message || "Không tải được chi tiết.");
    });
    return () => {
      active = false;
    };
  }, [row]);

  useEffect(() => {
    if (tab !== "diagnostics" || row.source !== "device" || diagnostics) return undefined;
    let active = true;
    systemAdminService.getDiagnostics(row.id).then((value) => {
      if (active) setDiagnostics(value);
    }).catch((loadError) => {
      if (active) setError(loadError?.message || "Không tải được chẩn đoán.");
    });
    return () => {
      active = false;
    };
  }, [diagnostics, row, tab]);

  useEffect(() => {
    if (tab !== "logs" || row.source !== "device" || logsLoaded) return undefined;
    let active = true;
    systemAdminService.getDeviceLogs(row.id).then((value) => {
      if (!active) return;
      setLogs(value);
      setLogsLoaded(true);
    }).catch((loadError) => {
      if (active) setError(loadError?.message || "Không tải được nhật ký.");
    });
    return () => {
      active = false;
    };
  }, [logsLoaded, row, tab]);

  const run = async (action) => {
    if (row.source !== "device") return;
    setError("");
    setNotice("");
    try {
      if (action === "test") {
        setConnection(await systemAdminService.testConnection(row.id));
        setTab("diagnostics");
      }
      if (action === "restart") {
        await systemAdminService.restartDevice(row.id);
        setNotice("Đã xếp lệnh khởi động lại. Audit log đã ghi.");
      }
      if (action === "enable") {
        if (row.type === "camera") await systemAdminService.enableCamera(row.id);
        else await systemAdminService.updateDevice(row.id, { status: "Online" });
        setNotice(row.type === "camera" ? "Đã cho phép hoạt động; chờ heartbeat xác thực." : "Đã kích hoạt. Audit log đã ghi.");
      }
      if (action === "firmware") {
        if (!firmwareDraft.trim()) {
          setError("Nhập phiên bản firmware.");
          return;
        }
        await systemAdminService.updateFirmware(row.id, firmwareDraft.trim());
        setNotice("Đã cập nhật firmware. Audit log đã ghi.");
      }
      if (action === "disable") {
        await systemAdminService.disableDevice(row.id);
        setNotice("Đã chuyển sang bảo trì. Audit log đã ghi.");
        setPendingDanger(null);
      }
      if (action === "remove") {
        await systemAdminService.deleteDevice(row.id);
        onChanged();
        onClose();
        return;
      }
      onChanged();
    } catch (actionError) {
      setError(actionError?.message || "Thao tác thất bại.");
    }
  };

  const saveConfig = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await systemAdminService.updateDevice(row.id, {
        name: config.name || null,
        ipAddress: config.ipAddress,
        macAddress: config.macAddress,
        installationLocation: config.installationLocation,
        ...(locationsAvailable ? { farmingAreaId: config.farmingAreaId || (row.type === "camera" ? "00000000-0000-0000-0000-000000000000" : null) } : {}),
        ...(row.type === "camera" ? {
          ...(locationsAvailable ? { farmingRowId: config.farmingRowId || "00000000-0000-0000-0000-000000000000" } : {}),
          // Hidden legacy credentials must not be erased by unrelated edits.
          ...(config.streamUrl !== (row.raw.streamUrl || "") ? { streamUrl: config.streamUrl } : {}),
          ...(config.snapshotUrl !== (row.raw.snapshotUrl || "") ? { snapshotUrl: config.snapshotUrl } : {}),
          resolution: config.resolution,
        } : {}),
      });
      setNotice("Đã lưu cấu hình. Audit log đã ghi.");
      onChanged();
    } catch (saveError) {
      setError(saveError?.message || "Không lưu được cấu hình.");
    }
  };

  const configLogs = logs.filter((log) => CONFIG_ACTIONS.some((action) => String(log.message || "").includes(action)));

  return (
    <aside className="system-device-drawer sticky flex h-[calc(100vh-7rem)] w-[420px] max-w-[440px] shrink-0 flex-col rounded-xl border border-[#dcebe8] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{row.code}</h2>
          <p className="text-sm text-[#526f79]">{row.typeLabel}{row.hardware ? ` · ${row.hardware}` : ""} · {row.location}</p>
          <p className={`text-sm ${statusClass(row.statusKey)}`}>{STATUS_LABEL[row.statusKey] || row.statusKey}</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-[#526f79]">Đóng</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={tab === id ? "rounded-full bg-[#147e75] px-2 py-1 font-bold text-white" : "rounded-full bg-[#edf6f3] px-2 py-1"}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto text-sm">
        {error ? <p className="mb-3 text-[#b93838]">{error}</p> : null}
        {notice ? <p className="mb-3 text-[#95600d]">{notice}</p> : null}
        {row.issues?.length ? <p className="mb-3 text-xs text-[#95600d]">{row.issues.join(" · ")}. Kiểm tra trước khi giữ cả hai bản ghi.</p> : null}
        {tab === "info" ? <InfoTab row={row} detail={detail} schedule={schedule} /> : null}
        {tab === "config" ? (
          row.source === "sensor" ? (
            <div className="space-y-3 rounded-xl border border-[#dcebe8] bg-[#f7fbfa] p-3">
              <p className="text-sm text-[#355b6a]">Cấu hình kỹ thuật, liên kết port và hiệu chuẩn được quản lý tại trang Sensor. Ngưỡng chất lượng nước thuộc quản lý trại.</p>
              <Link to={`/system/devices/sensors?sensorId=${encodeURIComponent(row.id)}&tab=config`} className="inline-flex rounded-lg bg-[#147e75] px-3 py-2 text-sm font-semibold text-white">Mở cấu hình Sensor</Link>
            </div>
          ) : row.source === "device" && config ? (
            <form onSubmit={saveConfig} className="space-y-2">
              <Field label="Tên" value={config.name} onChange={(value) => setConfig({ ...config, name: value })} />
              <Field label="IP" value={config.ipAddress} onChange={(value) => setConfig({ ...config, ipAddress: value })} />
              <Field label="MAC" value={config.macAddress} onChange={(value) => setConfig({ ...config, macAddress: value })} />
              <Field label="Vị trí lắp" value={config.installationLocation} onChange={(value) => setConfig({ ...config, installationLocation: value })} />
              <label className="block text-xs text-[#526f79]">
                Khu vực
                <select
                  disabled={!locationsAvailable}
                  value={config.farmingAreaId}
                  onChange={(event) => setConfig({ ...config, farmingAreaId: event.target.value, farmingRowId: "" })}
                  className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm"
                >
                  <option value="">Chưa gán</option>
                  {areas.filter(area => area.isActive || area.id === config.farmingAreaId).map((area) => <option key={area.id} value={area.id}>{area.name || area.code}</option>)}
                </select>
              </label>
              {row.type === "camera" ? (
                <>
                  <label className="block text-xs text-[#526f79]">Dãy nuôi
                    <select disabled={!locationsAvailable} value={config.farmingRowId} onChange={event => setConfig({...config, farmingRowId: event.target.value})} className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm">
                      <option value="">Không gán dãy</option>
                      {(areas.find(area => area.id === config.farmingAreaId)?.rows || []).filter(item => item.isActive || item.id === config.farmingRowId).map(item => <option key={item.id} value={item.id}>{item.name || item.code}</option>)}
                    </select>
                  </label>
                  <p className="text-xs text-[#526f79]">URL không chứa thông tin đăng nhập hoặc query. Camera cần xác thực phải qua Camera Agent.</p>
                  <Field label="Stream URL" value={config.streamUrl} onChange={(value) => setConfig({ ...config, streamUrl: value })} />
                  <Field label="Snapshot URL" value={config.snapshotUrl} onChange={(value) => setConfig({ ...config, snapshotUrl: value })} />
                  <Field label="Resolution" value={config.resolution} onChange={(value) => setConfig({ ...config, resolution: value })} />
                </>
              ) : null}
              <button type="submit" className="h-10 rounded-xl bg-[#147e75] px-3 text-sm font-bold text-white">Lưu cấu hình</button>
            </form>
          ) : <p className="text-[#526f79]">Cảm biến chưa có form sửa trên trang này.</p>
        ) : null}
        {tab === "diagnostics" ? (
          <DiagnosticsTab row={row} detail={detail} diagnostics={diagnostics} connection={connection} />
        ) : null}
        {tab === "logs" ? <LogsTab logs={logs} configLogs={configLogs} loaded={logsLoaded} /> : null}
      </div>
      {row.source === "device" ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <Action label={row.type === "camera" ? "Kiểm tra kết nối" : "Test connection"} onClick={() => run("test")} />
            {row.type !== "camera" && <Action label="Khởi động lại" onClick={() => run("restart")} />}
            <Action label="Kích hoạt" onClick={() => run("enable")} />
          </div>
          {row.type !== "camera" && <div className="flex gap-2">
            <input
              value={firmwareDraft}
              onChange={(event) => setFirmwareDraft(event.target.value)}
              placeholder="Phiên bản firmware"
              className="h-9 min-w-0 flex-1 rounded-lg border border-[#dcebe8] bg-[#f7fbfa] px-2 text-xs"
            />
            <button type="button" onClick={() => run("firmware")} className="rounded-lg border border-[#c9dfd9] px-2 text-xs">Cập nhật firmware</button>
          </div>}
          <div className="rounded-xl border border-[#e9b5b5] bg-[#fff1f1] p-3">
            <p className="text-xs font-semibold text-[#b93838]">Thao tác nguy hiểm</p>
            {pendingDanger ? (
              <div className="mt-2 space-y-2 text-xs">
                <p>{pendingDanger === "remove" ? `Gỡ ${row.code} khỏi hệ thống? Sensor gắn sẽ được tách ra.` : `Chuyển ${row.code} sang bảo trì?`}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => run(pendingDanger)} className="rounded-lg bg-[#b93838] px-2 py-1 font-semibold text-white">Xác nhận</button>
                  <button type="button" onClick={() => setPendingDanger(null)} className="rounded-lg border border-[#c9dfd9] px-2 py-1">Hủy</button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex gap-2 text-xs">
                <button type="button" onClick={() => setPendingDanger("disable")} className="rounded-lg border border-[#e9b5b5] px-2 py-1 text-[#b93838]">Vô hiệu hóa</button>
                <button type="button" onClick={() => setPendingDanger("remove")} className="rounded-lg border border-[#e9b5b5] px-2 py-1 text-[#b93838]">Gỡ thiết bị</button>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {row.type === "camera" ? (
        <Link to="/system/cameras" className="mt-3 text-xs font-semibold text-[#13796e]">Lịch ghi hình ở Camera & Ghi hình</Link>
      ) : null}
    </aside>
  );
}

function InfoTab({ row, detail, schedule }) {
  const snapshot = detail?.snapshotUrl || row.raw.snapshotUrl;
  const stream = detail?.streamUrl || row.raw.streamUrl;
  const showPreview = row.type === "camera";
  return (
    <div className="space-y-3">
      {showPreview ? <CameraPreview code={row.code} snapshot={snapshot} stream={stream} /> : null}
      <dl className="grid grid-cols-2 gap-2">
        <Item label="ID" value={row.code} />
        <Item label="Loại" value={row.hardware ? `${row.typeLabel} · ${row.hardware}` : row.typeLabel} />
        <Item label="Khu vực" value={row.area || "—"} />
        <Item label="Dãy" value={row.row || "—"} />
        <Item label="IP" value={row.ip || "—"} />
        <Item label="MAC" value={row.mac || detail?.macAddress || "—"} />
        <Item label="Firmware" value={row.firmware || "—"} />
        <Item label="Heartbeat" value={formatAgo(row.lastSeen)} />
        {row.type === "camera" ? <Item label="Resolution" value={detail?.resolution || row.raw.resolution || "—"} /> : null}
        {row.type === "camera" ? <Item label="Ghi hình" value={schedule?.mode || "Chưa có lịch"} /> : null}
        {row.type === "sensor" ? <Item label="Đơn vị" value={row.raw.unit || "—"} /> : null}
        {row.type === "sensor" ? <Item label="Giá trị gần nhất" value={row.raw.latestValue ?? "—"} /> : null}
        {row.type === "sensor" ? <Item label="Ngưỡng" value={`${row.raw.minThreshold ?? "—"} – ${row.raw.maxThreshold ?? "—"}`} /> : null}
        {row.type === "controller" ? <Item label="RSSI" value={detail?.rssiDbm ?? row.raw.rssiDbm ?? "—"} /> : null}
        {row.type === "controller" ? <Item label="Pin" value={detail?.batteryLevel ?? row.raw.batteryLevel ?? "—"} /> : null}
      </dl>
      {row.type === "controller" ? <ControllerInventory key={row.id} deviceId={row.id} /> : null}
      {row.type === "controller" ? <ChildLists detail={detail} sensorCount={row.raw.sensorCount} actuatorCount={row.raw.actuatorCount} /> : null}
      {row.type === "controller" ? <p className="text-xs text-[#54747e]">Bật/tắt bơm hoặc van không nằm ở trang này.</p> : null}
    </div>
  );
}

function ControllerInventory({ deviceId }) {
  const [inventory, setInventory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    systemAdminService.getControllerPorts(deviceId).then((result) => {
      if (active) setInventory(result);
    }).catch((err) => {
      if (active) { setInventory(null); setError(err?.message || "Không tải được danh mục cổng."); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [deviceId, revision]);
  const ports = inventory?.ports || [];
  return (
    <section className="system-panel rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Cổng controller</h3>
        <button type="button" disabled={loading} onClick={() => setRevision((v) => v + 1)} className="system-secondary-button">Làm mới</button>
      </div>
      <p className="mt-1 text-xs text-[#526f79]">Danh mục phần cứng do controller báo. Chỉ xem, không gửi lệnh điều khiển.</p>
      {loading ? <p role="status" className="mt-3 text-xs text-[#526f79]">Đang tải cổng...</p> : error ? <p role="alert" className="mt-3 text-xs text-[#b93838]">{error}</p> : (
        <>
          <p className="my-2 text-xs text-[#526f79]">Model: {inventory?.hardwareModel || "—"} · Manifest: {inventory?.capabilityVersion ?? "—"} · {ports.length} cổng</p>
          {!ports.length ? <p className="text-xs text-[#526f79]">Controller chưa báo danh mục cổng.</p> : (
            <ul className="space-y-2 text-xs">
              {ports.map((port) => {
                const equipment = (inventory?.equipment || []).filter((item) => item.controllerPortId === port.id || item.busPortId === port.id);
                const sensors = (inventory?.sensors || []).filter((item) => item.controllerPortId === port.id);
                return <li key={port.id} className="rounded-lg border border-[#dcebe8] bg-white p-2">
                  <div className="flex flex-wrap justify-between gap-1"><strong>{port.portCode}</strong><span className={port.isPresent ? "text-[#13796e]" : "text-[#95600d]"}>{port.isPresent ? "Hiện diện" : "Không hiện diện"}</span></div>
                  <p className="mt-1 text-[#355b6a]">{port.type} · GPIO {port.gpio}{port.secondaryGpio != null ? " / " + port.secondaryGpio : ""} · Kênh {port.channel ?? "—"}</p>
                  <p className="mt-1 text-[#526f79]">Commissioning: {port.commissioningStatus || "—"} · Báo trạng thái: {port.reportedOn == null ? "—" : port.reportedOn ? "ON" : "OFF"}</p>
                  <p className="mt-1 text-[#526f79]">Thiết bị: {[...equipment.map((item) => item.name), ...sensors.map((item) => item.sensorCode+(item.busAddress?" ("+item.busAddress+"/"+item.busRegister+")":""))].filter(Boolean).join(", ") || "Chưa liên kết"}</p>
                  {sensors.map(s=><Link key={s.id} className="mr-2 text-xs text-[#13796e] underline" to={"/system/devices/sensors?sensorId="+encodeURIComponent(s.id)}>Xem {s.sensorCode}</Link>)}
                  {port.isPresent&&["DIGITAL_INPUT","ANALOG_INPUT","RS485","I2C","UART"].includes(port.type)&&(!sensors.length||["RS485","I2C","UART"].includes(port.type))&&<Link className="text-xs text-[#13796e] underline" to={"/system/devices/sensors?deviceId="+encodeURIComponent(deviceId)+"&portId="+encodeURIComponent(port.id)}>Đăng ký Sensor</Link>}
                </li>;
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
ControllerInventory.propTypes = { deviceId: PropTypes.string.isRequired };

function CameraPreview({ code, snapshot, stream }) {
  if (snapshot) return <img src={snapshot} alt={code} className="h-36 w-full rounded-xl object-cover" />;
  if (stream && /^https?:/i.test(stream) && !/^rtsp:/i.test(stream)) {
    return <video src={stream} controls muted className="h-36 w-full rounded-xl bg-black" />;
  }
  return <p className="text-xs text-[#54747e]">{stream ? "Stream RTSP không phát trong trình duyệt. Chưa có snapshotUrl." : "Camera chưa có snapshot hoặc stream để xem trước."}</p>;
}

function ChildLists({ detail, sensorCount, actuatorCount }) {
  if (!detail) return <p className="text-xs text-[#526f79]">Đang tải {sensorCount ?? "?"} sensor và {actuatorCount ?? "?"} actuator.</p>;
  return (
    <div className="space-y-3">
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#54747e] uppercase">Sensor gắn · {detail.sensors?.length ?? 0}</h3>
        {detail.sensors?.length ? (
          <ul className="mt-2 space-y-1 text-xs">
            {detail.sensors.map((sensor) => (
              <li key={sensor.id} className="rounded-lg bg-[#edf6f3] px-2 py-1">
                <span className="font-semibold">{sensor.sensorCode}</span> · {sensor.sensorType || "sensor"} · {sensor.latestValue ?? "—"} {sensor.unit || ""} · {formatAgo(sensor.lastSeenAt)}
              </li>
            ))}
          </ul>
        ) : <p className="mt-1 text-xs text-[#526f79]">Không có sensor gắn DeviceId này.</p>}
      </section>
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#54747e] uppercase">Actuator · {detail.actuators?.length ?? 0}</h3>
        {detail.actuators?.length ? (
          <ul className="mt-2 space-y-1 text-xs">
            {detail.actuators.map((actuator) => (
              <li key={actuator.id} className="rounded-lg bg-[#edf6f3] px-2 py-1">
                {actuator.name || actuator.code} · {actuator.type || "relay"} · kênh {actuator.relayChannel || "—"} · {actuator.isOn ? "On" : "Off"}
              </li>
            ))}
          </ul>
        ) : <p className="mt-1 text-xs text-[#526f79]">Không có actuator gắn RelayDeviceId này.</p>}
      </section>
    </div>
  );
}

function DiagnosticsTab({ row, detail, diagnostics, connection }) {
  if (row.source === "sensor") {
    return (
      <dl className="grid grid-cols-2 gap-2">
        <Item label="Giá trị" value={row.raw.latestValue ?? "—"} />
        <Item label="Đơn vị" value={row.raw.unit || "—"} />
        <Item label="Đo lúc" value={formatWhen(row.raw.latestMeasuredAt)} />
        <Item label="Ngưỡng min" value={row.raw.minThreshold ?? "—"} />
        <Item label="Ngưỡng max" value={row.raw.maxThreshold ?? "—"} />
        <Item label="Last seen" value={formatAgo(row.lastSeen)} />
      </dl>
    );
  }
  const data = diagnostics || detail;
  if (!data) return <p className="text-[#526f79]">Đang tải chẩn đoán.</p>;
  return (
    <div className="space-y-3">
      {connection ? (
        <p className={connection.reachable ? "text-[#13796e]" : "text-[#95600d]"}>{connection.message}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-2">
        <Item label="Heartbeat" value={formatWhen(data.lastSeenAt || row.lastSeen)} />
        <Item label="RSSI" value={data.rssiDbm ?? "—"} />
        <Item label="Pin" value={data.batteryLevel ?? "—"} />
        <Item label="Lệnh chờ" value={data.pendingCommands ?? "—"} />
        <Item label="Đo gần nhất" value={formatWhen(data.latestMeasurementAt)} />
      </dl>
      <section>
        <h3 className="text-xs font-semibold text-[#54747e]">Lần đo gần nhất của sensor gắn</h3>
        <p className="mt-1 text-xs text-[#54747e]">API chỉ lưu một mốc heartbeat của thiết bị. Danh sách dưới là thời điểm đo, không phải lịch sử heartbeat đầy đủ.</p>
        {diagnostics?.recentMeasurements?.length ? (
          <ul className="mt-2 space-y-1 text-xs">
            {diagnostics.recentMeasurements.map((at) => <li key={at}>{formatWhen(at)}</li>)}
          </ul>
        ) : <p className="mt-1 text-xs text-[#526f79]">Chưa có lần đo.</p>}
      </section>
    </div>
  );
}

function LogsTab({ logs, configLogs, loaded }) {
  if (!loaded) return <p className="text-[#526f79]">Đang tải nhật ký.</p>;
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#54747e] uppercase">Nhật ký cấu hình</h3>
        {configLogs.length ? <LogList logs={configLogs} /> : <p className="mt-1 text-xs text-[#526f79]">Chưa có thao tác cấu hình được ghi.</p>}
      </section>
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#54747e] uppercase">Nhật ký thiết bị</h3>
        {logs.length ? <LogList logs={logs} /> : <p className="mt-1 text-xs text-[#526f79]">Không có nhật ký.</p>}
      </section>
    </div>
  );
}

function LogList({ logs }) {
  return (
    <ul className="mt-2 space-y-2 text-xs">
      {logs.map((log) => (
        <li key={`${log.id}-${log.at}`}>
          <span className="text-[#54747e]">{formatWhen(log.at)}</span> {log.message}
        </li>
      ))}
    </ul>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block text-xs text-[#526f79]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm text-[#153b56]" />
    </label>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-[#54747e]">{label}</dt>
      <dd className="break-all">{value ?? "—"}</dd>
    </div>
  );
}

function Action({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-[#c9dfd9] px-2 py-1">{label}</button>
  );
}

DeviceDetailDrawer.propTypes = {
  row: PropTypes.object.isRequired,
  areas: PropTypes.array.isRequired,
  locationsAvailable: PropTypes.bool,
  schedule: PropTypes.object,
  tabRequest: PropTypes.shape({ tab: PropTypes.string, nonce: PropTypes.number }),
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
};
InfoTab.propTypes = { row: PropTypes.object.isRequired, detail: PropTypes.object, schedule: PropTypes.object };
CameraPreview.propTypes = { code: PropTypes.string.isRequired, snapshot: PropTypes.string, stream: PropTypes.string };
ChildLists.propTypes = { detail: PropTypes.object, sensorCount: PropTypes.number, actuatorCount: PropTypes.number };
DiagnosticsTab.propTypes = {
  row: PropTypes.object.isRequired,
  detail: PropTypes.object,
  diagnostics: PropTypes.object,
  connection: PropTypes.object,
};
LogsTab.propTypes = { logs: PropTypes.array.isRequired, configLogs: PropTypes.array.isRequired, loaded: PropTypes.bool };
LogList.propTypes = { logs: PropTypes.array.isRequired };
Field.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string, onChange: PropTypes.func.isRequired };
Item.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };
Action.propTypes = { label: PropTypes.string.isRequired, onClick: PropTypes.func.isRequired };

export default DeviceDetailDrawer;
