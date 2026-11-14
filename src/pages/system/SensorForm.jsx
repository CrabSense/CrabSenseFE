import {useEffect,useRef,useState} from "react";
import PropTypes from "prop-types";
import {X,RefreshCw,CheckCircle2,Cpu,Link2} from "lucide-react";
import api from "../../services/systemAdminService";
import {deviceKind} from "./deviceModel";
import {EMPTY_ID,isBus,bindingPayload,shown} from "./sensorModel";

export function SensorDialog({title,children,onClose,busy=false}){
  const ref=useRef(null);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  return <dialog ref={ref} className="sen-dialog" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <header><h2>{title}</h2><button type="button" className="sen-icon" disabled={busy} onClick={onClose} aria-label="Đóng"><X size={20}/></button></header>{children}
  </dialog>;
}
SensorDialog.propTypes={title:PropTypes.string.isRequired,children:PropTypes.node,onClose:PropTypes.func.isRequired,busy:PropTypes.bool};
export function Field({label,children}){return <label className="sen-field"><span>{label}</span>{children}</label>;}
Field.propTypes={label:PropTypes.string.isRequired,children:PropTypes.node};
const SourceOptions=()=> <><option value="Controller">Controller</option><option value="Kiosk">Kiosk</option><option value="CameraAnalysis">Phân tích Camera / AI</option><option value="Manual">Nhập thủ công</option><option value="Legacy">Thiết bị cũ</option></>;

