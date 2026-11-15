import {useEffect,useState} from "react";
import PropTypes from "prop-types";
import api from "../../services/systemAdminService";
import {DataTable,Panel,SystemState} from "../../components/system/SystemChrome";
import {formatWhen,statusClass} from "./deviceModel";
const show=x=>x==null||x===""?"—":String(x);
const col=(key,label,render)=>({key,label,render});
const rowProps={row:PropTypes.object.isRequired,revision:PropTypes.number.isRequired};
function useLoad(load,revision,interval=0){
 const [data,setData]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true,busy=false,controller;setData(null);setLoading(true);setError("");
 const run=async()=>{if(busy)return;busy=true;controller=new AbortController();try{const value=await load(controller.signal);if(active){setData(value);setError("");}}catch(e){if(active&&!controller.signal.aborted)setError(e.message||"Không tải được dữ liệu.");}finally{busy=false;if(active)setLoading(false);}};
 run();const timer=interval?setInterval(run,interval):null;return()=>{active=false;controller?.abort();if(timer)clearInterval(timer);};},[load,revision,interval,retry]);
 return {data,error,loading,retry:()=>setRetry(x=>x+1)};
}
function State({state,children}){return <><SystemState loading={state.loading&&!state.data} error={!state.data?state.error:""} onRetry={state.retry}>{state.data&&children(state.data)}</SystemState>{state.data&&state.error&&<p role="alert" className="text-red-700 text-xs">{state.error} · Dữ liệu cũ</p>}</>;}
State.propTypes={state:PropTypes.object.isRequired,children:PropTypes.func.isRequired};
import {useCallback} from "react";
export function MonitoringTopology({area,revision,onSelect}){
 const [open,setOpen]=useState(false);
 return <Panel title="Sơ đồ phụ thuộc thiết bị"><button className="system-secondary-button" onClick={()=>setOpen(x=>!x)}>{open?"Thu gọn":"Xem sơ đồ"}</button>{open&&<TopologyBody area={area} revision={revision} onSelect={onSelect}/>}</Panel>;
}
MonitoringTopology.propTypes={area:PropTypes.string.isRequired,revision:PropTypes.number.isRequired,onSelect:PropTypes.func.isRequired};
function TopologyBody({area,revision,onSelect}){
 const load=useCallback(signal=>api.getMonitoringTopology({farmingAreaId:area},signal),[area]);
 const state=useLoad(load,revision,30000);
 return <State state={state}>{v=>{
 const nodes=v.nodes||[],ports=v.ports||[],equipment=v.equipment||[],ids=new Set(nodes.map(x=>x.id));
 const node=x=><button className="text-left text-sm underline" onClick={()=>onSelect(x)}><strong>{x.code}</strong> · <span className={statusClass(x.connectionStatus)}>{x.connectionStatus}</span></button>;
 const controller=x=><div key={x.id} className="ml-3 border-l border-[#dcebe8] pl-3 py-2">{node(x)}
 {ports.filter(p=>p.deviceId===x.id).map(p=><div key={p.id} className="ml-3 py-1 text-xs"><strong>{p.portCode}</strong> · {p.isPresent?"Hiện diện":"Không hiện diện"} · {show(p.commissioningStatus)} · {p.reportedOn==null?"Chưa xác minh":p.reportedOn?"ON báo cáo":"OFF báo cáo"}
 {nodes.filter(s=>s.type==="sensor"&&s.controllerId===x.id&&s.portCode===p.portCode).map(s=><div key={s.id} className="ml-3">{node(s)}</div>)}
 {equipment.filter(e=>e.controllerPortId===p.id).map(e=><p key={e.id} className="ml-3">{e.name} · tải vật lý chưa xác minh</p>)}</div>)}
 {nodes.filter(s=>s.type==="sensor"&&s.controllerId===x.id&&!ports.some(p=>p.deviceId===x.id&&p.portCode===s.portCode)).map(s=><div key={s.id} className="ml-3">{node(s)}</div>)}</div>;
 return <div className="mt-3 space-y-3"><p className="text-xs text-[#54747e]">Kiosk mất kết nối có thể làm mất khả năng quan sát thiết bị bên dưới. Không kết luận tải vật lý hỏng chỉ từ trạng thái relay.</p>
 {nodes.filter(x=>x.type==="kiosk").map(k=><div key={k.id} className="rounded-xl border border-[#dcebe8] p-3">{node(k)}<p className="text-xs">{show(k.areaName)} · {nodes.filter(x=>x.kioskId===k.id&&x.type!=="sensor").length} thiết bị phụ thuộc trực tiếp</p>{nodes.filter(x=>x.type==="controller"&&x.kioskId===k.id).map(controller)}{nodes.filter(x=>x.type==="camera"&&x.kioskId===k.id).map(x=><div key={x.id} className="ml-3 py-1">{node(x)}</div>)}</div>)}
 <div className="rounded-xl border border-[#dcebe8] p-3"><strong>Thiết bị chưa liên kết hoặc ngoài nhóm đã chọn</strong>{nodes.filter(x=>x.type==="controller"&&(!x.kioskId||!ids.has(x.kioskId))).map(controller)}{nodes.filter(x=>x.type==="camera"&&(!x.kioskId||!ids.has(x.kioskId))||x.type==="sensor"&&(!x.controllerId||!ids.has(x.controllerId))).map(x=><div key={x.id} className="py-1">{node(x)}</div>)}</div>
 </div>;}}</State>;
}
TopologyBody.propTypes=MonitoringTopology.propTypes;
export function MonitoringDiagnostics({row,revision}){
 const [open,setOpen]=useState(false);
 return <Panel title="Chẩn đoán thiết bị"><button className="system-secondary-button" onClick={()=>setOpen(x=>!x)}>{open?"Thu gọn":"Xem chi tiết"}</button>{open&&<DiagnosticsBody row={row} revision={revision}/>}</Panel>;
}
MonitoringDiagnostics.propTypes=rowProps;
function DiagnosticsBody({row,revision}){
 const load=useCallback(signal=>api.getMonitoringDiagnostics(row.type,row.id,signal),[row.type,row.id]);
 const state=useLoad(load,revision,30000);
 return <State state={state}>{v=>{const e=v.extra||{},d=v.device||{};
 return <div className="mt-3 space-y-2 text-sm">
 {row.type==="controller"&&<><p>Revision: {show(e.capabilityVersion)} · Firmware: {show(d.firmwareVersion)} · RSSI: {show(e.rssiDbm)} · Pin: {show(e.batteryLevel)}</p><p>Model: {show(e.hardwareModel)}</p><h4 className="font-semibold">Port</h4><DataTable rows={e.ports||[]} empty="Chưa có port." columns={[col("portCode","Port"),col("isPresent","Có mặt",x=>x.isPresent?"Có":"Không"),col("reportedOn","Đầu ra",x=>x.reportedOn==null?"—":x.reportedOn?"ON":"OFF"),col("configVersion","Revision"),col("lastReportedAt","Báo cáo",x=>formatWhen(x.lastReportedAt))]}/><h4 className="font-semibold">50 lệnh gần nhất</h4><DataTable rows={e.commands||[]} empty="Chưa có lệnh." columns={[col("command","Lệnh"),col("channel","Kênh"),col("status","Trạng thái"),col("createdAt","Tạo",x=>formatWhen(x.createdAt)),col("acknowledgedAt","ACK",x=>formatWhen(x.acknowledgedAt))]}/></>}
 {row.type==="sensor"&&<><p>Dữ liệu: {e.measurementFresh?"Còn mới":"Cũ hoặc chưa có"}</p><p>Chu kỳ đo: {show(e.samplingIntervalSeconds)} giây</p><p>Revision yêu cầu / áp dụng: {show(e.configurationVersion)} / {show(e.appliedConfigurationVersion)}</p><p>Áp dụng lúc: {formatWhen(e.lastConfigurationAppliedAt)}</p><p>Hiệu chuẩn: {e.calibration?formatWhen(e.calibration.performedAt)+" · "+show(e.calibration.result):"Chưa có"}</p></>}
 {row.type==="camera"&&<><p>Stream: {show(e.streamStatus)}</p><p>Agent: {show(e.agentVersion)} · Clip chờ: {show(d.pendingClips)}</p><p>Phiên: {show(e.latest?.status)} · Heartbeat: {formatWhen(e.latest?.lastHeartbeatAt)}</p><p>Kết thúc: {formatWhen(e.latest?.endedAt)}</p><p className="text-xs text-[#54747e]">Trạng thái phiên ghi không thay thế kiểm tra stream trực tiếp.</p></>}
 {row.type==="kiosk"&&<><p>Controller: {show(e.controllers)} · Camera: {show(e.cameras)}</p><p>Clip chờ upload: {show(e.pendingClips)}</p><p>Heartbeat: {formatWhen(d.lastSeenAt)}</p></>}
 </div>;}}</State>;
}
DiagnosticsBody.propTypes=rowProps;
export function MonitoringHealthHistory({row,revision}){
 const [page,setPage]=useState(1);
 const load=useCallback(signal=>api.getMonitoringHealthHistory(row.type,row.id,{page,pageSize:20},signal),[row.type,row.id,page]);
 const state=useLoad(load,revision,60000);
 return <Panel title="Lịch sử sức khỏe"><State state={state}>{v=><><DataTable rows={v.items||[]} empty="Chưa có mẫu sức khỏe." columns={[col("occurredAt","Thời điểm",x=>formatWhen(x.occurredAt)),col("healthStatus","Sức khỏe"),col("agentStatus","Agent"),col("reasonCode","Lý do")]}/><div className="mt-2 flex gap-2"><button className="system-secondary-button" disabled={page===1} onClick={()=>setPage(x=>x-1)}>Trước</button><button className="system-secondary-button" disabled={page*20>=v.total} onClick={()=>setPage(x=>x+1)}>Sau</button></div></>}</State></Panel>;
}
MonitoringHealthHistory.propTypes=rowProps;
export function MonitoringExport({area}){
 const [days,setDays]=useState(7),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const download=async()=>{setBusy(true);setError("");try{const blob=await api.exportMonitoringHistory({farmingAreaId:area,days});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="device-connection-history.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){setError(e.message||"Không xuất được báo cáo.");}finally{setBusy(false);}};
 return <Panel title="Báo cáo lịch sử kết nối"><label className="text-sm">Khoảng ngày <select value={days} onChange={e=>setDays(Number(e.target.value))} className="rounded border p-2">{[7,30,90].map(x=><option key={x} value={x}>{x} ngày</option>)}</select></label> <button className="system-secondary-button" disabled={busy} onClick={download}>{busy?"Đang xuất…":"Xuất CSV"}</button>{error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}</Panel>;
}
MonitoringExport.propTypes={area:PropTypes.string.isRequired};
