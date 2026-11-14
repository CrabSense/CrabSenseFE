import {useEffect,useMemo,useRef,useState} from "react";
import PropTypes from "prop-types";
import {Activity,Wifi,WifiOff,AlertTriangle,Power,HelpCircle,Plus,RefreshCw,Download,Search,MapPin,List,ChartNoAxesCombined,Settings,Eye,Pencil,X,Link2,Trash2,Cpu,ChevronLeft,ChevronRight,FlaskConical,Clock} from "lucide-react";
import api from "../../services/systemAdminService";
import {SystemPage,SystemState} from "../../components/system/SystemChrome";
import {deviceKind} from "./deviceModel";
import {buildLocationGroups} from "./cameraLocations";
import SensorForm,{BindingForm,SensorDialog,Field} from "./SensorForm";
import {SensorHistory,SensorEvents,SensorConfiguration,SensorTable,SensorState,useSensorData} from "./SensorPanels";
import {STATES,QUALITY,TEST_STATES,statusOf,sensorValue,place,shown,dateLabel,numberLabel,filterSensors,downloadCsv,isBus} from "./sensorModel";
import "./sensor-management.css";

const EMPTY_FILTER={search:"",status:"",area:"",row:"",type:"",device:""};
const TABS=[["list","Danh sách Sensor",List],["location","Theo vị trí",MapPin],["history","Lịch sử dữ liệu",ChartNoAxesCombined],["events","Cảnh báo kỹ thuật",AlertTriangle],["config","Cấu hình kỹ thuật",Settings]];
function Status({sensor}){const key=statusOf(sensor);return <span className={"sen-pill sen-"+key.toLowerCase()}><i/>{STATES[key]}</span>;}
Status.propTypes={sensor:PropTypes.object.isRequired};
function DeviceIdentity({sensor,onClick}){return <button type="button" className="sen-identity" onClick={onClick}><span className="sen-device-icon"><Activity size={20}/></span><span><strong>{sensor.sensorCode}</strong><small>{sensor.name||"Chưa đặt tên"}</small></span></button>;}
DeviceIdentity.propTypes={sensor:PropTypes.object.isRequired,onClick:PropTypes.func.isRequired};
function SensorList({items,selected,onSelect,onEdit,page,pageSize,onPage,onPageSize}){
  const totalPages=Math.max(1,Math.ceil(items.length/pageSize)),current=items.slice((page-1)*pageSize,page*pageSize);
  return <section className="sen-panel sen-list"><div className="sen-section-head"><h2><List size={18}/> Danh sách Sensor</h2><span className="sen-muted">{items.length} kết quả</span></div>
    {current.length?<div className="sen-table-scroll" tabIndex={0} role="region" aria-label="Danh sách Sensor"><table className="sen-table sen-inventory"><thead><tr>{["Sensor","Loại / Đơn vị","Khu / Dãy","Controller / Port","Giá trị mới nhất","Trạng thái","Cập nhật","Thao tác"].map(t=><th key={t} scope="col">{t}</th>)}</tr></thead><tbody>{current.map(s=><tr key={s.id} className={selected===s.id?"selected":""}><td><DeviceIdentity sensor={s} onClick={()=>onSelect(s.id)}/></td><td><strong>{s.sensorType}</strong><small>{shown(s.unit)}</small></td><td>{place(s)}</td><td><strong>{s.controllerCode||"Chưa liên kết"}</strong><small>{s.portCode||"Chưa gán port"}{s.portType?" · "+s.portType:""}</small></td><td><strong className="sen-value">{sensorValue(s)}</strong><small>{QUALITY[s.dataQuality]||"Chưa xác định"}</small></td><td><Status sensor={s}/></td><td>{dateLabel(s.latestMeasuredAt)}</td><td><div className="sen-actions"><button className="sen-icon" type="button" title="Xem chi tiết" aria-label={"Xem "+s.sensorCode} onClick={()=>onSelect(s.id)}><Eye size={17}/></button><button className="sen-icon" type="button" title="Chỉnh sửa" aria-label={"Sửa "+s.sensorCode} onClick={()=>onEdit(s)}><Pencil size={16}/></button></div></td></tr>)}</tbody></table></div>:<div className="sen-empty"><Activity size={32}/><strong>Không có Sensor phù hợp</strong><p>Đăng ký Sensor hoặc thay đổi bộ lọc.</p></div>}
    <div className="sen-pagination"><span>{items.length?(page-1)*pageSize+1:0}–{Math.min(page*pageSize,items.length)} / {items.length} Sensor</span><div><label>Số dòng <select value={pageSize} onChange={e=>onPageSize(Number(e.target.value))}>{[10,25,50].map(n=><option key={n}>{n}</option>)}</select></label><button className="sen-icon" disabled={page<=1} onClick={()=>onPage(page-1)} aria-label="Trang trước"><ChevronLeft size={18}/></button><strong>{page}/{totalPages}</strong><button className="sen-icon" disabled={page>=totalPages} onClick={()=>onPage(page+1)} aria-label="Trang sau"><ChevronRight size={18}/></button></div></div>
  </section>;
}
SensorList.propTypes={items:PropTypes.array.isRequired,selected:PropTypes.string,onSelect:PropTypes.func.isRequired,onEdit:PropTypes.func.isRequired,page:PropTypes.number.isRequired,pageSize:PropTypes.number.isRequired,onPage:PropTypes.func.isRequired,onPageSize:PropTypes.func.isRequired};

