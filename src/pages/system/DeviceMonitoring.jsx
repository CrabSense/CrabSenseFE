import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import systemAdminService from "../../services/systemAdminService";
import { DataTable, KpiGrid, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { deviceKind, formatWhen, statusClass } from "./deviceModel";

const kindNames = { camera: "Camera", sensor: "Sensor", controller: "Controller" };
const statusOf = (item, sensor) => {
  if (sensor && item.isActive === false) return "Disabled";
  if (item.status) return item.status;
  if (!sensor || !item.lastSeenAt) return "Unknown";
  const seen = Date.parse(item.lastSeenAt);
  return Number.isFinite(seen) ? (Date.now() - seen > 15 * 60 * 1000 ? "Offline" : "Online") : "Unknown";
};

export default function DeviceMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [devices, sensors, alerts] = await Promise.all([
        systemAdminService.getDevices(), systemAdminService.getSensorInventory({}), systemAdminService.getAlerts(true),
      ]);
      setData({ devices, sensors, alerts, updated: new Date() });
    } catch (err) { setError(err?.message || "Không tải được trạng thái thiết bị."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 30000);
    return () => clearInterval(timer);
  }, [load]);
  const rows = data ? [
    ...data.devices.map(item => ({ id: "device-" + item.id, code: item.deviceCode, name: item.name, kind: deviceKind(item), status: statusOf(item, false), lastSeen: item.lastSeenAt })),
    ...data.sensors.map(item => ({ id: "sensor-" + item.id, code: item.sensorCode, name: item.name||item.sensorType, kind: "sensor", status: statusOf(item, true), lastSeen: item.lastSeenAt, sensorId:item.id, location:[item.areaName,item.rowName].filter(Boolean).join(" / "), controller:item.controllerCode, port:item.portCode, value:item.latestValue, unit:item.unit, measuredAt:item.latestMeasuredAt })),
  ] : [];
  const statuses = ["Online", "Offline", "Error", "Maintenance", "Disabled", "Unknown"];
  const filtered = rows.filter(row => (kind === "all" || row.kind === kind) && (status === "all" || String(row.status).toLowerCase() === status.toLowerCase()));
  return <SystemPage title="Giám sát thiết bị" description="Theo dõi trạng thái kết nối, lần cuối nhận dữ liệu và cảnh báo kỹ thuật. Tự làm mới mỗi 30 giây." actions={<button type="button" className="system-secondary-button" onClick={() => load()}>Làm mới</button>}>
    <SystemState loading={loading} error={!data ? error : ""} onRetry={load}>
      <div className="space-y-4">
        {error && <p className="text-sm text-[#b93838]">{error} — đang hiển thị dữ liệu lần tải trước.</p>}
        <p className="text-xs text-[#526f79]">Cập nhật: {data ? formatWhen(data.updated) : "—"}</p>
        <KpiGrid items={statuses.map(label => ({ label, value: data ? rows.filter(row => String(row.status).toLowerCase() === label.toLowerCase()).length : "—" }))}/>
        <Panel title="Trạng thái thiết bị">
          <div className="mb-3 flex flex-wrap gap-2">
            <select aria-label="Loại thiết bị" value={kind} onChange={e => setKind(e.target.value)} className="rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 py-2 text-sm">
              <option value="all">Tất cả loại</option>{Object.entries(kindNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
            </select>
            <select aria-label="Trạng thái" value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 py-2 text-sm">
              <option value="all">Tất cả trạng thái</option>{statuses.map(value => <option key={value}>{value}</option>)}
            </select>
          </div>
          <DataTable rows={filtered} empty="Không có thiết bị khớp bộ lọc." columns={[
            { key: "code", label: "Mã thiết bị" }, { key: "name", label: "Tên / loại đo" },
            { key: "kind", label: "Loại", render: row => kindNames[row.kind] },
            { key: "status", label: "Trạng thái", render: row => <span className={statusClass(row.status)}>{row.status}</span> },
            { key: "lastSeen", label: "Lần cuối kết nối", render: row => formatWhen(row.lastSeen) },
            {key:"location",label:"Vị trí"},{key:"controller",label:"Controller / Port",render:row=>[row.controller,row.port].filter(Boolean).join(" / ")||"—"},{key:"value",label:"Giá trị",render:row=>row.value==null?"—":row.value+" "+(row.unit||"")},{key:"detail",label:"Chi tiết",render:row=>row.sensorId?<Link to={"/system/devices/sensors?sensorId="+encodeURIComponent(row.sensorId)}>Xem Sensor</Link>:"—"},
          ]}/>
        </Panel>
        <Panel title="Cảnh báo kỹ thuật đang mở"><DataTable rows={data?.alerts || []} empty="Không có cảnh báo đang mở." columns={[
          { key: "message", label: "Nội dung" }, { key: "severity", label: "Mức độ" },
          { key: "status", label: "Trạng thái" }, { key: "lastOccurredAt", label: "Thời gian", render: row => formatWhen(row.lastOccurredAt || row.createdAt) },
        ]}/><Link to="/system/logs" className="mt-3 inline-block text-sm text-[#13796e]">Xem nhật ký hệ thống</Link></Panel>
      </div>
    </SystemState>
  </SystemPage>;
}
