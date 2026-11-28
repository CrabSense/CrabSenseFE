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

const digest=/^[0-9a-f]{64}$/;
const validId=v=>typeof v==="string"&&guid.test(v)&&v!=="00000000-0000-0000-0000-000000000000";
export function verifySnapshot(batch,timeline,receipts,channelSets){
  const matches=r=>r?.stationId===batch.stationId&&r?.bootId===batch.bootId&&r?.batchId===batch.firmwareBatchId;
  if(!matches(timeline)||!matches(receipts)||receipts.inventoryComplete!==true||
      receipts.receiptBasis!=="persisted_backend_evidence"||receipts.timelineStatus!==timeline.status||
      !validId(timeline.connectionId))throw new Error("WaterBench batch or receipt identity mismatch");
  const rows=receipts.items;
  if(!Array.isArray(rows)||rows.length<1||rows.length>517||receipts.total!==rows.length)
    throw new Error("Incomplete receipt inventory");
  const ids=new Set(),events=new Set(),media=new Set();
  for(const row of rows){
    if(!row||!validId(row.receiptId)||ids.has(row.receiptId)||!validId(row.eventId)||events.has(row.eventId)||
      row.connectionId!==timeline.connectionId||typeof row.serverPayloadSha256!=="string"||
      !digest.test(row.serverPayloadSha256)||!["batch","media","nh3"].includes(row.kind))
      throw new Error("Invalid or duplicate receipt");
    ids.add(row.receiptId);events.add(row.eventId);
    if(row.kind==="media"){
      if(!validId(row.mediaId)||media.has(row.mediaId)||typeof row.sha256!=="string"||!digest.test(row.sha256))
        throw new Error("Invalid media receipt");
      media.add(row.mediaId);
    }
  }
  if(!rows.some(r=>r.kind==="batch"&&r.evidenceKind==="batch_start")||
      receipts.timelineCount!==rows.filter(r=>r.kind==="batch").length||
      receipts.mediaCount!==media.size||media.size>3||
      receipts.nh3Count!==rows.filter(r=>r.kind==="nh3").length||receipts.nh3Count>2)
    throw new Error("Receipt counts disagree");
  for(const set of [timeline,...channelSets]){
    const rows=set?.channels;
    if(!Array.isArray(rows)||rows.some(r=>!analytes.includes(r?.analyte))||
      new Set(rows.map(r=>r.analyte)).size!==rows.length)throw new Error("Invalid or duplicate channels");
  }
}
export function verifyReview(value,assessmentId,unit){
  if(!validId(assessmentId)||value?.assessmentId!==assessmentId||
      value.publicationScope!=="water_bench_reviewed_record"||value.productionSensorPublished!==false||
      !["pending_review","approved","rejected","published"].includes(value.status))
    throw new Error("Review assessment identity mismatch");
  if(value.review&&(value.review.assessmentId!==assessmentId||
      (value.review.decision==="approved"&&value.review.referenceUnit!==unit)))
    throw new Error("Review measurand or identity mismatch");
  if(value.status==="published"){
    const p=value.publication;
    if(!p||p.assessmentId!==assessmentId||p.unit!==unit||
      p.source!=="operator_attested_independent_reference"||p.productionSensorPublished!==false||
      typeof p.value!=="number"||!Number.isFinite(p.value)||p.value<0)
      throw new Error("Invalid published reference");
  }
  return value;
}