function LocationView({sensors,filtered,areas,filters,onSelect,onAdd,catalogAvailable}){
  const [closed,setClosed]=useState({});
  const groups=buildLocationGroups(sensors,filtered,areas,filters.area||"all",filters.row||"all");
  return <section className="sen-panel sen-location"><div className="sen-section-head"><div><h2><MapPin size={18}/> Sensor theo vị trí</h2><p>Phân cấp Khu → Dãy → Sensor. Vị trí có thể kế thừa Controller/RAS.</p></div></div>
    <div className="sen-location-summary"><span>{catalogAvailable?areas.length:"—"} khu trong danh mục</span><span>{sensors.filter(s=>s.farmingAreaId).length} Sensor đã gán khu</span><span>{sensors.filter(s=>!s.farmingAreaId).length} chưa gán khu</span></div>
    {groups.map(g=><article className="sen-area" key={g.id}><header><button type="button" aria-expanded={!closed[g.id]} onClick={()=>setClosed(o=>({...o,[g.id]:!o[g.id]}))}><MapPin size={17}/>{g.id==="none"?"Sensor chưa gán khu":g.name}<span>{g.all.length} Sensor</span><small>{closed[g.id]?"+":"−"}</small></button>{g.canAssign&&<button type="button" className="sen-icon" title="Thêm Sensor vào khu" aria-label={"Thêm vào "+g.name} onClick={()=>onAdd({initialArea:g.id})}><Plus size={18}/></button>}</header>
    {!closed[g.id]&&<div className="sen-area-body">{g.rows.length?g.rows.map(row=><div className="sen-row-group" key={row.id}><div className="sen-section-head"><h3>{row.name} <small>({row.all.length})</small></h3>{g.canAssign&&row.canAssign&&<button type="button" className="sen-icon" aria-label={"Thêm Sensor vào "+row.name} onClick={()=>onAdd({initialArea:g.id,initialRow:row.id==="none"?"":row.id})}><Plus size={17}/></button>}</div>{row.items.length?<div className="sen-location-cards">{row.items.map(s=><button type="button" key={s.id} className="sen-location-card" onClick={()=>onSelect(s.id)}><div><Activity size={19}/><strong>{s.sensorCode}</strong><Status sensor={s}/></div><span>{s.name||s.sensorType}</span><strong>{sensorValue(s)}</strong><small>{s.controllerCode||"Chưa liên kết"} · {s.portCode||"Chưa gán port"}</small></button>)}</div>:<p className="sen-muted">{row.all.length?"Không có Sensor phù hợp bộ lọc.":"Chưa có Sensor trong dãy."}</p>}</div>):<p className="sen-muted">{g.all.length?"Không có Sensor phù hợp bộ lọc.":"Chưa có Sensor trong khu."}</p>}</div>}</article>)}
  </section>;
}
LocationView.propTypes={sensors:PropTypes.array.isRequired,filtered:PropTypes.array.isRequired,areas:PropTypes.array.isRequired,filters:PropTypes.object.isRequired,onSelect:PropTypes.func.isRequired,onAdd:PropTypes.func.isRequired,catalogAvailable:PropTypes.bool.isRequired};

