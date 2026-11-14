import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link, useSearchParams } from "react-router-dom";
import { Activity, AlertTriangle, Cable, Clock, Cpu, List, Settings, Workflow } from "lucide-react";
import api from "../../services/systemAdminService";
import { DataTable, KpiGrid, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import DeviceManagement from "./DeviceManagement";
import "./controller-management.css";
import ControllerProvisioning from "./ControllerProvisioning";
import { formatWhen, statusClass } from "./deviceModel";
import { mapDeviceRows, STATUS_LABEL } from "./devices/rows";

const BASE = "/system/devices/controllers";
const EMPTY_ID = "00000000-0000-0000-0000-000000000000";
const TABS = [
  ["list", "Danh sách Controller", List],
  ["monitor", "Theo dõi Controller", Activity],
  ["ports", "Cổng / I/O", Cable],
  ["bindings", "Thiết bị liên kết", Workflow],
  ["history", "Lịch sử điều khiển", Clock],
  ["events", "Cảnh báo kỹ thuật", AlertTriangle],
  ["config", "Cấu hình kỹ thuật", Settings],
  ["provisioning", "Kiosk / Đăng ký", Cpu],
];
const COMMAND_STATES = {
  pending: "Chờ gửi", delivered: "Đã giao", acknowledged: "Đã phản hồi",
  failed: "Thất bại", timedout: "Hết hạn", superseded: "Đã thay thế",
};
const BUS_TYPES = ["RS485", "I2C", "UART"];
const fieldClass = "mt-1 w-full rounded-lg border border-[#c9dfd9] bg-[#f7fbfa] px-3 py-2 text-sm";
const shown = value => value == null || value === "" ? "—" : String(value);
const stateLabel = value => value == null ? "Chưa có phản hồi" : value ? "ON" : "OFF";
const column = (key, label, render) => ({ key, label, render });

function useResource(load, revision = 0, keepValue = false) {
  const [state, setState] = useState({ loading: true, error: "", value: null });
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setState(previous => ({ loading: true, error: "", value: keepValue ? previous.value : null }));
    Promise.resolve().then(() => load(controller.signal)).then(value => {
      if (active) setState({ loading: false, error: "", value });
    }).catch(error => {
      if (active) setState({ loading: false, error: error?.message || "Không tải được dữ liệu.", value: null });
    });
    return () => { active = false; controller.abort(); };
  }, [load, revision, keepValue]);
  return state;
}

function Tabs({ tab, controllerId, onChange }) {
  return <nav aria-label="Các chức năng quản lý Controller" className="ctrl-tabs">
    {TABS.map(([id, label, Icon]) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined}
      onClick={() => onChange(id, controllerId)}
      className="ctrl-tab">
      <Icon size={16} aria-hidden="true" />{label}
    </button>)}
  </nav>;
}
Tabs.propTypes = { tab: PropTypes.string.isRequired, controllerId: PropTypes.string, onChange: PropTypes.func.isRequired };

