export const EMPTY_ID="00000000-0000-0000-0000-000000000000";
export const STATES={Online:"Online",Offline:"Mất kết nối",Disabled:"Ngừng sử dụng",Error:"Lỗi đọc",Unknown:"Chờ dữ liệu"};
export const QUALITY={Realtime:"Realtime",Backfill:"Dữ liệu gửi bù",Unknown:"Chưa xác định"};
export const TEST_STATES={Pending:"Chờ Controller",Succeeded:"Thành công (Controller báo)",Failed:"Thất bại",Expired:"Hết hạn",Cancelled:"Đã hủy"};
export const BUS_TYPES=["I2C","RS485","UART"];
export const isBus=p=>BUS_TYPES.includes(p?.portType);
export const statusOf=s=>Object.hasOwn(STATES,s?.status)?s.status:"Unknown";
export const shown=v=>v==null||v===""?"—":String(v);
export const numberLabel=v=>v==null||v===""||!Number.isFinite(Number(v))?"—":Number(v).toLocaleString("vi-VN",{maximumFractionDigits:6});
export const sensorValue=s=>s?.latestValue==null?"—":numberLabel(s.latestValue)+(s.unit?" "+s.unit:"");
export const place=s=>[s.areaName,s.rowName].filter(Boolean).join(" / ")||"Chưa gán khu/dãy";
export const dateLabel=v=>{if(!v)return "—";const d=new Date(v);return Number.isNaN(d.getTime())?"—":d.toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"});};
export const dayVN=(date=new Date())=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
export function dateRange(from,to){
  if(!from||!to||from>to)throw new Error("Chọn khoảng ngày hợp lệ.");
  const end=new Date(to+"T00:00:00Z");end.setUTCDate(end.getUTCDate()+1);
  const start=new Date(from+"T00:00:00Z");
  if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime()))throw new Error("Ngày không hợp lệ.");
  const days=(end-start)/86400000;
  if(days>31)throw new Error("Khoảng biểu đồ tối đa 31 ngày.");
  return {from:from+"T00:00:00+07:00",to:end.toISOString().slice(0,10)+"T00:00:00+07:00",bucketMinutes:days>7?60:days>1?30:15};
}
export function filterSensors(sensors,f){
  const key=(f.search||"").trim().toLowerCase();
  return sensors.filter(s=>(!key||[s.sensorCode,s.name,s.sensorType,s.controllerCode,s.portCode,s.areaName,s.rowName].some(v=>String(v||"").toLowerCase().includes(key)))
    &&(!f.status||statusOf(s)===f.status)&&(!f.type||s.sensorType===f.type)&&(!f.device|| (f.device==="none"?!s.deviceId:s.deviceId===f.device))
    &&(!f.area||(f.area==="none"?!s.farmingAreaId:s.farmingAreaId===f.area))
    &&(!f.row||(f.row==="none"?!s.farmingRowId:s.farmingRowId===f.row)));
}
export function bindingPayload(deviceId,port,address,register){
  if(port&&!deviceId)throw new Error("Chọn Controller.");
  if(port&&port.deviceId!==deviceId)throw new Error("Port không thuộc Controller đã chọn.");
  if(isBus(port)&&(!address?.trim()||!register?.trim()))throw new Error("Nhập địa chỉ bus và register/thông số.");
  return {deviceId:deviceId||null,portId:port?.id||null,busAddress:isBus(port)?address.trim():null,busRegister:isBus(port)?register.trim():null};
}
export function configPayload(interval,timeout,version){
  const a=Number(interval),b=Number(timeout);
  if(!interval||!timeout||!Number.isInteger(a)||!Number.isInteger(b)||a<1||a>86400||b<a||b>604800||!Number.isInteger(version))throw new Error("Chu kỳ 1–86400 giây; timeout phải ≥ chu kỳ và ≤ 604800 giây.");
  return {samplingIntervalSeconds:a,disconnectTimeoutSeconds:b,expectedVersion:version};
}
export function csvCell(value){const s=String(value??"");return '"'+(/^[\s]*[=+@-]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}
export function downloadCsv(rows,name){const url=URL.createObjectURL(new Blob(["\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
