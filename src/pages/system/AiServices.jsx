import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Activity, Brain, Camera, Clock, Plus, RefreshCw, Search, Settings, X } from "lucide-react";
import systemAdminService from "../../services/systemAdminService";
import { DataTable, KpiGrid, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatWhen } from "./deviceModel";
import "./ai-services.css";

const TABS = [["services","Dịch vụ AI"],["models","Mô hình AI"],["cameras","Phân bổ camera"],["jobs","Lịch sử xử lý"],["monitor","Giám sát & nhật ký"]];
const HEALTH = { Online:"Đang hoạt động", Offline:"Mất kết nối", Degraded:"Có sự cố", NotIntegrated:"Chưa kết nối worker", Stopped:"Đã dừng", Disabled:"Vô hiệu hóa" };
const COMMAND = { RestartRequested:"Chờ khởi động lại", StopRequested:"Chờ dừng", DeployRequested:"Chờ triển khai", RollbackRequested:"Chờ hoàn tác", Running:"Đã xác nhận chạy", Stopped:"Đã xác nhận dừng", Failed:"Lệnh thất bại" };
const JOB = { Queued:"Đang chờ", Running:"Đang xử lý", Succeeded:"Thành công", Failed:"Thất bại" };
const EMPTY = { name:"", modelName:"", version:"", deviceLabel:"", confidenceThreshold:"0.75", frameSamplingFps:"2", batchSize:"4", classes:"", isEnabled:true };
const MODEL_EMPTY = { version:"", artifactName:"", sha256:"" };
const PAGE_SIZE = 10;
const display = value => value ?? "—";
const healthKey = row => HEALTH[row?.runtimeStatus] ? row.runtimeStatus : "NotIntegrated";
const pending = row => Boolean(row?.commandId && row.status?.endsWith("Requested") && Date.now() - Date.parse(row.commandRequestedAt) < 300000);
const commandLabel = row => row?.status?.endsWith("Requested") && !pending(row) ? "Lệnh hết hạn / chưa xác nhận" : COMMAND[row?.status] || row?.status || "—";
function labelsOf(value) {
  try { const labels = JSON.parse(value || "[]"); return Array.isArray(labels) ? labels.filter(x => typeof x === "string") : []; }
  catch { return []; }
}
const list = value => { if (!Array.isArray(value)) throw new Error("API AI trả dữ liệu không đúng định dạng."); return value; };

