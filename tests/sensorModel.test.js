import test from "node:test";
import assert from "node:assert/strict";
import {dateRange,filterSensors,bindingPayload,configPayload,sensorValue,numberLabel,csvCell,dayVN} from "../src/pages/system/sensorModel.js";

test("zero is a real reading; missing values are not zero",()=>{
 assert.equal(sensorValue({latestValue:0,unit:"pH"}),"0 pH");assert.equal(sensorValue({latestValue:null,unit:"pH"}),"—");assert.equal(numberLabel(null),"—");
});
test("Vietnam date range is inclusive start and exclusive next day",()=>{
 assert.deepEqual(dateRange("2026-11-14","2026-11-14"),{from:"2026-11-14T00:00:00+07:00",to:"2026-11-15T00:00:00+07:00",bucketMinutes:15});
 assert.equal(dayVN(new Date("2026-11-13T18:00:00Z")),"2026-11-14");
 assert.throws(()=>dateRange("2026-11-15","2026-11-14"));assert.throws(()=>dateRange("2026-10-01","2026-11-14"));
 assert.equal(dateRange("2026-11-01","2026-11-14").bucketMinutes,60);
});
test("filter by stable IDs, unknown status and unassigned location",()=>{
 const rows=[{id:"1",sensorCode:"PH-A",farmingAreaId:"a",status:"Online"},{id:"2",sensorCode:"PH-B",farmingAreaId:"b",status:"Offline"},{id:"3",sensorCode:"TEMP",status:null}];
 assert.deepEqual(filterSensors(rows,{search:"ph",area:"b"}).map(s=>s.id),["2"]);
 assert.deepEqual(filterSensors(rows,{area:"none",status:"Unknown"}).map(s=>s.id),["3"]);
});
test("binding rejects cross-controller or incomplete bus address",()=>{
 const p={id:"p",deviceId:"a",portType:"RS485"};
 assert.throws(()=>bindingPayload("b",p,"1","40001"));assert.throws(()=>bindingPayload("a",p,"","40001"));
 assert.deepEqual(bindingPayload("a",p," 1 ","40001"),{deviceId:"a",portId:"p",busAddress:"1",busRegister:"40001"});
 assert.deepEqual(bindingPayload("",null,"",""),{deviceId:null,portId:null,busAddress:null,busRegister:null});
});
test("configuration retains optimistic version and bounds timeout",()=>{
 assert.deepEqual(configPayload("10","60",3),{samplingIntervalSeconds:10,disconnectTimeoutSeconds:60,expectedVersion:3});
 assert.throws(()=>configPayload("0","60",3));assert.throws(()=>configPayload("60","10",3));assert.throws(()=>configPayload("1.5","60",3));
});
test("CSV escapes formula and quote cells",()=>{assert.equal(csvCell("=1+1"),'"\'=1+1"');assert.equal(csvCell('a"b'),'"a""b"');});
