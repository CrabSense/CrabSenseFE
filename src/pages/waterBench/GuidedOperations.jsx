import {useEffect,useId,useRef,useState} from "react";
import waterBench from "../../services/waterBenchService";
import {requireId} from "./operationModel";
import {verifyReview} from "../../services/waterBenchModel";
const field="w-full rounded-lg border border-[#38513B] bg-[#050806] px-3 py-2 text-sm";
const btn="rounded-lg border border-[#38513B] px-3 py-2 text-sm disabled:opacity-40";
const items=v=>Array.isArray(v)?v:[];
function Input({label,value,onChange,type="text",...rest}){return <label className="block text-sm">{label}<input className={field} type={type} value={value} onChange={e=>onChange(e.target.value)} {...rest}/></label>;}
function useQuery(fn,deps){
 const [state,setState]=useState({value:null,error:"",loading:true});
 useEffect(()=>{const c=new AbortController();let active=true;setState({value:null,error:"",loading:true});
 fn(c.signal).then(value=>{if(active)setState({value,error:"",loading:false});}).catch(e=>{if(active)setState({value:null,error:e.message,loading:false});});
 return()=>{active=false;c.abort();}; // dependencies are explicit identity fields, not inline function
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },deps);return state;
}
function MediaPicker({areaId,camera,value,onChange,label,testId}){
 const inputId=useId();
 const [skip,setSkip]=useState(0);
 const query=useQuery(signal=>waterBench.adminMedia(areaId,camera,skip,signal),[areaId,camera,skip]);
 const rows=items(query.value?.items);
 return <div className="space-y-1">
 <label className="block text-sm" htmlFor={inputId}>{label}</label><select id={inputId} aria-label={label} data-testid={testId} className={field} value={value} onChange={e=>onChange(e.target.value)} disabled={query.loading||!!query.error}>
 <option value="">—</option>{value&&!rows.some(a=>a.id===value)&&<option value={value}>{value}</option>}
 {rows.map(a=><option key={a.id} value={a.id}>{a.fileName} · {new Date(a.createdAt).toLocaleString()}</option>)}</select>
 {query.loading&&<p role="status" className="text-xs">Loading images…</p>}
 {!query.loading&&!query.error&&!rows.length&&<p className="text-xs text-amber-300">No matching images on this page.</p>}
 {query.error&&<p role="alert" className="text-red-300">{query.error}</p>}
 <div className="flex gap-2"><button type="button" className={btn} disabled={skip===0} onClick={()=>setSkip(s=>Math.max(0,s-50))}>‹</button><button type="button" className={btn} disabled={skip+50>=(query.value?.total??0)} onClick={()=>setSkip(s=>s+50)}>›</button></div>
 </div>;
}
function RoiEditor({mediaId,roi,onRoi,onSize,language}){
 const [url,setUrl]=useState(""),[error,setError]=useState(""),[size,setSize]=useState(null),[kind,setKind]=useState("sample");
 const start=useRef(null);
 useEffect(()=>{let active=true,objectUrl;const c=new AbortController();setUrl("");setSize(null);setError("");
 if(mediaId)waterBench.image(mediaId,c.signal).then(blob=>{if(active){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}}).catch(e=>{if(active)setError(e.message);});
 return()=>{active=false;c.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[mediaId]);
 const point=e=>{const r=e.currentTarget.getBoundingClientRect();return {x:Math.max(0,Math.min(size.width,Math.round((e.clientX-r.left)*size.width/r.width))),y:Math.max(0,Math.min(size.height,Math.round((e.clientY-r.top)*size.height/r.height)))};};
 const rect=(a,b)=>({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y)});
 return <div className="space-y-2">
 {error&&<p role="alert">{error}</p>}
 <div className="flex flex-wrap gap-2">{["sample","reference","anchor"].map(k=><button key={k} type="button" aria-pressed={kind===k} className={btn+(kind===k?" bg-[#77FF00]/20":"")} onClick={()=>setKind(k)}>{k}</button>)}</div>
 <p className="text-xs">{language==="en"?"Drag on the image, or edit exact pixel coordinates.":"Kéo vùng trên ảnh hoặc chỉnh tọa độ pixel."}</p>
 {url&&<div className="relative inline-block max-w-full">
 <img src={url} alt="Calibration reference image" className="block max-w-full" onError={()=>{setError("Cannot decode calibration image");setSize(null);onSize(null);}} onLoad={e=>{const v={width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight};setSize(v);onSize(v);}}/>
 {size&&<svg data-testid="roi-canvas" aria-label="ROI canvas" className="absolute inset-0 h-full w-full touch-none cursor-crosshair" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none"
 onPointerDown={e=>{start.current=point(e);e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={e=>{if(start.current)onRoi(kind,rect(start.current,point(e)));}}
 onPointerUp={e=>{if(start.current)onRoi(kind,rect(start.current,point(e)));start.current=null;}} onPointerCancel={()=>{start.current=null;}}>
 {Object.entries(roi).map(([k,r])=><rect key={k} data-testid={"roi-"+k} {...r} fill="none" stroke={k==="sample"?"#77ff00":k==="reference"?"#00cfff":"#ffbf47"} strokeWidth="2" vectorEffect="non-scaling-stroke"/>)}
 </svg>}
 </div>}
 {["sample","reference","anchor"].map(k=><div key={k} className="grid grid-cols-2 sm:grid-cols-4 gap-2"><p className="col-span-full text-sm">{k}</p>{["x","y","width","height"].map(f=><Input key={f} label={k+" "+f} type="number" min={0} value={roi[k]?.[f]??""} onChange={v=>onRoi(k,{...roi[k],[f]:v===""?"":Number(v)})}/>)}</div>)}
 </div>;
}
const standard=()=>({mediaId:"",concentration:"",reactionSeconds:"",salinityPpt:""});
function numeric(v){if(String(v).trim()===""||!Number.isFinite(Number(v)))throw new Error("Numeric value required");return Number(v);}
export function CalibrationWizard({areaId,language,submit}){
 const t=(vi,en)=>language==="en"?en:vi;
 const cameras=useQuery(signal=>waterBench.adminMedia(areaId,null,0,signal),[areaId]);
 const [camera,setCamera]=useState(""),[a,setA]=useState("NO2"),[basis,setBasis]=useState(""),[lot,setLot]=useState(""),[revision,setRevision]=useState(""),[expiry,setExpiry]=useState("");
 const [standards,setStandards]=useState(()=>[standard(),standard(),standard()]),[validation,setValidation]=useState(standard),[preview,setPreview]=useState("");
 const [size,setSize]=useState(null),[roi,setRoi]=useState({sample:{},reference:{},anchor:{}});
 const [params,setParams]=useState({reactionSeconds:"",timingToleranceSeconds:"",sampleVolumeMl:"",procedure:"",minSalinityPpt:"",maxSalinityPpt:"",maxValidationError:""});
 const [error,setError]=useState("");
 const patch=(k,v)=>setParams(x=>({...x,[k]:v}));
 const changeCamera=v=>{setCamera(v);setStandards([standard(),standard(),standard()]);setValidation(standard());setPreview("");setSize(null);setRoi({sample:{},reference:{},anchor:{}});};
 const sample=(s,update,label)=><div className="grid gap-2 sm:grid-cols-2"><MediaPicker key={camera+label} areaId={areaId} camera={camera} value={s.mediaId} onChange={v=>update({...s,mediaId:v})} label={label} testId={"media-"+label.toLowerCase().replaceAll(" ","-")}/>
 {["concentration","reactionSeconds","salinityPpt"].map(k=><Input key={k} label={label+" "+k} type="number" step="any" value={s[k]} onChange={v=>update({...s,[k]:v})}/>)}</div>;
 const create=()=>{
 try{
 setError("");if(!size||!preview||!lot.trim()||!revision.trim()||!params.procedure.trim())throw new Error("Complete calibration metadata and ROI");
 const rois=Object.fromEntries(Object.entries(roi).map(([k,r])=>{
 if(!["x","y","width","height"].every(f=>Number.isInteger(r[f]))||r.x<0||r.y<0||r.width<16||r.height<16||r.x+r.width>size.width||r.y+r.height>size.height)throw new Error("Invalid ROI: "+k);
 return [k,r];}));
 const samples=[...standards,validation].map(s=>({mediaId:requireId(s.mediaId),concentration:numeric(s.concentration),reactionSeconds:numeric(s.reactionSeconds),salinityPpt:numeric(s.salinityPpt)}));
 if(new Set(samples.map(s=>s.mediaId)).size!==samples.length)throw new Error("Standards and holdout must use distinct images");
 if(!samples.some(s=>s.concentration===0)||!standards.some(s=>Number(s.concentration)===0))throw new Error("Blank standard required");
 const unit=a==="NH3"?basis:"mg/L "+a;if(!unit)throw new Error("Select NH3 measurand");
 const validUntil=new Date(expiry).toISOString();
 const protocol={...size,sample:rois.sample,reference:rois.reference,channel:"AUTO",reactionSeconds:numeric(params.reactionSeconds),timingToleranceSeconds:numeric(params.timingToleranceSeconds),
 sampleVolumeMl:numeric(params.sampleVolumeMl),procedure:params.procedure,minSalinityPpt:numeric(params.minSalinityPpt),maxSalinityPpt:numeric(params.maxSalinityPpt),
 geometryPolicy:{anchor:rois.anchor,maxShift:4,minCorrelation:.92,minFocusRatio:.5}};
 return submit({cameraDeviceId:requireId(camera),analyte:a,kitName:{NO2:"Sera",NO3:"VASTOCEAN",NH3:"Thủy Phước"}[a],reagentLot:lot.trim(),kitRevision:revision.trim(),measuredUnit:unit,validUntil,
 protocol,standards:samples.slice(0,-1),validation:samples.at(-1),maxValidationError:numeric(params.maxValidationError)});
 }catch(e){setError(e.message);}
 };
 return <details data-testid="calibration-wizard" className="space-y-3"><summary className="cursor-pointer">{t("Tạo hiệu chuẩn trực quan","Guided calibration")}</summary>
 <p className="text-xs">{t("Ảnh chuẩn và đối chứng phải độc lập. ROI được tính theo pixel ảnh gốc; BE xác minh trước khi lưu.","Use independent standards and holdout. ROI uses native image pixels; BE validates before saving.")}</p>
 <label className="block">Camera<select aria-label="Calibration camera" data-testid="calibration-camera" disabled={cameras.loading||!!cameras.error} className={field} value={camera} onChange={e=>changeCamera(e.target.value)}><option value="">—</option>{items(cameras.value?.cameras).map(c=><option key={c.id} value={c.id}>{c.deviceCode}</option>)}</select></label>
 {cameras.error&&<p role="alert">{cameras.error}</p>}
 <div className="grid gap-2 sm:grid-cols-2"><label>Analyte<select className={field} value={a} onChange={e=>{setA(e.target.value);setBasis("");}}>{["NO2","NO3","NH3"].map(v=><option key={v}>{v}</option>)}</select></label>
 {a==="NH3"&&<label>Measurand<select className={field} value={basis} onChange={e=>setBasis(e.target.value)}><option value="">—</option>{["mg/L NH3","mg/L NH4","mg/L TAN-N"].map(v=><option key={v}>{v}</option>)}</select></label>}
 <Input label="Reagent lot" value={lot} onChange={setLot}/><Input label="Kit revision" value={revision} onChange={setRevision}/><Input label="Valid until" type="datetime-local" value={expiry} onChange={setExpiry}/></div>
 {camera&&<><MediaPicker key={camera+"preview"} areaId={areaId} camera={camera} value={preview} label="ROI image" testId="roi-image-picker" onChange={v=>{setPreview(v);setSize(null);setRoi({sample:{},reference:{},anchor:{}});}}/>
 <RoiEditor mediaId={preview} roi={roi} onRoi={(k,r)=>setRoi(x=>({...x,[k]:r}))} onSize={setSize} language={language}/>
 {standards.map((s,i)=><div key={i} className="border border-[#38513B] p-2">{sample(s,v=>setStandards(x=>x.map((y,j)=>i===j?v:y)),"Standard "+(i+1))}</div>)}
 <button type="button" className={btn} disabled={standards.length>=12} onClick={()=>setStandards(x=>[...x,standard()])}>+ Standard</button>
 <button type="button" className={btn} disabled={standards.length<=3} onClick={()=>setStandards(x=>x.slice(0,-1))}>− Standard</button>
 {sample(validation,setValidation,"Independent holdout")}
 </>}
 <div className="grid gap-2 sm:grid-cols-2">{Object.keys(params).map(k=><Input key={k} label={k} type={k==="procedure"?"text":"number"} step="any" value={params[k]} onChange={v=>patch(k,v)}/>)}</div>
 {error&&<p role="alert" className="text-red-300">{error}</p>}
 <button type="button" className={btn} disabled={!camera} onClick={create}>{t("Tạo hiệu chuẩn","Create calibration")}</button>
 </details>;
}
export function ControlCheck({areaId,profile,language,submit}){
 const [f,setF]=useState({mediaId:"",expected:"",maxError:"",reagentLot:profile.reagentLot??"",reactionSeconds:"",salinityPpt:""}),[error,setError]=useState("");
 const update=(k,v)=>setF(x=>({...x,[k]:v}));
 return <details><summary>{language==="en"?"Control check":"Kiểm tra đối chứng"}</summary><MediaPicker areaId={areaId} camera={profile.cameraDeviceId} value={f.mediaId} onChange={v=>update("mediaId",v)} label="QC image"/>
 {Object.keys(f).filter(k=>k!=="mediaId").map(k=><Input key={k} label={k} type={k==="reagentLot"?"text":"number"} step="any" value={f[k]} onChange={v=>update(k,v)}/>)}
 {error&&<p role="alert">{error}</p>}<button type="button" className={btn} disabled={!!profile.revokedAt} onClick={()=>{try{setError("");submit({mediaId:requireId(f.mediaId),expected:numeric(f.expected),maxError:numeric(f.maxError),reagentLot:f.reagentLot,reactionSeconds:numeric(f.reactionSeconds),salinityPpt:numeric(f.salinityPpt)});}catch(e){setError(e.message);}}}>QC</button></details>;
}
export function SalinityPicker({areaId,batch,language,value,onChange}){
 const q=useQuery(signal=>waterBench.salinity(areaId,batch,signal),[areaId,batch]);
 return <div><label>{language==="en"?"Qualified salinity readings":"Bản đo độ mặn đủ điều kiện"}<select data-testid="salinity-measurement" aria-label="Salinity measurement" className={field} value={value} onChange={e=>onChange(e.target.value)} disabled={q.loading||!!q.error}><option value="">—</option>{items(q.value?.items).map(m=><option key={m.measurementId} value={m.measurementId}>{m.value} ppt · {m.sensorCode} · {m.installationLocation} · Δ{m.differenceSeconds}s</option>)}</select></label>
 {q.error&&<p role="alert">{q.error}</p>}{!q.loading&&!q.error&&!items(q.value?.items).length&&<p className="text-amber-300">{language==="en"?"No qualified reading; no conversion.":"Không có bản đo hợp lệ; không chuyển đổi."}</p>}</div>;
}
export function ReviewPanel({areaId,batch,analyte,assessmentId,unit,language}){
 const t=(vi,en)=>language==="en"?en:vi;
 const [revision,setRevision]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const q=useQuery(async signal=>verifyReview(await waterBench.review(areaId,batch,analyte,signal),assessmentId,unit),[areaId,batch,analyte,assessmentId,unit,revision]);
 const [f,setF]=useState({decision:"",reason:"",media:"",value:"",method:"",same:false}),[publishReason,setPublishReason]=useState("");
 const lock=useRef(false),pending=useRef(null);
 const patch=(k,v)=>setF(x=>({...x,[k]:v}));
 const run=async(kind,make,send)=>{if(lock.current||q.loading||q.error||q.value?.assessmentId!==assessmentId)return;lock.current=true;setBusy(true);setError("");try{
 const p=pending.current?.kind===kind?pending.current.p:make();pending.current={kind,p};await send(p);pending.current=null;setRevision(x=>x+1);
 }catch(e){if(Number.isInteger(e.status)&&e.status>=400&&e.status<500&&e.status!==408&&e.status!==409&&e.status!==429)pending.current=null;setError(e.message);}finally{lock.current=false;setBusy(false);}};
 const review=()=>run("review",()=>{
 if(!f.reason.trim()||!["approved","rejected"].includes(f.decision))throw new Error("Decision and reason required");
 const p={requestId:crypto.randomUUID(),decision:f.decision,reason:f.reason.trim()};
 if(f.decision==="approved"){if(!f.same||!f.method.trim())throw new Error("Confirm independent same-sample reference");Object.assign(p,{referenceMediaId:requireId(f.media),referenceValue:numeric(f.value),referenceUnit:unit,referenceMethod:f.method.trim(),sameSampleConfirmed:true});}return p;
 },p=>waterBench.submitReview(areaId,batch,analyte,p));
 const publish=()=>run("publish",()=>{if(!publishReason.trim())throw new Error("Publication reason required");return {requestId:crypto.randomUUID(),reason:publishReason.trim()};},p=>waterBench.publish(areaId,batch,analyte,p));
 const status=q.value?.status;
 return <section data-testid={"review-panel-"+analyte} className="space-y-2 border border-[#38513B] rounded p-3">
 <h4 className="font-semibold">{analyte} · {t("Duyệt và công bố hồ sơ","Review and publish record")}</h4>
 {q.loading&&<p role="status">Loading…</p>}{q.error&&<p role="alert">{q.error}</p>}{error&&<p role="alert">{error}</p>}
 <fieldset disabled={busy||q.loading||!!q.error} className="space-y-2">
 {status==="pending_review"&&<><select aria-label={analyte+" review decision"} className={field} value={f.decision} onChange={e=>patch("decision",e.target.value)}><option value="">—</option><option value="approved">{t("Duyệt","Approve")}</option><option value="rejected">{t("Từ chối","Reject")}</option></select><Input label="Review reason" value={f.reason} onChange={v=>patch("reason",v)}/>
 {f.decision==="approved"&&<><MediaPicker areaId={areaId} value={f.media} onChange={v=>patch("media",v)} label="Independent reference image" testId={"review-image-"+analyte}/><Input label={"Reference value ("+unit+")"} type="number" step="any" value={f.value} onChange={v=>patch("value",v)}/><Input label="Reference method" value={f.method} onChange={v=>patch("method",v)}/><label className="flex gap-2"><input type="checkbox" checked={f.same} onChange={e=>patch("same",e.target.checked)}/>{t("Xác nhận đối chứng độc lập, cùng mẫu và đơn vị","Confirm independent reference, same sample and unit")}</label></>}
 <button className={btn} type="button" onClick={review}>{t("Lưu quyết định","Record review")}</button></>}
 {q.value?.review&&<p>{q.value.review.decision} · {q.value.review.referenceValue??"—"} {q.value.review.referenceUnit??""}</p>}
 {status==="approved"&&<><Input label="Publication reason" value={publishReason} onChange={setPublishReason}/><button className={btn} type="button" onClick={()=>{if(window.confirm(t("Công bố hồ sơ đối chứng, không ghi dữ liệu sensor?","Publish reviewed reference record, not sensor data?")))publish();}}>{t("Công bố hồ sơ","Publish record")}</button></>}
 {status==="published"&&<p className="text-[#77FF00]">{t("Đã công bố hồ sơ WaterBench","Published WaterBench record")}: {q.value.publication.value} {q.value.publication.unit}</p>}
 </fieldset><p className="text-xs text-amber-300">{t("Không tự xác thực hóa học hoặc ghi vào dữ liệu cảm biến.","Not automatic chemical validation or sensor publication.")}</p></section>;
}
