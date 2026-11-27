import {useEffect,useRef,useState} from "react";
import { CalibrationWizard, ControlCheck, SalinityPicker, ReviewPanel } from "./GuidedOperations";
import waterBench from "../../services/waterBenchService";
import authService from "../../services/authService";
import {batchKey} from "../../services/waterBenchModel";
import {analytes,sources,requireId,schedulePayload,estimatePayload,savedRequestMatches,reasonPayload} from "./operationModel";

const box="rounded-xl border border-[#24382A] bg-[#0D1510] p-5 space-y-3";
const field="w-full rounded-lg border border-[#38513B] bg-[#050806] px-3 py-2 text-sm";
const btn="rounded-lg border border-[#38513B] px-3 py-2 text-sm hover:border-[#77FF00] disabled:opacity-40";
const primary=btn+" bg-[#77FF00] text-[#050806] font-semibold";
const row=(value)=>Array.isArray(value)?value:[];
const get=(data,a)=>row(data?.channels).find(x=>x.analyte===a);
const id=()=>crypto.randomUUID();
const blank=(v)=>v==null?"—":String(v);
const newForm=()=>({seconds:"",salinity:"",source:"",reason:"",confirmed:false});
function useAction(onChanged){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const lock=useRef(false);
 const run=async(fn,refresh=true)=>{
  if(lock.current)return;
  lock.current=true;setBusy(true);setError("");setNotice("");
  try{const result=await fn();if(refresh){setNotice("OK");onChanged?.();}return result;}
  catch(e){setError(e.message||"Request failed");}
  finally{lock.current=false;setBusy(false);}
 };
 return {busy,error,notice,run};
}
function Feedback({action}){return <>{action.error&&<p role="alert" className="text-red-300">{action.error}</p>}{action.notice&&<p role="status">{action.notice}</p>}</>;}
function Field({label,value,onChange,type="text",...props}){return <label className="block text-sm space-y-1"><span>{label}</span><input className={field} type={type} value={value} onChange={e=>onChange(e.target.value)} {...props}/></label>;}
function Source({value,onChange}){return <select aria-label="Sample source" className={field} value={value} onChange={e=>onChange(e.target.value)}><option value="">—</option>{sources.map(s=><option key={s}>{s}</option>)}</select>;}
function JsonView({value}){return value==null?null:<pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded bg-black/30 p-3 text-xs">{JSON.stringify(value,null,2)}</pre>;}
export function StationOperations({areaId,station,language,onChanged}){
 const en=language==="en",t=(vi,eng)=>en?eng:vi;
 const action=useAction(onChanged);
 const [profiles,setProfiles]=useState([]),[kiosks,setKiosks]=useState([]),[loadError,setLoadError]=useState("");
 const [loaded,setLoaded]=useState(false);
 const [reg,setReg]=useState({kioskId:"",masterHardwareId:"",slaveHardwareId:""});
 const [form,setForm]=useState(()=>({enabled:station?.configuredEnabled===true,times:row(station?.times).join(", "),grace:station?.graceMinutes??5,
 source:station?.sampleSource??"",targets:Object.fromEntries(row(station?.targets).map(x=>[x.analyte,x.calibrationId]))}));
 const [calId,setCalId]=useState(""),[checks,setChecks]=useState(null);
 useEffect(()=>{
  const c=new AbortController();let active=true;
  Promise.all([waterBench.calibrations(areaId,c.signal),waterBench.kiosks(areaId,c.signal)]).then(([p,k])=>{
   if(active){if(!Array.isArray(p)||!Array.isArray(k))throw new Error("Invalid list response");setProfiles(p);setKiosks(k);setLoaded(true);}
  }).catch(e=>{if(active)setLoadError(e.message);});
  return()=>{active=false;c.abort();};
 },[areaId]);
 useEffect(()=>{
  const c=new AbortController();let active=true;
  setChecks(null);
  if(calId)waterBench.checks(areaId,calId,c.signal).then(v=>{if(active)setChecks(v);}).catch(e=>{if(active)setChecks({error:e.message});});
  return()=>{active=false;c.abort();};
 },[areaId,calId]);
 const update=(k,v)=>setForm(x=>({...x,[k]:v}));
 const activeProfile=profiles.find(p=>p.id===calId);
 const saveStation=()=>action.run(()=>{
  const p={...reg,kioskId:requireId(reg.kioskId)};
  if(!/^[0-9a-f]{12}$/.test(p.masterHardwareId)||!/^[0-9a-f]{12}$/.test(p.slaveHardwareId)||p.masterHardwareId===p.slaveHardwareId)throw new Error("Invalid hardware IDs");
  return waterBench.register(areaId,p);
 });
 const saveSchedule=()=>action.run(()=>waterBench.configure(areaId,schedulePayload(station,form)));
 return <section className={box}>
  <h3 className="font-semibold">{t("Quản lý trạm và hiệu chuẩn","Station and calibration management")}</h3>
  {loadError&&<p role="alert" className="text-red-300">{loadError}</p>}
  <fieldset disabled={action.busy||!loaded} className="space-y-3 disabled:opacity-60">
   {!station?<div className="grid gap-3 sm:grid-cols-2">
    <label className="block text-sm">{t("Kiosk đã cấp phát","Provisioned kiosk")}<select className={field} value={reg.kioskId} onChange={e=>setReg(x=>({...x,kioskId:e.target.value}))}><option value="">—</option>{kiosks.filter(k=>k.status!=="Revoked").map(k=><option key={k.id} value={k.id}>{k.code??k.id} · {k.status}</option>)}</select></label>
    <Field label="Master hardware ID" value={reg.masterHardwareId} onChange={v=>setReg(x=>({...x,masterHardwareId:v}))} maxLength={12}/>
    <Field label="Slave hardware ID" value={reg.slaveHardwareId} onChange={v=>setReg(x=>({...x,slaveHardwareId:v}))} maxLength={12}/>
    <button type="button" className={primary} onClick={saveStation}>{t("Đăng ký trạm","Register station")}</button>
   </div>:<div className="space-y-3">
    <p className="text-sm">{t("Cấu hình theo phiên bản BE; lịch không phải lệnh bơm trực tiếp.","Versioned configuration; schedule is not direct pump dispatch.")}</p>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={e=>update("enabled",e.target.checked)}/>{t("Bật lịch định kỳ","Enable schedule")}</label>
    <div className="grid gap-3 sm:grid-cols-2"><Field label={t("Giờ HH:mm, cách nhau dấu phẩy (UTC+7)","Times HH:mm, comma separated (UTC+7)")} value={form.times} onChange={v=>update("times",v)}/>
    <Field label={t("Cửa sổ xác nhận (phút)","Grace (minutes)")} type="number" min={1} max={15} value={form.grace} onChange={v=>update("grace",v)}/></div>
    <Source value={form.source} onChange={v=>update("source",v)}/>
    <div className="grid gap-3 sm:grid-cols-3">{analytes.map(a=><label className="text-sm" key={a}>{a}<select className={field} value={form.targets[a]??""} onChange={e=>update("targets",{...form.targets,[a]:e.target.value})}><option value="">—</option>{profiles.filter(p=>p.analyte===a).map(p=><option key={p.id} value={p.id} disabled={!!p.revokedAt||Date.parse(p.validUntil)<=Date.now()}>{p.reagentLot} · {p.unit} · {p.revokedAt?"revoked":p.validUntil}</option>)}</select></label>)}</div>
    <div className="flex flex-wrap gap-2"><button type="button" className={primary} onClick={saveSchedule}>{t("Lưu cấu hình","Save configuration")}</button>
    <button type="button" className={btn} onClick={()=>{if(window.confirm(t("Thu hồi trạm?","Revoke station?")))action.run(()=>waterBench.revokeStation(areaId,station.stationId));}}>{t("Thu hồi trạm","Revoke station")}</button></div>
   </div>}
   <hr className="border-[#24382A]"/>
   <label className="block text-sm">{t("Hồ sơ hiệu chuẩn","Calibration profiles")}<select className={field} value={calId} onChange={e=>setCalId(e.target.value)}><option value="">—</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.analyte} · {p.reagentLot} · {p.unit}</option>)}</select></label>
   {activeProfile&&<><p className="text-sm break-all">{activeProfile.id} · {blank(activeProfile.aiAlgorithm)} · {t("Hạn","Expires")}: {blank(activeProfile.validUntil)} · {t("QC","QC")}: {blank(activeProfile.qualityCheckDueAt)}</p>
    <p>{activeProfile.revokedAt?t("Đã thu hồi","Revoked"):t("Chưa thu hồi; kiểm tra hạn và QC","Not revoked; check expiry and QC")}</p>
    <JsonView value={checks}/>
    <button type="button" className={btn} disabled={!!activeProfile.revokedAt} onClick={()=>{if(window.confirm(t("Thu hồi hiệu chuẩn?","Revoke calibration?")))action.run(()=>waterBench.revokeCalibration(areaId,calId));}}>{t("Thu hồi hiệu chuẩn","Revoke calibration")}</button>
    <ControlCheck key={calId} areaId={areaId} profile={activeProfile} language={language} submit={p=>action.run(()=>waterBench.check(areaId,calId,p))}/>
   </>}
   <CalibrationWizard areaId={areaId} language={language} submit={p=>action.run(()=>waterBench.createCalibration(areaId,p))}/>
  </fieldset><Feedback action={action}/>
 </section>;
}
function cacheKey(areaId,batch,a){
 const user=authService.getStoredUser();
 const identity=user?.id??user?.userId;
 if(!identity||user?.role!=="FarmAdministrator")throw new Error("Farm administrator identity required");
 return "crabsense:water-bench:assessment:"+identity+":"+areaId+":"+batchKey(batch)+":"+a;
}
function readSaved(area,batch,a){try{return JSON.parse(sessionStorage.getItem(cacheKey(area,batch,a))||"null");}catch{return null;}}
function save(area,batch,a,p){sessionStorage.setItem(cacheKey(area,batch,a),JSON.stringify(p));}
export function BatchOperations({areaId,batch,data,language,onChanged}){
 const en=language==="en",t=(vi,eng)=>en?eng:vi;
 const action=useAction(onChanged);
 const [forms,setForms]=useState(()=>Object.fromEntries(analytes.map(a=>[a,newForm()])));
 const [proof,setProof]=useState(null),[ammonia,setAmmonia]=useState({method:"",salinityMeasurementId:"",reason:"",same:false,basis:false});
 const [ammoniaSaved,setAmmoniaSaved]=useState(()=>readSaved(areaId,batch,"NH3-reference"));
 const update=(a,k,v)=>setForms(x=>({...x,[a]:{...x[a],[k]:v}}));
 const mode=data.timeline?.timeline?.mode;
 const actual=row(data.results?.channels).map(c=>c.analyte).filter(a=>analytes.includes(a));
 const initial=(a)=>get(data.readiness,a)?.status==="operator_confirmation_required"&&get(data.retry,a)?.status==="not_attempted"&&!get(data.results,a)?.assessment;
 const create=(a)=>estimatePayload(get(data.readiness,a),forms[a],id());
 const runSingle=(a)=>action.run(async()=>{
  const p=readSaved(areaId,batch,a)??create(a);
  if(!initial(a)||p.action!=="estimate")throw new Error("Initial inference not available");
  // Persist exact request before network IO; ambiguous errors never mint a replacement ID.
  save(areaId,batch,a,p);return waterBench.assess(areaId,batch,a,p);
 });
 const runBatch=()=>action.run(async()=>{
  if(mode!=="scheduled"||actual.length!==3||!analytes.every(initial))throw new Error("Full scheduled batch not ready");
  const samples=analytes.map(a=>({analyte:a,assessment:readSaved(areaId,batch,a)??create(a)}));
  if(samples.some(s=>s.assessment.action!=="estimate"))throw new Error("Conflicting saved request");
  samples.forEach(s=>save(areaId,batch,s.analyte,s.assessment));
  const result=await waterBench.assessBatch(areaId,batch,samples);
  return result;
 });
 const retry=(a)=>action.run(async()=>{
  const attempt=get(data.retry,a);
  let p=readSaved(areaId,batch,a);
  if(!savedRequestMatches(p,attempt))p=await waterBench.retryRequest(areaId,batch,a);
  if(!savedRequestMatches(p,attempt))throw new Error("Original request identity mismatch");
  save(areaId,batch,a,p);
  return waterBench.assess(areaId,batch,a,p);
 });
 const retest=(a)=>action.run(()=>{
  if(get(data.results,a)?.assessment||get(data.retry,a)?.status==="inference_running")throw new Error("Retest not available");
  const old=readSaved(areaId,batch,a+"-retest"),p=old??reasonPayload(forms[a].reason,id());
  save(areaId,batch,a+"-retest",p);
  return waterBench.assess(areaId,batch,a,p);
 });
 const submitAmmonia=()=>action.run(()=>{
  if(ammoniaSaved)return waterBench.assessAmmonia(areaId,batch,ammoniaSaved);
  if(!ammonia.same||!ammonia.basis||!ammonia.reason.trim()||ammonia.reason.length>500||!["printed_table","equilibrium"].includes(ammonia.method))throw new Error("Confirm sample and measurand");
  const unit=get(data.results,"NH3")?.assessment?.unit;
  if(ammonia.method==="printed_table"?unit!=="mg/L NH4":!["mg/L NH4","mg/L TAN-N"].includes(unit))throw new Error("Incompatible ammonia measurand");
  const p={requestId:id(),method:ammonia.method,salinityMeasurementId:requireId(ammonia.salinityMeasurementId),sameSampleSourceConfirmed:true,measurandConfirmed:true,reason:ammonia.reason.trim()};
  save(areaId,batch,"NH3-reference",p);setAmmoniaSaved(p);
  return waterBench.assessAmmonia(areaId,batch,p);
 });
 return <section className={box}>
  <h3 className="font-semibold">{t("Đánh giá mẫu và bằng chứng","Sample assessments and evidence")}</h3>
  <p className="text-sm text-amber-300">{t("Chỉ phân tích ảnh đã lưu. Không tự bơm hóa chất hoặc công bố kết quả. Retry phục hồi đúng yêu cầu gốc từ BE.","Stored images only; no dosing. Retry recovers the original request from BE.")}</p>
  <fieldset disabled={action.busy} className="space-y-4 disabled:opacity-60">
   <div className="grid gap-3 lg:grid-cols-3">{actual.map(a=>{
    const ready=get(data.readiness,a),attempt=get(data.retry,a),result=get(data.results,a),f=forms[a],saved=readSaved(areaId,batch,a),canStart=initial(a);
    return <div key={a} className="rounded border border-[#38513B] p-3 space-y-2">
     <h4 className="font-semibold">{a}</h4>
     {ready?.status==="operator_confirmation_required"&&<p className="text-xs">{ready.reagentLot} · {ready.unit} · {ready.reactionSeconds} s (+{ready.timingToleranceSeconds}) · {ready.minSalinityPpt}–{ready.maxSalinityPpt} ppt</p>}
     {canStart&&!saved&&<><Field label={t("Thời gian thực tế (s)","Actual reaction seconds")} type="number" value={f.seconds} onChange={v=>update(a,"seconds",v)}/><Field label={t("Độ mặn thực tế (ppt)","Actual salinity ppt")} type="number" step="any" value={f.salinity} onChange={v=>update(a,"salinity",v)}/><Source value={f.source} onChange={v=>update(a,"source",v)}/><label className="flex gap-2 text-xs"><input type="checkbox" checked={f.confirmed} onChange={e=>update(a,"confirmed",e.target.checked)}/>{t("Đã xác nhận điều kiện mẫu, lô thuốc và nguồn nước","Confirmed actual sample conditions, reagent lot and source")}</label></>}
     {!result?.assessment&&<Field label={t("Lý do / ghi chú","Reason / note")} value={f.reason} onChange={v=>update(a,"reason",v)} maxLength={500}/>}
     {saved&&<p className="text-xs break-all">{t("Yêu cầu đã lưu","Saved request")}: {saved.requestId}</p>}
     <div className="flex flex-wrap gap-2">
     {canStart&&mode!=="scheduled"&&<button type="button" className={primary} onClick={()=>runSingle(a)}>{t("Phân tích AI","Analyze AI")}</button>}
     {attempt?.status==="retry_available"&&<button type="button" className={btn} onClick={()=>retry(a)}>{t("Retry yêu cầu cũ","Retry original request")}</button>}
     {attempt?.status==="retry_available"&&!savedRequestMatches(saved,attempt)&&<p className="text-xs text-amber-300">{t("Sẽ lấy yêu cầu gốc từ BE; không tạo ID mới.","Recover original request from BE; no new ID.")}</p>}
     {!result?.assessment&&attempt?.status!=="inference_running"&&result?.sessionId&&data.timeline?.timeline?.status!=="running_observed"&&<button type="button" className={btn} onClick={()=>{if(window.confirm(t("Xác nhận yêu cầu đo lại, không chạy phần cứng?","Record retest requirement without hardware dispatch?")))retest(a);}}>{t("Yêu cầu đo lại","Require retest")}</button>}
     {result?.assessment&&<button type="button" className={btn} onClick={()=>action.run(async()=>setProof(await waterBench.evidence(areaId,batch,a)),false)}>{t("Bằng chứng","Evidence")}</button>}
     </div>
    </div>;
   })}</div>
   {mode==="scheduled"&&actual.length===3&&analytes.every(initial)&&<button className={primary} type="button" onClick={runBatch}>{t("Phân tích đồng thời 3 chất","Analyze all 3 in parallel")}</button>}
   {get(data.results,"NH3")?.assessment?.status==="estimate_review_required"&&<div className="space-y-2 border-t border-[#24382A] pt-3">
    <h4 className="font-semibold">{t("Tham chiếu NH3","NH3 reference")}</h4>
    <button className={btn} type="button" onClick={()=>action.run(async()=>setProof(await waterBench.ammonia(areaId,batch)),false)}>{t("Xem tham chiếu đã lưu","Read stored reference")}</button>
    {!ammoniaSaved&&<><select className={field} aria-label="Ammonia method" value={ammonia.method} onChange={e=>setAmmonia(x=>({...x,method:e.target.value}))}><option value="">—</option><option value="printed_table">Thủy Phước — NH4</option><option value="equilibrium">Equilibrium — NH4 / TAN-N</option></select>
    <SalinityPicker areaId={areaId} batch={batch} language={language} value={ammonia.salinityMeasurementId} onChange={v=>setAmmonia(x=>({...x,salinityMeasurementId:v}))}/>
    <Field label={t("Lý do","Reason")} value={ammonia.reason} maxLength={500} onChange={v=>setAmmonia(x=>({...x,reason:v}))}/>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={ammonia.same} onChange={e=>setAmmonia(x=>({...x,same:e.target.checked}))}/>{t("Xác nhận cùng nguồn mẫu","Confirm same sample source")}</label>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={ammonia.basis} onChange={e=>setAmmonia(x=>({...x,basis:e.target.checked}))}/>{t("Xác nhận đại lượng và đơn vị thực tế","Confirm actual measurand and unit")}</label></>}
    <button className={btn} type="button" onClick={submitAmmonia}>{ammoniaSaved?t("Gửi lại yêu cầu gốc","Resend original request"):t("Tạo tham chiếu NH3","Create NH3 reference")}</button>
   </div>}
   {actual.filter(a=>get(data.results,a)?.assessment?.status==="estimate_review_required").map(a=><ReviewPanel key={a} areaId={areaId} batch={batch} analyte={a} unit={get(data.results,a).assessment.unit} language={language}/>)}
   <JsonView value={proof}/>
  </fieldset><Feedback action={action}/>
 </section>;
}
