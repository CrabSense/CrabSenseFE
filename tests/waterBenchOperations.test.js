import test from "node:test";
import assert from "node:assert/strict";
import {schedulePayload,estimatePayload,savedRequestMatches,reasonPayload,ammoniaPayload} from "../src/pages/waterBench/operationModel.js";
const g=n=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
test("schedule retains version and rejects overlap across midnight",()=>{
 const station={configurationVersion:7},form={enabled:true,times:"08:00, 19:00",grace:5,source:"RAS_RETURN",targets:{NO2:g(1),NO3:g(2),NH3:g(3)}};
 assert.equal(schedulePayload(station,form).expectedVersion,7);
 assert.throws(()=>schedulePayload(station,{...form,times:"23:59,00:01"}));
 assert.throws(()=>schedulePayload(station,{...form,targets:{NO2:g(1),NO3:g(1),NH3:g(3)}}));
});
test("estimate attestation and exact retry identity",()=>{
 const ready={status:"operator_confirmation_required",reactionSeconds:300,timingToleranceSeconds:20,minSalinityPpt:10,maxSalinityPpt:20,calibrationId:g(1),reagentLot:"L1"};
 const form={confirmed:true,reason:"observed",source:"RAS_RETURN",seconds:"300",salinity:"15"};
 const p=estimatePayload(ready,form,g(2));
 assert.equal(p.requestId,g(2));
 assert.throws(()=>estimatePayload(ready,{...form,confirmed:false},g(2)));
 assert.throws(()=>estimatePayload(ready,{...form,salinity:""},g(2)));
 assert.equal(savedRequestMatches(p,{status:"retry_available",requestId:g(2)}),true);
 assert.equal(savedRequestMatches(p,{status:"retry_available",requestId:g(3)}),false);
 assert.deepEqual(Object.keys(reasonPayload("bad photo",g(3))).sort(),["action","reason","requestId"]);
});

test("NH3 requires exact source, measurand, reason and eligible selection",()=>{
 const form={method:"equilibrium",salinityMeasurementId:g(1),same:true,basis:true,reason:" fixture "};
 assert.deepEqual(ammoniaPayload(form,"mg/L TAN-N",g(2)),{requestId:g(2),method:"equilibrium",salinityMeasurementId:g(1),sameSampleSourceConfirmed:true,measurandConfirmed:true,reason:"fixture"});
 for(const patch of [{same:false},{basis:false},{reason:" "},{salinityMeasurementId:""},{method:""}])
   assert.throws(()=>ammoniaPayload({...form,...patch},"mg/L TAN-N",g(2)));
 assert.throws(()=>ammoniaPayload({...form,method:"printed_table"},"mg/L TAN-N",g(2)));
 assert.throws(()=>ammoniaPayload(form,"mg/L NH3",g(2)));
 assert.equal(ammoniaPayload({...form,method:"printed_table"},"mg/L NH4",g(2)).method,"printed_table");
});
