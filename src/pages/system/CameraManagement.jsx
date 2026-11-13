import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Video, Camera, CircleCheck, CircleAlert, Wrench, RefreshCw, Plus, Search, Eye, Pencil, MoreHorizontal, MapPin, Clock, List, LayoutGrid, ChevronLeft, ChevronRight, X, Download, CalendarClock, Wifi, ImageOff } from "lucide-react";
import systemAdminService from "../../services/systemAdminService";
import { SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatWhen } from "./deviceModel";
import "./camera-management.css";
import { buildLocationGroups, locationSummary } from "./cameraLocations.js";

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

const CAMERA_TYPES = [
  ["camera", "IP Camera"],
  ["esp32-cam", "ESP32-CAM"],
  ["usb-camera", "USB Camera"],
];
const RESOLUTIONS = ["640x480", "1280x720", "1920x1080", "3840x2160"];
const RESOLUTION_LABELS = {"640x480":"640 × 480 (VGA)","1280x720":"1280 × 720 (HD)","1920x1080":"1920 × 1080 (Full HD)","3840x2160":"3840 × 2160 (4K)"};

function cameraFormType(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("usb")) return "usb-camera";
  if (value.includes("esp32")) return "esp32-cam";
  return "camera";
}

function validateCameraSource(value, snapshot = false) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return (snapshot ? ["http:", "https:"] : ["http:", "https:", "rtsp:", "rtsps:"]).includes(url.protocol)
      && Boolean(url.hostname) && !url.username && !url.password && !url.search && !url.hash
      && !value.includes("?") && !value.includes("#");
  } catch { return false; }
}

