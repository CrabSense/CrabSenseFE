import {useEffect,useRef,useState} from "react";
import PropTypes from "prop-types";
import {Activity,Clock,Download,RefreshCw,ChevronLeft,ChevronRight,AlertTriangle,FileText,Settings,FlaskConical,CheckCircle2} from "lucide-react";
import {ResponsiveContainer,LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,Legend} from "recharts";
import api from "../../services/systemAdminService";
import {Field} from "./SensorForm";
import {dateRange,dayVN,dateLabel,numberLabel,shown,QUALITY,configPayload,downloadCsv} from "./sensorModel";

export function useSensorData(load,deps){
  const [state,setState]=useState({loading:true,data:null,error:""});
  useEffect(()=>{const ctl=new AbortController();setState({loading:true,data:null,error:""});
    Promise.resolve().then(()=>load(ctl.signal)).then(data=>{if(!ctl.signal.aborted)setState({loading:false,data,error:""});})
    .catch(e=>{if(!ctl.signal.aborted)setState({loading:false,data:null,error:e.message||"Không tải được dữ liệu."});});
    return()=>ctl.abort();
  // The caller supplies the complete request identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },deps);
  return state;
}
export function SensorState({state,children,onRetry}){
  if(state.loading)return <div className="sen-empty" role="status"><RefreshCw size={18} className="animate-spin"/> Đang tải dữ liệu từ API…</div>;
  if(state.error)return <div role="alert" className="sen-error">{state.error}{onRetry&&<button type="button" className="system-secondary-button" onClick={onRetry}>Thử lại</button>}</div>;
  return children;
}
SensorState.propTypes={state:PropTypes.object.isRequired,children:PropTypes.node,onRetry:PropTypes.func};
export function SensorTable({columns,rows,empty="Chưa có dữ liệu."}){
  if(!rows?.length)return <div className="sen-empty"><FileText size={26}/><p>{empty}</p></div>;
  return <div className="sen-table-scroll" role="region" aria-label="Bảng dữ liệu Sensor" tabIndex={0}><table className="sen-table"><thead><tr>{columns.map(c=><th key={c.key} scope="col">{c.label}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r.id||i}>{columns.map(c=><td key={c.key}>{c.render?c.render(r):shown(r[c.key])}</td>)}</tr>)}</tbody></table></div>;
}
SensorTable.propTypes={columns:PropTypes.array.isRequired,rows:PropTypes.array,empty:PropTypes.string};

export function SensorHistory({sensor}){
  const today=dayVN(),[draft,setDraft]=useState({from:today,to:today}),[range,setRange]=useState(()=>dateRange(today,today));
  const [quality,setQuality]=useState("");
  const [page,setPage]=useState(1),[revision,refresh]=useState(0),[error,setError]=useState(""),[exporting,setExporting]=useState(false);
  const exportRef=useRef(null);
  const history=useSensorData(signal=>api.getSensorMeasurements(sensor.id,{from:range.from,to:range.to,quality,page,pageSize:50},signal),[sensor.id,range,quality,page,revision]);
  const stats=useSensorData(signal=>api.getSensorStatistics(sensor.id,{from:range.from,to:range.to,quality},signal),[sensor.id,range,quality,revision]);
  const chart=useSensorData(signal=>api.getSensorChart(sensor.id,{...range,quality},signal),[sensor.id,range,quality,revision]);
  useEffect(()=>()=>exportRef.current?.abort(),[]);
  const apply=e=>{e.preventDefault();try{setRange(dateRange(draft.from,draft.to));setPage(1);setError("");}catch(e){setError(e.message);}};
  const exportAll=async()=>{
    if(exporting||history.loading||history.error)return;
    setExporting(true);setError("");const ctl=new AbortController();exportRef.current=ctl;
    try{
      const records=[];let p=1;
      while(true){
        const res=await api.getSensorMeasurements(sensor.id,{from:range.from,to:range.to,quality,page:p,pageSize:200},ctl.signal);
        if(res.totalCount>5000||records.length+res.items.length>5000)throw new Error("Tối đa 5.000 mẫu mỗi lần xuất. Hãy thu hẹp khoảng ngày.");
        records.push(...res.items);if(p>=res.totalPages||!res.items.length)break;p++;
      }
      if(!ctl.signal.aborted)downloadCsv([["Mã Sensor","Thời điểm đo","Thời điểm nhận","Giá trị","Đơn vị","Chất lượng","Nguồn"],...records.map(m=>[sensor.sensorCode,dateLabel(m.measuredAt),dateLabel(m.receivedAt),m.value,m.unit,QUALITY[m.dataQuality]||m.dataQuality||"Chưa xác định",m.source])],"sensor-"+sensor.sensorCode+".csv");
    }catch(e){if(!ctl.signal.aborted)setError(e.message);}finally{if(!ctl.signal.aborted)setExporting(false);}
  };
  const groups=chart.data?.buckets?.reduce((acc,b)=>{const unit=b.unit||"Không rõ đơn vị";(acc[unit]??=[]).push({...b,time:new Date(b.at).getTime()});return acc;},Object.create(null))||{};
  return <div className="sen-stack">
    <section className="sen-panel"><div className="sen-section-head"><div><h2><Activity size={18}/> Lịch sử dữ liệu · {sensor.sensorCode}</h2><p>Khoảng ngày đo theo giờ Việt Nam (UTC+7), không phải ngày nhận.</p></div><button className="system-secondary-button sen-btn" onClick={()=>refresh(n=>n+1)} type="button"><RefreshCw size={16}/> Làm mới</button></div>
    <form className="sen-inline-form" onSubmit={apply}><Field label="Từ ngày"><input required type="date" value={draft.from} onChange={e=>setDraft(d=>({...d,from:e.target.value}))}/></Field><Field label="Đến ngày"><input required type="date" value={draft.to} onChange={e=>setDraft(d=>({...d,to:e.target.value}))}/></Field><Field label="Chất lượng dữ liệu"><select value={quality} onChange={e=>{setQuality(e.target.value);setPage(1);}}><option value="">Tất cả</option>{Object.entries(QUALITY).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></Field><button type="submit" className="system-primary-button">Áp dụng</button><button type="button" className="system-secondary-button sen-btn" disabled={exporting||history.loading||Boolean(history.error)} onClick={exportAll}><Download size={16}/>{exporting?"Đang xuất…":"Xuất CSV"}</button></form>{error&&<p role="alert" className="sen-error">{error}</p>}
    </section>
    <section className="sen-panel"><h2>Thống kê theo đơn vị</h2><SensorState state={stats} onRetry={()=>refresh(n=>n+1)}>
      {stats.data?.groups?.length?stats.data.groups.map((g,i)=><div key={g.unit||i} className="sen-stat-group"><p>{g.unit||"Không rõ đơn vị"}</p><div className="sen-stat-grid">{[["Số mẫu",g.count],["Nhỏ nhất",g.min],["Lớn nhất",g.max],["Trung bình",g.average]].map(([label,value])=><div key={label}><small>{label}</small><strong>{numberLabel(value)}</strong></div>)}</div></div>):<div className="sen-empty">Chưa có mẫu đo trong khoảng này.</div>}
    </SensorState></section>
    <section className="sen-panel"><div className="sen-section-head"><div><h2>Biểu đồ dữ liệu đo</h2><p>Min / max / trung bình mỗi {range.bucketMinutes} phút. Không thay dữ liệu thiếu bằng 0.</p></div></div>
      <SensorState state={chart} onRetry={()=>refresh(n=>n+1)}>{Object.keys(groups).length?Object.entries(groups).map(([unit,points])=><div key={unit} className="sen-chart"><h3>{unit}</h3><div style={{height:260,minWidth:0}}><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{top:12,right:20,left:0,bottom:8}}><CartesianGrid strokeDasharray="3 3" stroke="#e3eeeb"/><XAxis dataKey="time" type="number" domain={["dataMin","dataMax"]} tickFormatter={v=>new Date(v).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})} tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} domain={["auto","auto"]}/><Tooltip labelFormatter={dateLabel}/><Legend/><Line type="linear" dataKey="min" name="Min" stroke="#84b8c9" dot={false} isAnimationActive={false}/><Line type="linear" dataKey="max" name="Max" stroke="#c99546" dot={false} isAnimationActive={false}/><Line type="linear" dataKey="average" name="Trung bình" stroke="#147e75" strokeWidth={2} dot={points.length<3} isAnimationActive={false}/></LineChart></ResponsiveContainer></div></div>):<div className="sen-empty">Chưa có dữ liệu để vẽ biểu đồ.</div>}</SensorState>
    </section>
    <section className="sen-panel"><h2>Danh sách mẫu đo</h2><SensorState state={history} onRetry={()=>refresh(n=>n+1)}>
      <SensorTable rows={history.data?.items||[]} columns={[{key:"measuredAt",label:"Thời điểm đo",render:m=>dateLabel(m.measuredAt)},{key:"receivedAt",label:"Thời điểm nhận",render:m=>dateLabel(m.receivedAt)},{key:"value",label:"Giá trị",render:m=>numberLabel(m.value)},{key:"unit",label:"Đơn vị"},{key:"dataQuality",label:"Chất lượng",render:m=>QUALITY[m.dataQuality]||"Chưa xác định"},{key:"source",label:"Nguồn"}]}/>
      <div className="sen-pagination"><span>{history.data?.totalCount||0} mẫu đo · Trang {page}/{Math.max(1,history.data?.totalPages||0)}</span><div><button className="sen-icon" disabled={page<=1} onClick={()=>setPage(p=>p-1)} aria-label="Trang trước"><ChevronLeft size={19}/></button><button className="sen-icon" disabled={page>=(history.data?.totalPages||0)} onClick={()=>setPage(p=>p+1)} aria-label="Trang sau"><ChevronRight size={19}/></button></div></div>
    </SensorState></section>
  </div>;
}
SensorHistory.propTypes={sensor:PropTypes.object.isRequired};