export default function SensorForm({sensor,areas,devices,types,initialArea="",initialRow="",initialPort=null,onClose,onSaved}){
  const editing=Boolean(sensor),[raw,setRaw]=useState(null),[loading,setLoading]=useState(editing),[method,setMethod]=useState(initialPort?"port":"manual");
  const [f,setF]=useState({sensorCode:initialPort?.sensorCode||"",name:"",sensorType:"",unit:"",sourceType:"Controller",deviceId:initialPort?.deviceId||"",portId:initialPort?.id||"",busAddress:"",busRegister:"",farmingAreaId:initialArea,farmingRowId:initialRow,installationLocation:""});
  const [ports,setPorts]=useState([]),[portLoading,setPortLoading]=useState(false),[portError,setPortError]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const lock=useRef(false);
  const set=(key,val)=>setF(old=>({...old,[key]:val}));
  useEffect(()=>{
    if(!sensor)return;
    const ctl=new AbortController();
    api.getSensor(sensor.id,ctl.signal).then(s=>{
      if(ctl.signal.aborted)return;
      setRaw(s);setF({sensorCode:s.sensorCode,name:s.name||"",sensorType:s.sensorType,unit:s.unit||"",sourceType:s.sourceType||"Legacy",deviceId:s.deviceId||"",portId:s.controllerPortId||s.busPortId||"",busAddress:"",busRegister:"",farmingAreaId:s.farmingAreaId||"",farmingRowId:s.farmingRowId||"",installationLocation:s.installationLocation||""});
    }).catch(e=>{if(!ctl.signal.aborted)setError(e.message);}).finally(()=>{if(!ctl.signal.aborted)setLoading(false);});
    return()=>ctl.abort();
  },[sensor]);
  useEffect(()=>{
    if(editing||method!=="port"||!f.deviceId){setPorts([]);setPortLoading(false);return;}
    const ctl=new AbortController();setPorts([]);setPortLoading(true);setPortError("");
    api.getDiscoveredSensors(f.deviceId,ctl.signal).then(rows=>{if(!ctl.signal.aborted)setPorts(rows);}).catch(e=>{if(!ctl.signal.aborted)setPortError(e.message);}).finally(()=>{if(!ctl.signal.aborted)setPortLoading(false);});
    return()=>ctl.abort();
  },[editing,method,f.deviceId]);
  const port=ports.find(p=>p.id===f.portId);
  // A sensor may have a direct row without an explicit area. Preserve that relationship
  // unless the user actually changes location.
  const derivedArea=areas.find(a=>a.rows?.some(r=>r.id===f.farmingRowId));
  const area=areas.find(a=>a.id===f.farmingAreaId)||(!f.farmingAreaId?derivedArea:null);
  const areaRows=area?.rows||[];
  const deviceOptions=devices.filter(d=>f.sourceType==="CameraAnalysis"&&method==="manual"?deviceKind(d)==="camera":deviceKind(d)==="controller");
  const chooseDevice=value=>setF(old=>({...old,deviceId:value,portId:"",busAddress:"",busRegister:""}));
  const submit=async e=>{
    e.preventDefault();if(lock.current)return;
    lock.current=true;setBusy(true);setError("");
    try{
      if(!f.sensorCode.trim()||!f.sensorType.trim())throw new Error("Nhập mã và loại Sensor.");
      if(editing){
        const body={name:f.name.trim(),installationLocation:f.installationLocation.trim()};
        if(f.farmingAreaId!==(raw.farmingAreaId||""))body.farmingAreaId=f.farmingAreaId||EMPTY_ID;
        if(f.farmingRowId!==(raw.farmingRowId||""))body.farmingRowId=f.farmingRowId||EMPTY_ID;
        // Omit unchanged fields: legacy types/units and inherited location remain intact.
        if(f.sensorType.trim()!==raw.sensorType)body.sensorType=f.sensorType.trim();
        if(f.unit.trim()!==(raw.unit||""))body.unit=f.unit.trim();
        if(f.sourceType!==(raw.sourceType||"Legacy"))body.sourceType=f.sourceType;
        await api.updateSensor(sensor.id,body);
      }else{
        const body={sensorCode:f.sensorCode.trim(),name:f.name.trim()||null,sensorType:f.sensorType.trim(),unit:f.unit.trim()||null,farmingAreaId:f.farmingAreaId||null,farmingRowId:f.farmingRowId||null};
        if(method==="port"){
          if(!port)throw new Error("Chọn port hiện có trong manifest của Controller.");
          const binding=bindingPayload(f.deviceId,port,f.busAddress,f.busRegister);
          if(port.sensorCode&&!isBus(port)&&body.sensorCode!==port.sensorCode)throw new Error("Mã Sensor phải khớp manifest.");
          await api.registerSensorFromPort({...body,controllerId:f.deviceId,portId:binding.portId,busAddress:binding.busAddress,busRegister:binding.busRegister});
        }else await api.createSensor({...body,deviceId:f.deviceId||null,sourceType:f.sourceType,installationLocation:f.installationLocation.trim()||null});
      }
      onSaved(editing?"Đã cập nhật Sensor.":"Đã đăng ký Sensor.");
    }catch(e){setError(e.message||"Không lưu được Sensor.");}
    finally{lock.current=false;setBusy(false);}
  };
  return <SensorDialog title={editing?"Chỉnh sửa Sensor":"Thêm Sensor"} onClose={onClose} busy={busy}>
    {loading?<div className="sen-empty">Đang tải cấu hình…</div>:editing&&!raw?<div className="sen-error">{error||"Không tải được Sensor."}</div>:<form onSubmit={submit} className="sen-form">
      {error&&<p role="alert" className="sen-error">{error}</p>}
      {!editing&&<div className="sen-choice"><button type="button" className={method==="port"?"active":""} onClick={()=>setMethod("port")}><Cpu size={18}/> Từ port Controller</button><button type="button" className={method==="manual"?"active":""} onClick={()=>setMethod("manual")}>Đăng ký thủ công</button></div>}
      {!editing&&method==="port"&&<p className="sen-note">Chỉ các port input/bus hiện diện được Controller khai báo. Loại cảm biến phải được xác nhận, không suy đoán từ GPIO.</p>}
      <h3>01 · Thông tin Sensor</h3>
      <div className="sen-form-grid">
        <Field label="Mã Sensor *"><input required maxLength={128} disabled={editing||Boolean(port?.sensorCode&&!isBus(port)&&method==="port")} value={f.sensorCode} onChange={e=>set("sensorCode",e.target.value)}/></Field>
        <Field label="Tên hiển thị"><input maxLength={200} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="VD: Cảm biến pH bể A"/></Field>
        <Field label="Loại Sensor *"><input required maxLength={64} list="sen-types" value={f.sensorType} onChange={e=>{const val=e.target.value;const found=types.find(t=>t.sensorType===val);setF(old=>({...old,sensorType:val,...(!editing&&found?{unit:found.unit||""}:{})}));}} placeholder="Chọn hoặc nhập loại"/><datalist id="sen-types">{[...new Set(types.map(t=>t.sensorType))].map(t=><option key={t} value={t}/>)}</datalist></Field>
        <Field label="Đơn vị đo"><input maxLength={32} value={f.unit} onChange={e=>set("unit",e.target.value)} placeholder="pH, °C, mg/L…"/></Field>
        {(editing||method==="manual")&&<Field label="Nguồn dữ liệu"><select value={f.sourceType} onChange={e=>{set("sourceType",e.target.value);if(!editing)chooseDevice("");}}><SourceOptions/>{!["Controller","Kiosk","CameraAnalysis","Manual","Legacy"].includes(f.sourceType)&&<option value={f.sourceType}>{f.sourceType}</option>}</select></Field>}
        {editing&&<div className="sen-note">Controller/port được chỉnh tại mục Liên kết phần cứng. Loại và đơn vị đã có dữ liệu đo không thể đổi ý nghĩa lịch sử.</div>}
      </div>
      {!editing&&<><h3>02 · Liên kết phần cứng</h3><div className="sen-form-grid">
        <Field label={method==="port"?"Controller *":"Thiết bị nguồn (tùy chọn)"}><select required={method==="port"} value={f.deviceId} onChange={e=>chooseDevice(e.target.value)}><option value="">Chọn thiết bị</option>{f.deviceId&&!deviceOptions.some(d=>d.id===f.deviceId)&&<option value={f.deviceId}>{initialPort?.deviceCode||"Thiết bị đã chọn"}</option>}{deviceOptions.map(d=><option key={d.id} value={d.id}>{d.deviceCode} · {d.name||d.deviceType}</option>)}</select></Field>
        {method==="port"&&<Field label="Port đã phát hiện *"><select required disabled={!f.deviceId||portLoading} value={f.portId} onChange={e=>{const p=ports.find(x=>x.id===e.target.value);setF(old=>({...old,portId:e.target.value,busAddress:"",busRegister:"",...(p?.sensorCode&&!isBus(p)?{sensorCode:p.sensorCode}:{})}));}}><option value="">{portLoading?"Đang tải port…":"Chọn port"}</option>{ports.map(p=><option key={p.id} value={p.id}>{p.portCode} · {p.portType}{p.gpio!=null?" / GPIO "+p.gpio:""}{p.registered?" (bus dùng chung)":""}</option>)}</select></Field>}
        {method==="port"&&isBus(port)&&<><Field label="Địa chỉ bus *"><input required maxLength={64} value={f.busAddress} onChange={e=>set("busAddress",e.target.value)}/></Field><Field label="Register / thông số *"><input required maxLength={64} value={f.busRegister} onChange={e=>set("busRegister",e.target.value)}/></Field></>}
      </div>{method==="port"&&portError&&<p role="alert" className="sen-error">{portError}</p>}{method==="port"&&f.deviceId&&!portLoading&&!portError&&!ports.length&&<p className="sen-note">Không có port input/bus khả dụng. Kiểm tra manifest hoặc chọn đăng ký thủ công nếu thiết bị cũ.</p>}</>}
      <h3>{editing?"02":"03"} · Vị trí lắp đặt</h3>
      <div className="sen-form-grid">
        <Field label="Khu nuôi"><select value={f.farmingAreaId||area?.id||""} disabled={!areas.length} onChange={e=>setF(old=>({...old,farmingAreaId:e.target.value,farmingRowId:""}))}><option value="">Không gán trực tiếp / kế thừa thiết bị</option>{f.farmingAreaId&&!areas.some(a=>a.id===f.farmingAreaId)&&<option value={f.farmingAreaId}>Khu đã gán (chưa tải danh mục)</option>}{areas.filter(a=>a.isActive!==false||a.id===f.farmingAreaId).map(a=><option key={a.id} value={a.id}>{a.name||a.code}{a.isActive===false?" (ngừng hoạt động)":""}</option>)}</select></Field>
        <Field label="Dãy nuôi"><select value={f.farmingRowId} disabled={!area} onChange={e=>set("farmingRowId",e.target.value)}><option value="">Không gán trực tiếp</option>{f.farmingRowId&&!areaRows.some(r=>r.id===f.farmingRowId)&&<option value={f.farmingRowId}>Dãy đã gán (chưa tải danh mục)</option>}{areaRows.filter(r=>r.isActive!==false||r.id===f.farmingRowId).map(r=><option key={r.id} value={r.id}>{r.name||r.code}</option>)}</select></Field>
        {(editing||method==="manual")&&<Field label="Vị trí cụ thể"><input maxLength={200} value={f.installationLocation} onChange={e=>set("installationLocation",e.target.value)} placeholder="VD: Bể lọc số 1"/></Field>}
      </div>
      <p className="sen-note">Ngưỡng chất lượng nước thuộc quản lý trại, không chỉnh tại đây. {method==="port"&&!editing?"Vị trí lắp chi tiết có thể cập nhật sau khi đăng ký.":""}</p>
      <footer><button type="button" className="system-secondary-button" onClick={onClose} disabled={busy}>Hủy</button><button className="system-primary-button" type="submit" disabled={busy||portLoading||(method==="port"&&!editing&&!port)}><CheckCircle2 size={16}/>{busy?"Đang lưu…":"Lưu Sensor"}</button></footer>
    </form>}
  </SensorDialog>;
}
SensorForm.propTypes={sensor:PropTypes.object,areas:PropTypes.array.isRequired,devices:PropTypes.array.isRequired,types:PropTypes.array.isRequired,initialArea:PropTypes.string,initialRow:PropTypes.string,initialPort:PropTypes.object,onClose:PropTypes.func.isRequired,onSaved:PropTypes.func.isRequired};

