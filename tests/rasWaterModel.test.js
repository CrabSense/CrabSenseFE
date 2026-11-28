import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {qualifiedAreaReadings,readingAssessment,visibleAreaReadings} from "../src/services/rasWaterModel.js";
const guid=n=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
const area=guid(1),now=Date.parse("2026-11-27T10:00:00Z");
const row=(n,extra={})=>({sensorId:guid(n),farmingAreaId:area,sensorCode:"S"+n,
  sensorType:"Salinity",unit:"ppt",isActive:true,dataQuality:"Realtime",latestValue:0,
  latestMeasuredAt:new Date(now-2000).toISOString(),lastReceivedAt:new Date(now-1000).toISOString(),
  status:"Online",...extra});
test("shared RAS keeps two original sensors and real zero; excludes different area and chemistry",()=>{
  const result=qualifiedAreaReadings(area,[row(2,{farmingRowId:guid(10)}),row(3,{farmingRowId:guid(11),latestValue:18}),
    row(4,{farmingAreaId:guid(9)}),row(5,{sensorType:"NO2",unit:"mg/L"}),row(6,{sensorType:"TDS",unit:"ppm",latestValue:1200})],now);
  assert.deepEqual(result.map(r=>r.id),[guid(2),guid(3),guid(6)]);
  assert.equal(result[0].value,0);assert.equal(result[2].unit,"ppm");
  assert.deepEqual(qualifiedAreaReadings(null,[row(2)],now),[]);
});
test("reject unknown units, missing receipts, duplicate identities and invalid measurements",()=>{
  assert.deepEqual(qualifiedAreaReadings(area,[row(2),row(2),row(3,{unit:"ppm"}),
    row(4,{lastReceivedAt:null}),row(5,{latestValue:"0"}),row(6,{isActive:false}),
    row(7,{dataQuality:"Legacy"}),row(8,{latestMeasuredAt:"2026-11-27T10:01:00Z"})],now),[]);
});
test("thresholds are explicit; no safe inference for unknown, stale or offline",()=>{
  const get=extra=>qualifiedAreaReadings(area,[row(2,extra)],now)[0];
  assert.equal(readingAssessment(get({}),now),"Chưa có ngưỡng cấu hình");
  assert.equal(readingAssessment(get({minThreshold:1}),now),"Cảnh báo từ cấu hình");
  assert.equal(readingAssessment(get({minThreshold:20,maxThreshold:10}),now),"Chưa có ngưỡng cấu hình");
  assert.equal(readingAssessment(get({status:"Offline"}),now),"Chưa xác minh hiện trạng");
  assert.equal(readingAssessment(get({}),now+301000),"Dữ liệu cũ / chưa xác minh");
});
test("visibility, connectivity, area, identity and expiry gate the same snapshot",()=>{
  const readings=qualifiedAreaReadings(area,[row(2)],now);
  const snapshot={area,identity:"user+token",verifiedAt:now,readings};
  const context={area,identity:snapshot.identity,online:true,visible:true,now};
  assert.equal(visibleAreaReadings(snapshot,context),readings);
  for(const changed of [{area:guid(9)},{identity:"other"},{online:false},{visible:false},{now:now+15000},{now:now-1}]){
    assert.deepEqual(visibleAreaReadings(snapshot,{...context,...changed}),[]);
  }
});

// Wiring regression: the dashboard must not reintroduce the legacy health score.
test("Farm Admin dashboard uses scoped RAS cards, not legacy health scores or absent device counts",()=>{
  const source=path=>readFileSync(new URL(path,import.meta.url),"utf8");
  const dashboard=source("../src/pages/Dashboard.jsx");
  const hook=source("../src/hooks/useDashboard.js");
  const grid=source("../src/components/monitoring/environment/EnvironmentGrid.jsx");
  assert.match(dashboard,/!areasLoading\s*&&\s*selectedArea\?\.id\s*===\s*selectedAreaId\s*\?\s*selectedAreaId\s*:\s*null/);
  assert.match(dashboard,/useRasWater\(waterArea\)/);
  assert.match(dashboard,/<EnvironmentGrid\s+readings=\{ras\.readings\}\s+now=\{ras\.now\}\s+areaId=\{waterArea\}\s+showDevices=\{false\}/);
  assert.doesNotMatch(dashboard,/FarmHealthCard|HealthBreakdown|waterQualityScore/);
  assert.match(hook,/dashboardService\.getOverview\(areaId\)/);
  assert.doesNotMatch(hook,/getMetrics\(|setMetrics\(/);
  assert.match(grid,/showDevices=true/);
  assert.match(grid,/\{showDevices && <EnvironmentCard/);
});