function Discovery({devices,onClose,onRegister}){
  const [device,setDevice]=useState(""),[revision,refresh]=useState(0);
  const data=useSensorData(signal=>api.getDiscoveredSensors(device,signal),[device,revision]);
  return <SensorDialog title="Port Sensor được phát hiện" onClose={onClose}><div className="sen-form"><p className="sen-note">Danh sách port input/bus do Controller khai báo. Không phải tất cả port đều đã kết nối cảm biến thực tế. Một bus có thể đăng ký nhiều thông số.</p><div className="sen-inline-form"><Field label="Controller"><select value={device} onChange={e=>setDevice(e.target.value)}><option value="">Tất cả Controller</option>{devices.filter(d=>deviceKind(d)==="controller").map(d=><option key={d.id} value={d.id}>{d.deviceCode}</option>)}</select></Field><button type="button" className="system-secondary-button sen-btn" onClick={()=>refresh(n=>n+1)}><RefreshCw size={16}/> Làm mới</button></div><SensorState state={data} onRetry={()=>refresh(n=>n+1)}><SensorTable rows={data.data||[]} columns={[{key:"deviceCode",label:"Controller"},{key:"portCode",label:"Port"},{key:"portType",label:"Loại"},{key:"gpio",label:"GPIO"},{key:"sensorCode",label:"Mã khai báo"},{key:"registered",label:"Đăng ký",render:p=>p.registered?"Bus dùng chung":"Chưa đăng ký"},{key:"action",label:"Thao tác",render:p=><button className="system-secondary-button" type="button" onClick={()=>onRegister(p)}>Đăng ký</button>}]} empty="Không có port chưa đăng ký hoặc bus hiện diện."/></SensorState></div></SensorDialog>;
}
Discovery.propTypes={devices:PropTypes.array.isRequired,onClose:PropTypes.func.isRequired,onRegister:PropTypes.func.isRequired};