function CameraForm({ camera, areas, initialArea = "", initialRow = "", onClose, onSaved }) {
  const ref = useRef(null);
  const busyRef = useRef(false);
  const [form, setForm] = useState(() => ({
    deviceCode: camera?.deviceCode || "", name: camera?.name || "", deviceType: cameraFormType(camera?.deviceType),
    ipAddress: camera?.ipAddress || "", macAddress: camera?.macAddress || "", streamUrl: camera?.streamUrl || "",
    snapshotUrl: camera?.snapshotUrl || "", resolution: camera?.resolution || "", firmwareVersion: camera?.firmwareVersion || "",
    farmingAreaId: camera?.farmingAreaId || initialArea, farmingRowId: camera?.farmingRowId || initialRow, installationLocation: camera?.installationLocation || "",
    note: camera?.note || "",
  }));
  const [customResolution, setCustomResolution] = useState(() => Boolean(camera?.resolution && !RESOLUTIONS.includes(camera.resolution)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const usb = form.deviceType === "usb-camera";
  const esp = form.deviceType === "esp32-cam";
  const [method, setMethod] = useState("manual");
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async event => {
    event.preventDefault();
    if (busyRef.current) return;
    setError("");
    if (!form.deviceCode.trim() || !form.name.trim()) {
      setError("Vui lòng nhập mã và tên Camera."); return;
    }
    if (!usb && (!validateCameraSource(form.streamUrl) || !validateCameraSource(form.snapshotUrl, true))) {
      setError("Stream URL phải dùng HTTP(S)/RTSP(S), Snapshot URL dùng HTTP(S), không chứa tài khoản, query hoặc fragment.");
      return;
    }
    if (customResolution && !form.resolution.trim()) {
      setError("Vui lòng nhập độ phân giải hoặc chọn một mức có sẵn."); return;
    }
    busyRef.current = true; setBusy(true);
    try {
      const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
      // USB devices are registered as metadata only. Do not send hidden network fields.
      if (usb) {
        for (const key of ["ipAddress","macAddress","streamUrl","snapshotUrl","firmwareVersion"]) delete body[key];
      }
      if (camera) {
        delete body.deviceCode; delete body.deviceType;
        // Preserve hidden legacy credentials and unchanged metadata on unrelated edits.
        for (const key of ["streamUrl","snapshotUrl","firmwareVersion","ipAddress","macAddress"]) {
          if (body[key] === (camera[key] || "")) delete body[key];
        }
        body.farmingAreaId ||= EMPTY_ID; body.farmingRowId ||= EMPTY_ID;
        await systemAdminService.updateCamera(camera.id, body);
      } else {
        body.farmingAreaId ||= null; body.farmingRowId ||= null;
        for (const key of ["ipAddress","macAddress","streamUrl","snapshotUrl","firmwareVersion","resolution","installationLocation","note"]) {
          if (body[key] === "") body[key] = null;
        }
        await systemAdminService.createCamera(body);
      }
      onSaved(); onClose();
    } catch (err) { setError(err?.message || "Không lưu được Camera."); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const rowOptions = (areas.find(a=>a.id===form.farmingAreaId)?.rows||[]).filter(r=>r.isActive||r.id===form.farmingRowId);
  return <dialog ref={ref} aria-labelledby="camera-form-title" className="cam-dialog cam-camera-form" onCancel={event => {event.preventDefault(); if (!busyRef.current) onClose();}}>
    <form onSubmit={submit}>
      <div className="cam-dialog-head">
        <div className="cam-form-title"><span className="cam-form-title-icon"><Video size={25}/></span><div><h2 id="camera-form-title">{camera ? "Chỉnh sửa Camera" : "Thêm Camera"}</h2><p>{camera ? "Cập nhật thông tin đăng ký và cấu hình." : "Add Camera · Đăng ký Camera vào hệ thống"}</p></div></div>
        <button type="button" className="cam-icon" disabled={busy} aria-label="Đóng" onClick={onClose}><X size={20}/></button>
      </div>
      <div className="cam-form-body">
        {error && <p className="cam-error" role="alert">{error}</p>}
        {!camera && <div className="cam-form-methods" role="group" aria-label="Phương thức đăng ký">
          <button type="button" className={method==="manual"?"active":""} aria-pressed={method==="manual"} onClick={()=>setMethod("manual")}><Pencil size={21}/><span><strong>Thêm thủ công</strong><small>Nhập thông tin Camera</small></span><CircleCheck size={17}/></button>
          <button type="button" disabled title="Cần tích hợp Camera Agent tại Kiosk"><Search size={21}/><span><strong>Tự động phát hiện</strong><small>Chưa tích hợp Camera Agent</small></span></button>
        </div>}
        <fieldset className="cam-form-section" disabled={busy}>
          <legend><span className="cam-section-number">01</span> Thông tin Camera</legend>
          <div className="cam-form-grid">
            <label>Mã Camera <span className="cam-required">*</span><input required disabled={Boolean(camera)} maxLength={64} value={form.deviceCode} onChange={e=>set("deviceCode",e.target.value)} placeholder="CAM-001"/></label>
            <label>Tên Camera <span className="cam-required">*</span><input required maxLength={200} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Camera khu A – Dãy 1"/></label>
            <label>Loại Camera <span className="cam-required">*</span><select value={form.deviceType} disabled={Boolean(camera)} onChange={e=>set("deviceType",e.target.value)}>{CAMERA_TYPES.map(([type,label])=><option key={type} value={type}>{label}</option>)}</select></label>
            {!usb && <label>Firmware khai báo<input value={form.firmwareVersion} onChange={e=>set("firmwareVersion",e.target.value)} maxLength={64} placeholder="VD: v1.0.0"/></label>}
            <p className="cam-wide cam-hint">{camera?"Mã và loại Camera được giữ nguyên khi chỉnh sửa.":usb?"Camera USB kết nối qua máy tính/Kiosk.":esp?"ESP32-CAM có thể gửi heartbeat khi sử dụng firmware tương thích CrabSense.":"Camera IP kết nối qua mạng LAN; không cần mở cổng Camera ra Internet."}</p>
          </div>
        </fieldset>
        <fieldset className="cam-form-section" disabled={busy}>
          <legend><span className="cam-section-number">02</span> Cấu hình kết nối</legend>
          <div className="cam-form-grid">
            {usb ? <div className="cam-wide cam-form-info"><Wifi size={19}/><div><strong>Đăng ký Camera USB</strong><p>Chỉ lưu thông tin thiết bị và vị trí. Liên kết Kiosk, cổng USB và thu hình chưa được BE/Camera Agent hỗ trợ. Không cần nhập IP, MAC hoặc RTSP.</p></div></div> : <>
              <label>Địa chỉ IP<input value={form.ipAddress} onChange={e=>set("ipAddress",e.target.value)} maxLength={64} placeholder="192.168.1.21"/></label>
              <label>Địa chỉ MAC<input value={form.macAddress} onChange={e=>set("macAddress",e.target.value)} maxLength={64} placeholder="AA:BB:CC:DD:EE:FF"/></label>
              <label className="cam-wide">Stream URL<input value={form.streamUrl} onChange={e=>set("streamUrl",e.target.value)} placeholder={esp?"http://192.168.1.21:81/stream":"rtsp://192.168.1.21:554/stream"}/><small className="cam-hint">HTTP(S) hoặc RTSP(S). Có thể bổ sung sau khi đăng ký.</small></label>
              <label className="cam-wide">Snapshot URL<input value={form.snapshotUrl} onChange={e=>set("snapshotUrl",e.target.value)} placeholder={esp?"http://192.168.1.21/capture":"https://camera.example/capture"}/></label>
              <div className="cam-wide cam-form-info"><CircleAlert size={18}/><p>Không nhập mật khẩu, token, query hoặc fragment trong URL. Nguồn cần xác thực phải qua Camera Agent.</p></div>
            </>}
            <label>Độ phân giải<select value={customResolution?"custom":form.resolution} onChange={e=>{const v=e.target.value;setCustomResolution(v==="custom");set("resolution",v==="custom"?"":v);}}><option value="">Chưa khai báo</option>{RESOLUTIONS.map(r=><option key={r} value={r}>{RESOLUTION_LABELS[r]}</option>)}<option value="custom">Khác</option></select></label>
            {customResolution && <label>Độ phân giải tùy chỉnh<input value={form.resolution} onChange={e=>set("resolution",e.target.value)} maxLength={32} placeholder="VD: 2560x1440"/></label>}
          </div>
        </fieldset>
        <fieldset className="cam-form-section" disabled={busy}>
          <legend><span className="cam-section-number">03</span> Vị trí lắp đặt</legend>
          <div className="cam-form-grid">
            <label>Khu nuôi<select value={form.farmingAreaId} onChange={e=>setForm(current=>({...current,farmingAreaId:e.target.value,farmingRowId:""}))}><option value="">Chưa gán</option>{areas.filter(a=>a.isActive||a.id===form.farmingAreaId).map(a=><option key={a.id} value={a.id}>{a.name||a.code}</option>)}</select></label>
            <label>Dãy nuôi<select value={form.farmingRowId} onChange={e=>set("farmingRowId",e.target.value)} disabled={!form.farmingAreaId}><option value="">Chưa gán</option>{rowOptions.map(r=><option key={r.id} value={r.id}>{r.name||r.code}</option>)}</select></label>
            <label className="cam-wide">Vị trí lắp đặt cụ thể<input value={form.installationLocation} onChange={e=>set("installationLocation",e.target.value)} maxLength={200} placeholder="VD: Trên khung dãy A01, hướng xuống hộp cua"/></label>
            <label className="cam-wide">Ghi chú<textarea rows={3} maxLength={500} value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Thông tin bổ sung về Camera…"/></label>
          </div>
        </fieldset>
        {!camera && <div className="cam-form-info cam-form-after"><CircleCheck size={19}/><div><strong>Sau khi đăng ký</strong><p>Camera được lưu ở trạng thái Offline, chờ heartbeat xác thực. Lịch trình ghi hình được cấu hình ở trang riêng.</p></div></div>}
      </div>
      <div className="cam-dialog-foot"><span className="cam-required-note"><span className="cam-required">*</span> Trường bắt buộc</span><button type="button" className="system-secondary-button" disabled={busy} onClick={onClose}>Hủy</button><button type="submit" className="system-primary-button" disabled={busy}>{busy?"Đang lưu…":camera?"Lưu thay đổi":"Đăng ký Camera"}</button></div>
    </form>
  </dialog>;
}
CameraForm.propTypes = {camera:PropTypes.object,areas:PropTypes.array.isRequired,initialArea:PropTypes.string,initialRow:PropTypes.string,onClose:PropTypes.func.isRequired,onSaved:PropTypes.func.isRequired};

function LocationCameraCard({ camera, selected, onChoose, onEdit, canEdit }) {
  return <article className={`cam-location-card ${selected?"selected":""}`}>
    <button type="button" className="cam-location-card-main" onClick={()=>onChoose(camera)} aria-label={"Xem chi tiết "+camera.deviceCode}>
      <div className="cam-location-preview"><Video size={27}/><span>Chưa xác minh hình ảnh</span><StatusPill camera={camera}/></div>
      <div className="cam-location-card-info"><strong>{camera.deviceCode}</strong><span>{camera.name||"Camera"}</span><small>{camera.installationLocation||"Chưa khai báo vị trí lắp đặt"}</small><small><Clock size={12}/> {formatWhen(camera.lastSeenAt)}</small></div>
    </button>
    <div className="cam-location-card-actions"><button type="button" onClick={()=>onChoose(camera)}><Eye size={15}/> Chi tiết</button><button type="button" disabled={!canEdit} onClick={()=>onEdit(camera)}><MapPin size={15}/> Gán vị trí</button></div>
  </article>;
}
LocationCameraCard.propTypes={camera:PropTypes.object.isRequired,selected:PropTypes.bool,onChoose:PropTypes.func.isRequired,onEdit:PropTypes.func.isRequired,canEdit:PropTypes.bool};

function CameraLocationView({ cameras, filtered, areas, area, row, onArea, onChoose, onEdit, onAdd, selectedId, locationError }) {
  const summary=locationSummary(cameras,areas);
  const groups=buildLocationGroups(cameras,filtered,areas,area,row);
  const [closed,setClosed]=useState({});
  const toggle=id=>setClosed(prev=>({...prev,[id]:!prev[id]}));
  const counts=items=>({online:items.filter(c=>statusKey(c)==="online").length,offline:items.filter(c=>statusKey(c)==="offline").length,maintenance:items.filter(c=>statusKey(c)==="maintenance").length,error:items.filter(c=>statusKey(c)==="error").length,unknown:items.filter(c=>statusKey(c)==="unknown").length});
  return <div className="cam-location-view">
    <div className="cam-location-summary">
      {[[MapPin,"Khu nuôi",locationError?"—":areas.length],[Video,"Đã gán khu",summary.assigned],[CircleAlert,"Chưa gán khu",summary.unassigned]].map(([Icon,label,value])=><div key={label}><span className="cam-location-summary-icon"><Icon size={21}/></span><span><small>{label}</small><strong>{value}</strong></span></div>)}
    </div>
    {locationError?<p className="cam-note" role="alert">Không tải được danh mục khu/dãy. Chỉ hiển thị vị trí đã lưu trên Camera; không thể xác định khu hoặc dãy nào còn trống.</p>:<>
      <div className="cam-location-picker"><h3>Chọn khu nuôi</h3><div role="group" aria-label="Chọn khu nuôi">
        <button type="button" aria-pressed={area==="all"} onClick={()=>onArea("all")}><strong>Tất cả khu</strong><small>{cameras.length} Camera</small></button>
        {areas.map(a=><button key={a.id} type="button" aria-pressed={area===a.id} onClick={()=>onArea(a.id)}><strong>{a.name||a.code}{a.isActive===false?" · Ngừng hoạt động":""}</strong><small>{cameras.filter(c=>c.farmingAreaId===a.id).length} Camera</small></button>)}
        <button type="button" aria-pressed={area==="none"} onClick={()=>onArea("none")}><strong>Chưa gán khu</strong><small>{summary.unassigned} Camera</small></button>
      </div></div>
    </>}
    {groups.length?groups.map(group=>{
      const stat=counts(group.all);
      return <section key={group.id} className="cam-area-group">
        <header className="cam-area-head"><div><h3><MapPin size={17}/>{group.name}</h3><p>{group.all.length} Camera · {stat.online} Online · {stat.offline} Offline · {stat.maintenance} Bảo trì{stat.error?` · ${stat.error} Lỗi`:""}{stat.unknown?` · ${stat.unknown} Chưa xác định`:""}</p></div><button type="button" className="cam-icon" aria-expanded={!closed[group.id]} aria-label={(closed[group.id]?"Mở ":"Thu gọn ")+group.name} onClick={()=>toggle(group.id)}><ChevronRight size={18} className={closed[group.id]?"":"cam-location-chevron"}/></button></header>
        {!closed[group.id]&&<div className="cam-area-rows">
          {!group.rows.length&&<div className="cam-location-empty"><Video size={23}/><strong>{group.all.length?"Không có Camera phù hợp bộ lọc":group.id==="none"?"Không có Camera chưa gán khu":"Khu này chưa có Camera"}</strong>{!group.all.length&&group.canAssign&&!locationError&&<button className="system-secondary-button" type="button" onClick={()=>onAdd(group.id,"")}>Thêm Camera vào khu</button>}</div>}
          {group.rows.map(r=><section key={r.id} className="cam-row-group"><header><div><h4>{r.name}{r.inactive?" · Ngừng hoạt động":""}</h4><small>{r.all.length} Camera{r.items.length!==r.all.length?` · ${r.items.length} phù hợp`:""}</small></div>{group.canAssign&&r.canAssign&&!locationError&&<button type="button" className="cam-icon" aria-label={"Thêm Camera vào "+r.name} title="Thêm Camera" onClick={()=>onAdd(group.id,r.id==="none"?"":r.id)}><Plus size={18}/></button>}</header>
            {r.items.length?<div className="cam-location-cards">{r.items.map(camera=><LocationCameraCard key={camera.id} camera={camera} selected={camera.id===selectedId} onChoose={onChoose} onEdit={onEdit} canEdit={!locationError}/>)}</div>:<div className="cam-location-empty"><Video size={23}/><span>{r.all.length?"Không có Camera phù hợp bộ lọc":"Chưa có Camera trong "+(r.id==="none"?"nhóm này":"dãy này")}</span></div>}
          </section>)}
        </div>}
      </section>;
    }):<div className="cam-empty"><MapPin size={30}/><strong>Không có khu hoặc Camera phù hợp</strong><span>Thay đổi bộ lọc hoặc thêm Camera.</span></div>}
  </div>;
}
CameraLocationView.propTypes={cameras:PropTypes.array.isRequired,filtered:PropTypes.array.isRequired,areas:PropTypes.array.isRequired,area:PropTypes.string.isRequired,row:PropTypes.string.isRequired,onArea:PropTypes.func.isRequired,onChoose:PropTypes.func.isRequired,onEdit:PropTypes.func.isRequired,onAdd:PropTypes.func.isRequired,selectedId:PropTypes.string,locationError:PropTypes.bool.isRequired};

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
  const chooseArea=value=>{setArea(value);setRow("all");setPage(1);};
  const addAtLocation=(areaId,rowId)=>{if(!locationError)setEdit({camera:null,initialArea:areaId,initialRow:rowId});};
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
              <label>Khu nuôi<select aria-label="Khu nuôi" value={area} onChange={e=>chooseArea(e.target.value)}><option value="all">Tất cả</option><option value="none">Chưa gán</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name||a.code}</option>)}</select></label>
              <label>Dãy nuôi<select aria-label="Dãy nuôi" value={row} disabled={area==="none"||locationError} onChange={e=>{setRow(e.target.value);setPage(1);}}><option value="all">Tất cả</option>{areaRows.map(r=><option key={r.id} value={r.id}>{r.name||r.code}</option>)}</select></label>
              <label>Trạng thái<select aria-label="Trạng thái" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="all">Tất cả</option>{Object.entries(STATES).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
            </div>
            <div className="cam-list-heading"><h2>{view==="list"?"Danh sách Camera":"Camera theo khu / dãy"}</h2><span>{filtered.length} kết quả</span></div>
            {view==="list"?<><div className="cam-table-scroll" tabIndex={0} role="region" aria-label="Danh sách Camera"><table className="cam-table"><thead><tr><th scope="col">Mã / tên Camera</th><th scope="col">Vị trí</th><th scope="col">IP / Stream</th><th scope="col">Trạng thái</th><th scope="col">Ghi hình</th><th scope="col">Kết nối gần nhất</th><th scope="col">Thao tác</th></tr></thead><tbody>{visible.map(c=><tr key={c.id} className={c.id===selectedId?"selected":""}><td><button type="button" className="cam-device" onClick={()=>choose(c)}><span className="cam-device-icon"><Camera size={20}/></span><span><strong>{c.deviceCode}</strong><small>{c.name||"Camera"}</small></span></button></td><td><span className="cam-cell-main">{cameraPlace(c)}</span><small>{display(c.installationLocation)}</small></td><td><span className="cam-cell-main">{display(c.ipAddress)}</span><small>{protocol(c.streamUrl)} · {display(c.resolution)}</small></td><td><StatusPill camera={c}/></td><td><span className="cam-pill cam-neutral">{recordingLabel(scheduleById.get(c.id))}</span><small>{scheduleById.get(c.id)?.runtimeStatus==="NotIntegrated"?"Chưa tích hợp":""}</small></td><td>{formatWhen(c.lastSeenAt)}</td><td><div className="cam-actions"><button type="button" className="cam-icon" title="Xem chi tiết" aria-label={"Xem "+c.deviceCode} onClick={()=>choose(c)}><Eye size={17}/></button><button type="button" className="cam-icon" disabled={locationError} title="Chỉnh sửa" aria-label={"Sửa "+c.deviceCode} onClick={()=>editCamera(c)}><Pencil size={16}/></button><div className="cam-more"><button type="button" className="cam-icon" aria-expanded={menu===c.id} aria-label={"Thao tác "+c.deviceCode} onClick={()=>setMenu(menu===c.id?null:c.id)}><MoreHorizontal size={19}/></button>{menu===c.id&&<div className="cam-menu"><button type="button" onClick={()=>choose(c,"health")}>Chẩn đoán</button><button type="button" onClick={()=>choose(c,"events")}>Nhật ký</button><button type="button" onClick={()=>choose(c,"config")}>Cấu hình</button></div>}</div></div></td></tr>)}</tbody></table></div>
              {!visible.length&&<div className="cam-empty"><Video size={30}/><strong>{cameras.length?"Không có Camera phù hợp":"Chưa có Camera đăng ký"}</strong><span>{cameras.length?"Thay đổi bộ lọc để xem kết quả.":"Thêm Camera để bắt đầu quản lý thiết bị."}</span>{!cameras.length&&!locationError&&<button className="system-primary-button" type="button" onClick={()=>setEdit({camera:null})}>Thêm Camera</button>}</div>}
              <div className="cam-pagination"><span>Hiển thị {filtered.length?(current-1)*size+1:0}–{Math.min(current*size,filtered.length)} / {filtered.length} Camera</span><div><label>Số dòng <select value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1);}}>{[5,10,20,50].map(n=><option key={n}>{n}</option>)}</select></label><button type="button" className="cam-icon" aria-label="Trang trước" disabled={current===1} onClick={()=>setPage(current-1)}><ChevronLeft size={18}/></button><span className="cam-page-number">{current} / {pages}</span><button type="button" className="cam-icon" aria-label="Trang sau" disabled={current===pages} onClick={()=>setPage(current+1)}><ChevronRight size={18}/></button></div></div></>:<CameraLocationView cameras={cameras} filtered={filtered} areas={areas} area={area} row={row} onArea={chooseArea} onChoose={choose} onEdit={editCamera} onAdd={addAtLocation} selectedId={selectedId} locationError={locationError}/>}
          </section>
          {selected&&<CameraDetails key={selected.id} camera={selected} schedule={scheduleById.get(selected.id)} tab={tab} onTab={setTab} onClose={()=>setSelectedId(null)} onEdit={editCamera} onReload={load} canEdit={!locationError}/>}
        </div>
        <p className="cam-hint cam-bottom-note">Trạng thái kết nối lấy từ BE. Ghi hình là cấu hình đã lưu, không phải trạng thái đang quay thực tế.</p>
      </SystemState>
      {edit&&<CameraForm camera={edit.camera} areas={areas} initialArea={edit.initialArea} initialRow={edit.initialRow} onClose={()=>setEdit(null)} onSaved={()=>{setNotice(edit.camera?"Đã lưu cấu hình Camera.":"Đã đăng ký Camera; chờ heartbeat.");load();}}/>}
    </div>
  </SystemPage>;
}
