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

import {operationalBoxStatus,hasRecordedAlerts,offlineBoxCount} from "../src/services/monitoringAssessment.js";
test("legacy and nullable assessments never determine operational status or offline count",()=>{
  assert.equal(operationalBoxStatus({health:{score:99,statusLevel:"healthy"},healthStatus:"healthy"}),"unknown");
  assert.equal(operationalBoxStatus({status:"maintenance",health:null}),"operationalMaintenance");
  assert.equal(hasRecordedAlerts({alertCount:null}),false);
  assert.equal(hasRecordedAlerts({alertCount:1}),true);
  const offline={devices:{totalCount:1,onlineCount:0,isOnline:false}};
  const online={devices:{totalCount:1,onlineCount:1,isOnline:true}};
  const unknown={devices:{totalCount:0,onlineCount:0,isOnline:false}};
  assert.equal(offlineBoxCount([offline,online],true,2),1);
  assert.equal(offlineBoxCount([online],true,1),0);
  assert.equal(offlineBoxCount([offline,unknown],true,2),null);
  assert.equal(offlineBoxCount([offline],false,1),null);
  assert.equal(offlineBoxCount([offline],true,2),null);
});
test("monitoring no longer renders legacy score or uses assessment filters",()=>{
  const src=p=>readFileSync(new URL(p,import.meta.url),"utf8");
  assert.doesNotMatch(src("../src/components/monitoring/boxes/BoxMonitoringRow.jsx"),/box\.health|\/100/);
  assert.doesNotMatch(src("../src/components/monitoring/boxes/BoxMonitoringSection.jsx"),/columnScore|box\.health/);
  assert.doesNotMatch(src("../src/components/monitoring/summary/MonitoringSummaryGrid.jsx"),/summary\.(healthy|warning|critical|offline)/);
});