function Detail({sensor,onClose,onEdit,onBinding,onNavigate,onChanged}){
  const [rev,refresh]=useState(0),[busy,setBusy]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState(""),[confirm,setConfirm]=useState("");
  const lock=useRef(false);
  const detail=useSensorData(signal=>api.getSensorInventoryDetail(sensor.id,signal),[sensor.id,rev]);
  const health=useSensorData(signal=>api.getSensorHealth(sensor.id,signal),[sensor.id,rev]);
  const tests=useSensorData(signal=>api.getSensorTests(sensor.id,signal),[sensor.id,rev]);
  const [running,setRunning]=useState(null),[pollError,setPollError]=useState("");
  const data=detail.data||sensor;
  useEffect(()=>{if(tests.data){setRunning(tests.data.find(t=>t.status==="Pending")||null);}},[tests.data]);
  useEffect(()=>{
    if(!running?.id||running.status!=="Pending")return;
    const ctl=new AbortController();let timer;
    const poll=async()=>{
      try{const result=await api.getSensorTest(sensor.id,running.id,ctl.signal);if(ctl.signal.aborted)return;setRunning(result);setPollError("");if(result.status!=="Pending"){refresh(n=>n+1);return;}}
      catch(e){if(ctl.signal.aborted)return;setPollError(e.message||"Không cập nhật được kết quả test.");}
      if(!ctl.signal.aborted)timer=setTimeout(poll,3000);
    };timer=setTimeout(poll,3000);
    return()=>{ctl.abort();clearTimeout(timer);};
  },[sensor.id,running?.id,running?.status]);
  const act=async action=>{
    if(lock.current)return;lock.current=true;setBusy(action);setError("");setNotice("");
    try{
      if(action==="test"){const run=await api.requestSensorTest(sensor.id);setRunning(run);setNotice("Đã tạo yêu cầu kiểm tra; chờ Controller đọc Sensor và phản hồi.");}
      else if(action==="delete"){await api.deleteSensor(sensor.id);onChanged("Đã xóa Sensor.",true);return;}
      else{await (action==="disable"?api.disableSensor(sensor.id):api.enableSensor(sensor.id));onChanged(action==="disable"?"Đã ngừng sử dụng Sensor.":"Đã kích hoạt Sensor; chờ dữ liệu mới.");}
      setConfirm("");refresh(n=>n+1);
    }catch(e){setError(e.message||"Thao tác thất bại.");}finally{lock.current=false;setBusy("");}
  };
  const testRows=running?[running,...(tests.data||[]).filter(t=>t.id!==running.id)]:tests.data||[];
  return <aside className="sen-detail"><header><div><h2>Chi tiết Sensor</h2><p>{data.sensorCode} · {data.name||data.sensorType}</p></div><button type="button" className="sen-icon" disabled={Boolean(busy)} onClick={onClose} aria-label="Đóng chi tiết"><X size={20}/></button></header><div className="sen-detail-body">
    <div className="sen-reading"><Activity size={30}/><div><small>Giá trị mới nhất</small><strong>{sensorValue(data)}</strong><span>{dateLabel(data.latestMeasuredAt)}</span></div><Status sensor={data}/></div>
    {detail.error&&<p role="alert" className="sen-error">Chi tiết: {detail.error}</p>}
    <div className="sen-facts"><dt>Loại / đơn vị</dt><dd>{data.sensorType} / {shown(data.unit)}</dd><dt>Vị trí</dt><dd>{place(data)}</dd><dt>Lắp đặt</dt><dd>{shown(data.installationLocation)}</dd><dt>Controller</dt><dd>{shown(data.controllerCode)}</dd><dt>Port</dt><dd>{shown(data.portCode)} · {shown(data.portType)}</dd><dt>GPIO</dt><dd>{[data.gpio,data.secondaryGpio].filter(v=>v!=null).join(" / ")||"—"}</dd>{data.busPortId&&<><dt>Bus / register</dt><dd>{shown(data.busAddress)} / {shown(data.busRegister)}</dd></>}<dt>Nguồn dữ liệu</dt><dd>{shown(data.sourceType)}</dd><dt>Chất lượng</dt><dd>{QUALITY[data.dataQuality]||"Chưa xác định"}</dd><dt>Nhận lần cuối</dt><dd>{dateLabel(data.lastReceivedAt)}</dd><dt>Hiệu chuẩn</dt><dd>{({Passed:"Đạt",Failed:"Không đạt"})[data.calibrationStatus]||"Chưa xác định"} · {dateLabel(data.lastCalibratedAt)}</dd></div>
    <h3>Chẩn đoán kết nối</h3><SensorState state={health} onRetry={()=>refresh(n=>n+1)}>{health.data&&<div className="sen-facts"><dt>Controller</dt><dd>{shown(health.data.controllerStatus)}</dd><dt>Port hiện diện</dt><dd>{health.data.portPresent==null?"Chưa gán":health.data.portPresent?"Có":"Không"}</dd><dt>Port hiện hành</dt><dd>{health.data.portPresent==null?"—":health.data.portCurrent?"Đúng phiên bản":"Không hợp lệ"}</dd><dt>Timeout</dt><dd>{shown(health.data.timeoutSeconds)} giây</dd><dt>Sensor phản hồi</dt><dd>{dateLabel(health.data.lastSeenAt)}</dd></div>}</SensorState>
    <p className="sen-note">Health dựa trên telemetry đã nhận, không chứng minh cảm biến đang đọc trực tiếp lúc này.</p>
    {error&&<p role="alert" className="sen-error">{error}</p>}{notice&&<p role="status" className="sen-notice">{notice}</p>}
    <div className="sen-detail-buttons"><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)||!data.isActive||!data.deviceId||running?.status==="Pending"} onClick={()=>act("test")}><FlaskConical size={16}/>{busy==="test"?"Đang gửi…":"Kiểm tra Sensor"}</button><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)} onClick={()=>refresh(n=>n+1)}><RefreshCw size={15}/> Làm mới</button></div>
    <h3>Lịch sử kiểm tra</h3>{pollError&&<p className="sen-error">{pollError}</p>}
    {running?.status==="Pending"&&<p role="status" className="sen-note"><Clock size={15}/> Chờ Controller Edge V2 đến {dateLabel(running.expiresAt)}. Không có kết quả giả.</p>}
    {tests.error&&<p className="sen-error">{tests.error}</p>}
    {testRows.length?<div className="sen-test-list">{testRows.slice(0,5).map(t=><article key={t.id}><strong>{TEST_STATES[t.status]||t.status}</strong><small>{dateLabel(t.createdAt)}</small><span>{t.value!=null?numberLabel(t.value)+" "+(t.unit||""):"Chưa có giá trị"}{t.resultMessage?" · "+t.resultMessage:""}</span></article>)}</div>:<p className="sen-muted">{tests.loading?"Đang tải kiểm tra…":"Chưa có yêu cầu kiểm tra."}</p>}
    <div className="sen-detail-buttons"><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)} onClick={()=>onNavigate("history")}><ChartNoAxesCombined size={16}/> Lịch sử đo</button><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)} onClick={()=>onNavigate("config")}><Settings size={16}/> Cấu hình</button><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)} onClick={()=>onNavigate("events")}><AlertTriangle size={16}/> Cảnh báo</button></div>
    <div className="sen-detail-buttons"><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)} onClick={()=>onEdit(data)}><Pencil size={15}/> Chỉnh sửa</button><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)} onClick={()=>onBinding(data)}><Link2 size={16}/> Liên kết phần cứng</button></div>
    {confirm?<div className="sen-confirm"><strong>{confirm==="delete"?"Xóa Sensor?":confirm==="disable"?"Ngừng sử dụng Sensor?":"Kích hoạt Sensor?"}</strong><p>{confirm==="delete"?"BE sẽ từ chối nếu Sensor có dữ liệu, lịch sử hoặc liên kết phần cứng.":confirm==="disable"?"Sensor sẽ không được nhận dữ liệu mới hay tham gia tự động điều khiển. Không đồng nghĩa tắt nguồn phần cứng.":"Sensor sẽ chờ dữ liệu mới; không tự báo Online."}</p><div><button className="system-secondary-button" type="button" disabled={Boolean(busy)} onClick={()=>setConfirm("")}>Hủy</button><button className="sen-danger" type="button" disabled={Boolean(busy)} onClick={()=>act(confirm)}>{busy?"Đang xử lý…":"Xác nhận"}</button></div></div>:<div className="sen-detail-buttons"><button type="button" className="system-secondary-button sen-btn" disabled={Boolean(busy)} onClick={()=>setConfirm(data.isActive?"disable":"enable")}><Power size={16}/>{data.isActive?"Ngừng sử dụng":"Kích hoạt"}</button><button type="button" className="sen-danger sen-btn" disabled={Boolean(busy)} onClick={()=>setConfirm("delete")}><Trash2 size={16}/> Xóa</button></div>}
  </div></aside>;
}
Detail.propTypes={sensor:PropTypes.object.isRequired,onClose:PropTypes.func.isRequired,onEdit:PropTypes.func.isRequired,onBinding:PropTypes.func.isRequired,onNavigate:PropTypes.func.isRequired,onChanged:PropTypes.func.isRequired};

