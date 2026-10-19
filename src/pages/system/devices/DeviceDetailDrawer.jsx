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

function DeviceDetailDrawer({ row, areas, schedule, tabRequest, onClose, onChanged }) {
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
  const [sensorConfig, setSensorConfig] = useState(null);

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
      setSensorConfig({
        unit: row.raw.unit || "",
        minThreshold: row.raw.minThreshold ?? "",
        maxThreshold: row.raw.maxThreshold ?? "",
      });
      return undefined;
    }
    setSensorConfig(null);
    setConfig({
      name: row.raw.name || "",
      ipAddress: row.raw.ipAddress || "",
      macAddress: row.raw.macAddress || "",
      installationLocation: row.raw.installationLocation || "",
      farmingAreaId: row.raw.farmingAreaId || "",
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
        await systemAdminService.updateDevice(row.id, { status: "Online" });
        setNotice("Đã kích hoạt. Audit log đã ghi.");
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
        farmingAreaId: config.farmingAreaId || null,
        streamUrl: config.streamUrl,
        snapshotUrl: config.snapshotUrl,
        resolution: config.resolution,
      });
      setNotice("Đã lưu cấu hình. Audit log đã ghi.");
      onChanged();
    } catch (saveError) {
      setError(saveError?.message || "Không lưu được cấu hình.");
    }
  };

  const configLogs = logs.filter((log) => CONFIG_ACTIONS.some((action) => String(log.message || "").includes(action)));

  return (
    <aside className="sticky top-4 flex h-[calc(100vh-7rem)] w-[420px] max-w-[440px] shrink-0 flex-col rounded-2xl border border-white/10 bg-[#0C140E] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{row.code}</h2>
          <p className="text-sm text-[#9AAB9E]">{row.typeLabel}{row.hardware ? ` · ${row.hardware}` : ""} · {row.location}</p>
          <p className={`text-sm ${statusClass(row.statusKey)}`}>{STATUS_LABEL[row.statusKey] || row.statusKey}</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-[#9AAB9E]">Đóng</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={tab === id ? "rounded-full bg-[#77FF00] px-2 py-1 font-bold text-[#071007]" : "rounded-full bg-white/5 px-2 py-1"}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto text-sm">
        {error ? <p className="mb-3 text-[#FFB4B4]">{error}</p> : null}
        {notice ? <p className="mb-3 text-[#F5C451]">{notice}</p> : null}
        {row.issues?.length ? <p className="mb-3 text-xs text-[#F5C451]">{row.issues.join(" · ")}. Kiểm tra trước khi giữ cả hai bản ghi.</p> : null}
        {tab === "info" ? <InfoTab row={row} detail={detail} schedule={schedule} /> : null}
        {tab === "config" ? (
          row.source === "sensor" && sensorConfig ? (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setError("");
                try {
                  await systemAdminService.updateSensor(row.id, {
                    unit: sensorConfig.unit || null,
                    minThreshold: sensorConfig.minThreshold === "" ? null : Number(sensorConfig.minThreshold),
                    maxThreshold: sensorConfig.maxThreshold === "" ? null : Number(sensorConfig.maxThreshold),
                  });
                  setNotice("Đã lưu ngưỡng cảm biến.");
                  onChanged();
                } catch (saveError) {
                  setError(saveError?.message || "Không lưu được cảm biến.");
                }
              }}
              className="space-y-2"
            >
              <Field label="Đơn vị" value={sensorConfig.unit} onChange={(value) => setSensorConfig({ ...sensorConfig, unit: value })} />
              <Field label="Ngưỡng min" value={String(sensorConfig.minThreshold)} onChange={(value) => setSensorConfig({ ...sensorConfig, minThreshold: value })} />
              <Field label="Ngưỡng max" value={String(sensorConfig.maxThreshold)} onChange={(value) => setSensorConfig({ ...sensorConfig, maxThreshold: value })} />
              <p className="text-xs text-[#8EA292]">Đây là ngưỡng đang lưu. API chưa có chu kỳ lấy mẫu hay hiệu chuẩn riêng.</p>
              <button type="submit" className="h-10 rounded-xl bg-[#77FF00] px-3 text-sm font-bold text-[#071007]">Lưu hiệu chuẩn</button>
            </form>
          ) : row.source === "device" && config ? (
            <form onSubmit={saveConfig} className="space-y-2">
              <Field label="Tên" value={config.name} onChange={(value) => setConfig({ ...config, name: value })} />
              <Field label="IP" value={config.ipAddress} onChange={(value) => setConfig({ ...config, ipAddress: value })} />
              <Field label="MAC" value={config.macAddress} onChange={(value) => setConfig({ ...config, macAddress: value })} />
              <Field label="Vị trí lắp" value={config.installationLocation} onChange={(value) => setConfig({ ...config, installationLocation: value })} />
              <label className="block text-xs text-[#9AAB9E]">
                Khu vực
                <select
                  value={config.farmingAreaId}
                  onChange={(event) => setConfig({ ...config, farmingAreaId: event.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                >
                  <option value="">Chưa gán</option>
                  {areas.map((area) => <option key={area.id} value={area.id}>{area.name || area.code}</option>)}
                </select>
              </label>
              {row.type === "camera" ? (
                <>
                  <Field label="Stream URL" value={config.streamUrl} onChange={(value) => setConfig({ ...config, streamUrl: value })} />
                  <Field label="Snapshot URL" value={config.snapshotUrl} onChange={(value) => setConfig({ ...config, snapshotUrl: value })} />
                  <Field label="Resolution" value={config.resolution} onChange={(value) => setConfig({ ...config, resolution: value })} />
                </>
              ) : null}
              <button type="submit" className="h-10 rounded-xl bg-[#77FF00] px-3 text-sm font-bold text-[#071007]">Lưu cấu hình</button>
            </form>
          ) : <p className="text-[#9AAB9E]">Cảm biến chưa có form sửa trên trang này.</p>
        ) : null}
        {tab === "diagnostics" ? (
          <DiagnosticsTab row={row} detail={detail} diagnostics={diagnostics} connection={connection} />
        ) : null}
        {tab === "logs" ? <LogsTab logs={logs} configLogs={configLogs} loaded={logsLoaded} /> : null}
      </div>
      {row.source === "device" ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <Action label="Test connection" onClick={() => run("test")} />
            <Action label="Khởi động lại" onClick={() => run("restart")} />
            <Action label="Kích hoạt" onClick={() => run("enable")} />
          </div>
          <div className="flex gap-2">
            <input
              value={firmwareDraft}
              onChange={(event) => setFirmwareDraft(event.target.value)}
              placeholder="Phiên bản firmware"
              className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0B120C] px-2 text-xs"
            />
            <button type="button" onClick={() => run("firmware")} className="rounded-lg border border-white/15 px-2 text-xs">Cập nhật firmware</button>
          </div>
          <div className="rounded-xl border border-[#FF8D8D]/40 bg-[#2A1212] p-3">
            <p className="text-xs font-semibold text-[#FFB4B4]">Thao tác nguy hiểm</p>
            {pendingDanger ? (
              <div className="mt-2 space-y-2 text-xs">
                <p>{pendingDanger === "remove" ? `Gỡ ${row.code} khỏi hệ thống? Sensor gắn sẽ được tách ra.` : `Chuyển ${row.code} sang bảo trì?`}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => run(pendingDanger)} className="rounded-lg bg-[#FF8D8D] px-2 py-1 font-semibold text-[#1A0909]">Xác nhận</button>
                  <button type="button" onClick={() => setPendingDanger(null)} className="rounded-lg border border-white/15 px-2 py-1">Hủy</button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex gap-2 text-xs">
                <button type="button" onClick={() => setPendingDanger("disable")} className="rounded-lg border border-[#FF8D8D]/40 px-2 py-1 text-[#FFB4B4]">Vô hiệu hóa</button>
                <button type="button" onClick={() => setPendingDanger("remove")} className="rounded-lg border border-[#FF8D8D]/40 px-2 py-1 text-[#FFB4B4]">Gỡ thiết bị</button>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {row.type === "camera" ? (
        <Link to="/system/cameras" className="mt-3 text-xs font-semibold text-[#77FF00]">Lịch ghi hình ở Camera & Ghi hình</Link>
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
      {row.type === "controller" ? <ChildLists detail={detail} sensorCount={row.raw.sensorCount} actuatorCount={row.raw.actuatorCount} /> : null}
      {row.type === "controller" ? <p className="text-xs text-[#8EA292]">Bật/tắt bơm hoặc van không nằm ở trang này.</p> : null}
    </div>
  );
}

function CameraPreview({ code, snapshot, stream }) {
  if (snapshot) return <img src={snapshot} alt={code} className="h-36 w-full rounded-xl object-cover" />;
  if (stream && /^https?:/i.test(stream) && !/^rtsp:/i.test(stream)) {
    return <video src={stream} controls muted className="h-36 w-full rounded-xl bg-black" />;
  }
  return <p className="text-xs text-[#8EA292]">{stream ? "Stream RTSP không phát trong trình duyệt. Chưa có snapshotUrl." : "Camera chưa có snapshot hoặc stream để xem trước."}</p>;
}

function ChildLists({ detail, sensorCount, actuatorCount }) {
  if (!detail) return <p className="text-xs text-[#9AAB9E]">Đang tải {sensorCount ?? "?"} sensor và {actuatorCount ?? "?"} actuator.</p>;
  return (
    <div className="space-y-3">
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#8EA292] uppercase">Sensor gắn · {detail.sensors?.length ?? 0}</h3>
        {detail.sensors?.length ? (
          <ul className="mt-2 space-y-1 text-xs">
            {detail.sensors.map((sensor) => (
              <li key={sensor.id} className="rounded-lg bg-white/5 px-2 py-1">
                <span className="font-semibold">{sensor.sensorCode}</span> · {sensor.sensorType || "sensor"} · {sensor.latestValue ?? "—"} {sensor.unit || ""} · {formatAgo(sensor.lastSeenAt)}
              </li>
            ))}
          </ul>
        ) : <p className="mt-1 text-xs text-[#9AAB9E]">Không có sensor gắn DeviceId này.</p>}
      </section>
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#8EA292] uppercase">Actuator · {detail.actuators?.length ?? 0}</h3>
        {detail.actuators?.length ? (
          <ul className="mt-2 space-y-1 text-xs">
            {detail.actuators.map((actuator) => (
              <li key={actuator.id} className="rounded-lg bg-white/5 px-2 py-1">
                {actuator.name || actuator.code} · {actuator.type || "relay"} · kênh {actuator.relayChannel || "—"} · {actuator.isOn ? "On" : "Off"}
              </li>
            ))}
          </ul>
        ) : <p className="mt-1 text-xs text-[#9AAB9E]">Không có actuator gắn RelayDeviceId này.</p>}
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
  if (!data) return <p className="text-[#9AAB9E]">Đang tải chẩn đoán.</p>;
  return (
    <div className="space-y-3">
      {connection ? (
        <p className={connection.reachable ? "text-[#77FF00]" : "text-[#F5C451]"}>{connection.message}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-2">
        <Item label="Heartbeat" value={formatWhen(data.lastSeenAt || row.lastSeen)} />
        <Item label="RSSI" value={data.rssiDbm ?? "—"} />
        <Item label="Pin" value={data.batteryLevel ?? "—"} />
        <Item label="Lệnh chờ" value={data.pendingCommands ?? "—"} />
        <Item label="Đo gần nhất" value={formatWhen(data.latestMeasurementAt)} />
      </dl>
      <section>
        <h3 className="text-xs font-semibold text-[#8EA292]">Lần đo gần nhất của sensor gắn</h3>
        <p className="mt-1 text-xs text-[#8EA292]">API chỉ lưu một mốc heartbeat của thiết bị. Danh sách dưới là thời điểm đo, không phải lịch sử heartbeat đầy đủ.</p>
        {diagnostics?.recentMeasurements?.length ? (
          <ul className="mt-2 space-y-1 text-xs">
            {diagnostics.recentMeasurements.map((at) => <li key={at}>{formatWhen(at)}</li>)}
          </ul>
        ) : <p className="mt-1 text-xs text-[#9AAB9E]">Chưa có lần đo.</p>}
      </section>
    </div>
  );
}

function LogsTab({ logs, configLogs, loaded }) {
  if (!loaded) return <p className="text-[#9AAB9E]">Đang tải nhật ký.</p>;
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#8EA292] uppercase">Nhật ký cấu hình</h3>
        {configLogs.length ? <LogList logs={configLogs} /> : <p className="mt-1 text-xs text-[#9AAB9E]">Chưa có thao tác cấu hình được ghi.</p>}
      </section>
      <section>
        <h3 className="text-xs font-semibold tracking-[0.08em] text-[#8EA292] uppercase">Nhật ký thiết bị</h3>
        {logs.length ? <LogList logs={logs} /> : <p className="mt-1 text-xs text-[#9AAB9E]">Không có nhật ký.</p>}
      </section>
    </div>
  );
}

function LogList({ logs }) {
  return (
    <ul className="mt-2 space-y-2 text-xs">
      {logs.map((log) => (
        <li key={`${log.id}-${log.at}`}>
          <span className="text-[#8EA292]">{formatWhen(log.at)}</span> {log.message}
        </li>
      ))}
    </ul>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block text-xs text-[#9AAB9E]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]" />
    </label>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-[#8EA292]">{label}</dt>
      <dd className="break-all">{value ?? "—"}</dd>
    </div>
  );
}

function Action({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-white/15 px-2 py-1">{label}</button>
  );
}

DeviceDetailDrawer.propTypes = {
  row: PropTypes.object.isRequired,
  areas: PropTypes.array.isRequired,
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
