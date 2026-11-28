import test from "node:test";
import assert from "node:assert/strict";
import {areaPath,batchPath,unwrap,channels,verifySnapshot,verifyReview} from "../src/services/waterBenchModel.js";
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
