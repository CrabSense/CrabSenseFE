import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {deviceInventory,validCount} from "../src/services/monitoringInventory.js";
test("device inventory distinguishes empty, offline, partial and online",()=>{
  assert.equal(deviceInventory({totalCount:0,onlineCount:0,isOnline:false}).kind,"empty");
  assert.equal(deviceInventory({totalCount:0,onlineCount:0,isOnline:false}).isOnline,null);
  assert.equal(deviceInventory({totalCount:2,onlineCount:0,isOnline:false}).kind,"offline");
  assert.equal(deviceInventory({totalCount:2,onlineCount:0,isOnline:false}).percentage,0);
  assert.equal(deviceInventory({totalCount:2,onlineCount:1,isOnline:true}).percentage,50);
  assert.equal(deviceInventory({totalCount:2,onlineCount:2,isOnline:true}).kind,"normal");
});
test("invalid inventory and absent KPI never become a real zero",()=>{
  for(const v of [null,undefined,"",false,"0",NaN,-1,1.5])assert.equal(validCount(v),false);
  assert.equal(validCount(0),true);
  for(const d of [null,{}, {totalCount:2,onlineCount:null,isOnline:false},
    {totalCount:0,onlineCount:0,isOnline:true},{totalCount:1,onlineCount:2,isOnline:true},
    {totalCount:2,onlineCount:1,isOnline:false}])assert.equal(deviceInventory(d).kind,"unknown");
});
test("monitoring uses the same inventory policy for row, filter and scoped header",()=>{
  const src=p=>readFileSync(new URL(p,import.meta.url),"utf8");
  assert.match(src("../src/pages/Monitoring.jsx"),/data\?\.farmingAreaId === waterArea && waterArea/);
  assert.match(src("../src/components/monitoring/boxes/BoxMonitoringRow.jsx"),/deviceInventory\(box\.devices\)\.isOnline/);
  assert.match(src("../src/components/monitoring/boxes/BoxMonitoringSection.jsx"),/deviceInventory\(box\.devices\)\.isOnline === false/);
  assert.match(src("../src/components/monitoring/summary/MonitoringSummaryCard.jsx"),/hasValidValue \? value : "—"/);
});