export function SensorAllEvents(){
  const [revision,refresh]=useState(0),[kind,setKind]=useState(""),[status,setStatus]=useState("");
  const data=useSensorData(()=>api.getAlerts(false),[revision]);
  const alerts=(data.data||[]).filter(a=>["sensor_disconnect","sensor_read_error"].includes(a.incidentType));
  const rows=alerts.filter(a=>(!kind||a.incidentType===kind)&&(!status||a.status===status));
  return <section className="sen-panel"><div className="sen-section-head"><div><h2><AlertTriangle size={18}/> Cảnh báo kỹ thuật toàn hệ thống</h2><p>Chỉ lỗi kỹ thuật Sensor do BE ghi nhận. Chọn Sensor để xem nhật ký riêng.</p></div><button type="button" className="system-secondary-button sen-btn" onClick={()=>refresh(n=>n+1)}><RefreshCw size={16}/> Làm mới</button></div>
    <div className="sen-inline-form"><Field label="Loại cảnh báo"><select value={kind} onChange={e=>setKind(e.target.value)}><option value="">Tất cả loại</option><option value="sensor_disconnect">Mất kết nối</option><option value="sensor_read_error">Lỗi đọc</option></select></Field><Field label="Trạng thái"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Tất cả trạng thái</option>{[...new Set(alerts.map(a=>a.status))].filter(Boolean).map(s=><option key={s}>{s}</option>)}</select></Field></div>
    <SensorState state={data} onRetry={()=>refresh(n=>n+1)}><SensorTable rows={rows} columns={[{key:"incidentType",label:"Loại lỗi",render:a=>a.incidentType==="sensor_disconnect"?"Mất kết nối":"Lỗi đọc Sensor"},{key:"message",label:"Thông báo"},{key:"severity",label:"Mức độ"},{key:"status",label:"Trạng thái"},{key:"lastOccurredAt",label:"Lần cuối",render:a=>dateLabel(a.lastOccurredAt||a.createdAt)}]} empty="Không có cảnh báo Sensor phù hợp."/></SensorState>
  </section>;
}

