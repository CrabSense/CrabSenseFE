import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Video, Camera, CircleCheck, CircleAlert, Wrench, RefreshCw, Plus, Search, Eye, Pencil, MoreHorizontal, MapPin, Clock, List, LayoutGrid, ChevronLeft, ChevronRight, X, Download, CalendarClock, Wifi, ImageOff } from "lucide-react";
import systemAdminService from "../../services/systemAdminService";
import { SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatWhen } from "./deviceModel";
import "./camera-management.css";

const EMPTY_ID = "00000000-0000-0000-0000-000000000000";
const STATES = { online: "Online", offline: "Mất kết nối", maintenance: "Bảo trì", error: "Lỗi", unknown: "Chưa xác định" };
const MODE = { Disabled: "Tắt", Continuous: "Liên tục", MotionDetection: "Chuyển động", AiEvent: "Sự kiện AI", Scheduled: "Theo lịch" };
const statusKey = camera => {
  const value = String(camera?.status || "").toLowerCase();
  return Object.hasOwn(STATES, value) ? value : "unknown";
};
const recordingLabel = schedule => !schedule ? "Chưa tải cấu hình" : (MODE[schedule.mode] || schedule.mode || "Chưa cấu hình");
const safeSnapshot = value => {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash ? url.href : null; } catch { return null; }
};
const display = value => value || "—";
const cameraPlace = camera => [camera.areaName, camera.rowName].filter(Boolean).join(" / ") || "Chưa gán khu/dãy";
const protocol = value => { try { return new URL(value).protocol.replace(":", "").toUpperCase(); } catch { return "Chưa cấu hình"; } };
const csvCell = value => {
  const raw = String(value ?? "");
  return '"' + (/^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw).replaceAll('"', '""') + '"';
};

function StatusPill({ camera }) {
  const state = statusKey(camera);
  return <span className={`cam-pill cam-${state}`}><i />{STATES[state]}</span>;
}
StatusPill.propTypes = { camera: PropTypes.object.isRequired };

