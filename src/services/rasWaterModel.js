// RAS water is an area reference, never an independently measured box value.
const guid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const explicitArea=id=>typeof id==="string" && guid.test(id) && id!=="00000000-0000-0000-0000-000000000000";
const specs={
  temperature:["Nhiệt độ",["°C"]],
  ph:["pH",["pH"]],
  do:["Oxy hòa tan",["mg/L"]],
  dissolvedoxygen:["Oxy hòa tan",["mg/L"]],
  dissolved_oxygen:["Oxy hòa tan",["mg/L"]],
  salinity:["Độ mặn",["ppt"]],
  tds:["TDS",["ppm","mg/L"]],
  flow:["Lưu lượng",["L/min"]],
  orp:["ORP",["mV"]],
};
const finite=v=>typeof v==="number" && Number.isFinite(v);
function utc(value,now){
  if(typeof value!=="string" || !/(?:Z|[+-]00:00)$/i.test(value))return null;
  const t=Date.parse(value);
  return Number.isFinite(t)&&t<=now+1000?t:null;
}
export function qualifiedAreaReadings(area,rows,now=Date.now()){
  if(!explicitArea(area)||!Array.isArray(rows))return [];
  const out=[];
  for(const r of rows){
    if(!r||r.farmingAreaId!==area||!explicitArea(r.sensorId)||r.isActive!==true||
        r.dataQuality!=="Realtime"||!finite(r.latestValue))continue;
    const kind=typeof r.sensorType==="string"?r.sensorType.toLowerCase():"";
    if(!Object.hasOwn(specs,kind))continue;
    const [label,units]=specs[kind];
    if(!units.includes(r.unit))continue;
    const measured=utc(r.latestMeasuredAt,now),received=utc(r.lastReceivedAt,now);
    if(measured===null||received===null||received<measured)continue;
    const lo=r.minThreshold,hi=r.maxThreshold;
    const valid=(lo==null||finite(lo))&&(hi==null||finite(hi))&&(lo==null||hi==null||lo<hi);
    out.push({id:r.sensorId,areaId:area,label,kind,code:typeof r.sensorCode==="string"&&r.sensorCode.trim()?r.sensorCode:r.sensorId,
      location:typeof r.locationName==="string"?r.locationName:null,
      value:r.latestValue,unit:r.unit,measuredAt:r.latestMeasuredAt,receivedAt:r.lastReceivedAt,
      measured,received,min:valid?lo??null:null,max:valid?hi??null:null,
      status:r.status,alarm:typeof r.alarm==="string"&&r.alarm.trim().length>0});
  }
  const counts=new Map();
  for(const r of out)counts.set(r.id,(counts.get(r.id)||0)+1);
  return out.filter(r=>counts.get(r.id)===1).sort((a,b)=>a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
}
export function readingAssessment(r,now=Date.now()){
  if(now-r.measured>300000||now-r.received>300000||r.measured>now+1000||r.received>now+1000)
    return "Dữ liệu cũ / chưa xác minh";
  if(r.status!=="Online")return "Chưa xác minh hiện trạng";
  if(r.alarm||(r.min!==null&&r.value<r.min)||(r.max!==null&&r.value>r.max))return "Cảnh báo từ cấu hình";
  if(r.min===null&&r.max===null)return "Chưa có ngưỡng cấu hình";
  return "Trong giới hạn cấu hình";
}
export function visibleAreaReadings(snapshot,{area,identity,online,visible,now=Date.now()}){
  if(!snapshot||!explicitArea(area)||!identity||!online||!visible||
    snapshot.area!==area||snapshot.identity!==identity||
    now<snapshot.verifiedAt||now-snapshot.verifiedAt>=15000)return [];
  return snapshot.readings;
}