export function SensorEvents({sensor}){
  const [revision,refresh]=useState(0);
  const events=useSensorData(signal=>api.getSensorEvents(sensor.id,signal),[sensor.id,revision]);
  return <div className="sen-stack"><section className="sen-panel"><div className="sen-section-head"><div><h2><AlertTriangle size={18}/> Cảnh báo kỹ thuật · {sensor.sensorCode}</h2><p>Lỗi đọc, mất kết nối. Không bao gồm cảnh báo ngưỡng nuôi cua.</p></div><button type="button" className="system-secondary-button sen-btn" onClick={()=>refresh(n=>n+1)}><RefreshCw size={16}/> Làm mới</button></div>
    <SensorState state={events} onRetry={()=>refresh(n=>n+1)}><SensorTable rows={events.data?.alerts||[]} columns={[{key:"incidentType",label:"Loại lỗi",render:a=>({sensor_disconnect:"Mất kết nối",sensor_read_error:"Lỗi đọc Sensor"})[a.incidentType]||a.incidentType},{key:"message",label:"Thông báo"},{key:"severity",label:"Mức độ"},{key:"status",label:"Trạng thái"},{key:"lastOccurredAt",label:"Lần cuối",render:a=>dateLabel(a.lastOccurredAt)},{key:"resolvedAt",label:"Đã xử lý",render:a=>dateLabel(a.resolvedAt)}]} empty="Không có cảnh báo kỹ thuật."/></SensorState>
  </section><section className="sen-panel"><h2><FileText size={17}/> Nhật ký thao tác</h2><SensorState state={events}><SensorTable rows={events.data?.logs||[]} columns={[{key:"action",label:"Thao tác"},{key:"createdAt",label:"Thời điểm",render:l=>dateLabel(l.createdAt)},{key:"userId",label:"Người thực hiện (ID)"}]} empty="Chưa có nhật ký thao tác."/></SensorState></section></div>;
}
SensorEvents.propTypes={sensor:PropTypes.object.isRequired};

