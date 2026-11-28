import test from "node:test";
import assert from "node:assert/strict";
import {areaPath,batchPath,unwrap,channels,verifySnapshot,verifyReview,verifyEstimate,verifyEstimates} from "../src/services/waterBenchModel.js";
import {canUseWeb,FARM_PORTAL_ROLES} from "../src/constants/roles.js";
const area="11111111-1111-1111-1111-111111111111";
const batch={stationId:area,bootId:"0123456789abcdef",firmwareBatchId:"abcdef0123456789"};
test("only scoped, validated API paths",()=>{
  assert.equal(batchPath(area,batch),areaPath(area)+"/batches/"+area+"/0123456789abcdef/abcdef0123456789");
  assert.throws(()=>areaPath("../system"));
  assert.throws(()=>batchPath(area,{...batch,bootId:"../other"}));
  assert.throws(()=>unwrap({success:false}));
  assert.equal(unwrap({success:true,data:null}),null);
});
test("missing is not zero; NH3 basis preserved; retest never numeric",()=>{
  const c=channels({channels:[{analyte:"NO2",assessment:{status:"estimate_review_required",estimatedValue:0,unit:"mg/L NO2"}},
    {analyte:"NO3",assessment:{status:"needs_retest",estimatedValue:1,unit:"mg/L NO3"}},
    {analyte:"NH3",assessment:{status:"estimate_review_required",estimatedValue:2,unit:"mg/L TAN-N"}}]},null,null);
  assert.equal(c[0].estimate,0);assert.equal(c[1].estimate,null);assert.equal(c[2].unit,"mg/L TAN-N");
  assert.equal(channels(null,null,null)[0].estimate,null);
  assert.equal(channels({channels:[{analyte:"NH3",assessment:{status:"estimate_review_required",estimatedValue:1,unit:"mg/L"}}]},null,null)[2].estimate,null);
});
test("web admins only",()=>{
  assert.deepEqual(FARM_PORTAL_ROLES,["FarmAdministrator"]);
  assert.equal(canUseWeb("SystemAdministrator"),true);
  assert.equal(canUseWeb("FarmManager"),false);
  assert.equal(canUseWeb("FarmStaff"),false);
});

test("snapshot rejects wrong identity, duplicate receipts and inconsistent counts",()=>{
  const timeline={stationId:area,bootId:batch.bootId,batchId:batch.firmwareBatchId,connectionId:area,status:"completed",channels:[]};
  const row={receiptId:area,eventId:area,connectionId:area,kind:"batch",evidenceKind:"batch_start",serverPayloadSha256:"a".repeat(64)};
  const receipts={...timeline,inventoryComplete:true,receiptBasis:"persisted_backend_evidence",timelineStatus:"completed",total:1,timelineCount:1,mediaCount:0,nh3Count:0,items:[row]};
  verifySnapshot(batch,timeline,receipts,[{channels:[]}]);
  assert.throws(()=>verifySnapshot(batch,timeline,{...receipts,batchId:batch.bootId},[]));
  assert.throws(()=>verifySnapshot(batch,timeline,{...receipts,total:2},[]));
  assert.throws(()=>verifySnapshot(batch,timeline,{...receipts,total:2,items:[row,row]},[]));
  assert.throws(()=>verifySnapshot(batch,timeline,receipts,[{channels:[{analyte:"NO2"},{analyte:"NO2"}]}]));
});
test("review cannot refer to another assessment or ammonia measurand",()=>{
  const review={assessmentId:area,status:"published",publicationScope:"water_bench_reviewed_record",productionSensorPublished:false,
    publication:{assessmentId:area,unit:"mg/L TAN-N",value:0,source:"operator_attested_independent_reference",productionSensorPublished:false}};
  assert.equal(verifyReview(review,area,"mg/L TAN-N").publication.value,0);
  assert.throws(()=>verifyReview(review,area,"mg/L NH3"));
  assert.throws(()=>verifyReview({...review,assessmentId:"other"},area,"mg/L TAN-N"));
});

const fixtureGuid=n=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
function estimateFixture(batch,analyte="NO2",unit="mg/L NO2"){
  const nh=analyte==="NH3",n=nh?100:50,hash=x=>x.repeat(64);
  const sessionId=nh?"n":"s",connectionId=fixtureGuid(42),captureId=nh?2:1;
  const session={receiptId:fixtureGuid(n),eventId:fixtureGuid(n+1),connectionId,sessionId,analyte,kind:"batch",evidenceKind:"session",serverPayloadSha256:hash("a")};
  const image={receiptId:fixtureGuid(n+2),eventId:fixtureGuid(n+3),connectionId,sessionId,analyte,kind:"media",evidenceKind:"jpeg",captureId,serverPayloadSha256:hash("b"),mediaId:fixtureGuid(n+4),sha256:hash("c"),privateMediaMetadataPresent:true};
  const assessment={id:fixtureGuid(nh?21:20),requestId:fixtureGuid(3),calibrationId:fixtureGuid(1),sessionEvidenceId:session.receiptId,imageEvidenceId:image.receiptId,mediaId:image.mediaId,status:"estimate_review_required",estimatedValue:1.2,unit,holdoutError:.1};
  const result={analyte,sessionId,captureId,status:"estimate_review_required",assessment};
  const evidence={assessmentId:assessment.id,requestId:assessment.requestId,status:assessment.status,candidateValue:assessment.estimatedValue,unit,holdoutError:assessment.holdoutError,chemicalResultValidated:false,productionPublished:false,session,image,calibration:{id:assessment.calibrationId},provenanceStatus:"snapshot_verified",provenanceSha256:hash("f"),provenance:{
    contract:"water-bench-ai-evidence-v1",assessmentId:assessment.id,requestId:assessment.requestId,requestSha256:hash("d"),
    stationId:batch.stationId,bootId:batch.bootId,batchId:batch.firmwareBatchId,analyte,connectionId,sessionId,captureId,
    sessionReceiptId:session.receiptId,imageReceiptId:image.receiptId,sessionPayloadSha256:session.serverPayloadSha256,imagePayloadSha256:image.serverPayloadSha256,imageSha256:image.sha256,mediaId:image.mediaId,calibrationId:assessment.calibrationId}};
  return {result,evidence,session,image};
}

test("estimate must match selected receipt and verified snapshot",()=>{
  const f=estimateFixture(batch), receipts={items:[f.session,f.image]};
  verifyEstimate(batch,"NO2",f.result,receipts,f.evidence);
  for(const patch of [{candidateValue:0},{provenanceStatus:"legacy_linkage_only"},{provenance:{...f.evidence.provenance,imageSha256:"bad"}}]){
    assert.throws(()=>verifyEstimate(batch,"NO2",f.result,receipts,{...f.evidence,...patch}));
  }
  assert.throws(()=>verifyEstimate(batch,"NO2",f.result,{items:[f.session,{...f.image,privateMediaMetadataPresent:false}]},f.evidence));
});
test("cancelled evidence load rejects late data and prevents follow-up",async()=>{
  const f=estimateFixture(batch), receipts={items:[f.session,f.image]},controller=new AbortController();
  let release,calls=0;
  const deferred=new Promise(resolve=>{release=resolve;});
  const pending=verifyEstimates(batch,{channels:[f.result]},receipts,()=>{calls++;return deferred;},controller.signal);
  controller.abort();release(f.evidence);
  await assert.rejects(pending,/cancelled/);
  await assert.rejects(verifyEstimates(batch,{channels:[f.result]},receipts,()=>{calls++;return deferred;},controller.signal),/cancelled/);
  assert.equal(calls,1);
});
