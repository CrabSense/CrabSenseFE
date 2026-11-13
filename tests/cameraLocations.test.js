import test from "node:test";
import assert from "node:assert/strict";
import {buildLocationGroups,locationSummary} from "../src/pages/system/cameraLocations.js";

const areas=[
  {id:"a",name:"Khu A",isActive:true,rows:[{id:"r1",name:"Dãy 1",isActive:true},{id:"r2",name:"Dãy 2",isActive:true}]},
  {id:"b",name:"Khu A",isActive:true,rows:[{id:"r3",name:"Dãy 1",isActive:true}]},
  {id:"c",name:"Khu C",isActive:false,rows:[]},
];
const cameras=[
  {id:"c1",farmingAreaId:"a",farmingRowId:"r1"},
  {id:"c2",farmingAreaId:"a"},
  {id:"c3"},
  {id:"c4",farmingAreaId:"missing",areaName:"Khu cũ",farmingRowId:"old",rowName:"Dãy cũ"},
];

test("groups by id, preserves empty areas and rows and unassigned cameras",()=>{
  const groups=buildLocationGroups(cameras,cameras,areas);
  assert.equal(groups.find(g=>g.id==="a").rows.find(r=>r.id==="r2").all.length,0);
  assert.equal(groups.find(g=>g.id==="b").rows[0].all.length,0);
  assert.equal(groups.find(g=>g.id==="c").canAssign,false);
  assert.deepEqual(groups.find(g=>g.id==="a").rows.find(r=>r.id==="none").items.map(c=>c.id),["c2"]);
  assert.equal(groups.find(g=>g.id==="none").rows[0].items[0].id,"c3");
  assert.equal(groups.find(g=>g.id==="missing").name,"Khu cũ");
  assert.equal(groups.find(g=>g.id==="missing").canAssign,false);
  assert.deepEqual(groups.flatMap(g=>g.rows.flatMap(r=>r.items.map(c=>c.id))).sort(),["c1","c2","c3","c4"]);
  assert.deepEqual(locationSummary(cameras,areas),{areas:3,assigned:3,unassigned:1});
});

test("filtering does not mislabel an occupied row as empty",()=>{
  const groups=buildLocationGroups(cameras,[],areas,"a","r1");
  assert.equal(groups.length,1);
  assert.equal(groups[0].rows.length,1);
  assert.equal(groups[0].rows[0].all.length,1);
  assert.equal(groups[0].rows[0].items.length,0);
});

test("catalog failure still retains all known camera assignments",()=>{
  const groups=buildLocationGroups(cameras,cameras,[]);
  assert.deepEqual(groups.flatMap(g=>g.rows.flatMap(r=>r.items.map(c=>c.id))).sort(),["c1","c2","c3","c4"]);
  assert.ok(groups.every(g=>!g.canAssign));
});
