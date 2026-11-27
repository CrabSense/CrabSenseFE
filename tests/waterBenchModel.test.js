import test from "node:test";
import assert from "node:assert/strict";
import {areaPath,batchPath,unwrap,channels} from "../src/services/waterBenchModel.js";
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