function Info({ entries }) {
  return <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {entries.map(([label, value]) => <div key={label} className="rounded-lg bg-[#f7fbfa] p-3"><dt className="text-xs text-[#54747e]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{shown(value)}</dd></div>)}
  </dl>;
}
Info.propTypes = { entries: PropTypes.array.isRequired };

function Monitor({ row, revision, refresh }) {
  const load = useCallback(() => api.getDiagnostics(row.id), [row.id]);
  const state = useResource(load, revision);
  const [test, setTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState("");
  const testConnection = async () => {
    setTesting(true); setTest(null); setTestError("");
    try { setTest(await api.testConnection(row.id)); }
    catch (error) { setTestError(error?.message || "Kiểm tra kết nối thất bại."); }
    finally { setTesting(false); }
  };
  const data = state.value;
  return <SystemState loading={state.loading} error={state.error} onRetry={refresh}>
    {data && <div className="space-y-4">
      <KpiGrid items={[
        { label: "Trạng thái danh mục", value: STATUS_LABEL[row.statusKey] || row.statusKey },
        { label: "Sensor liên kết", value: data.sensorCount ?? "—" },
        { label: "Lệnh đang chờ", value: data.pendingCommands ?? "—" },
        { label: "RSSI", value: data.rssiDbm == null ? "—" : data.rssiDbm + " dBm" },
      ]}/>
      <Panel title="Kết nối và chẩn đoán">
        <Info entries={[
          ["Trạng thái BE", data.status], ["Heartbeat gần nhất", formatWhen(data.lastSeenAt)],
          ["IP", data.ipAddress], ["Firmware báo / đã lưu", data.firmwareVersion],
          ["Pin (%)", data.batteryLevel], ["Đo Sensor gần nhất", formatWhen(data.latestMeasurementAt)],
        ]}/>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" disabled={testing || row.statusKey === "maintenance"} onClick={testConnection} className="system-secondary-button">{testing ? "Đang kiểm tra…" : "Kiểm tra TCP"}</button>
          <p className="text-xs text-[#54747e]">Kiểm tra từ máy chủ, không phải phép thử relay hoặc xác minh tải điện.</p>
        </div>
        {testError && <p role="alert" className="mt-2 text-sm text-[#b93838]">{testError}</p>}
        {test && <p role="status" className={"mt-2 text-sm " + (test.reachable ? "text-[#13796e]" : "text-[#95600d]")}>{test.message}</p>}
      </Panel>
      <Panel title="Lần đo gần nhất của Sensor">
        <p className="mb-3 text-xs text-[#54747e]">Không phải lịch sử heartbeat. Hệ thống hiện lưu mốc heartbeat gần nhất.</p>
        <DataTable columns={[column("at", "Thời điểm", x => formatWhen(x.at))]} rows={(data.recentMeasurements || []).map((at, i) => ({ id: i, at }))} empty="Chưa có lần đo."/>
      </Panel>
    </div>}
  </SystemState>;
}
Monitor.propTypes = { row: PropTypes.object.isRequired, revision: PropTypes.number.isRequired, refresh: PropTypes.func.isRequired };

function portLabel(port) {
  return port ? port.portCode + (port.channel != null ? " · Kênh " + port.channel : "") : "Chưa gán port";
}
function linkedSensors(inventory, port) {
  return inventory.sensors.filter(x => x.controllerPortId === port.id || x.busPortId === port.id);
}
function linkedEquipment(inventory, port) {
  return inventory.equipment.filter(x => x.controllerPortId === port.id);
}
function sensorUrl(sensorId) {
  return "/system/devices/sensors?sensorId=" + encodeURIComponent(sensorId) + "&tab=config";
}
function registrationUrl(deviceId, portId) {
  return "/system/devices/sensors?deviceId=" + encodeURIComponent(deviceId) + "&portId=" + encodeURIComponent(portId);
}

function Ports({ row, inventory, refresh, refreshing }) {
  const [type, setType] = useState("");
  const [presence, setPresence] = useState("");
  const [search, setSearch] = useState("");
  const ports = inventory.ports;
  const rows = ports.filter(p => (!type || p.type === type) && (!presence || String(p.isPresent) === presence)
    && (!search.trim() || [p.portCode, p.gpio, p.secondaryGpio, p.channel, ...linkedSensors(inventory, p).map(x => x.sensorCode), ...linkedEquipment(inventory, p).map(x => x.name)].join(" ").toLowerCase().includes(search.trim().toLowerCase())));
  return <div className="space-y-4">
    <KpiGrid items={[
      { label: "Cổng hiện diện", value: ports.filter(p => p.isPresent).length },
      { label: "Output hiện diện", value: ports.filter(p => p.isPresent && p.type === "DIGITAL_OUTPUT").length },
      { label: "Chờ commissioning", value: ports.filter(p => p.isPresent && p.commissioningStatus === "Pending").length },
      { label: "Phiên bản manifest", value: inventory.capabilityVersion || "Chưa báo" },
    ]}/>
    <Panel title="Danh mục cổng phần cứng">
      <p className="mb-3 text-xs text-[#54747e]">Model: {shown(inventory.hardwareModel)}. GPIO ON/OFF là phản hồi đã lưu, không xác nhận bơm/van đang chạy. Không sửa GPIO trực tiếp từ web.</p>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <label className="text-xs text-[#526f79]">Tìm port / GPIO / thiết bị<input className={fieldClass} value={search} onChange={e => setSearch(e.target.value)}/></label>
        <label className="text-xs text-[#526f79]">Loại cổng<select className={fieldClass} value={type} onChange={e => setType(e.target.value)}><option value="">Tất cả</option>{[...new Set(ports.map(p => p.type))].sort().map(t => <option key={t}>{t}</option>)}</select></label>
        <label className="text-xs text-[#526f79]">Hiện diện<select className={fieldClass} value={presence} onChange={e => setPresence(e.target.value)}><option value="">Tất cả</option><option value="true">Hiện diện</option><option value="false">Đã rút khỏi manifest</option></select></label>
      </div>
      <div className="ctrl-port-grid">{rows.filter(p => p.isPresent && p.type === "DIGITAL_OUTPUT").map(p => <article className="ctrl-port-card" key={p.id}><header><strong>{p.portCode}</strong><span className={"ctrl-pill "+(p.reportedOn == null ? "warning" : p.reportedOn ? "online" : "")}>{stateLabel(p.reportedOn)}</span></header><p>GPIO {p.gpio} · Kênh {shown(p.channel)}</p><p>{linkedEquipment(inventory,p).map(e=>e.name).join(", ") || "Chưa liên kết"}</p><p>{shown(p.commissioningStatus)} · {formatWhen(p.lastReportedAt)}</p></article>)}</div>
      <DataTable rows={rows} empty={ports.length ? "Không có cổng phù hợp." : "Controller chưa khai báo danh mục cổng."} columns={[
        column("portCode", "Port", p => <strong>{p.portCode}</strong>),
        column("type", "Loại"),
        column("gpio", "GPIO", p => shown(p.gpio) + (p.secondaryGpio == null ? "" : " / " + p.secondaryGpio)),
        column("channel", "Kênh / Active", p => shown(p.channel) + " / " + shown(p.activeLevel)),
        column("isPresent", "Hiện diện", p => p.isPresent ? "Hiện diện" : "Đã rút"),
        column("commissioningStatus", "Commissioning", p => shown(p.commissioningStatus)),
        column("reportedOn", "GPIO báo", p => p.isPresent && p.type === "DIGITAL_OUTPUT" ? stateLabel(p.reportedOn) : "—"),
        column("binding", "Thiết bị liên kết", p => <div className="space-y-1">
          {linkedSensors(inventory, p).map(s => <div key={s.id}><Link className="text-[#13796e] underline" to={sensorUrl(s.id)}>{s.sensorCode}</Link></div>)}
          {linkedEquipment(inventory, p).map(e => <div key={e.id}>{e.name}</div>)}
          {!linkedSensors(inventory, p).length && !linkedEquipment(inventory, p).length && <span>Chưa liên kết</span>}
          {p.isPresent && (BUS_TYPES.includes(p.type) || ["DIGITAL_INPUT", "ANALOG_INPUT"].includes(p.type) && !linkedSensors(inventory, p).length) && <Link className="block text-[#13796e] underline" to={registrationUrl(row.id, p.id)}>Đăng ký Sensor</Link>}
        </div>),
        column("lastReportedAt", "Báo lúc", p => formatWhen(p.lastReportedAt)),
      ]}/>
    </Panel>
    <Commissioning row={row} inventory={inventory} refresh={refresh} refreshing={refreshing}/>
  </div>;
}
Ports.propTypes = { row: PropTypes.object.isRequired, inventory: PropTypes.object.isRequired, refresh: PropTypes.func.isRequired, refreshing: PropTypes.bool };

function isRecentOff(port) {
  const age = Date.now() - new Date(port.lastReportedAt).getTime();
  return port.isPresent && port.reportedOn === false && Number.isFinite(age) && age >= -60000 && age <= 120000;
}

function Commissioning({ row, inventory, refresh, refreshing }) {
  const [portId, setPortId] = useState("");
  const [status, setStatus] = useState("Verified");
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const outputs = inventory.ports.filter(p => p.isPresent && p.type === "DIGITAL_OUTPUT");
  const port = outputs.find(p => p.id === portId);
  const exact = port && linkedEquipment(inventory, port).filter(e => String(e.relayChannel) === String(port.channel)).length === 1;
  const locked = inventory.hardwareControlDisabled === true;
  const eligible = Boolean(locked && port && isRecentOff(port) && (status !== "Verified" || exact) && confirmed && note.trim() && status !== port.commissioningStatus && !refreshing);
  const save = async e => {
    e.preventDefault(); if (!eligible || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api.saveControllerCommissioning(row.id, port.id, {
        expectedConfigVersion: inventory.capabilityVersion, expectedStatus: port.commissioningStatus,
        status, physicalCheckConfirmed: confirmed, note: note.trim(),
      });
      setMessage("Đã ghi nhận kết quả kiểm tra phần cứng; không gửi lệnh điều khiển.");
      setConfirmed(false); setNote(""); refresh();
    } catch (err) { setError(err?.message || "Không lưu được kết quả kiểm tra."); }
    finally { setBusy(false); }
  };
  return <Panel title="Nghiệm thu cổng Output (Commissioning)">
    <p className="mb-3 text-xs text-[#54747e]">Chỉ ghi nhận kết quả kiểm tra thực tế của kỹ thuật viên; không cấp điện, không kiểm thử tự động. Chỉ cho phép khi khóa điều khiển phần cứng đang bật, GPIO báo OFF trong 2 phút và không còn lệnh đang chạy. Verified yêu cầu một ánh xạ RAS chính xác.</p>
    {!locked && <p role="alert" className="mb-3 text-sm text-[#95600d]">Chưa xác nhận khóa điều khiển phần cứng đang bật. Tạm khóa cấu hình nghiệm thu.</p>}
    {!outputs.length ? <p className="text-sm text-[#526f79]">Chưa có output hiện diện để nghiệm thu.</p> : <form onSubmit={save} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs text-[#526f79]">Output<select className={fieldClass} disabled={busy || refreshing || !locked} value={portId} onChange={e => {setPortId(e.target.value); setConfirmed(false); setNote(""); setError(""); setMessage("");}}><option value="">Chọn output</option>{outputs.map(p => <option key={p.id} value={p.id}>{portLabel(p)} · {p.commissioningStatus}</option>)}</select></label>
        <label className="text-xs text-[#526f79]">Kết quả<select className={fieldClass} disabled={busy || refreshing || !locked} value={status} onChange={e => {setStatus(e.target.value); setConfirmed(false);}}><option value="Verified">Verified – Đã kiểm tra đạt</option><option value="Pending">Pending – Cần kiểm tra lại</option><option value="Disabled">Disabled – Không cho phép sử dụng</option></select></label>
      </div>
      {port && !isRecentOff(port) && <p className="text-xs text-[#95600d]">Chưa có phản hồi GPIO OFF đủ mới. Cập nhật trạng thái từ controller rồi thử lại.</p>}
      {port && status === "Verified" && !exact && <p className="text-xs text-[#95600d]">Output chưa có ánh xạ RAS chính xác.</p>}
      <label className="block text-xs text-[#526f79]">Ghi chú kiểm tra<textarea className={fieldClass} rows={3} maxLength={500} required disabled={busy || refreshing || !locked} value={note} onChange={e => setNote(e.target.value)} placeholder="Kết quả kiểm tra đấu dây, tải, bảo vệ và điều kiện an toàn"/></label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy || refreshing || !locked} onChange={e => setConfirmed(e.target.checked)}/><span>Tôi đã kiểm tra thực tế và xác nhận trạng thái tải điện an toàn; không dựa riêng vào GPIO báo OFF.</span></label>
      <button className="system-primary-button" type="submit" disabled={!eligible || busy}>{busy ? "Đang lưu…" : "Lưu kết quả nghiệm thu"}</button>
    </form>}
    {error && <p role="alert" className="mt-2 text-sm text-[#b93838]">{error}</p>}
    {message && <p role="status" className="mt-2 text-sm text-[#13796e]">{message}</p>}
  </Panel>;
}
Commissioning.propTypes = { row: PropTypes.object.isRequired, inventory: PropTypes.object.isRequired, refresh: PropTypes.func.isRequired, refreshing: PropTypes.bool };

function RelayMapping({ row, inventory, refresh, refreshing, revision }) {
  const areaId = row.raw.farmingAreaId;
  const load = useCallback(signal => areaId ? api.getControllerRasDiagram(areaId, signal) : Promise.resolve(null), [areaId]);
  const state = useResource(load, revision);
  const [nodeId, setNodeId] = useState("");
  const [channel, setChannel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const nodes = (state.value?.nodes || []).filter(n => !n.relayDeviceId || n.relayDeviceId === row.id);
  const node = nodes.find(n => n.id === nodeId);
  const currentOutputs = inventory.ports.filter(p => p.isPresent && p.type === "DIGITAL_OUTPUT" && p.channel != null);
  const locked = inventory.hardwareControlDisabled === true;
  const available = currentOutputs.filter(p => p.commissioningStatus !== "Disabled" && isRecentOff(p) && !inventory.equipment.some(e => (e.controllerPortId === p.id || String(e.relayChannel) === String(p.channel)) && e.id !== nodeId));
  const selectNode = e => {
    const id = e.target.value; setNodeId(id);
    const selected = nodes.find(n => n.id === id);
    setChannel(selected?.relayDeviceId === row.id ? String(selected.relayChannel ?? "") : "");
    setError(""); setNotice("");
  };
  const save = async e => {
    e.preventDefault();
    if (!locked || refreshing || !node || busy || (channel && !available.some(p => String(p.channel) === channel)) || (!channel && node.relayDeviceId !== row.id)) return;
    if (!window.confirm(channel ? "Xác nhận đã kiểm tra tải điện an toàn trước khi ánh xạ RAS vào kênh " + channel + "? Cần nghiệm thu lại trước khi vận hành." : "Xác nhận đã kiểm tra tải điện an toàn trước khi gỡ liên kết? Thao tác này không tắt tải điện.")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api.updateControllerRelay(areaId, node.id, { relayDeviceId: channel ? row.id : null, relayChannel: channel || null });
      setNotice("Đã lưu ánh xạ. Không có lệnh bật/tắt nào được gửi.");
      refresh();
    } catch (err) { setError(err?.message || "Không lưu được ánh xạ."); }
    finally { setBusy(false); }
  };
  if (!areaId) return <Panel title="Ánh xạ thiết bị RAS"><p className="text-sm text-[#526f79]">Gán Controller vào khu nuôi trước khi liên kết thiết bị RAS.</p></Panel>;
  return <Panel title="Cấu hình ánh xạ thiết bị RAS">
    <SystemState loading={state.loading} error={state.error} onRetry={refresh}>
      <p className="mb-3 text-xs text-[#54747e]">Chỉ chọn thiết bị RAS có sẵn trong khu của Controller và output hiện diện báo OFF gần đây. Không thực hiện bật/tắt. Đổi ánh xạ sẽ yêu cầu nghiệm thu lại.</p>
      {!locked && <p role="alert" className="mb-3 text-sm text-[#95600d]">Chưa xác nhận khóa điều khiển phần cứng đang bật. Tạm khóa thay đổi ánh xạ.</p>}
      {!nodes.length ? <p className="text-sm text-[#526f79]">Không có thiết bị RAS phù hợp trong khu này.</p> : <form className="space-y-3" onSubmit={save}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs text-[#526f79]">Thiết bị RAS<select disabled={busy || refreshing || !locked} className={fieldClass} value={nodeId} onChange={selectNode}><option value="">Chọn thiết bị</option>{nodes.map(n => <option key={n.id} value={n.id}>{n.displayLabel || n.nodeCode}{n.relayDeviceId ? " · Đã liên kết kênh " + n.relayChannel : ""}</option>)}</select></label>
          <label className="text-xs text-[#526f79]">Output<select disabled={!node || busy || refreshing || !locked} className={fieldClass} value={channel} onChange={e => setChannel(e.target.value)}><option value="">Không liên kết</option>{available.map(p => <option key={p.id} value={String(p.channel)}>{portLabel(p)} · {p.commissioningStatus}</option>)}</select></label>
        </div>
        <button type="submit" className="system-primary-button" disabled={busy || refreshing || !locked || !node || (!channel && node.relayDeviceId !== row.id) || (Boolean(channel) && !available.some(p => String(p.channel) === channel))}>{busy ? "Đang lưu…" : "Lưu ánh xạ"}</button>
      </form>}
      {error && <p role="alert" className="mt-2 text-sm text-[#b93838]">{error}</p>}
      {notice && <p role="status" className="mt-2 text-sm text-[#13796e]">{notice}</p>}
    </SystemState>
  </Panel>;
}
RelayMapping.propTypes = { row: PropTypes.object.isRequired, inventory: PropTypes.object.isRequired, refresh: PropTypes.func.isRequired, refreshing: PropTypes.bool, revision: PropTypes.number };

function Bindings({ row, inventory, refresh, refreshing, revision }) {
  const ports = new Map(inventory.ports.map(p => [p.id, p]));
  return <div className="space-y-4">
    <Panel title="Sensor liên kết">
      <DataTable rows={inventory.sensors} empty="Chưa có Sensor liên kết với Controller." columns={[
        column("sensorCode", "Sensor", s => <Link className="text-[#13796e] underline" to={sensorUrl(s.id)}>{s.sensorCode}</Link>),
        column("sensorType", "Loại"),
        column("port", "Port", s => portLabel(ports.get(s.controllerPortId || s.busPortId))),
        column("busAddress", "Địa chỉ / Thanh ghi", s => shown(s.busAddress) + " / " + shown(s.busRegister)),
        column("action", "Thao tác", s => <Link className="text-[#13796e] underline" to={sensorUrl(s.id)}>Cấu hình Sensor</Link>),
      ]}/>
    </Panel>
    <Panel title="Actuator / thiết bị RAS liên kết">
      <DataTable rows={inventory.equipment} empty="Chưa có thiết bị RAS liên kết." columns={[
        column("name", "Thiết bị"),
        column("relayChannel", "Kênh", e => shown(e.relayChannel)),
        column("port", "Port", e => portLabel(ports.get(e.controllerPortId))),
        column("state", "GPIO báo", e => { const p = ports.get(e.controllerPortId); return p?.isPresent ? stateLabel(p.reportedOn) : "Chưa có phản hồi"; }),
        column("commissioning", "Commissioning", e => shown(ports.get(e.controllerPortId)?.commissioningStatus)),
      ]}/>
    </Panel>
    <RelayMapping row={row} inventory={inventory} refresh={refresh} refreshing={refreshing} revision={revision}/>
  </div>;
}
Bindings.propTypes = { row: PropTypes.object.isRequired, inventory: PropTypes.object.isRequired, refresh: PropTypes.func.isRequired, refreshing: PropTypes.bool, revision: PropTypes.number };

function InventoryView({ row, tab, revision, refresh }) {
  const load = useCallback(signal => api.getControllerPorts(row.id, signal), [row.id]);
  const state = useResource(load, revision, true);
  return {tab === "provisioning" ? <ControllerProvisioning/> : <SystemState loading={state.loading && !state.value} error={state.error} onRetry={refresh}>
    {state.value && (tab === "ports" ? <Ports row={row} inventory={state.value} refresh={refresh} refreshing={state.loading}/> : <Bindings row={row} inventory={state.value} refresh={refresh} refreshing={state.loading} revision={revision}/>)}
  </SystemState>;
}
InventoryView.propTypes = { row: PropTypes.object.isRequired, tab: PropTypes.string.isRequired, revision: PropTypes.number.isRequired, refresh: PropTypes.func.isRequired };

function CommandHistory({ row, revision, refresh }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [status, setStatus] = useState("");
  const load = useCallback(signal => api.getControllerCommandHistory(row.id, { page, pageSize, status }, signal), [row.id, page, pageSize, status]);
  const state = useResource(load, revision);
  const data = state.value;
  const pages = Math.max(1, Math.ceil((data?.totalCount || 0) / pageSize));
  return <Panel title="Nhật ký lệnh điều khiển">
    <p className="mb-3 text-xs text-[#54747e]">Lệnh được lưu tại Cloud. Phản hồi lệnh không phải bằng chứng thiết bị điện đã thực sự hoạt động.</p>
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <label className="text-xs text-[#526f79]">Trạng thái<select className={fieldClass} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Tất cả</option>{Object.entries(COMMAND_STATES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="text-xs text-[#526f79]">Số dòng<select className={fieldClass} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>{[10,25,50,100].map(n => <option key={n}>{n}</option>)}</select></label>
    </div>
    <SystemState loading={state.loading} error={state.error} onRetry={refresh}>
      {data && <>
        <DataTable rows={data.items} empty="Không có lệnh phù hợp." columns={[
          column("createdAt", "Thời điểm", c => formatWhen(c.createdAt)),
          column("command", "Lệnh", c => <strong>{shown(c.command)}</strong>),
          column("channel", "Kênh", c => shown(c.channel)),
          column("requestSource", "Nguồn", c => shown(c.requestSource)),
          column("status", "Trạng thái", c => <span className={statusClass(c.status === "acknowledged" ? "success" : c.status === "timedout" ? "warning" : c.status)}>{COMMAND_STATES[c.status] || c.status}</span>),
          column("attemptCount", "Lần thử", c => shown(c.attemptCount)),
          column("deliveredAt", "Giao lúc", c => formatWhen(c.deliveredAt)),
          column("expiresAt", "Hết hạn", c => formatWhen(c.expiresAt)),
          column("commandSequence", "Sequence", c => shown(c.commandSequence)),
          column("acknowledgedAt", "Phản hồi / lỗi", c => formatWhen(c.acknowledgedAt || c.failedAt || c.supersededAt)),
          column("resultMessage", "Kết quả", c => shown(c.resultMessage)),
          column("inventoryRevision", "Revision", c => shown(c.inventoryRevision)),
        ]}/>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>{data.totalCount} lệnh · Trang {page}/{pages}</span>
          <div className="flex gap-2"><button className="system-secondary-button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</button><button className="system-secondary-button" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Sau</button></div>
        </div>
      </>}
    </SystemState>
  </Panel>;
}
CommandHistory.propTypes = { row: PropTypes.object.isRequired, revision: PropTypes.number.isRequired, refresh: PropTypes.func.isRequired };

function TechnicalEvents({ row, revision, refresh }) {
  const loadPorts = useCallback(signal => api.getControllerPorts(row.id, signal), [row.id]);
  const loadLogs = useCallback(() => api.getDeviceLogs(row.id), [row.id]);
  const ports = useResource(loadPorts, revision);
  const logs = useResource(loadLogs, revision);
  const loadFailures = useCallback(signal => Promise.all([
    api.getControllerCommandHistory(row.id, { page: 1, pageSize: 10, status: "failed" }, signal),
    api.getControllerCommandHistory(row.id, { page: 1, pageSize: 10, status: "timedout" }, signal),
  ]).then(results => results.flatMap(result => result.items).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))), [row.id]);
  const failures = useResource(loadFailures, revision);
  const warnings = useMemo(() => {
    const issues = row.issues.map((message, i) => ({ id: "issue-" + i, type: "Danh mục", message }));
    if (!row.lastSeen) issues.push({ id: "heartbeat", type: "Heartbeat", message: "Chưa nhận heartbeat." });
    else if (row.statusKey === "offline" || row.statusKey === "warning") issues.push({ id: "heartbeat", type: "Kết nối", message: "Controller cần kiểm tra kết nối; heartbeat gần nhất " + formatWhen(row.lastSeen) });
    if (ports.value) {
      if (!ports.value.capabilityVersion) issues.push({ id: "manifest", type: "Manifest", message: "Controller chưa báo danh mục phần cứng." });
      for (const port of ports.value.ports) {
        if (!port.isPresent) issues.push({ id: port.id, type: "Port đã rút", message: port.portCode + " không còn hiện diện trong manifest." });
        else if (port.commissioningStatus === "Pending") issues.push({ id: port.id, type: "Commissioning", message: port.portCode + " chưa được xác minh." });
        else if (port.commissioningStatus === "Disabled") issues.push({ id: port.id, type: "Port", message: port.portCode + " đang Disabled." });
      }
    }
    return issues;
  }, [row, ports.value]);
  return <div className="space-y-4">
    <Panel title="Kiểm tra kỹ thuật hiện tại">
      <p className="mb-3 text-xs text-[#54747e]">Các mục kiểm tra suy ra từ trạng thái và manifest hiện tại, không phải cảnh báo đã được lưu.</p>
      <SystemState loading={ports.loading} error={ports.error} onRetry={refresh}>
        <DataTable rows={warnings} columns={[column("type", "Nhóm"), column("message", "Nội dung")]} empty="Không phát hiện mục cần kiểm tra trong dữ liệu hiện tại."/>
      </SystemState>
    </Panel>
    <Panel title="Cảnh báo và nhật ký kỹ thuật đã ghi">
      <SystemState loading={logs.loading} error={logs.error} onRetry={refresh}>
        <DataTable rows={logs.value || []} columns={[
          column("at", "Thời điểm", l => formatWhen(l.at)), column("severity", "Mức độ"), column("source", "Nguồn"), column("message", "Nội dung"),
        ]} empty="Chưa có nhật ký kỹ thuật."/>
      </SystemState>
      <p className="mt-3 text-xs text-[#54747e]">Xem kết quả lệnh chi tiết trong tab Lịch sử điều khiển.</p>
    </Panel>
    <Panel title="Lệnh thất bại hoặc hết hạn gần đây">
      <SystemState loading={failures.loading} error={failures.error} onRetry={refresh}>
        <DataTable rows={failures.value || []} columns={[
          column("createdAt", "Thời điểm", x => formatWhen(x.createdAt)), column("command", "Lệnh"),
          column("channel", "Kênh", x => shown(x.channel)), column("status", "Trạng thái", x => COMMAND_STATES[x.status] || x.status),
          column("resultMessage", "Kết quả", x => shown(x.resultMessage)),
        ]} empty="Không có lệnh thất bại hoặc hết hạn."/>
      </SystemState>
      <p className="mt-3 text-xs text-[#54747e]">Tối đa 10 lệnh mỗi nhóm trạng thái; đây là kết quả lệnh đã lưu, không phải cảnh báo mới.</p>
    </Panel>
  </div>;
}
TechnicalEvents.propTypes = { row: PropTypes.object.isRequired, revision: PropTypes.number.isRequired, refresh: PropTypes.func.isRequired };

function ConfigForm({ detail, areas, onSaved }) {
  const [draft, setDraft] = useState({
    name: detail.name || "", ipAddress: detail.ipAddress || "", macAddress: detail.macAddress || "",
    installationLocation: detail.installationLocation || "", note: detail.note || "",
    farmingAreaId: detail.farmingAreaId || "", farmingRowId: detail.farmingRowId || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const area = areas.find(a => a.id === draft.farmingAreaId);
  const change = (key, value) => setDraft(d => ({ ...d, [key]: value, ...(key === "farmingAreaId" ? { farmingRowId: "" } : {}) }));
  const save = async e => {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const moved = draft.farmingAreaId !== (detail.farmingAreaId || "");
      if (moved && (detail.sensorCount > 0 || detail.actuatorCount > 0)) throw new Error("Gỡ hoặc chuyển các liên kết Sensor/RAS trước khi chuyển Controller sang khu khác.");
      await api.updateDevice(detail.id, { ...draft, farmingAreaId: draft.farmingAreaId || EMPTY_ID, farmingRowId: draft.farmingRowId || EMPTY_ID });
      setNotice("Đã lưu cấu hình kỹ thuật.");
      onSaved();
    } catch (err) { setError(err?.message || "Không lưu được cấu hình."); }
    finally { setBusy(false); }
  };
  return <Panel title="Thông tin và vị trí Controller">
    <p className="mb-3 text-xs text-[#54747e]">Chỉ cập nhật metadata. Phiên bản firmware và cấu hình GPIO do thiết bị báo; không chỉnh trạng thái Online thủ công.</p>
    <Info entries={[["Mã Controller", detail.deviceCode], ["Loại", detail.deviceType], ["Firmware", detail.firmwareVersion], ["Heartbeat gần nhất", formatWhen(detail.lastSeenAt)]]}/>
    <form onSubmit={save} className="mt-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {[["name","Tên"],["ipAddress","IP"],["macAddress","MAC"],["installationLocation","Vị trí lắp đặt"]].map(([key,label]) => <label key={key} className="text-xs text-[#526f79]">{label}<input className={fieldClass} maxLength={key === "installationLocation" ? 200 : 128} value={draft[key]} disabled={busy} onChange={e => change(key,e.target.value)}/></label>)}
        <label className="text-xs text-[#526f79]">Khu nuôi<select className={fieldClass} disabled={busy} value={draft.farmingAreaId} onChange={e => change("farmingAreaId",e.target.value)}><option value="">Chưa gán</option>{areas.filter(a => a.isActive || a.id === draft.farmingAreaId).map(a => <option key={a.id} value={a.id}>{a.name || a.code}</option>)}</select></label>
        <label className="text-xs text-[#526f79]">Dãy nuôi<select className={fieldClass} disabled={busy || !area} value={draft.farmingRowId} onChange={e => change("farmingRowId",e.target.value)}><option value="">Không gán dãy</option>{(area?.rows || []).filter(r => r.isActive || r.id === draft.farmingRowId).map(r => <option key={r.id} value={r.id}>{r.name || r.code}</option>)}</select></label>
      </div>
      <label className="block text-xs text-[#526f79]">Ghi chú<textarea className={fieldClass} rows={3} maxLength={500} value={draft.note} disabled={busy} onChange={e => change("note",e.target.value)}/></label>
      <button className="system-primary-button" type="submit" disabled={busy}>{busy ? "Đang lưu…" : "Lưu cấu hình"}</button>
      {error && <p role="alert" className="text-sm text-[#b93838]">{error}</p>}
      {notice && <p role="status" className="text-sm text-[#13796e]">{notice}</p>}
    </form>
  </Panel>;
}
ConfigForm.propTypes = { detail: PropTypes.object.isRequired, areas: PropTypes.array.isRequired, onSaved: PropTypes.func.isRequired };

function Configuration({ row, revision, refresh }) {
  const load = useCallback(() => Promise.all([api.getDevice(row.id), api.getDeviceLocations()]), [row.id]);
  const state = useResource(load, revision);
  const [saved, setSaved] = useState(false);
  return <>
    {saved && <p role="status" className="mb-3 text-sm text-[#13796e]">Đã lưu cấu hình kỹ thuật.</p>}
    <SystemState loading={state.loading} error={state.error} onRetry={refresh}>
      {state.value && <ConfigForm detail={state.value[0]} areas={state.value[1]} onSaved={() => { setSaved(true); refresh(); }}/>}
    </SystemState>
  </>;
}
Configuration.propTypes = { row: PropTypes.object.isRequired, revision: PropTypes.number.isRequired, refresh: PropTypes.func.isRequired };

function Workspace({ tab, controllerId, onChange }) {
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(v => v + 1), []);
  const load = useCallback(() => api.getDevices(), []);
  const state = useResource(load, revision, true);
  const rows = useMemo(() => mapDeviceRows(state.value || [], []).filter(r => r.type === "controller"), [state.value]);
  const row = controllerId ? rows.find(r => r.id === controllerId) : rows[0];
  return <SystemPage title="Quản lý Controller" description="Giám sát phần cứng, ánh xạ thiết bị, lịch sử lệnh và cấu hình kỹ thuật." actions={<button className="system-secondary-button" type="button" onClick={refresh}>Làm mới</button>}>
    <Tabs tab={tab} controllerId={row?.id || controllerId} onChange={onChange}/>
    <SystemState loading={state.loading && !state.value} error={state.error} onRetry={refresh}>
      {!rows.length ? <Panel title="Chưa có Controller"><Link to={BASE} className="text-[#13796e] underline">Mở danh sách để đăng ký Controller</Link></Panel> : <>
        <div className="ctrl-context">
          <span className="ctrl-context-icon"><Cpu size={24}/></span>
          <label className="min-w-[200px] flex-1 text-xs text-[#526f79]">Controller<select className={fieldClass} value={row?.id || ""} onChange={e => onChange(tab,e.target.value)}><option value="" disabled>Chọn Controller</option>{rows.map(r => <option key={r.id} value={r.id}>{r.code} · {r.name} · {STATUS_LABEL[r.statusKey] || r.statusKey}</option>)}</select></label>
          {row && <div className="ctrl-context-meta"><span className={"ctrl-pill "+row.statusKey}>{STATUS_LABEL[row.statusKey] || row.statusKey}</span><span>{row.location}</span><span>IP: {shown(row.ip)}</span><span>Firmware: {shown(row.firmware)}</span></div>}
        </div>
        {!row ? <p role="alert" className="text-sm text-[#b93838]">Controller trong đường dẫn không còn tồn tại. Chọn thiết bị khác.</p> : <div key={row.id + ":" + tab}>
          {tab === "monitor" && <Monitor row={row} revision={revision} refresh={refresh}/>}
          {(tab === "ports" || tab === "bindings") && <InventoryView row={row} tab={tab} revision={revision} refresh={refresh}/>}
          {tab === "history" && <CommandHistory row={row} revision={revision} refresh={refresh}/>}
          {tab === "events" && <TechnicalEvents row={row} revision={revision} refresh={refresh}/>}
          {tab === "config" && <Configuration row={row} revision={revision} refresh={refresh}/>}
        </div>}
      </>}
    </SystemState>}
  </SystemPage>;
}
Workspace.propTypes = { tab: PropTypes.string.isRequired, controllerId: PropTypes.string, onChange: PropTypes.func.isRequired };

export default function ControllerManagement() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some(([id]) => id === requested) ? requested : "list";
  const controllerId = params.get("controllerId") || "";
  const navigate = (nextTab, id) => {
    const next = new URLSearchParams();
    if (nextTab !== "list") next.set("tab", nextTab);
    if (id) next.set("controllerId", id);
    setParams(next);
  };
  return <div className="controller-workspace">{tab === "list" ? <DeviceManagement kind="controller" navigation={<Tabs tab={tab} controllerId={controllerId} onChange={navigate}/>} onControllerTab={navigate}/> : <Workspace tab={tab} controllerId={controllerId} onChange={navigate}/>}</div>;
}