function AiServiceForm({ service, busy, onClose, onSave }) {
  const ref = useRef(null);
  const [form,setForm] = useState(() => service ? { name:service.name || "", modelName:service.modelName || "", version:service.version || "",
    deviceLabel:service.deviceLabel || "", confidenceThreshold:String(service.confidenceThreshold ?? 0.75), frameSamplingFps:String(service.frameSamplingFps ?? 2),
    batchSize:String(service.batchSize ?? 4), classes:labelsOf(service.detectionClassesJson).join("\n"), isEnabled:service.isEnabled !== false } : EMPTY);
  const [error,setError] = useState("");
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  const set = (key,value) => setForm(current => ({...current,[key]:value}));
  const submit = async event => {
    event.preventDefault(); setError("");
    if (!form.name.trim() || !form.modelName.trim() || !form.version.trim()) { setError("Tên, model và phiên bản là bắt buộc."); return; }
    const detectionClasses = [...new Set(form.classes.split("\n").map(x=>x.trim()).filter(Boolean))];
    if (detectionClasses.length > 100 || detectionClasses.some(x=>x.length>80)) { setError("Tối đa 100 lớp, mỗi lớp tối đa 80 ký tự."); return; }
    const body = { name:form.name.trim(), deviceLabel:form.deviceLabel.trim() || null, confidenceThreshold:Number(form.confidenceThreshold),
      frameSamplingFps:Number(form.frameSamplingFps), batchSize:Number(form.batchSize) };
    try { await onSave(service ? {...body,detectionClasses,isEnabled:form.isEnabled} : {...body,modelName:form.modelName.trim(),version:form.version.trim(),detectionClassesJson:JSON.stringify(detectionClasses)}); }
    catch (failure) { setError(failure?.message || "Không lưu được dịch vụ."); }
  };
  return <dialog ref={ref} className="ai-dialog" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <form onSubmit={submit}>
      <div className="ai-dialog-head"><div><h2>{service ? "Cấu hình dịch vụ AI" : "Đăng ký dịch vụ AI"}</h2><p>Thông tin cấu hình không đồng nghĩa worker đã hoạt động.</p></div>
        <button type="button" className="ai-icon-button" disabled={busy} onClick={onClose} aria-label="Đóng"><X size={19}/></button></div>
      <div className="ai-form-grid">
        <label>Tên dịch vụ <input required maxLength={120} value={form.name} onChange={e=>set("name",e.target.value)}/></label>
        <label>Tên model <input required maxLength={120} disabled={Boolean(service)} value={form.modelName} onChange={e=>set("modelName",e.target.value)}/></label>
        <label>Phiên bản {service ? "cấu hình" : "ban đầu"} <input required maxLength={80} disabled={Boolean(service)} value={form.version} onChange={e=>set("version",e.target.value)}/></label>
        <label>Máy chạy AI <input maxLength={200} value={form.deviceLabel} onChange={e=>set("deviceLabel",e.target.value)} placeholder="Ví dụ: AI edge server"/></label>
        <label>Ngưỡng confidence (0–1) <input type="number" required min="0" max="1" step="0.01" value={form.confidenceThreshold} onChange={e=>set("confidenceThreshold",e.target.value)}/></label>
        <label>FPS lấy mẫu <input type="number" required min="0.01" max="120" step="0.01" value={form.frameSamplingFps} onChange={e=>set("frameSamplingFps",e.target.value)}/></label>
        <label>Batch size (cấu hình) <input type="number" required min="1" max="128" step="1" value={form.batchSize} onChange={e=>set("batchSize",e.target.value)}/></label>
        {service && <label className="ai-check"><input type="checkbox" checked={form.isEnabled} onChange={e=>set("isEnabled",e.target.checked)}/> Cho phép nhận job AI</label>}
        <label className="ai-span">Lớp nhận diện (mỗi dòng một lớp; để trống = mọi lớp)<textarea rows={3} value={form.classes} onChange={e=>set("classes",e.target.value)} placeholder={"molting\nsoftshell"}/></label>
      </div>
      {error && <p className="ai-error" role="alert">{error}</p>}
      <div className="ai-actions"><button type="button" className="ai-button" disabled={busy} onClick={onClose}>Hủy</button><button type="submit" className="ai-button primary" disabled={busy}>{busy?"Đang lưu…":"Lưu cấu hình"}</button></div>
    </form>
  </dialog>;
}
AiServiceForm.propTypes = { service:PropTypes.object, busy:PropTypes.bool.isRequired, onClose:PropTypes.func.isRequired, onSave:PropTypes.func.isRequired };

