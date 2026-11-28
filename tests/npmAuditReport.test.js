import test from "node:test";
import assert from "node:assert/strict";
import {summarizeAudit,requireCleanAudits} from "../scripts/npm-audit-report.mjs";
const lock={packages:{"node_modules/example":{version:"1.0.0",dev:true}}};
const baseCounts={info:0,low:0,moderate:0,high:0,critical:0,total:0};
const clean=()=>({auditReportVersion:2,vulnerabilities:{},metadata:{vulnerabilities:{...baseCounts}}});
const affected=()=>({auditReportVersion:2,vulnerabilities:{example:{name:"example",severity:"high",isDirect:false,range:"<1.1.0",nodes:["node_modules/example"],via:[{source:123,title:"Fixture",url:"https://example.com/advisory",range:"<1.1.0",severity:"high"}],fixAvailable:{name:"example",version:"1.1.0",isSemVerMajor:false}}},metadata:{vulnerabilities:{...baseCounts,high:1,total:1}}});
test("accept clean npm audit only with successful exit",()=>{
  assert.deepEqual(summarizeAudit(clean(),lock,0).affected,[]);
  assert.throws(()=>summarizeAudit(clean(),lock,1));
});
test("preserve affected lock version, scope and exact recommended fix",()=>{
  const x=summarizeAudit(affected(),lock,1);
  assert.equal(x.counts.high,1);
  assert.equal(x.affected[0].installed[0].version,"1.0.0");
  assert.equal(x.affected[0].installed[0].devOnly,true);
  assert.equal(x.affected[0].direct,false);
  assert.equal(x.affected[0].fixAvailable.version,"1.1.0");
});
test("registry failures and malformed or inconsistent output fail closed",()=>{
  for(const r of [null,{error:{code:"E503"}},{...clean(),auditReportVersion:1},affected()]){
    assert.throws(()=>summarizeAudit(r,lock,0));
  }
  const bad=affected();bad.metadata.vulnerabilities.high=0;bad.metadata.vulnerabilities.moderate=1;
  assert.throws(()=>summarizeAudit(bad,lock,1));
  assert.throws(()=>summarizeAudit(affected(),{packages:{}},1));
});

test("security gate requires clean full and omit-dev reports",()=>{
  const good=summarizeAudit(clean(),lock,0);
  assert.doesNotThrow(()=>requireCleanAudits({full:good,"omit-dev":good}));
  assert.throws(()=>requireCleanAudits({full:good}));
  assert.throws(()=>requireCleanAudits({full:good,"omit-dev":{error:"registry unavailable"}}));
});
test("security gate blocks every severity in either audit scope",()=>{
  const good=summarizeAudit(clean(),lock,0);
  for(const severity of ["info","low","moderate","high","critical"]){
    const fixture=affected();fixture.vulnerabilities.example.severity=severity;
    fixture.metadata.vulnerabilities={...baseCounts,[severity]:1,total:1};
    const bad=summarizeAudit(fixture,lock,1);
    assert.throws(()=>requireCleanAudits({full:bad,"omit-dev":good}));
    assert.throws(()=>requireCleanAudits({full:good,"omit-dev":bad}));
  }
});
test("security gate rejects incomplete or contradictory summaries",()=>{
  const good=summarizeAudit(clean(),lock,0);
  for(const bad of [{counts:{total:0},affected:[]},{...good,affected:[{}]},null])
    assert.throws(()=>requireCleanAudits({full:good,"omit-dev":bad}));
});
