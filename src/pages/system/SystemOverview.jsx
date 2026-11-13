import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Activity, ArrowRight, Bell, Brain, Cctv, CheckCircle2, Clock, Cpu, Database, HardDrive, MapPin, RefreshCw, Server, Shield, TriangleAlert, Wifi, WifiOff, Wrench } from "lucide-react";
import systemAdminService from "../../services/systemAdminService";
import { useSettings } from "../../context/SettingsContext";
import { deviceKind, formatWhen, formatBytes } from "./deviceModel";

const jobs = {
  devices: () => systemAdminService.getDevices(),
  sensors: () => systemAdminService.getSensors(),
  ai: () => systemAdminService.getAiServices(),
  health: () => systemAdminService.getHealth(),
  metrics: () => systemAdminService.getMetrics(),
  services: () => systemAdminService.getServices(),
  capacity: () => systemAdminService.getStorageCapacity(),
  schedules: () => systemAdminService.getRecordingSchedules(),
  alerts: () => systemAdminService.getAlerts(false),
  logs: () => systemAdminService.getLogs(),
  backups: () => systemAdminService.getBackups(),
  backupSchedule: () => systemAdminService.getBackupSchedule(),
  deployments: () => systemAdminService.getDeployments(),
  versions: () => systemAdminService.getVersions(),
  security: () => systemAdminService.getSecurityOverview(),
};
const labels = {devices:"Thiết bị",sensors:"Cảm biến",ai:"Dịch vụ AI",health:"Tình trạng hệ thống",metrics:"Tài nguyên",services:"Dịch vụ nền",capacity:"Lưu trữ",schedules:"Lịch ghi hình",alerts:"Cảnh báo",logs:"Nhật ký",backups:"Sao lưu",backupSchedule:"Lịch sao lưu",deployments:"Triển khai",versions:"Phiên bản",security:"Bảo mật"};
const tones = { green:"bg-[#e4f7ed] text-[#176b47]", gray:"bg-[#edf1f4] text-[#506579]", red:"bg-[#fdeceb] text-[#b83b35]", amber:"bg-[#fff4dc] text-[#94600c]", blue:"bg-[#e7f3fa] text-[#216d9d]" };
const list = (value) => Array.isArray(value) ? value : [];
const lower = (value) => String(value || "").toLowerCase();
const missing = "—";
const number = (value) => value == null || value === "" || !Number.isFinite(Number(value)) ? null : Number(value);
const pct = (used,total) => number(used) == null || number(total) == null || Number(total) <= 0 ? null : Math.max(0,Math.min(100,Math.round(Number(used)/Number(total)*100)));
const bytes = (value) => number(value) == null ? missing : formatBytes(value);
const when = (value) => formatWhen(value);
const duration = (seconds) => seconds == null ? missing : Math.floor(seconds/86400)+" ngày "+Math.floor(seconds%86400/3600)+" giờ "+Math.floor(seconds%3600/60)+" phút";
const dateValue = (value) => new Date(value || 0).getTime() || 0;
const status = (value) => {
  const v=lower(value);
  if (["online","connected","active","running"].includes(v)) return "online";
  if (["offline","disconnected","inactive","disabled"].includes(v)) return "offline";
  if (["error","critical","failed","fault"].includes(v)) return "error";
  if (v==="maintenance") return "maintenance";
  return "unknown";
};
function sensorStatus(sensor) {
  if(sensor.isActive===false) return "disabled";
  if(sensor.status) return status(sensor.status);
  const seen=dateValue(sensor.lastSeenAt);
  if (!seen) return "unknown";
  return Date.now()-seen > 15*60*1000 ? "offline" : "online";
}
function Panel({title,icon:Icon,to,children,className=""}) {
  return <section className={`min-w-0 rounded-[19px] border border-[#deebe8] bg-white p-4 shadow-[0_3px_12px_rgba(29,80,84,0.05)] ${className}`}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-base font-extrabold"><Icon size={21} className="shrink-0 text-[#13897f]" aria-hidden="true"/>{title}</h2>{to&&<Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-[#187b83] hover:underline">Chi tiết <ArrowRight size={14}/></Link>}</div>{children}
  </section>;
}
Panel.propTypes={title:PropTypes.string.isRequired,icon:PropTypes.elementType.isRequired,to:PropTypes.string,children:PropTypes.node,className:PropTypes.string};
function Kpi({label,value,hint,icon:Icon,to,tone}) {
  return <Link to={to} className="min-w-0 rounded-[19px] border border-[#deebe8] bg-white p-4 shadow-[0_3px_12px_rgba(29,80,84,0.05)] transition hover:border-[#86cabb] hover:shadow-md"><div className="flex items-start gap-3"><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}><Icon size={25}/></div><div className="min-w-0"><h2 className="text-sm font-bold">{label}</h2><div className="mt-1 text-[30px] font-extrabold leading-none tabular-nums">{value}</div><p className="mt-2 text-xs leading-snug text-[#64818b]">{hint}</p></div></div></Link>;
}
Kpi.propTypes={label:PropTypes.string.isRequired,value:PropTypes.node,hint:PropTypes.string,icon:PropTypes.elementType.isRequired,to:PropTypes.string.isRequired,tone:PropTypes.string.isRequired};
function Gauge({label,value}) {
  const v=number(value);
  const fill=v==null?0:Math.max(0,Math.min(100,v));
  return <div className="min-w-0 text-center"><p className="text-xs font-bold">{label}</p><svg viewBox="0 0 100 60" className="mx-auto mt-2 w-full max-w-[112px]" role="img" aria-label={label+" "+(v==null?"chưa có dữ liệu":fill+"%")}><path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e4edee" strokeWidth="9" strokeLinecap="round"/><path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={fill>=85?"#e3a12c":"#24a78c"} strokeWidth="9" strokeLinecap="round" pathLength="100" strokeDasharray={fill+" 100"}/><text x="50" y="48" textAnchor="middle" fill="#153b56" fontSize="17" fontWeight="700">{v==null?missing:fill+"%"}</text></svg></div>;
}
Gauge.propTypes={label:PropTypes.string.isRequired,value:PropTypes.number};
function Empty({children}) { return <p className="rounded-xl bg-[#f5f9f8] px-3 py-4 text-sm text-[#64818b]">{children}</p>; }
Empty.propTypes={children:PropTypes.node};
function Row({label,value}) {return <div className="flex items-center justify-between gap-3 border-b border-[#e9f0ef] py-2.5 last:border-0"><span className="min-w-0 text-sm text-[#56717e]">{label}</span><strong className="min-w-0 break-words text-right text-sm">{value}</strong></div>;}
Row.propTypes={label:PropTypes.string.isRequired,value:PropTypes.node};

