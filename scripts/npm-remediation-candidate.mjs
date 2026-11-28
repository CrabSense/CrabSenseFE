import {spawnSync} from "node:child_process";
import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {summarizeAudit} from "./npm-audit-report.mjs";

const dir="candidate-output";
mkdirSync(dir,{recursive:true});
const npm=process.platform==="win32"?"npm.cmd":"npm";
const env={...process.env,npm_config_registry:"https://registry.npmjs.org/"};
function run(args,accepted=[0]){
  const result=spawnSync(npm,args,{env,encoding:"utf8",timeout:180000,maxBuffer:32*1024*1024});
  if(result.error||result.signal||!accepted.includes(result.status)){
    console.error(result.stderr||result.error||result.signal);
    throw new Error("npm command failed: "+args.join(" "));
  }
  return result;
}
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=p=>createHash("sha256").update(readFileSync(p)).digest("hex");
const oldManifest=read("package.json"),oldLock=read("package-lock.json"),baseSha=sha("package-lock.json");
// Keep the CSS provider: shadcn/tailwind.css is an actual build dependency.
// Resolve within major 4; do not accept force, legacy-peer-deps, or unrelated direct upgrades.
const registry=run(["view","shadcn@^4.23.1","version","--json"]);
const versions=JSON.parse(registry.stdout);
const shadcn=Array.isArray(versions)?versions.at(-1):versions;
if(typeof shadcn!=="string"||!/^4\.\d+\.\d+$/.test(shadcn))throw new Error("No stable shadcn 4 candidate");
console.log("NPM_CANDIDATE_SHADCN "+shadcn);
run(["install","--package-lock-only","--ignore-scripts","--save-exact","shadcn@"+shadcn]);
// Apply npm's semver-compatible recommendations only, preserving Vite's major.
const fix=run(["audit","fix","--package-lock-only","--ignore-scripts","--json"],[0,1]);
writeFileSync(dir+"/compatible-fix.json",fix.stdout);
const manifest=read("package.json"),lock=read("package-lock.json");
for(const field of ["dependencies","devDependencies"]){
  for(const [name,range] of Object.entries(oldManifest[field]||{})){
    if(name!=="shadcn"&&manifest[field]?.[name]!==range)
      throw new Error("Unexpected direct dependency change: "+name);
  }
}
if(manifest.dependencies.shadcn!==shadcn||lock.packages["node_modules/shadcn"]?.version!==shadcn)
  throw new Error("Candidate did not retain exact shadcn version");
if(!lock.packages["node_modules/vite"]?.version.startsWith("5."))throw new Error("Unexpected Vite major change");
const evidence={baseLockSha256:baseSha,candidateLockSha256:sha("package-lock.json"),shadcn,reports:{}};
for(const [scope,flags] of [["full",["--include=dev"]],["omit-dev",["--omit=dev"]]]){
  const audit=run(["audit","--json",...flags],[0,1]);
  writeFileSync(dir+"/"+scope+".json",audit.stdout);
  const summary=summarizeAudit(JSON.parse(audit.stdout),lock,audit.status);
  evidence.reports[scope]=summary;
  console.log("CANDIDATE_AUDIT_SCOPE "+scope+" "+JSON.stringify(summary.counts));
  for(const p of summary.affected)console.log("CANDIDATE_AUDIT_PACKAGE "+scope+" "+JSON.stringify({name:p.name,severity:p.severity,installed:p.installed,fixAvailable:p.fixAvailable}));
}
copyFileSync("package.json",dir+"/package.json");
copyFileSync("package-lock.json",dir+"/package-lock.json");
writeFileSync(dir+"/summary.json",JSON.stringify(evidence,null,2)+"\n");
// Reconstructible public lock delta for review; no credentials, no automatic push.
console.log("CANDIDATE_MANIFEST "+JSON.stringify(manifest));
for(const [key,value] of Object.entries(lock.packages)){
  if(JSON.stringify(oldLock.packages[key])!==JSON.stringify(value)){
    if(value.resolved && !value.resolved.startsWith("https://registry.npmjs.org/"))throw new Error("Unexpected registry URL");
    console.log("CANDIDATE_LOCK_DELTA "+JSON.stringify({key,value}));
  }
}
for(const key of Object.keys(oldLock.packages)){
  if(!Object.hasOwn(lock.packages,key))console.log("CANDIDATE_LOCK_DELTA "+JSON.stringify({key,value:null}));
}
console.log("CANDIDATE_COMPLETE "+JSON.stringify({base:baseSha,candidate:evidence.candidateLockSha256,packageCount:Object.keys(lock.packages).length}));
