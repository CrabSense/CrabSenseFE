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

export function verifyEstimate(batch,analyte,result,receipts,evidence){
  const a=result?.assessment,p=evidence?.provenance,s=evidence?.session,i=evidence?.image;
  const hash=v=>typeof v==="string"&&digest.test(v);
  const number=v=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
  const unitOk=analyte==="NH3"?["mg/L NH3","mg/L NH4","mg/L TAN-N"].includes(a?.unit):a?.unit==="mg/L "+analyte;
  const match=(row,kind,id)=>{
    const rows=receipts.items.filter(r=>r.receiptId===id);
    return rows.length===1&&row?.kind===kind&&row.analyte===analyte&&
      ["receiptId","eventId","connectionId","sessionId","captureId","analyte","kind","evidenceKind","serverPayloadSha256","mediaId","sha256"]
        .every(k=>(rows[0][k]??null)===(row[k]??null))&&
      (kind!=="media"||rows[0].privateMediaMetadataPresent===true);
  };
  if(!a||!p||!s||!i||evidence.provenanceStatus!=="snapshot_verified"||!hash(evidence.provenanceSha256)||
      evidence.status!=="estimate_review_required"||evidence.chemicalResultValidated!==false||evidence.productionPublished!==false||
      !["id","requestId","calibrationId","sessionEvidenceId","imageEvidenceId","mediaId"].every(k=>validId(a[k]))||
      !number(a.estimatedValue)||!number(a.holdoutError)||!unitOk||
      evidence.assessmentId!==a.id||evidence.requestId!==a.requestId||evidence.candidateValue!==a.estimatedValue||
      evidence.unit!==a.unit||evidence.holdoutError!==a.holdoutError||p.contract!=="water-bench-ai-evidence-v1"||
      p.assessmentId!==a.id||p.requestId!==a.requestId||!hash(p.requestSha256)||
      p.stationId!==batch.stationId||p.bootId!==batch.bootId||p.batchId!==batch.firmwareBatchId||p.analyte!==analyte||
      p.connectionId!==s.connectionId||p.connectionId!==i.connectionId||p.sessionId!==s.sessionId||
      p.sessionId!==i.sessionId||p.sessionId!==result.sessionId||p.captureId!==i.captureId||p.captureId!==result.captureId||
      p.sessionReceiptId!==a.sessionEvidenceId||p.imageReceiptId!==a.imageEvidenceId||
      p.sessionPayloadSha256!==s.serverPayloadSha256||p.imagePayloadSha256!==i.serverPayloadSha256||
      p.imageSha256!==i.sha256||p.mediaId!==a.mediaId||p.mediaId!==i.mediaId||p.calibrationId!==a.calibrationId||
      evidence.calibration?.id!==a.calibrationId||!match(s,"batch",a.sessionEvidenceId)||
      s.evidenceKind!=="session"||!match(i,"media",a.imageEvidenceId))
    throw new Error("WaterBench estimate provenance mismatch or unavailable");
}
export async function verifyEstimates(batch,results,receipts,read,signal){
  const current=()=>{if(signal?.aborted)throw new Error("WaterBench load cancelled");};
  current();
  await Promise.all(results.channels.filter(r=>r.assessment?.status==="estimate_review_required").map(async r=>{
    current();
    const evidence=await read(r.analyte,signal);
    current();
    verifyEstimate(batch,r.analyte,r,receipts,evidence);
  }));
  current();
}
