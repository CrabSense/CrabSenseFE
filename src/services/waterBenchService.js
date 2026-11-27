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
  kiosks:(area,signal)=>{areaPath(area);return read("/kiosks?farmingAreaId="+area,signal);},
  calibrations:(area,signal)=>read(colorPath(area),signal),
  register:(area,payload)=>write(areaPath(area)+"/station","POST",payload),
  configure:(area,payload)=>write(areaPath(area)+"/configuration","PUT",payload),
  revokeStation:(area,station)=>write(areaPath(area)+"/station/"+encodeURIComponent(station)+"/revoke","POST"),
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
