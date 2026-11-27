import fetchAPI from "./api";
import { areaPath,batchPath,unwrap,analytes } from "./waterBenchModel";
const read=async(path,signal)=>unwrap(await fetchAPI(path,{signal,cache:"no-store"}));
const write=async(path,method,payload)=>unwrap(await fetchAPI(path,{method,...(payload===undefined?{}:{body:JSON.stringify(payload)})}));
const colorPath=area=>areaPath(area).replace(/water-bench$/,"water-analysis/color")+"/calibrations";
const resultPath=(area,batch,analyte)=>{
  if(!analytes.includes(analyte))throw new Error("Invalid analyte");
  return batchPath(area,batch)+"/results/"+analyte;
};
const waterBenchService={
  adminMedia:(area,camera,skip=0,signal)=>read(areaPath(area)+"/admin-media?"+new URLSearchParams({skip:String(skip),take:"50",...(camera?{cameraId:camera}:{})}),signal),
  image:(id,signal)=>fetchAPI("/media/"+encodeURIComponent(id)+"/content",{signal,cache:"no-store"},{responseType:"image",maxBytes:5*1024*1024}),
  salinity:(area,batch,signal)=>read(resultPath(area,batch,"NH3")+"/salinity-candidates",signal),
  retryRequest:(area,batch,a)=>read(resultPath(area,batch,a)+"/retry-request"),
  review:(area,batch,a,signal)=>read(resultPath(area,batch,a)+"/review",signal),
  submitReview:(area,batch,a,p)=>write(resultPath(area,batch,a)+"/review","POST",p),
  publish:(area,batch,a,p)=>write(resultPath(area,batch,a)+"/publish","POST",p),
  kiosks:(area,signal)=>{areaPath(area);return read("/kiosks?farmingAreaId="+area,signal);},
  calibrations:(area,signal)=>read(colorPath(area),signal),
  register:(area,payload)=>write(areaPath(area)+"/station","POST",payload),
  configure:(area,payload)=>write(areaPath(area)+"/configuration","PUT",payload),
  revokeStation:async(area,station)=>{
    const r=await fetchAPI(areaPath(area)+"/station/"+encodeURIComponent(station)+"/revoke",{method:"POST"});
    if(r?.success!==true)throw new Error(r?.message||"Revoke failed");return r;
  },
  createCalibration:(area,payload)=>write(colorPath(area),"POST",payload),
  revokeCalibration:async(area,id)=>{
    const response=await fetchAPI(colorPath(area)+"/"+encodeURIComponent(id)+"/revoke",{method:"POST"});
    if(response?.success!==true)throw new Error(response?.message||"Calibration revoke failed");
    return response;
  },
  checks:(area,id,signal)=>read(colorPath(area)+"/"+encodeURIComponent(id)+"/checks",signal),
  check:(area,id,payload)=>write(colorPath(area)+"/"+encodeURIComponent(id)+"/checks","POST",payload),
  assess:(area,batch,analyte,payload)=>write(resultPath(area,batch,analyte)+"/assessment","POST",payload),
  assessBatch:(area,batch,samples)=>write(batchPath(area,batch)+"/results/batch-assessment","POST",{samples}),
  assessAmmonia:(area,batch,payload)=>write(resultPath(area,batch,"NH3")+"/ammonia-reference","POST",payload),
  station:(area,signal)=>read(areaPath(area)+"/station",signal),
  batches:(area,signal)=>read(areaPath(area)+"/batches",signal),
  detail:(area,batch,signal)=>read(batchPath(area,batch),signal),
  results:(area,batch,signal)=>read(batchPath(area,batch)+"/results",signal),
  readiness:(area,batch,signal)=>read(batchPath(area,batch)+"/results/ai-readiness",signal),
  retry:(area,batch,signal)=>read(batchPath(area,batch)+"/results/retry-status",signal),
  receipts:(area,batch,signal)=>read(batchPath(area,batch)+"/receipts",signal),
  evidence:(area,batch,analyte,signal)=>{
    if(!analytes.includes(analyte))throw new Error("Invalid analyte");
    return read(batchPath(area,batch)+"/results/"+analyte+"/evidence",signal);
  },
  ammonia:(area,batch,signal)=>read(batchPath(area,batch)+"/results/NH3/ammonia-reference",signal),
};
export default waterBenchService;