export default function SensorManagement(){
  const [sensors,setSensors]=useState([]),[summary,setSummary]=useState(null),[areas,setAreas]=useState([]),[devices,setDevices]=useState([]),[types,setTypes]=useState([]);
  const [catalogAvailable,setCatalogAvailable]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(""),[auxError,setAuxError]=useState(""),[notice,setNotice]=useState(""),[revision,refresh]=useState(0);
  const [tab,setTab]=useState("list"),[filters,setFilters]=useState(EMPTY_FILTER),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(10),[selected,setSelected]=useState(""),[modal,setModal]=useState(null);
  useEffect(()=>{
    const ctl=new AbortController();setLoading(true);setError("");setAuxError("");
    Promise.allSettled([api.getSensorInventory({},ctl.signal),api.getSensorSummary(ctl.signal),api.getDeviceLocations(),api.getDevices(),api.getSensorTypes(ctl.signal)]).then(([inventory,sum,loc,dev,typ])=>{
      if(ctl.signal.aborted)return;
      if(inventory.status==="fulfilled"){setSensors(inventory.value);setSelected(old=>inventory.value.some(s=>s.id===old)?old:"");}
      else setError(inventory.reason?.message||"Không tải được danh sách Sensor.");
      setSummary(sum.status==="fulfilled"?sum.value:null);
      if(loc.status==="fulfilled"){setAreas(loc.value);setCatalogAvailable(true);}else{setAreas([]);setCatalogAvailable(false);}
      if(dev.status==="fulfilled")setDevices(dev.value);else setDevices([]);
      if(typ.status==="fulfilled")setTypes(typ.value);else setTypes([]);
      const failures=[["thống kê",sum],["khu/dãy",loc],["thiết bị",dev],["loại Sensor",typ]].filter(([,v])=>v.status==="rejected").map(([label])=>label);
      setAuxError(failures.length?"Không tải được "+failures.join(", ")+". Dữ liệu Sensor vẫn hiển thị; làm mới để thử lại.":"");
    }).finally(()=>{if(!ctl.signal.aborted)setLoading(false);});
    return()=>ctl.abort();
  },[revision]);
  const filtered=useMemo(()=>filterSensors(sensors,filters),[sensors,filters]);
  const visiblePage=Math.min(page,Math.max(1,Math.ceil(filtered.length/pageSize)));
  const active=sensors.find(s=>s.id===selected);
  const update=(key,val)=>{setFilters(old=>({...old,[key]:val,...(key==="area"?{row:""}:{})}));setPage(1);};
  const openAdd=(opts={})=>setModal({kind:"form",...opts});
  const changed=(message,deleted=false)=>{setNotice(message||"Đã cập nhật dữ liệu.");if(deleted)setSelected("");refresh(n=>n+1);};
  const saved=message=>{setModal(null);changed(message);};
  const typeOptions=[...new Set([...types.map(t=>t.sensorType),...sensors.map(s=>s.sensorType)])].sort();
  const rows=filters.area==="none"?[]:filters.area?areas.find(a=>a.id===filters.area)?.rows||[]:areas.flatMap(a=>a.rows||[]);
  const isBrowse=tab==="list"||tab==="location";
  const kpis=[["total","Tổng Sensor",Activity,""],["online","Đang hoạt động",Wifi,"Online"],["offline","Mất kết nối",WifiOff,"Offline"],["error","Lỗi đọc",AlertTriangle,"Error"],["disabled","Ngừng sử dụng",Power,"Disabled"],["unknown","Chờ dữ liệu",HelpCircle,"Unknown"]];
  const exportList=()=>downloadCsv([["Mã Sensor","Tên","Loại","Đơn vị","Khu","Dãy","Controller","Port","Giá trị mới nhất","Thời điểm đo","Trạng thái","Chất lượng"],...filtered.map(s=>[s.sensorCode,s.name,s.sensorType,s.unit,s.areaName,s.rowName,s.controllerCode,s.portCode,s.latestValue,dateLabel(s.latestMeasuredAt),STATES[statusOf(s)],QUALITY[s.dataQuality]||"Chưa xác định"])],"crabsense-sensors.csv");
  return <SystemPage title="Quản lý Sensor" description="Quản lý cảm biến, liên kết Controller, theo dõi dữ liệu và tình trạng kỹ thuật." actions={<><button className="system-secondary-button sen-btn" type="button" disabled={loading} onClick={()=>refresh(n=>n+1)}><RefreshCw size={16} className={loading?"animate-spin":""}/> Làm mới</button><button className="system-primary-button sen-btn" type="button" disabled={loading||Boolean(error)} onClick={()=>openAdd()}><Plus size={18}/> Thêm Sensor</button></>}>
    <div className="sensor-workspace">
      {notice&&<p role="status" className="sen-notice">{notice}</p>}
      {auxError&&<p role="alert" className="sen-note">{auxError}</p>}
      <div className="sen-kpis">{kpis.map(([key,label,Icon,status])=><button type="button" key={key} className={"sen-kpi "+key+(filters.status===status?" chosen":"")} disabled={loading||Boolean(error)} onClick={()=>{setTab("list");update("status",filters.status===status?"":status);}}><span className="sen-kpi-icon"><Icon size={22}/></span><span><small>{label}</small><strong>{loading||error||!summary?"—":summary[key]??"—"}</strong></span></button>)}</div>
      <div className="sen-meta"><span>Loại Sensor: <strong>{summary?.types??"—"}</strong></span><span>Thống kê toàn hệ thống · không suy đoán trạng thái từ giá trị nước</span></div>
      <nav className="sen-tabs" aria-label="Chế độ quản lý Sensor">{TABS.map(([id,label,Icon])=><button type="button" key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}><Icon size={17}/>{label}</button>)}</nav>
      <SystemState loading={loading&&!sensors.length} error={error} onRetry={()=>refresh(n=>n+1)}>
        {isBrowse?<><section className="sen-panel sen-filter"><div className="sen-section-head"><h2>Bộ lọc thiết bị</h2><div className="sen-actions"><button className="system-secondary-button sen-btn" type="button" onClick={()=>setModal({kind:"discovery"})}><Cpu size={16}/> Port phát hiện</button><button className="system-secondary-button sen-btn" type="button" disabled={!filtered.length} onClick={exportList}><Download size={16}/> Xuất CSV</button></div></div><div className="sen-filter-grid">
          <Field label="Tìm kiếm"><div className="sen-search"><Search size={16}/><input placeholder="Mã, tên, Controller, port…" value={filters.search} onChange={e=>update("search",e.target.value)}/></div></Field>
          <Field label="Loại Sensor"><select value={filters.type} onChange={e=>update("type",e.target.value)}><option value="">Tất cả loại</option>{typeOptions.map(t=><option key={t}>{t}</option>)}</select></Field>
          <Field label="Khu nuôi"><select value={filters.area} onChange={e=>update("area",e.target.value)}><option value="">Tất cả khu</option><option value="none">Chưa gán khu</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name||a.code}</option>)}</select></Field>
          <Field label="Dãy nuôi"><select value={filters.row} onChange={e=>update("row",e.target.value)}><option value="">Tất cả dãy</option><option value="none">Chưa gán dãy</option>{rows.map(r=><option key={r.id} value={r.id}>{r.name||r.code}</option>)}</select></Field>
          <Field label="Controller"><select value={filters.device} onChange={e=>update("device",e.target.value)}><option value="">Tất cả thiết bị</option><option value="none">Chưa liên kết</option>{devices.map(d=><option key={d.id} value={d.id}>{d.deviceCode}</option>)}</select></Field>
          <Field label="Trạng thái"><select value={filters.status} onChange={e=>update("status",e.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(STATES).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></Field>
          <button type="button" className="system-secondary-button" onClick={()=>{setFilters(EMPTY_FILTER);setPage(1);}}>Đặt lại</button>
        </div></section>
        <div className="sen-layout">{tab==="list"?<SensorList items={filtered} selected={selected} onSelect={setSelected} onEdit={s=>setModal({kind:"form",sensor:s})} page={visiblePage} pageSize={pageSize} onPage={setPage} onPageSize={n=>{setPageSize(n);setPage(1);}}/>:<LocationView sensors={sensors} filtered={filtered} areas={areas} filters={filters} onSelect={setSelected} onAdd={openAdd} catalogAvailable={catalogAvailable}/>}
          {active&&<Detail key={active.id+":"+revision} sensor={active} onClose={()=>setSelected("")} onEdit={s=>setModal({kind:"form",sensor:s})} onBinding={s=>setModal({kind:"binding",sensor:s})} onNavigate={setTab} onChanged={changed}/>}
        </div></>:<><section className="sen-panel sen-selector"><Field label="Chọn Sensor"><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Chọn cảm biến để xem</option>{sensors.map(s=><option key={s.id} value={s.id}>{s.sensorCode} · {s.name||s.sensorType} · {place(s)}</option>)}</select></Field>{active&&<Status sensor={active}/>}</section>
        {!active?<div className="sen-panel sen-empty"><Activity size={28}/><strong>Chọn một Sensor để xem dữ liệu</strong><p>Không hiển thị dữ liệu giả hoặc gộp các đơn vị đo khác nhau.</p></div>:tab==="history"?<SensorHistory key={active.id} sensor={active}/>:tab==="events"?<SensorEvents key={active.id} sensor={active}/>:<SensorConfiguration key={active.id} sensor={active} onChanged={()=>changed("Đã lưu thông tin kỹ thuật.")}/>}</>}
      </SystemState>
      {modal?.kind==="form"&&<SensorForm {...modal} areas={areas} devices={devices} types={types} onClose={()=>setModal(null)} onSaved={saved}/>}
      {modal?.kind==="binding"&&<BindingForm sensor={modal.sensor} devices={devices} onClose={()=>setModal(null)} onSaved={saved}/>}
      {modal?.kind==="discovery"&&<Discovery devices={devices} onClose={()=>setModal(null)} onRegister={p=>{const d=devices.find(d=>d.id===p.deviceId);openAdd({initialPort:p,initialArea:d?.farmingAreaId||"",initialRow:d?.farmingRowId||""});}}/>}
    </div>
  </SystemPage>;
}
