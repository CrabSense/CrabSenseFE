import {useEffect,useRef,useState} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import api from "../../services/systemAdminService";

const empty="00000000-0000-0000-0000-000000000000";
const types=[["camera","Camera",900],["controller","Controller",900],["kiosk","Kiosk",120],["agent","Recording Agent",90]];
const field="mt-1 w-full rounded-lg border border-[#c9dfd9] bg-[#f7fbfa] px-3 py-2 text-sm";

function PolicyRow({type,label,defaultSeconds,id,overrides,onSaved}){
 const policy=(overrides||[]).find(x=>x.sourceType===type&&x.sourceId.toLowerCase()===id.toLowerCase());
 const [value,setValue]=useState(String(policy?.timeoutSeconds??defaultSeconds)),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const lock=useRef(false);
 useEffect(()=>{setValue(String(policy?.timeoutSeconds??defaultSeconds));setError("");setNotice("");},[type,id,defaultSeconds,policy?.version,policy?.timeoutSeconds]);
 const reset=async()=>{if(lock.current||!policy||policy.isInherited||!window.confirm("Khôi phục cấu hình mặc định?"))return;lock.current=true;setBusy(true);setError("");try{await api.resetMonitoringPolicy(type,id,policy.version);setNotice("Đã khôi phục mặc định.");onSaved();}catch(e){setError(e.message||"Không thể khôi phục.");}finally{lock.current=false;setBusy(false);}};
 const save=async()=>{if(lock.current)return;setError("");setNotice("");const number=Number(value);if(!Number.isInteger(number)||number<30||number>86400){setError("Timeout phải là số nguyên từ 30 đến 86400 giây.");return;}
 lock.current=true;setBusy(true);try{await api.saveMonitoringPolicy(type,id,{timeoutSeconds:number,expectedVersion:policy?.version??0});setNotice("Đã lưu chính sách giám sát.");onSaved();}catch(e){setError(e.message||"Không thể lưu chính sách. Vui lòng tải lại.");}finally{lock.current=false;setBusy(false);}};
 return <div className="rounded-lg border border-[#dcebe8] p-3"><div className="grid gap-2 sm:grid-cols-[1fr_145px_auto] sm:items-end"><strong className="text-sm">{label}<span className="block text-xs font-normal text-[#54747e]">{id===empty?"Mặc định tất cả thiết bị":policy&&!policy.isInherited?"Ghi đè riêng":"Đang kế thừa mặc định"}</span></strong><label className="text-xs text-[#526f79]">Timeout (giây)<input aria-label={"Timeout "+label} className={field} type="number" min="30" max="86400" step="1" value={value} disabled={busy} onChange={e=>setValue(e.target.value)}/></label><button type="button" className="system-secondary-button" disabled={busy||String(policy?.timeoutSeconds??defaultSeconds)===value} onClick={save}>{busy?"Đang lưu…":"Lưu"}</button></div>{id!==empty&&policy&&!policy.isInherited&&<button type="button" disabled={busy} className="system-secondary-button mt-2" onClick={reset}>Dùng mặc định</button>}{error&&<p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}{notice&&<p role="status" className="mt-2 text-xs text-[#147e75]">{notice}</p>}</div>;
}
PolicyRow.propTypes={type:PropTypes.string.isRequired,label:PropTypes.string.isRequired,defaultSeconds:PropTypes.number.isRequired,id:PropTypes.string.isRequired,overrides:PropTypes.array,onSaved:PropTypes.func.isRequired};

export default function MonitoringPolicyEditor({data,selected,onSaved}){
 const defaults={camera:data.cameraTimeoutSeconds,controller:data.controllerTimeoutSeconds,kiosk:data.kioskTimeoutSeconds,agent:data.agentTimeoutSeconds};
 return <div className="space-y-3"><p className="text-xs text-[#54747e]">Chỉ thay đổi ngưỡng hiển thị giám sát và lịch sử quan sát; cảnh báo mất kết nối kỹ thuật vẫn dùng timeout của worker riêng. Không thay đổi heartbeat hoặc quyền điều khiển của thiết bị.</p>
 <div className="grid gap-2 lg:grid-cols-2">{types.map(([type,label,fallback])=><PolicyRow key={type} type={type} label={label} defaultSeconds={defaults[type]??fallback} id={empty} overrides={data.overrides} onSaved={onSaved}/>)}</div>
 {selected&&types.some(([type])=>type===selected.type)&&<section className="rounded-lg bg-[#f4faf8] p-3"><p className="mb-2 text-sm font-semibold">Chính sách riêng: {selected.code}</p><PolicyRow key={selected.type+selected.id} type={selected.type} label={selected.type} defaultSeconds={defaults[selected.type]??900} id={selected.id} overrides={data.overrides} onSaved={onSaved}/>{selected.type==="camera"&&<div className="mt-2"><PolicyRow type="agent" label="Recording Agent của Camera" defaultSeconds={defaults.agent??90} id={selected.id} overrides={data.overrides} onSaved={onSaved}/></div>}</section>}
 {selected?.type==="sensor"&&<p className="rounded-lg bg-[#f4faf8] p-3 text-sm">Sensor {selected.code} có timeout riêng tại <Link className="text-[#13796e] underline" to={"/system/devices/sensors?sensorId="+encodeURIComponent(selected.id)}>Cấu hình Sensor</Link>.</p>}
 <p className="text-xs text-[#54747e]">Sensor sử dụng timeout riêng tại <Link className="text-[#13796e] underline" to="/system/devices/sensors">Cấu hình Sensor</Link>. Lịch sử lấy mẫu mỗi {data.historySampleSeconds} giây; khoảng trống không được tính là thời gian Online.</p></div>;
}
MonitoringPolicyEditor.propTypes={data:PropTypes.object.isRequired,selected:PropTypes.object,onSaved:PropTypes.func.isRequired};
