import {spawnSync} from "node:child_process";
import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {summarizeAudit} from "./npm-audit-report.mjs";

const dir="vite-migration-output";
mkdirSync(dir,{recursive:true});
const npm=process.platform==="win32"?"npm.cmd":"npm";
const env={...process.env,npm_config_registry:"https://registry.npmjs.org/",npm_config_force:"false",npm_config_legacy_peer_deps:"false",npm_config_strict_peer_deps:"true",npm_config_engine_strict:"true"};
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
// Explicit major migration, isolated from the already verified shadcn patch.
// The audit recommendation at FE main 123e5a5 was Vite 8.4.0.
const vite="8.4.0";
if(!oldLock.packages["node_modules/vite"]?.version.startsWith("5."))throw new Error("Unexpected baseline Vite version");
// Major 6.3.0 failed strict resolution: optional Rolldown Babel peers selected
// Babel 8 against the existing Babel 7 tree. Try stable major 5 without relaxing peers.
const registryVersions=JSON.parse(run(["view","@vitejs/plugin-react@^5","version","--json"]).stdout);
const stable=(Array.isArray(registryVersions)?registryVersions:[registryVersions]).filter(v=>typeof v==="string"&&/^5\.\d+\.\d+$/.test(v));
stable.sort((a,b)=>{const x=a.split(".").map(Number),y=b.split(".").map(Number);return x[1]-y[1]||x[2]-y[2]});
const plugin=stable.at(-1);
if(!plugin)throw new Error("No stable React plugin 5 candidate");
const pluginMeta=JSON.parse(run(["view","@vitejs/plugin-react@"+plugin,"version","peerDependencies","engines","--json"]).stdout);
if(pluginMeta.version!==plugin)throw new Error("React plugin registry version mismatch");
if(typeof plugin!=="string"||!/^\d+\.\d+\.\d+$/.test(plugin))throw new Error("No stable React plugin candidate");
const viteMeta=JSON.parse(run(["view","vite@"+vite,"version","engines","--json"]).stdout);
if(viteMeta.version!==vite)throw new Error("Vite registry version mismatch");
const metadata={node:process.version,vite:viteMeta,reactPlugin:pluginMeta};
writeFileSync(dir+"/registry-metadata.json",JSON.stringify(metadata,null,2)+"\n");
console.log("VITE_CANDIDATE_REGISTRY "+JSON.stringify(metadata));
// Let npm enforce actual peer and engine constraints; never force or ignore peers.
run(["install","--package-lock-only","--ignore-scripts","--save-dev","--save-exact","--strict-peer-deps","vite@"+vite,"@vitejs/plugin-react@"+plugin]);
const manifest=read("package.json"),lock=read("package-lock.json");
const expected=structuredClone(oldManifest);
expected.devDependencies.vite=vite;
expected.devDependencies["@vitejs/plugin-react"]=plugin;
const normalize=value=>Array.isArray(value)?value.map(normalize):value&&typeof value==="object"?Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key])])):value;
if(JSON.stringify(normalize(manifest))!==JSON.stringify(normalize(expected)))throw new Error("Unexpected manifest change");
for(const [name,version] of [["vite",vite],["@vitejs/plugin-react",plugin]]){
  if(lock.packages["node_modules/"+name]?.version!==version)throw new Error("Resolved version mismatch: "+name);
}
const evidence={baseLockSha256:baseSha,candidateLockSha256:sha("package-lock.json"),vite,reactPlugin:plugin,metadata,reports:{}};
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