function CameraForm({ camera, areas, onClose, onSaved }) {
  const ref = useRef(null);
  const [form, setForm] = useState(() => ({
    deviceCode: camera?.deviceCode || "", name: camera?.name || "", deviceType: camera?.deviceType?.includes("cam") ? camera.deviceType : "camera",
    ipAddress: camera?.ipAddress || "", macAddress: camera?.macAddress || "", streamUrl: camera?.streamUrl || "",
    snapshotUrl: camera?.snapshotUrl || "", resolution: camera?.resolution || "", firmwareVersion: camera?.firmwareVersion || "",
    farmingAreaId: camera?.farmingAreaId || "", farmingRowId: camera?.farmingRowId || "", installationLocation: camera?.installationLocation || "",
    note: camera?.note || "",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async event => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
      if (camera) {
        delete body.deviceCode; delete body.deviceType;
        // Legacy protected URLs are hidden by BE. Do not erase a hidden value during an unrelated edit.
        if (body.streamUrl === (camera.streamUrl || "")) delete body.streamUrl;
        if (body.snapshotUrl === (camera.snapshotUrl || "")) delete body.snapshotUrl;
        if (body.firmwareVersion === (camera.firmwareVersion || "")) delete body.firmwareVersion;
        body.farmingAreaId ||= EMPTY_ID; body.farmingRowId ||= EMPTY_ID;
        await systemAdminService.updateCamera(camera.id, body);
      } else {
        body.farmingAreaId ||= null; body.farmingRowId ||= null;
        await systemAdminService.createCamera(body);
      }
      onSaved(); onClose();
    } catch (err) { setError(err?.message || "Không lưu được Camera."); }
    finally { setBusy(false); }
  };
  const fields = [["name","Tên Camera"],["ipAddress","Địa chỉ IP"],["macAddress","MAC"],["resolution","Độ phân giải"],["firmwareVersion","Firmware khai báo"],["installationLocation","Vị trí lắp đặt"]];
  return <dialog ref={ref} aria-labelledby="camera-form-title" className="cam-dialog" onCancel={event => {event.preventDefault(); if (!busy) onClose();}}>
    <form onSubmit={submit}>
      <div className="cam-dialog-head"><div><h2 id="camera-form-title">{camera ? "Chỉnh sửa Camera" : "Thêm Camera"}</h2><p>Đăng ký thiết bị và cấu hình nguồn hình ảnh.</p></div><button type="button" className="cam-icon" disabled={busy} aria-label="Đóng" onClick={onClose}><X size={20}/></button></div>
      <div className="cam-form-body">
        {error && <p className="cam-error" role="alert">{error}</p>}
        <div className="cam-form-grid">
          <label>Mã Camera <span className="cam-required">*</span><input required disabled={Boolean(camera)} value={form.deviceCode} onChange={e=>set("deviceCode",e.target.value)} placeholder="CAM-001"/></label>
          <label>Loại Camera<select value={form.deviceType} disabled={Boolean(camera)} onChange={e=>set("deviceType",e.target.value)}>{[...new Set(["camera","esp32-cam","usb-camera","ip-camera",form.deviceType])].map(type=><option key={type} value={type}>{type}</option>)}</select></label>
          {fields.map(([key,label])=><label key={key}>{label}<input value={form[key]} onChange={e=>set(key,e.target.value)} maxLength={key==="resolution"?32:key==="ipAddress"||key==="macAddress"?64:key==="installationLocation"?200:undefined}/></label>)}
          <label>Khu nuôi<select value={form.farmingAreaId} onChange={e=>setForm(current=>({...current,farmingAreaId:e.target.value,farmingRowId:""}))}><option value="">Chưa gán</option>{areas.filter(a=>a.isActive||a.id===form.farmingAreaId).map(a=><option key={a.id} value={a.id}>{a.name||a.code}</option>)}</select></label>
          <label>Dãy nuôi<select value={form.farmingRowId} onChange={e=>set("farmingRowId",e.target.value)} disabled={!form.farmingAreaId}><option value="">Chưa gán</option>{(areas.find(a=>a.id===form.farmingAreaId)?.rows||[]).filter(r=>r.isActive||r.id===form.farmingRowId).map(r=><option key={r.id} value={r.id}>{r.name||r.code}</option>)}</select></label>
          <label className="cam-wide">Stream URL<input value={form.streamUrl} onChange={e=>set("streamUrl",e.target.value)} placeholder="rtsp://192.168.1.21/live"/></label>
          <label className="cam-wide">Snapshot URL<input value={form.snapshotUrl} onChange={e=>set("snapshotUrl",e.target.value)} placeholder="https://camera.example/capture"/></label>
          <p className="cam-wide cam-hint">Không nhập mật khẩu, token, query hoặc fragment vào URL. Nguồn cần xác thực phải qua Camera Agent.</p>
          <label className="cam-wide">Ghi chú<textarea rows={2} maxLength={500} value={form.note} onChange={e=>set("note",e.target.value)}/></label>
        </div>
      </div>
      <div className="cam-dialog-foot"><button type="button" className="system-secondary-button" disabled={busy} onClick={onClose}>Hủy</button><button type="submit" className="system-primary-button" disabled={busy}>{busy?"Đang lưu…":"Lưu Camera"}</button></div>
    </form>
  </dialog>;
}
CameraForm.propTypes = {camera:PropTypes.object,areas:PropTypes.array.isRequired,onClose:PropTypes.func.isRequired,onSaved:PropTypes.func.isRequired};

function CameraDetails({ camera, schedule, tab, onTab, onClose, onEdit, onReload, canEdit }) {
  const [detail,setDetail]=useState(null);
  const [health,setHealth]=useState(null);
  const [events,setEvents]=useState(null);
  const [capabilities,setCapabilities]=useState(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState("");
  const [busy,setBusy]=useState(false);
  const [confirm,setConfirm]=useState("");
  const [preview,setPreview]=useState(false);
  const [imageError,setImageError]=useState(false);
  const [revision,setRevision]=useState(0);
  useEffect(() => {
    let active=true;
    setError("");setLoading(true);
    const request = tab==="events" ? systemAdminService.getCameraEvents(camera.id).then(data=>{if(active)setEvents(data);})
      : tab==="health" ? Promise.all([systemAdminService.getCameraHealth(camera.id),systemAdminService.getCameraCapabilities(camera.id)]).then(([h,c])=>{if(active){setHealth(h);setCapabilities(c);}})
      : systemAdminService.getCamera(camera.id).then(data=>{if(active)setDetail(data);});
    request.catch(err=>{if(active)setError(err?.message||"Không tải được chi tiết.");}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[camera.id,camera.lastSeenAt,camera.name,camera.streamUrl,camera.snapshotUrl,camera.ipAddress,camera.macAddress,camera.resolution,camera.firmwareVersion,camera.farmingAreaId,camera.farmingRowId,camera.installationLocation,camera.note,tab,revision]);
  const data={...detail,...camera};
  const snapshot=safeSnapshot(data.snapshotUrl);
  const execute=async action=>{
    setBusy(true);setError("");setResult("");
    try {
      if(action==="test"){const answer=await systemAdminService.testCamera(camera.id);setResult(answer?.message||"Chưa xác minh được Camera.");}
      if(action==="enable"){await systemAdminService.enableCamera(camera.id);setResult("Đã cho phép hoạt động; chờ heartbeat xác thực.");}
      if(action==="disable"){await systemAdminService.disableCamera(camera.id);setResult("Đã chuyển sang bảo trì.");}
      if(action==="delete"){await systemAdminService.deleteCamera(camera.id);onClose();onReload();return;}
      setConfirm("");setRevision(v=>v+1);onReload();
    } catch(err){setError(err?.message||"Thao tác thất bại.");}
    finally{setBusy(false);}
  };
  return <aside className="cam-detail" aria-label="Chi tiết Camera">
    <div className="cam-detail-head"><div className="min-w-0"><h2>{camera.deviceCode}</h2><p>{camera.name||"Camera"}</p></div><button className="cam-icon" type="button" onClick={onClose} aria-label="Đóng chi tiết"><X size={19}/></button></div>
    <div className="cam-detail-badges"><StatusPill camera={camera}/><span className="cam-pill cam-neutral">{recordingLabel(schedule)}</span></div>
    <div className="cam-detail-tabs" role="group" aria-label="Mục chi tiết">{[["info","Thông tin"],["config","Cấu hình"],["health","Chẩn đoán"],["events","Nhật ký"]].map(([id,label])=><button type="button" key={id} aria-pressed={tab===id} className={tab===id?"active":""} onClick={()=>onTab(id)}>{label}</button>)}</div>
    <div className="cam-detail-body">
      {error&&<p role="alert" className="cam-error">{error}</p>}
      {result&&<p role="status" className="cam-note">{result}</p>}
      {loading&&<p role="status" className="cam-hint">Đang tải chi tiết…</p>}
      {tab==="info"&&<>
        <div className="cam-preview">
          {preview&&snapshot&&!imageError?<img src={snapshot} alt={"Ảnh từ "+camera.deviceCode} referrerPolicy="no-referrer" onError={()=>setImageError(true)}/>:<div className="cam-preview-empty"><ImageOff size={30}/><strong>{imageError?"Không tải được ảnh": "Chưa có phiên live"}</strong><span>Camera Agent chưa tích hợp</span>{snapshot&&<button type="button" onClick={()=>{setImageError(false);setPreview(true);}} className="cam-preview-button">Thử tải ảnh đã cấu hình</button>}</div>}
          <span className="cam-preview-tag">{preview&&snapshot&&!imageError?"Ảnh cấu hình · không phải live":"Chưa xác minh luồng"}</span>
        </div>
        <h3>Thông tin nhanh</h3>
        <dl className="cam-facts"><dt>Vị trí</dt><dd>{cameraPlace(camera)}</dd><dt>IP</dt><dd>{display(data.ipAddress)}</dd><dt>Luồng video</dt><dd>{protocol(data.streamUrl)}</dd><dt>Độ phân giải</dt><dd>{display(data.resolution)}</dd><dt>Kết nối gần nhất</dt><dd>{formatWhen(camera.lastSeenAt)}</dd></dl>
        <p className="cam-hint">Online chỉ phản ánh heartbeat; không xác nhận video đang phát.</p>
        <Link className="cam-link-button" to="/system/cameras"><CalendarClock size={16}/> Lịch trình ghi hình</Link>
      </>}
      {tab==="config"&&<><h3>Cấu hình đã lưu</h3><dl className="cam-facts"><dt>MAC</dt><dd>{display(data.macAddress)}</dd><dt>Firmware</dt><dd>{display(data.firmwareVersion)}</dd><dt>Stream URL</dt><dd>{display(data.streamUrl)}</dd><dt>Snapshot URL</dt><dd>{display(data.snapshotUrl)}</dd><dt>Vị trí lắp</dt><dd>{display(data.installationLocation)}</dd><dt>Ghi chú</dt><dd>{display(data.note)}</dd></dl><button className="cam-link-button" type="button" disabled={!canEdit} onClick={()=>onEdit(data)}><Pencil size={15}/> Chỉnh sửa cấu hình</button></>}
      {tab==="health"&&<><h3>Tình trạng kết nối</h3><dl className="cam-facts"><dt>Trạng thái BE</dt><dd>{display(health?.status)}</dd><dt>Heartbeat</dt><dd>{formatWhen(health?.lastSeenAt)}</dd><dt>RSSI</dt><dd>{health?.rssiDbm!=null?health.rssiDbm+" dBm":"—"}</dd><dt>Camera Agent</dt><dd>{capabilities?.runtimeStatus==="NotIntegrated"?"Chưa tích hợp":display(capabilities?.runtimeStatus)}</dd></dl><p className="cam-hint">Chưa có kiểm tra RTSP thực tế hoặc khởi động lại Camera từ xa.</p><button className="cam-link-button" type="button" disabled={busy} onClick={()=>execute("test")}><Wifi size={16}/> Kiểm tra kết nối</button></>}
      {tab==="events"&&<><h3>Nhật ký kỹ thuật</h3>{events?.length? <div className="cam-events">{events.map(event=><div key={event.id}><strong>{event.message}</strong><span>{event.severity} · {formatWhen(event.at)}</span></div>)}</div>:!loading&&<p className="cam-hint">{events?"Chưa có nhật ký.":"Chưa tải nhật ký."}</p>}</>}
    </div>
    <div className="cam-detail-foot">
      {confirm?<div className="cam-confirm"><p>{confirm==="delete"?"Gỡ Camera? BE sẽ chặn xóa nếu có lịch sử media/AI.":confirm==="disable"?"Chuyển Camera sang bảo trì?":"Cho phép Camera hoạt động lại? Camera sẽ chờ heartbeat."}</p><div><button className="system-secondary-button" type="button" disabled={busy} onClick={()=>setConfirm("")}>Hủy</button><button className="system-primary-button" type="button" disabled={busy} onClick={()=>execute(confirm)}>{busy?"Đang xử lý…":"Xác nhận"}</button></div></div>:<><button className="system-secondary-button" type="button" disabled={busy} onClick={()=>setConfirm(statusKey(camera)==="maintenance"?"enable":"disable")}>{statusKey(camera)==="maintenance"?"Kích hoạt":"Bảo trì"}</button><button className="cam-danger" type="button" disabled={busy} onClick={()=>setConfirm("delete")}>Gỡ Camera</button></>}
    </div>
  </aside>;
}
CameraDetails.propTypes={camera:PropTypes.object.isRequired,schedule:PropTypes.object,tab:PropTypes.string.isRequired,onTab:PropTypes.func.isRequired,onClose:PropTypes.func.isRequired,onEdit:PropTypes.func.isRequired,onReload:PropTypes.func.isRequired,canEdit:PropTypes.bool.isRequired};

export default function CameraManagement(){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [error,setError]=useState("");
  const [auxError,setAuxError]=useState("");
  const [locationError,setLocationError]=useState(false);
  const [query,setQuery]=useState("");
  const [area,setArea]=useState("all");
  const [row,setRow]=useState("all");
  const [status,setStatus]=useState("all");
  const [view,setView]=useState("list");
  const [page,setPage]=useState(1);
  const [size,setSize]=useState(10);
  const [selectedId,setSelectedId]=useState(null);
  const [tab,setTab]=useState("info");
  const [edit,setEdit]=useState(null);
  const [notice,setNotice]=useState("");
  const [menu,setMenu]=useState(null);
  const requestId=useRef(0);
  const load=useCallback(async()=>{
    const id=++requestId.current;
    setRefreshing(true);setError("");
    try{
      const [cameras,locations,schedules]=await Promise.allSettled([systemAdminService.getCameras(),systemAdminService.getDeviceLocations(),systemAdminService.getRecordingSchedules()]);
      if(id!==requestId.current)return;
      if(cameras.status==="rejected")throw cameras.reason;
      setLocationError(locations.status==="rejected");
      const failures=[locations.status==="rejected"?"khu/dãy":null,schedules.status==="rejected"?"cấu hình ghi hình":null].filter(Boolean);
      setAuxError(failures.length?"Không tải được "+failures.join(" và ")+". Vẫn hiển thị danh sách Camera.":"");
      setData({cameras:cameras.value,areas:locations.status==="fulfilled"?locations.value:[],schedules:schedules.status==="fulfilled"?schedules.value:null,updated:new Date()});
    }catch(err){if(id===requestId.current)setError(err?.message||"Không tải được danh sách Camera.");}
    finally{if(id===requestId.current){setRefreshing(false);setLoading(false);}}
  },[]);
  useEffect(()=>{load();return()=>{requestId.current++;};},[load]);
  useEffect(()=>{
    if (!menu) return undefined;
    const close = event => { if (event.type === "keydown" ? event.key === "Escape" : !event.target.closest?.(".cam-more")) setMenu(null); };
    document.addEventListener("keydown", close);
    document.addEventListener("click", close);
    return ()=>{document.removeEventListener("keydown",close);document.removeEventListener("click",close);};
  },[menu]);
  const cameras=data?.cameras||[];
  const areas=data?.areas||[];
  const scheduleById=useMemo(()=>new Map((data?.schedules||[]).map(s=>[s.deviceId,s])),[data?.schedules]);
  const selected=cameras.find(c=>c.id===selectedId);
  const filtered=cameras.filter(c=>{
    const needle=query.trim().toLowerCase();
    return (!needle||[c.deviceCode,c.name,c.ipAddress,c.macAddress].some(v=>String(v||"").toLowerCase().includes(needle)))
      &&(area==="all"||(area==="none"?!c.farmingAreaId:c.farmingAreaId===area))
      &&(row==="all"||c.farmingRowId===row)&&(status==="all"||statusKey(c)===status);
  });
  const pages=Math.max(1,Math.ceil(filtered.length/size)), current=Math.min(page,pages);
  const visible=filtered.slice((current-1)*size,current*size);
  const choose=(camera,nextTab="info")=>{setSelectedId(camera.id);setTab(nextTab);setMenu(null);};
  const metrics=[["all","Tổng Camera",cameras.length,Video,"total"],["online","Online",cameras.filter(c=>statusKey(c)==="online").length,CircleCheck,"online"],["offline","Mất kết nối",cameras.filter(c=>statusKey(c)==="offline").length,Wifi,"offline"],["maintenance","Bảo trì",cameras.filter(c=>statusKey(c)==="maintenance").length,Wrench,"maintenance"],["error","Lỗi",cameras.filter(c=>statusKey(c)==="error").length,CircleAlert,"error"]];
  const exportCsv=()=>{
    const values=[["Mã","Tên","Khu","Dãy","IP","Trạng thái","Lần cuối kết nối"],...filtered.map(c=>[c.deviceCode,c.name,c.areaName,c.rowName,c.ipAddress,STATES[statusKey(c)],c.lastSeenAt])];
    const url=URL.createObjectURL(new Blob(["\uFEFF"+values.map(line=>line.map(csvCell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="crabsense-cameras.csv";link.click();URL.revokeObjectURL(url);
  };
  const areaRows=area==="all"?areas.flatMap(a=>a.rows||[]):areas.find(a=>a.id===area)?.rows||[];
  const editCamera=c=>{if(!locationError)setEdit({camera:c});};
  const grouped=Object.entries(filtered.reduce((acc,c)=>{const key=cameraPlace(c);(acc[key]??=[]).push(c);return acc;},Object.create(null)));
  return <SystemPage title="Quản lý Camera" description="Đăng ký, cấu hình và giám sát Camera trong hệ thống CrabSense." actions={<><button type="button" className="system-secondary-button cam-btn" disabled={refreshing} onClick={load}><RefreshCw size={16} className={refreshing?"animate-spin":""}/> Làm mới</button><button type="button" className="system-secondary-button cam-btn" disabled={!data} onClick={exportCsv}><Download size={16}/> Xuất CSV</button><button type="button" className="system-primary-button cam-btn" disabled={!data||locationError} onClick={()=>setEdit({camera:null})}><Plus size={18}/> Thêm Camera</button></>}>
    <div className="camera-management">
      <SystemState loading={loading} error={!data?error:""} onRetry={load}>
        {error&&data&&<p role="alert" className="cam-error">{error} · Đang hiển thị dữ liệu lần tải trước.</p>}
        {auxError&&<p role="alert" className="cam-note">{auxError}</p>}
        {notice&&<p role="status" className="cam-note">{notice}</p>}
        <div className="cam-metrics">{metrics.map(([key,label,count,Icon,tone])=><button key={key} type="button" className={`cam-metric cam-metric-${tone} ${status===key?"active":""}`} onClick={()=>{setStatus(key);setPage(1);}} aria-pressed={status===key}><span className="cam-metric-icon"><Icon size={23}/></span><span><small>{label}</small><strong>{count}</strong></span></button>)}</div>
        <div className="cam-toolbar"><div className="cam-view-tabs" role="group" aria-label="Chế độ hiển thị"><button type="button" aria-pressed={view==="list"} className={view==="list"?"active":""} onClick={()=>setView("list")}><List size={17}/> Danh sách Camera</button><button type="button" aria-pressed={view==="location"} className={view==="location"?"active":""} onClick={()=>setView("location")}><LayoutGrid size={17}/> Theo vị trí</button><Link to="/system/cameras"><CalendarClock size={17}/> Lịch ghi hình</Link></div><span className="cam-updated"><Clock size={14}/> {data?.updated?formatWhen(data.updated):"—"}</span></div>
        <div className="cam-layout">
          <section className="cam-list-panel">
            <div className="cam-filters"><label className="cam-search"><Search size={17}/><input aria-label="Tìm Camera" placeholder="Tìm tên, mã Camera hoặc IP…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></label>
              <label>Khu nuôi<select aria-label="Khu nuôi" value={area} onChange={e=>{setArea(e.target.value);setRow("all");setPage(1);}}><option value="all">Tất cả</option><option value="none">Chưa gán</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name||a.code}</option>)}</select></label>
              <label>Dãy nuôi<select aria-label="Dãy nuôi" value={row} onChange={e=>{setRow(e.target.value);setPage(1);}}><option value="all">Tất cả</option>{areaRows.map(r=><option key={r.id} value={r.id}>{r.name||r.code}</option>)}</select></label>
              <label>Trạng thái<select aria-label="Trạng thái" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="all">Tất cả</option>{Object.entries(STATES).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
            </div>
            <div className="cam-list-heading"><h2>{view==="list"?"Danh sách Camera":"Camera theo khu / dãy"}</h2><span>{filtered.length} kết quả</span></div>
            {view==="list"?<><div className="cam-table-scroll" tabIndex={0} role="region" aria-label="Danh sách Camera"><table className="cam-table"><thead><tr><th scope="col">Mã / tên Camera</th><th scope="col">Vị trí</th><th scope="col">IP / Stream</th><th scope="col">Trạng thái</th><th scope="col">Ghi hình</th><th scope="col">Kết nối gần nhất</th><th scope="col">Thao tác</th></tr></thead><tbody>{visible.map(c=><tr key={c.id} className={c.id===selectedId?"selected":""}><td><button type="button" className="cam-device" onClick={()=>choose(c)}><span className="cam-device-icon"><Camera size={20}/></span><span><strong>{c.deviceCode}</strong><small>{c.name||"Camera"}</small></span></button></td><td><span className="cam-cell-main">{cameraPlace(c)}</span><small>{display(c.installationLocation)}</small></td><td><span className="cam-cell-main">{display(c.ipAddress)}</span><small>{protocol(c.streamUrl)} · {display(c.resolution)}</small></td><td><StatusPill camera={c}/></td><td><span className="cam-pill cam-neutral">{recordingLabel(scheduleById.get(c.id))}</span><small>{scheduleById.get(c.id)?.runtimeStatus==="NotIntegrated"?"Chưa tích hợp":""}</small></td><td>{formatWhen(c.lastSeenAt)}</td><td><div className="cam-actions"><button type="button" className="cam-icon" title="Xem chi tiết" aria-label={"Xem "+c.deviceCode} onClick={()=>choose(c)}><Eye size={17}/></button><button type="button" className="cam-icon" disabled={locationError} title="Chỉnh sửa" aria-label={"Sửa "+c.deviceCode} onClick={()=>editCamera(c)}><Pencil size={16}/></button><div className="cam-more"><button type="button" className="cam-icon" aria-expanded={menu===c.id} aria-label={"Thao tác "+c.deviceCode} onClick={()=>setMenu(menu===c.id?null:c.id)}><MoreHorizontal size={19}/></button>{menu===c.id&&<div className="cam-menu"><button type="button" onClick={()=>choose(c,"health")}>Chẩn đoán</button><button type="button" onClick={()=>choose(c,"events")}>Nhật ký</button><button type="button" onClick={()=>choose(c,"config")}>Cấu hình</button></div>}</div></div></td></tr>)}</tbody></table></div>
              {!visible.length&&<div className="cam-empty"><Video size={30}/><strong>{cameras.length?"Không có Camera phù hợp":"Chưa có Camera đăng ký"}</strong><span>{cameras.length?"Thay đổi bộ lọc để xem kết quả.":"Thêm Camera để bắt đầu quản lý thiết bị."}</span>{!cameras.length&&!locationError&&<button className="system-primary-button" type="button" onClick={()=>setEdit({camera:null})}>Thêm Camera</button>}</div>}
              <div className="cam-pagination"><span>Hiển thị {filtered.length?(current-1)*size+1:0}–{Math.min(current*size,filtered.length)} / {filtered.length} Camera</span><div><label>Số dòng <select value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1);}}>{[5,10,20,50].map(n=><option key={n}>{n}</option>)}</select></label><button type="button" className="cam-icon" aria-label="Trang trước" disabled={current===1} onClick={()=>setPage(current-1)}><ChevronLeft size={18}/></button><span className="cam-page-number">{current} / {pages}</span><button type="button" className="cam-icon" aria-label="Trang sau" disabled={current===pages} onClick={()=>setPage(current+1)}><ChevronRight size={18}/></button></div></div></>:<div className="cam-location-groups">{grouped.length?grouped.map(([place,items])=><section key={place}><h3><MapPin size={17}/>{place}<span>{items.length}</span></h3><div>{items.map(c=><button type="button" key={c.id} onClick={()=>choose(c)} className={c.id===selectedId?"active":""}><Camera size={21}/><span><strong>{c.deviceCode}</strong><small>{c.name}</small></span><StatusPill camera={c}/></button>)}</div></section>):<div className="cam-empty">Không có Camera phù hợp.</div>}</div>}
          </section>
          {selected&&<CameraDetails key={selected.id} camera={selected} schedule={scheduleById.get(selected.id)} tab={tab} onTab={setTab} onClose={()=>setSelectedId(null)} onEdit={editCamera} onReload={load} canEdit={!locationError}/>}
        </div>
        <p className="cam-hint cam-bottom-note">Trạng thái kết nối lấy từ BE. Ghi hình là cấu hình đã lưu, không phải trạng thái đang quay thực tế.</p>
      </SystemState>
      {edit&&<CameraForm camera={edit.camera} areas={areas} onClose={()=>setEdit(null)} onSaved={()=>{setNotice(edit.camera?"Đã lưu cấu hình Camera.":"Đã đăng ký Camera; chờ heartbeat.");load();}}/>}
    </div>
  </SystemPage>;
}
