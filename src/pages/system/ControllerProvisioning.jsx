import {useEffect,useState,useRef} from "react";
import {Link} from "react-router-dom";
import api from "../../services/systemAdminService";
import {Panel,DataTable,SystemState} from "../../components/system/SystemChrome";
import {formatWhen} from "./deviceModel";
const field="mt-1 w-full rounded-lg border border-[#c9dfd9] bg-[#f7fbfa] px-3 py-2 text-sm";
const col=(key,label,render)=>({key,label,render});
export default function ControllerProvisioning(){
 const [areas,setAreas]=useState([]),[area,setArea]=useState(""),[name,setName]=useState(""),[rows,setRows]=useState(null),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0),[loading,setLoading]=useState(true);
 const lock=useRef(false);
 useEffect(()=>{let active=true;api.getDeviceLocations().then(v=>{if(active){setAreas(v);setArea(a=>a||v.find(x=>x.isActive)?.id||"");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!area)return;let active=true;const ctrl=new AbortController();setRows(null);setError("");setLoading(true);Promise.all([api.getKiosks(area,ctrl.signal),api.getEdgeControllers(area,ctrl.signal)]).then(v=>{if(active)setRows(v);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;ctrl.abort();};},[area,revision]);
 async function act(label,fn){if(lock.current||!window.confirm(label))return;lock.current=true;setBusy(true);setError("");setNotice("");try{await fn();setNotice("Đã lưu thao tác. Danh sách được tải lại.");setRevision(v=>v+1);}catch(e){setError(e.message||"Thao tác thất bại.");}finally{lock.current=false;setBusy(false);}}
 const action=(label,fn,disabled=false)=><button type="button" className="system-secondary-button" disabled={busy||loading||disabled} onClick={()=>act(label,fn)}>{label}</button>;
 return <div className="space-y-4">
 <Panel title="Đăng ký và quản lý Kiosk"><p className="mb-3 text-sm text-[#526f79]">Chọn khu nuôi để quản lý Kiosk và Controller tự đăng ký. Mã provisioning có thời hạn, chỉ cung cấp cho kỹ thuật viên được ủy quyền. Không phải mật khẩu thiết bị.</p>
 <div className="grid gap-3 md:grid-cols-3"><label>Khu nuôi<select className={field} value={area} disabled={busy} onChange={e=>{setArea(e.target.value);setNotice("");}}><option value="">Chọn khu</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name||a.code}</option>)}</select></label><label>Tên Kiosk<input className={field} value={name} maxLength={100} disabled={busy} onChange={e=>setName(e.target.value)}/></label><div className="flex items-end gap-2">{action("Tạo Kiosk",()=>api.createKiosk({farmingAreaId:area,name:name.trim()||null}),!area||!areas.find(a=>a.id===area)?.isActive)}<button className="system-secondary-button" disabled={busy||!area} onClick={()=>setRevision(v=>v+1)}>Làm mới</button></div></div>
 {notice&&<p role="status" className="mt-3 text-sm text-[#13796e]">{notice}</p>}
 {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
 </Panel>
 <SystemState loading={loading} error={error} onRetry={()=>setRevision(v=>v+1)}>
 {rows&&<><Panel title="Danh sách Kiosk"><DataTable rows={rows[0]} empty="Chưa có Kiosk." columns={[col("code","Mã"),col("name","Tên"),col("status","Trạng thái"),col("lanIp","IP LAN"),col("lastSeenAt","Heartbeat",x=>formatWhen(x.lastSeenAt)),col("provisioningCode","Mã đăng ký",x=>x.provisioningCode?<span>{x.provisioningCode}<br/>{formatWhen(x.provisioningExpiresAt)}</span>:"—"),col("actions","Thao tác",x=><div className="flex flex-wrap gap-2">{action("Cấp mã mới",()=>api.issueKioskCode(x.id),x.status==="Revoked")}{action("Thu hồi Kiosk",()=>api.revokeKiosk(x.id),x.status==="Revoked")}{action("Xóa Kiosk",()=>api.deleteKiosk(x.id),rows[1].some(d=>d.kioskId===x.id)||x.status!=="Revoked")}</div>)]}/></Panel>
 <Panel title="Controller tự đăng ký"><p className="mb-3 text-xs text-[#526f79]">Duyệt chỉ cấp quyền xác thực; không xác nhận Online và không bật thiết bị điện. Controller bị từ chối phải được duyệt lại chủ động. Từ chối sẽ thu hồi credential, không phải lệnh tắt tải.</p><DataTable rows={rows[1]} empty="Chưa có Controller tự đăng ký." columns={[col("deviceCode","Controller",x=><Link className="text-[#13796e] underline" to={"/system/devices/controllers?tab=monitor&controllerId="+encodeURIComponent(x.id)}>{x.deviceCode}</Link>),col("kioskCode","Kiosk"),col("mac","MAC"),col("ipAddress","IP"),col("edgeState","Xác thực"),col("linkStatus","Kết nối"),col("lastSeenAt","Heartbeat",x=>formatWhen(x.lastSeenAt)),col("actions","Thao tác",x=><div className="flex flex-wrap gap-2">{action(x.edgeState==="Rejected"?"Duyệt lại":"Duyệt",()=>api.approveEdgeController(x.id),!["Pending","Rejected"].includes(x.edgeState))}{action("Từ chối / thu hồi",()=>api.rejectEdgeController(x.id),!["Pending","Approved","Online"].includes(x.edgeState))}</div>)]}/></Panel></>}
 </SystemState></div>;
}