function AiServices() {
  const [services,setServices] = useState([]);
  const [selectedId,setSelectedId] = useState("");
  const [tab,setTab] = useState("services");
  const [loaded,setLoaded] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [actionError,setActionError] = useState("");
  const [busy,setBusy] = useState(false);
  const lock = useRef(false);
  const [formMode,setFormMode] = useState("");
  const [search,setSearch] = useState("");
  const [status,setStatus] = useState("");
  const [page,setPage] = useState(1);
  const [modelForm,setModelForm] = useState(MODEL_EMPTY);
  const [cameraId,setCameraId] = useState("");
  const [jobStatus,setJobStatus] = useState("");
  const [jobPage,setJobPage] = useState(1);
  const [refreshKey,setRefreshKey] = useState(0);
  const [detail,setDetail] = useState(null);
  const [detailLoading,setDetailLoading] = useState(false);
  const [detailError,setDetailError] = useState("");
  const selected = services.find(x=>x.id===selectedId);
  const load = useCallback(async signal => {
    try {
      const rows = await systemAdminService.getAiServices(signal);
      if (signal?.aborted) return;
      setServices(rows); setSelectedId(current => rows.some(x=>x.id===current) ? current : rows[0]?.id || ""); setError(""); setLoaded(true);
    } catch (failure) { if (!signal?.aborted) setError(failure?.message || "Không tải được dịch vụ AI."); }
  },[]);
  useEffect(()=>{
    const controller = new AbortController();
    load(controller.signal);
    const timer = setInterval(()=>load(controller.signal),15000);
    return ()=>{clearInterval(timer);controller.abort();};
  },[load]);

  useEffect(()=>{
    if (!selectedId || tab==="services") return;
    const controller = new AbortController(); const signal = controller.signal;
    setDetail(null); setDetailLoading(true); setDetailError("");
    const run = async () => {
      try {
        let result;
        if (tab==="models") result = {models:list(await systemAdminService.getAiModels(selectedId,signal))};
        if (tab==="cameras") {
          const [assignments,cameras] = await Promise.all([systemAdminService.getAiCameras(selectedId,signal),systemAdminService.getCameras()]);
          result={assignments:list(assignments),cameras:list(cameras)};
        }
        if (tab==="jobs") {
          const jobs=await systemAdminService.getAiJobs(selectedId,{status:jobStatus,page:jobPage,pageSize:25},signal);
          if (!Array.isArray(jobs?.items) || !Number.isFinite(jobs?.totalCount)) throw new Error("API lịch sử AI không đúng định dạng.");
          result={jobs};
        }
        if (tab==="monitor") {
          const [metrics,audit] = await Promise.all([systemAdminService.getAiMetrics(selectedId,signal),systemAdminService.getAiAudit(selectedId,signal)]);
          result={metrics,audit:list(audit)};
        }
        if (!signal.aborted) setDetail(result);
      } catch(failure) { if(!signal.aborted)setDetailError(failure?.message || "Không tải được chi tiết AI."); }
      finally { if(!signal.aborted)setDetailLoading(false); }
    };
    run(); return ()=>controller.abort();
  },[selectedId,tab,jobStatus,jobPage,refreshKey]);

  const refresh = () => { load(); setRefreshKey(x=>x+1); };
  const select = id => { setSelectedId(id); setJobPage(1); setCameraId(""); setModelForm(MODEL_EMPTY); setActionError(""); };
  const runAction = async (operation, message, close=false) => {
    if(lock.current) return;
    lock.current=true;setBusy(true);setActionError("");setNotice("");
    try { await operation(); if(close)setFormMode("");setNotice(message);refresh(); }
    catch(failure){setActionError(failure?.message || "Thao tác thất bại.");throw failure;}
    finally{lock.current=false;setBusy(false);}
  };
  const perform = (operation,message,confirmText) => {
    if(confirmText && !window.confirm(confirmText))return;
    runAction(operation,message).catch(()=>{});
  };
  const runtimeReady = selected && selected.lastHeartbeatAt && Date.now()-Date.parse(selected.lastHeartbeatAt)<90000 && !["Offline","NotIntegrated"].includes(healthKey(selected));
  const canCommand = Boolean(runtimeReady && !pending(selected) && !busy);
  const submitForm = body => runAction(
    ()=>formMode==="edit" ? systemAdminService.updateAiConfiguration(selectedId,body) : systemAdminService.createAiService(body),
    "Đã lưu cấu hình dịch vụ AI.",true);
  const rows=useMemo(()=>services.filter(row=>(!status || healthKey(row)===status) &&
    (!search.trim() || [row.name,row.modelName,row.version,row.deviceLabel].some(value=>String(value||"").toLowerCase().includes(search.trim().toLowerCase())))),[services,search,status]);
  const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE)), currentPage=Math.min(page,pages);
  const online=services.filter(x=>healthKey(x)==="Online").length;
  const trouble=services.filter(x=>["Offline","Degraded"].includes(healthKey(x))).length;
  const detections=services.reduce((sum,x)=>sum+(Number(x.detectionCount)||0),0);
  const detailForTab=detail && selectedId;
  const models=detail?.models || [];
  const assignments=detail?.assignments || [];
  const jobs=detail?.jobs;
  const metrics=detail?.metrics;
  const audit=detail?.audit || [];
  const cameraOptions=(detail?.cameras || []).filter(x=>!assignments.some(a=>a.deviceId===x.id));
  return <SystemPage title="Quản lý dịch vụ AI" description="Cấu hình model, kết nối worker, camera và theo dõi quá trình suy luận thực tế." actions={<>
      <button type="button" className="ai-button" onClick={refresh}><RefreshCw size={16}/> Làm mới</button>
      <button type="button" className="ai-button primary" disabled={busy} onClick={()=>setFormMode("create")}><Plus size={17}/> Thêm dịch vụ</button></>}>
    <div className="ai-workspace">
      <SystemState loading={!loaded && !error} error={!loaded ? error : ""} onRetry={refresh}>
        {loaded && <>
          {error && <p className="ai-error" role="alert">Dữ liệu có thể đã cũ: {error}</p>}
          {actionError && <p className="ai-error" role="alert">{actionError}</p>}
          {notice && <p className="ai-notice" role="status">{notice}</p>}
          <KpiGrid items={[{label:"Tổng dịch vụ",value:services.length,hint:"Cấu hình đã đăng ký"},{label:"Worker online",value:online,hint:"Heartbeat và đúng phiên bản"},{label:"Gặp sự cố",value:trouble,hint:"Mất kết nối hoặc sai model"},{label:"Kết quả AI",value:detections,hint:"Nhận diện đã lưu theo dịch vụ"}]}/>
          <div className="ai-tabs" role="tablist" aria-label="Quản lý AI">{TABS.map(([key,label])=><button type="button" key={key} role="tab" aria-selected={tab===key} onClick={()=>{setTab(key);setDetail(null);}} className={tab===key?"active":""}>{label}</button>)}</div>
          {tab==="services" ? <>
            <Panel title="Danh sách dịch vụ">
              <div className="ai-toolbar"><label className="ai-search"><Search size={16}/><input aria-label="Tìm dịch vụ" placeholder="Tìm tên dịch vụ, model, máy chạy…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label>
                <select aria-label="Lọc trạng thái runtime" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Tất cả trạng thái</option>{Object.entries(HEALTH).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
              <DataTable empty="Không có dịch vụ phù hợp." rows={rows.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE)} columns={[
                {key:"name",label:"Dịch vụ / Model",render:r=><div className="ai-service-name"><Brain size={18}/><span><strong>{r.name}</strong><small>{r.modelName}</small></span></div>},
                {key:"version",label:"Phiên bản",render:r=><span className="ai-code">{r.version}</span>},
                {key:"runtimeStatus",label:"Runtime",render:r=><span className={"ai-pill "+healthKey(r)}>{HEALTH[healthKey(r)]}</span>},
                {key:"lastHeartbeatAt",label:"Heartbeat",render:r=>r.lastHeartbeatAt?formatWhen(r.lastHeartbeatAt):"Chưa có"},
                {key:"detectionCount",label:"Kết quả",render:r=>display(r.detectionCount)},
                {key:"actions",label:"Thao tác",render:r=><button type="button" className={"ai-button small "+(selectedId===r.id?"selected":"")} onClick={()=>select(r.id)}>Chi tiết</button>} ]}/>
              <div className="ai-pagination"><span>{rows.length} dịch vụ · Trang {currentPage}/{pages}</span><button type="button" className="ai-button small" disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>Trước</button><button type="button" className="ai-button small" disabled={currentPage>=pages} onClick={()=>setPage(currentPage+1)}>Sau</button></div>
            </Panel>
            {selected && <Panel title={"Chi tiết · "+selected.name}>
              <div className="ai-detail-grid">
                <div><span>Cấu hình</span><strong>{selected.isEnabled===false?"Vô hiệu hóa":"Cho phép nhận job"}</strong></div><div><span>Model cấu hình / đã xác nhận</span><strong>{selected.version}</strong></div>
                <div><span>Model worker báo cáo</span><strong>{display(selected.reportedVersion)}</strong></div><div><span>Trạng thái lệnh</span><strong>{commandLabel(selected)}</strong></div>
                <div><span>Phiên bản chờ triển khai</span><strong>{display(selected.requestedVersion)}</strong></div><div><span>Máy chạy AI</span><strong>{display(selected.deviceLabel)}</strong></div>
                <div><span>Ngưỡng confidence</span><strong>{display(selected.confidenceThreshold)}</strong></div><div><span>FPS lấy mẫu / Batch</span><strong>{display(selected.frameSamplingFps)} / {display(selected.batchSize)}</strong></div>
                <div><span>Lớp nhận diện</span><strong>{labelsOf(selected.detectionClassesJson).join(", ") || "Tất cả"}</strong></div><div><span>Heartbeat cuối</span><strong>{selected.lastHeartbeatAt?formatWhen(selected.lastHeartbeatAt):"Chưa có"}</strong></div>
              </div>
              {selected.commandError && <p className="ai-error" role="alert">{selected.commandError}</p>}
              <div className="ai-actions left">
                <button type="button" className="ai-button" disabled={busy||pending(selected)} onClick={()=>setFormMode("edit")}><Settings size={15}/> Cấu hình</button>
                <button type="button" className="ai-button" disabled={!canCommand||selected.isEnabled===false} onClick={()=>perform(()=>systemAdminService.restartAi(selectedId),"Đã gửi yêu cầu khởi động; chờ worker xác nhận.","Khởi động hoặc khởi động lại dịch vụ này?")}>Khởi động / Restart</button>
                <button type="button" className="ai-button danger" disabled={!canCommand} onClick={()=>perform(()=>systemAdminService.stopAi(selectedId),"Đã gửi yêu cầu dừng; chờ worker xác nhận.","Dừng AI sẽ tạm ngừng xử lý. Tiếp tục?")}>Dừng</button>
                <button type="button" className="ai-button" disabled={!canCommand||!selected.previousVersion||selected.isEnabled===false} onClick={()=>perform(()=>systemAdminService.rollbackAi(selectedId),"Đã gửi yêu cầu rollback; chờ worker xác nhận.","Quay lại model "+selected.previousVersion+"?")}>Rollback</button>
                <button type="button" className="ai-button" onClick={()=>setTab("models")}>Quản lý model</button>
              </div>
              {!runtimeReady && <p className="ai-hint">Worker chưa kết nối hoặc heartbeat đã hết hạn. Cần cấu hình worker trên máy chạy AI trước khi điều khiển.</p>}
            </Panel>}
          </> : <>
            <div className="ai-context"><label>Chọn dịch vụ AI <select value={selectedId} onChange={e=>select(e.target.value)}><option value="">Chọn dịch vụ</option>{services.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label>{selected&&<span className={"ai-pill "+healthKey(selected)}>{HEALTH[healthKey(selected)]}</span>}</div>
            {!selected ? <Panel title="Chưa có dịch vụ"><p className="ai-hint">Đăng ký dịch vụ AI trước khi cấu hình.</p></Panel> : <SystemState loading={detailLoading} error={detailError} onRetry={refresh}>
              {detailForTab && tab==="models" && <>
                <Panel title="Đăng ký phiên bản model">
                  <p className="ai-hint">Đặt file .pt đã huấn luyện trên máy worker và nhập SHA-256. Đăng ký không tải lên hay kích hoạt model.</p>
                  <form className="ai-inline-form" onSubmit={e=>{e.preventDefault();runAction(()=>systemAdminService.registerAiModel(selectedId,modelForm),"Đã đăng ký phiên bản model.").then(()=>setModelForm(MODEL_EMPTY)).catch(()=>{});}}>
                    <label>Phiên bản<input required maxLength={80} value={modelForm.version} onChange={e=>setModelForm(f=>({...f,version:e.target.value}))} placeholder="v1.0.0"/></label>
                    <label>Tên file .pt<input required maxLength={123} value={modelForm.artifactName} onChange={e=>setModelForm(f=>({...f,artifactName:e.target.value}))} placeholder="crab-v1.pt"/></label>
                    <label>SHA-256<input required minLength={64} maxLength={64} value={modelForm.sha256} onChange={e=>setModelForm(f=>({...f,sha256:e.target.value}))} placeholder="64 ký tự hex"/></label>
                    <button className="ai-button primary" type="submit" disabled={busy}>Đăng ký</button>
                  </form>
                </Panel>
                <Panel title="Danh sách phiên bản">
                  <DataTable empty="Chưa có phiên bản model được đăng ký." rows={models} columns={[{key:"version",label:"Phiên bản",render:r=><strong>{r.version}</strong>},{key:"artifactName",label:"Artifact"},{key:"sha256",label:"SHA-256",render:r=><span className="ai-code" title={r.sha256}>{r.sha256.slice(0,12)}…</span>},{key:"state",label:"Trạng thái",render:r=>r.version===selected.version&&selected.reportedVersion===r.version&&healthKey(selected)==="Online"?"Đang chạy":r.version===selected.version?"Đã cấu hình":r.version===selected.previousVersion?"Phiên bản trước":"Đã đăng ký"},{key:"actions",label:"Thao tác",render:r=><button type="button" className="ai-button small" disabled={!canCommand||selected.isEnabled===false||r.version===selected.version&&healthKey(selected)==="Online"} onClick={()=>perform(()=>systemAdminService.deployAi(selectedId,r.version),"Đã gửi yêu cầu triển khai; chờ worker kiểm tra artifact.","Triển khai model "+r.version+"?")}>Triển khai</button>}]}/>
                </Panel>
              </>}
              {detailForTab && tab==="cameras" && <Panel title="Camera sử dụng dịch vụ AI">
                <p className="ai-hint">Liên kết camera để cho phép yêu cầu phân tích media của camera. Gắn camera chưa tự bật luồng ghi hình hoặc nhận diện liên tục.</p>
                <form className="ai-inline-form" onSubmit={e=>{e.preventDefault();if(cameraId)runAction(()=>systemAdminService.assignAiCamera(selectedId,cameraId),"Đã gắn camera.").then(()=>setCameraId("")).catch(()=>{});}}>
                  <label>Camera<select required value={cameraId} onChange={e=>setCameraId(e.target.value)}><option value="">Chọn camera chưa gắn</option>{cameraOptions.map(c=><option key={c.id} value={c.id}>{c.deviceCode} · {c.name||"Camera"}</option>)}</select></label><button type="submit" className="ai-button primary" disabled={busy||!cameraId}><Camera size={16}/> Gắn camera</button>
                </form>
                <DataTable empty="Chưa gắn camera." rows={assignments.map(x=>({...x,id:x.deviceId}))} columns={[{key:"deviceCode",label:"Mã camera"},{key:"name",label:"Tên camera"},{key:"actions",label:"Thao tác",render:r=><button type="button" className="ai-button small danger" disabled={busy} onClick={()=>perform(()=>systemAdminService.unassignAiCamera(selectedId,r.deviceId),"Đã bỏ gắn camera.","Bỏ gắn camera này?")}>Bỏ gắn</button>}]}/>
              </Panel>}
              {detailForTab && tab==="jobs" && jobs && <Panel title="Lịch sử xử lý kỹ thuật">
                <p className="ai-hint">System Admin theo dõi job, model, thời lượng và lỗi. Ảnh gốc, hộp cua và kết quả nghiệp vụ thuộc quyền người dùng được phân công khu nuôi.</p>
                <div className="ai-toolbar"><select aria-label="Lọc job" value={jobStatus} onChange={e=>{setJobStatus(e.target.value);setJobPage(1);}}><option value="">Tất cả trạng thái</option>{Object.entries(JOB).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
                <DataTable empty="Chưa có job AI." rows={jobs.items} columns={[{key:"id",label:"Job",render:r=><span className="ai-code" title={r.id}>{r.id.slice(0,8)}…</span>},{key:"modelVersion",label:"Model"},{key:"status",label:"Trạng thái",render:r=><span className={"ai-pill "+r.status}>{JOB[r.status]||r.status}</span>},{key:"attempts",label:"Lần thử"},{key:"createdAt",label:"Tạo lúc",render:r=>formatWhen(r.createdAt)},{key:"durationMs",label:"Thời lượng",render:r=>r.durationMs==null?"—":Math.round(r.durationMs)+" ms"},{key:"actions",label:"Thao tác",render:r=>r.status==="Failed"?<button type="button" className="ai-button small" disabled={busy||r.modelVersion!==selected.version||selected.isEnabled===false} onClick={()=>perform(()=>systemAdminService.retryAiJob(selectedId,r.id),"Đã đưa job trở lại hàng đợi.","Thử lại job AI này?")}>Thử lại</button>:"—"}]}/>
                <div className="ai-pagination"><span>{jobs.totalCount} job · Trang {jobPage}/{Math.max(1,Math.ceil(jobs.totalCount/25))}</span><button type="button" className="ai-button small" disabled={jobPage<=1} onClick={()=>setJobPage(x=>x-1)}>Trước</button><button type="button" className="ai-button small" disabled={jobPage*25>=jobs.totalCount} onClick={()=>setJobPage(x=>x+1)}>Sau</button></div>
              </Panel>}
              {detailForTab && tab==="monitor" && metrics && <>
                <KpiGrid items={[{label:"Thành công / 24h",value:metrics.completed},{label:"Thất bại / 24h",value:metrics.failed},{label:"Tỷ lệ lỗi",value:metrics.failureRate==null?"—":(metrics.failureRate*100).toFixed(1)+"%"},{label:"Thời lượng TB",value:metrics.averageDurationMs==null?"—":Math.round(metrics.averageDurationMs)+" ms",hint:"Tải và suy luận job thành công"}]}/>
                <Panel title="Sức khỏe worker"><div className="ai-detail-grid"><div><span><Activity size={14}/> Runtime</span><strong>{HEALTH[healthKey(selected)]}</strong></div><div><span><Clock size={14}/> Heartbeat cuối</span><strong>{selected.lastHeartbeatAt?formatWhen(selected.lastHeartbeatAt):"Chưa có"}</strong></div><div><span>Model báo cáo</span><strong>{display(selected.reportedVersion)}</strong></div><div><span>Lệnh gần nhất</span><strong>{commandLabel(selected)}</strong></div></div>
                <p className="ai-hint">Không hiển thị GPU, độ chính xác hoặc tài nguyên giả. Worker báo kết nối theo heartbeat; độ chính xác cần dữ liệu đã gán nhãn.</p></Panel>
                <Panel title="Nhật ký thao tác"><DataTable empty="Chưa có nhật ký." rows={audit.map((x,i)=>({...x,id:x.createdAt+"-"+i}))} columns={[{key:"createdAt",label:"Thời gian",render:r=>formatWhen(r.createdAt)},{key:"action",label:"Hành động"},{key:"details",label:"Chi tiết"},{key:"userId",label:"Người thao tác",render:r=><span className="ai-code">{r.userId||"—"}</span>}]}/></Panel>
              </>}
            </SystemState>}
          </>}
        </>}
      </SystemState>
      {formMode && <AiServiceForm service={formMode==="edit"?selected:undefined} busy={busy} onClose={()=>setFormMode("")} onSave={submitForm}/>}
    </div>
  </SystemPage>;
}
export default AiServices;
