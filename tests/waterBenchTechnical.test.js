import test from "node:test";
import assert from "node:assert/strict";
import {technicalPage,pageCounters} from "../src/pages/system/waterBenchTechnicalModel.js";
const row={id:"11111111-1111-1111-1111-111111111111",kioskId:"22222222-2222-2222-2222-222222222222",
 stationRevoked:false,technicalReceiptFreshness:"stale",configurationVersion:2,technicalReceipts24h:5,cameraErrors24h:1,
 clockObservations24h:3,retryableFailures24h:2,contractBlocked24h:1,expiredRunningLeases24h:1,activeRunningLeases24h:0,
 candidateValue:999,requestJson:"PRIVATE",kioskCode:"KIOSK-TEST"};
const fixture={success:true,data:{source:"persisted_technical_metadata",chemicalDataIncluded:false,commandsEnabled:false,liveHardwareVerified:false,
 attemptCountsAreHistorical:true,windowHours:24,generatedAt:"2026-11-27T00:00:00Z",windowStart:"2026-11-26T00:00:00Z",page:1,pageSize:25,total:1,items:[row]}};
test("technical page uses allowlist, distinct current-page counts and no business evidence",()=>{
 const p=technicalPage(fixture,1,25);
 assert.equal(p.rows[0].candidateValue,undefined);
 assert.equal(p.rows[0].requestJson,undefined);
 assert.deepEqual(pageCounters(p.rows),{stations:1,revoked:0,stale:1,cameraErrors:1,aiTechnical:2});
});
test("reject incorrect flags, malformed counters or page identity",()=>{
 for(const patch of [{chemicalDataIncluded:true},{commandsEnabled:true},{liveHardwareVerified:true},{page:2},{items:[{...row,cameraErrors24h:-1}]}]){
   assert.throws(()=>technicalPage({success:true,data:{...fixture.data,...patch}},1,25));
 }
});