function ConfigEditor({sensor,config,onChanged}){
  const [interval,setInterval]=useState(config.samplingIntervalSeconds??""),[timeout,setTimeoutValue]=useState(config.disconnectTimeoutSeconds??900),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const lock=useRef(false);
  const submit=async e=>{e.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError("");setNotice("");
    try{const result=await api.saveSensorConfiguration(sensor.id,configPayload(interval,timeout,config.configurationVersion));setNotice(result.runtimeStatus==="Applied"?"Controller đã xác nhận cấu hình.":"Đã lưu cấu hình mong muốn. Chờ Controller xác nhận.");onChanged();}
    catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}};
  return <form onSubmit={submit} className="sen-stack"><div className="sen-facts-grid"><div><small>Phiên bản mong muốn</small><strong>{config.configurationVersion}</strong></div><div><small>Phiên bản đã áp dụng</small><strong>{shown(config.appliedConfigurationVersion)}</strong></div><div><small>Trạng thái</small><strong>{({Applied:"Đã xác nhận",Pending:"Chờ Controller",NotConfigured:"Chưa cấu hình"})[config.runtimeStatus]||shown(config.runtimeStatus)}</strong></div><div><small>Thời điểm xác nhận</small><strong>{dateLabel(config.lastConfigurationAppliedAt)}</strong></div></div>
    <p className="sen-note">Đây là cấu hình mong muốn trên BE. Hardware/Kiosk cần hỗ trợ Edge V2 để xác nhận đã áp dụng; không tự báo thành công.</p>
    {error&&<p role="alert" className="sen-error">{error}</p>}{notice&&<p role="status" className="sen-notice">{notice}</p>}
    <div className="sen-form-grid"><Field label="Chu kỳ lấy mẫu (giây) *"><input type="number" required min="1" max="86400" step="1" value={interval} onChange={e=>setInterval(e.target.value)}/></Field><Field label="Timeout mất kết nối (giây) *"><input type="number" required min="1" max="604800" step="1" value={timeout} onChange={e=>setTimeoutValue(e.target.value)}/></Field></div>
    <div><button type="button" className="system-secondary-button" disabled={busy} onClick={async()=>{if(!window.confirm("Khôi phục chu kỳ mặc định của firmware và timeout BE?"))return;setBusy(true);try{await api.resetSensorConfiguration(sensor.id,config.configurationVersion);onChanged();}catch(e){setError(e.message);}finally{setBusy(false);}}}>Khôi phục mặc định</button> <button type="submit" className="system-primary-button sen-btn" disabled={busy}><CheckCircle2 size={16}/>{busy?"Đang lưu…":"Lưu cấu hình"}</button></div>
  </form>;
}
ConfigEditor.propTypes={sensor:PropTypes.object.isRequired,config:PropTypes.object.isRequired,onChanged:PropTypes.func.isRequired};