export default function SystemOverview() {
  const {settings}=useSettings();
  const [data,setData]=useState({});
  const [failures,setFailures]=useState([]);
  const [loading,setLoading]=useState(true);
  const [updated,setUpdated]=useState(null);
  const busy=useRef(false);
  const mounted=useRef(false);
  const load=useCallback(async()=>{
    if(busy.current) return;
    busy.current=true;
    setLoading(true);
    const keys=Object.keys(jobs);
    try {
      const results=await Promise.allSettled(keys.map(key=>Promise.resolve().then(jobs[key])));
      if(!mounted.current) return;
      const next={}; const failed=[];
      results.forEach((r,i)=>{if(r.status==="fulfilled") next[keys[i]]=r.value; else failed.push(keys[i]);});
      setData(next);setFailures(failed);
      if(failed.length<keys.length) setUpdated(new Date());
    } finally {busy.current=false;if(mounted.current)setLoading(false);}
  },[]);
  const refreshSeconds=Math.max(10,Math.min(3600,Number(settings.refreshInterval)||30));
  useEffect(()=>{mounted.current=true;load();const timer=window.setInterval(load,refreshSeconds*1000);return()=>{mounted.current=false;window.clearInterval(timer);};},[load,refreshSeconds]);
  const devices=list(data.devices), sensors=list(data.sensors), ai=list(data.ai), schedules=list(data.schedules);
  const cameras=devices.filter(d=>deviceKind(d)==="camera"), controllers=devices.filter(d=>deviceKind(d)==="controller");
  const counts={online:0,offline:0,error:0,maintenance:0,unknown:0,disabled:0};
  devices.forEach(d=>counts[status(d.status)]++);sensors.forEach(s=>counts[sensorStatus(s)]++);
  const complete=Array.isArray(data.devices)&&Array.isArray(data.sensors);
  const total=devices.length+sensors.length;
  const used=data.capacity?.usedBytes??data.metrics?.storageUsedBytes;
  const capacity=data.capacity?.totalBytes??data.metrics?.storageTotalBytes;
  const storagePct=pct(used,capacity);
  const remaining=number(used)!=null&&number(capacity)!=null?Math.max(0,Number(capacity)-Number(used)):null;
  const cpu=number(data.metrics?.hostCpuPercent);
  const ram=pct(data.metrics?.hostMemoryUsedBytes,data.metrics?.hostMemoryTotalBytes);
  const uptime=number(data.metrics?.hostUptimeSeconds);
  const apiUptime=number(data.metrics?.apiUptimeSeconds);
  const alerts=[...list(data.alerts)].sort((a,b)=>dateValue(b.lastOccurredAt||b.createdAt)-dateValue(a.lastOccurredAt||a.createdAt));
  const logs=[...list(data.logs)].sort((a,b)=>dateValue(b.at)-dateValue(a.at));
  const areas=[...new Map(devices.filter(d=>d.farmingAreaId).map(d=>[d.farmingAreaId,d.areaName||d.areaCode||d.farmingAreaId])).entries()];
  const backup=[...list(data.backups)].sort((a,b)=>dateValue(b.createdAtUtc)-dateValue(a.createdAtUtc))[0];
  const deploy=list(data.deployments)[0];
  const version=list(data.versions).find(v=>v.component==="Backend API");
  const onlineAi=ai.filter(s=>lower(s.runtimeStatus)==="running").length;
  const verifiedAi=ai.filter(s=>["running","stopped","error","offline"].includes(lower(s.runtimeStatus))).length;
  const scheduleEnabled=schedules.filter(s=>s.mode&&lower(s.mode)!=="disabled").length;
  const scheduleTimed=schedules.filter(s=>lower(s.mode)==="scheduled").length;
  const runtimeRecording=schedules.filter(s=>lower(s.runtimeStatus)==="recording").length;
  const unverifiedRecording=schedules.some(s=>lower(s.mode)!=="disabled"&&["","notintegrated","unknown"].includes(lower(s.runtimeStatus)));
  const health=data.health;
  const core=list(data.services);
  const healthText=health?.databaseConnected===false||core.some(s=>/error|critical|failed/i.test(s.status||""))?"Lỗi hệ thống":health?.status||"Chưa có dữ liệu";
  const value=(key,n)=>Array.isArray(data[key])?n:missing;
  return <div className="space-y-4 text-[#153b56]">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[#187f75]">Giám sát hạ tầng CrabSense</p><p className="mt-1 text-xs text-[#64818b]">Cập nhật: {updated?updated.toLocaleString():missing} · Tự làm mới {refreshSeconds}s</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#cce5dc] bg-white px-4 py-2 text-sm font-semibold text-[#187f75] hover:bg-[#e8f6ee] disabled:opacity-60"><RefreshCw size={16} className={loading?"animate-spin motion-reduce:animate-none":""}/>{loading?"Đang tải...":"Làm mới"}</button></div>
    {failures.length>0&&<div role="alert" className="rounded-xl border border-[#f1dca7] bg-[#fff7e4] p-3 text-xs leading-relaxed text-[#855b14]">Không tải được: {failures.map(k=>labels[k]).join(", ")}. Dữ liệu chưa có hiển thị dấu —. Bạn có thể thử làm mới.</div>}
    <section aria-label="Thống kê thiết bị" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Camera" value={value("devices",cameras.length)} hint={Array.isArray(data.devices)?cameras.filter(d=>status(d.status)==="online").length+" online":"Chưa có dữ liệu"} icon={Cctv} to="/system/cameras" tone="green"/>
      <Kpi label="Cảm biến" value={value("sensors",sensors.length)} hint={Array.isArray(data.sensors)?sensors.filter(s=>sensorStatus(s)==="online").length+" online":"Chưa có dữ liệu"} icon={Wifi} to="/system/devices" tone="blue"/>
      <Kpi label="Controller" value={value("devices",controllers.length)} hint={Array.isArray(data.devices)?controllers.filter(d=>status(d.status)==="online").length+" online":"Chưa có dữ liệu"} icon={Cpu} to="/system/devices" tone="green"/>
      <Kpi label="Dịch vụ AI" value={value("ai",ai.length)} hint={Array.isArray(data.ai)?ai.length===0?"Chưa đăng ký":verifiedAi===ai.length?onlineAi+" đang chạy":verifiedAi+" / "+ai.length+" đã xác minh runtime":"Chưa có dữ liệu"} icon={Brain} to="/system/ai" tone="blue"/>
    </section>
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Trạng thái thiết bị" icon={Activity} to="/system/devices">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[["online","Online",CheckCircle2,"green"],["offline","Offline",WifiOff,"gray"],["error","Lỗi",TriangleAlert,"red"],["maintenance","Bảo trì",Wrench,"amber"]].map(([key,label,Icon,tone])=><div key={key} className={`rounded-xl p-3 text-center ${tones[tone]}`}><div className="flex items-center justify-center gap-1 text-xs font-bold"><Icon size={15}/>{label}</div><div className="mt-2 text-2xl font-extrabold">{complete?counts[key]:missing}</div><div className="mt-1 text-xs">{complete&&total?Math.round(counts[key]/total*100)+"%":missing}</div></div>)}</div>
        <p className="mt-3 text-xs text-[#64818b]">{complete?`Tổng ${total} thiết bị · ${counts.disabled} cảm biến vô hiệu · ${counts.unknown} chưa xác định`:"Chưa đủ dữ liệu thiết bị và cảm biến."} · Cảm biến không gửi dữ liệu hơn 15 phút được xem là offline.</p>
      </Panel>
      <Panel title="Tình trạng hệ thống" icon={Server} to="/system/deployment">
        <div className="grid grid-cols-4 gap-2 divide-x divide-[#e4edee]"><Gauge label="CPU" value={cpu==null?null:Math.round(cpu)}/><Gauge label="RAM" value={ram}/><Gauge label="Disk" value={storagePct}/><div className="px-1 text-center"><p className="text-xs font-bold">Uptime host</p><Clock size={25} className="mx-auto mt-3 text-[#168b7e]"/><p className="mt-1 text-xs font-bold">{duration(uptime)}</p></div></div>
        <p className="mt-2 text-xs text-[#64818b]">Trạng thái: <strong className="text-[#187f75]">{healthText}</strong> · CPU/RAM: máy chủ Linux. API uptime: {duration(apiUptime)}.</p>
      </Panel>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Lưu trữ ổ đĩa API" icon={Database} to="/system/storage"><div className="flex flex-wrap items-center gap-4"><div className="relative grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full" style={{background:`conic-gradient(#20a68d ${storagePct??0}%, #e3ebee 0)`}}><div className="grid h-[78px] w-[78px] place-items-center rounded-full bg-white text-center"><div><strong className="block text-lg">{storagePct==null?missing:storagePct+"%"}</strong><span className="text-[10px] text-[#64818b]">đã sử dụng</span></div></div></div><div className="min-w-0 flex-1 text-xs"><p className="text-[#64818b]">Đã sử dụng</p><strong>{bytes(used)}</strong><p className="mt-2 text-[#64818b]">Còn trống</p><strong>{bytes(remaining)}</strong><p className="mt-2 text-[#64818b]">Tổng: {bytes(capacity)}</p></div></div></Panel>
      <Panel title="Ghi hình" icon={Cctv} to="/system/cameras"><Row label="Camera đã bật chế độ ghi" value={value("schedules",scheduleEnabled)}/><Row label="Camera ghi theo lịch" value={value("schedules",scheduleTimed)}/><Row label="Camera đang ghi thực tế" value={!Array.isArray(data.schedules)||unverifiedRecording?"Chưa xác minh":runtimeRecording}/><p className="mt-2 text-xs text-[#64818b]">Trạng thái thực tế cần worker ghi hình báo cáo.</p></Panel>
      <Panel title="Khu nuôi" icon={MapPin} to="/system/devices"><Row label="Khu đã gán thiết bị" value={complete?areas.length:missing}/><div className="mt-2 flex flex-wrap gap-2">{areas.slice(0,5).map(([id,a])=><span key={id} className="rounded-lg bg-[#e8f5ef] px-2 py-1 text-xs text-[#187f75]">{a}</span>)}</div><p className="mt-2 text-xs text-[#64818b]">Đếm theo ID khu của thiết bị, không phải tổng số khu toàn hệ thống.</p></Panel>
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Cảnh báo hệ thống" icon={Bell} to="/system/logs">{!Array.isArray(data.alerts)?<Empty>Chưa tải được cảnh báo.</Empty>:alerts.length===0?<Empty>Không có cảnh báo.</Empty>:<ul className="divide-y divide-[#e9f0ef]">{alerts.slice(0,5).map((a,i)=><li key={a.id??i} className="flex items-start gap-3 py-3"><span className={`rounded-xl p-2 ${tones[/critical|error|high/i.test(a.severity||"")?"red":/warn/i.test(a.severity||"")?"amber":"blue"]}`}><TriangleAlert size={17}/></span><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{a.title||a.message||"Cảnh báo"}</p><p className="mt-1 text-xs text-[#64818b]">{when(a.lastOccurredAt||a.createdAt)} · {a.incidentType||a.category||"Hệ thống"}</p></div><span className="shrink-0 text-xs font-semibold text-[#64818b]">{a.severity||missing}</span></li>)}</ul>}</Panel>
      <Panel title="Hoạt động gần đây" icon={Clock} to="/system/logs">{!Array.isArray(data.logs)?<Empty>Chưa tải được nhật ký.</Empty>:logs.length===0?<Empty>Chưa có hoạt động.</Empty>:<ul className="divide-y divide-[#e9f0ef]">{logs.slice(0,5).map((r,i)=><li key={r.id??i} className="flex items-start gap-3 py-3"><span className="rounded-xl bg-[#e4f7ed] p-2 text-[#168b7e]"><Activity size={17}/></span><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{r.message||r.source||"Hoạt động hệ thống"}</p><p className="mt-1 text-xs text-[#64818b]">{when(r.at)} · {r.source||"system"}</p></div></li>)}</ul>}</Panel>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Dịch vụ nền & AI" icon={Brain} to="/system/ai">{core.length||ai.length?<>{[...core,...ai].slice(0,6).map((s,i)=><Row key={s.id??i} label={s.name||"Dịch vụ"} value={s.status||missing}/>)}</>:<Empty>Chưa có dữ liệu dịch vụ.</Empty>}</Panel>
      <Panel title="Sao lưu & triển khai" icon={HardDrive} to="/system/storage"><Row label="Sao lưu gần nhất" value={backup?when(backup.createdAtUtc):missing}/><Row label="Kết quả backup tự động" value={data.backupSchedule?.lastResult||missing}/><Row label="Backend" value={version?.version||missing}/><Row label="Triển khai gần nhất" value={deploy?String(deploy.component||"")+" "+String(deploy.version||"")+" · "+String(deploy.status||"Chưa xác minh"):missing}/><Link to="/system/deployment" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#187f75]">Xem triển khai <ArrowRight size={14}/></Link></Panel>
      <Panel title="Bảo mật hệ thống" icon={Shield} to="/system/security"><Row label="Đăng nhập thất bại" value={data.security?.failedLogins??missing}/><Row label="Phiên hoạt động" value={data.security?.activeSessions??missing}/><Row label="API keys" value={data.security?.apiKeys??missing}/><Row label="Cảnh báo bảo mật" value={data.security?.securityAlerts??missing}/></Panel>
    </div>
  </div>;
}
