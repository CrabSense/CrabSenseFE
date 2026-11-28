import {spawnSync} from "node:child_process";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {summarizeAudit,requireCleanAudits} from "./npm-audit-report.mjs";

const dir="audit-output";
mkdirSync(dir,{recursive:true});
const lockBytes=readFileSync("package-lock.json"),lock=JSON.parse(lockBytes);
const npm=process.platform==="win32"?"npm.cmd":"npm";
const version=spawnSync(npm,["--version"],{encoding:"utf8"});
if(version.status!==0)throw new Error("Cannot determine npm version");
const evidence={commit:process.env.GITHUB_SHA||null,node:process.version,npm:version.stdout.trim(),
  lockSha256:createHash("sha256").update(lockBytes).digest("hex"),
  generatedAt:new Date().toISOString(),reports:{}};
let failed=false;
for(const [scope,flags] of [["full",["--include=dev"]],["omit-dev",["--omit=dev"]]]){
  try{
    // Audit existing lockfile only; never install, mutate, or run audit fix.
    const run=spawnSync(npm,["audit","--json",...flags],{
      encoding:"utf8",timeout:120000,maxBuffer:16*1024*1024,
      env:{...process.env,npm_config_registry:"https://registry.npmjs.org/"},
    });
    writeFileSync(dir+"/"+scope+".json",run.stdout||"");
    if(run.error||run.signal)throw new Error("npm audit did not complete");
    const summary=summarizeAudit(JSON.parse(run.stdout),lock,run.status);
    evidence.reports[scope]=summary;
    console.log("NPM_AUDIT_SCOPE "+scope+" "+JSON.stringify(summary.counts));
    for(const entry of summary.affected)console.log("NPM_AUDIT_PACKAGE "+scope+" "+JSON.stringify(entry));
  }catch(error){
    failed=true;
    evidence.reports[scope]={error:String(error.message)};
    console.error("NPM_AUDIT_INVALID "+scope+" "+JSON.stringify(String(error.message)));
  }
}
writeFileSync(dir+"/summary.json",JSON.stringify(evidence,null,2)+"\n");
if(!readFileSync("package-lock.json").equals(lockBytes))throw new Error("Audit mutated the lockfile");
if(failed)process.exitCode=1;
else {
  try {
    requireCleanAudits(evidence.reports);
    console.log("NPM_SECURITY_GATE_PASS full=0 omit-dev=0");
  }catch(error){
    console.error("::error::"+error.message);
    process.exitCode=1;
  }
}
