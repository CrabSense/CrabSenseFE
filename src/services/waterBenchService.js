import fetchAPI from "./api";
import { areaPath,batchPath,unwrap,analytes } from "./waterBenchModel";
const read=async(path,signal)=>unwrap(await fetchAPI(path,{signal,cache:"no-store"}));
const waterBenchService={
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