function CalibrationEditor({sensor,onSaved}){
  const [f,setF]=useState({performedAt:"",referenceValue:"",observedValue:"",unit:sensor.unit||"",method:"",result:"Passed",note:""}),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const lock=useRef(false);
  const set=(k,v)=>setF(old=>({...old,[k]:v}));
  const submit=async e=>{e.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError("");
    try{const at=new Date(f.performedAt+":00+07:00");if(!Number.isFinite(at.getTime())||at.getTime()>Date.now()+120000)throw new Error("Thời điểm hiệu chuẩn không hợp lệ.");
      if(!f.referenceValue.trim()||!f.observedValue.trim()||!Number.isFinite(Number(f.referenceValue))||!Number.isFinite(Number(f.observedValue)))throw new Error("Nhập giá trị chuẩn và giá trị quan sát.");
      await api.recordSensorCalibration(sensor.id,{...f,performedAt:at.toISOString(),referenceValue:Number(f.referenceValue),observedValue:Number(f.observedValue),unit:f.unit.trim(),method:f.method.trim(),note:f.note.trim()||null});onSaved();
    }catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}};
  return <form className="sen-stack" onSubmit={submit}><p className="sen-note">Chỉ ghi nhận kết quả hiệu chuẩn đã thực hiện tại thiết bị, không gửi lệnh chỉnh phần cứng. Thời gian nhập theo UTC+7.</p>{error&&<p role="alert" className="sen-error">{error}</p>}<div className="sen-form-grid">
    <Field label="Thời điểm hiệu chuẩn *"><input required type="datetime-local" value={f.performedAt} onChange={e=>set("performedAt",e.target.value)}/></Field>
    <Field label="Phương pháp *"><input required maxLength={100} value={f.method} onChange={e=>set("method",e.target.value)} placeholder="VD: dung dịch chuẩn pH 7"/></Field>
    <Field label="Giá trị chuẩn *"><input required type="number" step="any" value={f.referenceValue} onChange={e=>set("referenceValue",e.target.value)}/></Field>
    <Field label="Giá trị quan sát *"><input required type="number" step="any" value={f.observedValue} onChange={e=>set("observedValue",e.target.value)}/></Field>
    <Field label="Đơn vị *"><input required maxLength={32} readOnly={Boolean(sensor.unit)} value={f.unit} onChange={e=>set("unit",e.target.value)}/></Field>
    <Field label="Kết quả"><select value={f.result} onChange={e=>set("result",e.target.value)}><option value="Passed">Đạt</option><option value="Failed">Không đạt</option></select></Field>
    <Field label="Ghi chú"><textarea maxLength={500} value={f.note} onChange={e=>set("note",e.target.value)}/></Field>
  </div><div><button className="system-primary-button" disabled={busy} type="submit">{busy?"Đang lưu…":"Ghi nhận hiệu chuẩn"}</button></div></form>;
}
CalibrationEditor.propTypes={sensor:PropTypes.object.isRequired,onSaved:PropTypes.func.isRequired};

export function SensorConfiguration({sensor,onChanged}){
  const [revision,refresh]=useState(0),[calForm,setCalForm]=useState(false),[notice,setNotice]=useState("");
  const config=useSensorData(signal=>api.getSensorConfiguration(sensor.id,signal),[sensor.id,revision]);
  const calibrations=useSensorData(signal=>api.getSensorCalibrations(sensor.id,signal),[sensor.id,revision]);
  const update=()=>{refresh(n=>n+1);onChanged();};
  return <div className="sen-stack"><section className="sen-panel"><div className="sen-section-head"><div><h2><Settings size={18}/> Cấu hình kỹ thuật · {sensor.sensorCode}</h2><p>Chu kỳ lấy mẫu và timeout, không thay đổi ngưỡng nước.</p></div><button type="button" className="system-secondary-button sen-btn" onClick={()=>refresh(n=>n+1)}><RefreshCw size={16}/> Kiểm tra xác nhận</button></div><SensorState state={config} onRetry={()=>refresh(n=>n+1)}>{config.data&&<ConfigEditor key={config.data.configurationVersion} sensor={sensor} config={config.data} onChanged={update}/>}</SensorState></section>
  <section className="sen-panel"><div className="sen-section-head"><h2><FlaskConical size={18}/> Hiệu chuẩn Sensor</h2><button className="system-secondary-button" type="button" onClick={()=>setCalForm(v=>!v)}>{calForm?"Đóng form":"Ghi nhận hiệu chuẩn"}</button></div>{notice&&<p role="status" className="sen-notice">{notice}</p>}{calForm&&<CalibrationEditor sensor={sensor} onSaved={()=>{setCalForm(false);setNotice("Đã lưu kết quả hiệu chuẩn thủ công.");update();}}/>}
  <SensorState state={calibrations} onRetry={()=>refresh(n=>n+1)}><SensorTable rows={calibrations.data||[]} columns={[{key:"performedAt",label:"Thời điểm",render:c=>dateLabel(c.performedAt)},{key:"referenceValue",label:"Giá trị chuẩn",render:c=>numberLabel(c.referenceValue)},{key:"observedValue",label:"Quan sát",render:c=>numberLabel(c.observedValue)},{key:"unit",label:"Đơn vị"},{key:"method",label:"Phương pháp"},{key:"result",label:"Kết quả",render:c=>c.result==="Passed"?"Đạt":c.result==="Failed"?"Không đạt":shown(c.result)},{key:"note",label:"Ghi chú"}]} empty="Chưa có lịch sử hiệu chuẩn."/></SensorState></section></div>;
}
SensorConfiguration.propTypes={sensor:PropTypes.object.isRequired,onChanged:PropTypes.func.isRequired};
