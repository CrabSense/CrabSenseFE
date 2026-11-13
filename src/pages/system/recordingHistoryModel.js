export const EMPTY_FILTERS={deviceId:"",farmingAreaId:"",farmingRowId:"",search:"",from:"",to:""};
export const PREVIEW_LIMIT=128*1024*1024;
export const DOWNLOAD_LIMIT=500*1024*1024;
export function recordingQuery(f,page,pageSize){
  if(f.from&&f.to&&f.from>f.to)throw new Error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
  const q={deviceId:f.deviceId,farmingAreaId:f.farmingAreaId,farmingRowId:f.farmingRowId,search:f.search.trim(),page,pageSize};
  if(f.from)q.from=f.from+"T00:00:00+07:00";
  if(f.to){const end=new Date(f.to+"T00:00:00Z");end.setUTCDate(end.getUTCDate()+1);q.to=end.toISOString().slice(0,10)+"T00:00:00+07:00";}
  return q;
}
export const recordingTime=value=>{if(!value)return "Chưa xác định";const d=new Date(value);return Number.isNaN(d.getTime())?"Chưa xác định":d.toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"});};
export const durationLabel=value=>{if(value==null||!Number.isFinite(Number(value))||Number(value)<0)return "Chưa xác định";const s=Math.floor(Number(value));return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(n=>String(n).padStart(2,"0")).join(":");};
export const modeLabel=value=>({Disabled:"Tắt",Continuous:"Liên tục",MotionDetection:"Chuyển động",AiEvent:"Sự kiện AI",Scheduled:"Theo lịch"})[value]||"Chưa xác định";
export const csvCell=value=>{const raw=String(value??"");return '"'+(/^[\s]*[=+@-]/.test(raw)?"'"+raw:raw).replaceAll('"','""')+'"';};