export function BindingForm({sensor,devices,onClose,onSaved}){
  const [device,setDevice]=useState(sensor.deviceId||""),[portId,setPortId]=useState(sensor.controllerPortId||sensor.busPortId||""),[address,setAddress]=useState(sensor.busAddress||""),[register,setRegister]=useState(sensor.busRegister||"");
  const [ports,setPorts]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const lock=useRef(false);
  useEffect(()=>{
    let active=true;setPorts([]);setError("");
    if(!device){setLoading(false);return()=>{active=false;};}
    setLoading(true);api.getControllerPorts(device).then(data=>{if(active){if(!Array.isArray(data?.ports))throw new Error("Danh mục port không hợp lệ.");const occupied=new Set((data.sensors||[]).filter(s=>s.id!==sensor.id).map(s=>s.controllerPortId));setPorts(data.ports.filter(p=>p.isPresent&&p.configVersion===data.capabilityVersion&&["DIGITAL_INPUT","ANALOG_INPUT","I2C","RS485","UART"].includes(p.portType)&&(!occupied.has(p.id)||isBus(p))).map(p=>({...p,deviceId:device})));}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[device,sensor.id]);
  const port=ports.find(p=>p.id===portId);
  const submit=async e=>{e.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError("");try{
    if(portId&&!port)throw new Error("Port không còn hợp lệ; chọn lại hoặc gỡ port.");
    await api.bindSensor(sensor.id,bindingPayload(device,port,address,register));
    onSaved("Đã cập nhật liên kết. Chờ dữ liệu mới từ thiết bị.");
  }catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}};
  return <SensorDialog title={"Liên kết phần cứng · "+sensor.sensorCode} onClose={onClose} busy={busy}><form className="sen-form" onSubmit={submit}>
    <p className="sen-note">Thay đổi liên kết sẽ đặt lại trạng thái kết nối và xác nhận cấu hình. Chỉ chọn port input đang hiện diện.</p>
    {error&&<p role="alert" className="sen-error">{error}</p>}
    <Field label="Thiết bị nguồn"><select value={device} onChange={e=>{setDevice(e.target.value);setPortId("");setAddress("");setRegister("");}}><option value="">Gỡ liên kết thiết bị</option>{device&&!devices.some(d=>d.id===device)&&<option value={device}>{sensor.controllerCode||"Thiết bị đã gán"}</option>}{devices.filter(d=>d.id===sensor.deviceId||deviceKind(d)==="controller"||sensor.sourceType==="CameraAnalysis").map(d=><option key={d.id} value={d.id}>{d.deviceCode} · {shown(d.name)}</option>)}</select></Field>
    <Field label="Port"><select value={portId} disabled={!device||loading} onChange={e=>{setPortId(e.target.value);setAddress("");setRegister("");}}><option value="">{loading?"Đang tải…":"Không gán port"}</option>{portId&&!port&&<option value={portId}>Port cũ (chưa xác minh)</option>}{ports.map(p=><option key={p.id} value={p.id}>{p.portCode} · {p.portType}</option>)}</select></Field>
    {isBus(port)&&<div className="sen-form-grid"><Field label="Địa chỉ bus *"><input required maxLength={64} value={address} onChange={e=>setAddress(e.target.value)}/></Field><Field label="Register *"><input required maxLength={64} value={register} onChange={e=>setRegister(e.target.value)}/></Field></div>}
    {portId&&!port&&!loading&&<p className="sen-note">Port cũ không còn hiện diện hoặc đã được gán. Chọn lại port hợp lệ.</p>}
    <footer><button type="button" className="system-secondary-button" onClick={onClose} disabled={busy}>Hủy</button><button type="submit" className="system-primary-button" disabled={busy||loading||Boolean(portId&&!port)}>{busy?<RefreshCw size={16}/>:<Link2 size={16}/>} Lưu liên kết</button></footer>
  </form></SensorDialog>;
}
BindingForm.propTypes={sensor:PropTypes.object.isRequired,devices:PropTypes.array.isRequired,onClose:PropTypes.func.isRequired,onSaved:PropTypes.func.isRequired};
