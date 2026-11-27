const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hex = /^[0-9a-f]{16}$/;
export const analytes = ["NO2","NO3","NH3"];
export function areaPath(areaId) {
  if (!guid.test(areaId ?? "")) throw new Error("Invalid area identity");
  return "/areas/"+areaId+"/water-bench";
}
export function batchPath(areaId,batch) {
  if (!guid.test(batch?.stationId ?? "") || !hex.test(batch?.bootId ?? "") || !hex.test(batch?.firmwareBatchId ?? "")) throw new Error("Invalid batch identity");
  return areaPath(areaId)+"/batches/"+batch.stationId+"/"+batch.bootId+"/"+batch.firmwareBatchId;
}
export function batchKey(batch) {
  return [batch.stationId,batch.bootId,batch.firmwareBatchId].join(":");
}
export function unwrap(response) {
  if (response?.success !== true || !Object.hasOwn(response,"data")) throw new Error(response?.message || "Invalid API response");
  return response.data;
}
export function channels(results,readiness,retry) {
  const find = (rows,a) => (Array.isArray(rows?.channels)?rows.channels:[]).find(x=>x.analyte===a);
  return analytes.map(analyte=>{
    const result=find(results,analyte), ready=find(readiness,analyte), attempt=find(retry,analyte);
    const a=result?.assessment;
    const unitOk=analyte==="NH3"?["mg/L NH3","mg/L NH4","mg/L TAN-N"].includes(a?.unit):a?.unit==="mg/L "+analyte;
    const estimate=a?.status==="estimate_review_required" && unitOk && typeof a.estimatedValue==="number" && Number.isFinite(a.estimatedValue) && a.estimatedValue>=0;
    return {analyte,resultStatus:result?.status??null,readiness:ready?.status??null,retryStatus:attempt?.status??null,
      attempts:Number.isInteger(attempt?.attempts)?attempt.attempts:null,maxAttempts:attempt?.maxAttempts??null,
      assessmentId:a?.id??null,estimate:estimate?a.estimatedValue:null,unit:estimate?a.unit:null,
      holdoutError:estimate&&typeof a.holdoutError==="number"?a.holdoutError:null};
  });
}
