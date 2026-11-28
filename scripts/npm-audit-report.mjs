// npm audit v2 reports affected packages, not a count of distinct CVEs.
const levels=["info","low","moderate","high","critical"];
export function summarizeAudit(report,lock,exitCode){
  if(!report||report.error||report.auditReportVersion!==2||
      !report.vulnerabilities||typeof report.vulnerabilities!=="object"||
      Array.isArray(report.vulnerabilities)||!report.metadata?.vulnerabilities||
      ![0,1].includes(exitCode))throw new Error("Invalid or incomplete npm audit report");
  const counts=report.metadata.vulnerabilities;
  if(![...levels,"total"].every(k=>Number.isInteger(counts[k])&&counts[k]>=0)||
      levels.reduce((sum,k)=>sum+counts[k],0)!==counts.total||
      Object.keys(report.vulnerabilities).length!==counts.total||
      (counts.total===0)!==(exitCode===0))throw new Error("Inconsistent audit counts or exit status");
  const observed=Object.fromEntries(levels.map(k=>[k,0]));
  const affected=Object.entries(report.vulnerabilities).map(([name,v])=>{
    if(!v||v.name!==name||!levels.includes(v.severity)||typeof v.isDirect!=="boolean"||
      typeof v.range!=="string"||!Array.isArray(v.via)||!Array.isArray(v.nodes)||
      !v.nodes.length||!v.nodes.every(p=>typeof p==="string"&&lock.packages?.[p]?.version)||
      !v.via.every(x=>typeof x==="string"||(x&&typeof x==="object"&&typeof x.url==="string"))||
      !(typeof v.fixAvailable==="boolean"||(v.fixAvailable&&typeof v.fixAvailable.name==="string"&&
        typeof v.fixAvailable.version==="string"&&typeof v.fixAvailable.isSemVerMajor==="boolean")))
      throw new Error("Invalid package audit entry: "+name);
    observed[v.severity]++;
    return {name,severity:v.severity,direct:v.isDirect,range:v.range,
      installed:v.nodes.map(path=>({path,version:lock.packages[path].version,devOnly:lock.packages[path].dev===true})),
      via:v.via.map(x=>typeof x==="string"?{dependency:x}:{id:x.source,title:x.title,url:x.url,range:x.range,severity:x.severity}),
      fixAvailable:v.fixAvailable};
  });
  if(levels.some(k=>observed[k]!==counts[k]))throw new Error("Inconsistent severity counts");
  affected.sort((a,b)=>levels.indexOf(b.severity)-levels.indexOf(a.severity)||a.name.localeCompare(b.name));
  return {counts,affected};
}

// The gate accepts only validated reports for both scopes, with zero affected packages.
export function requireCleanAudits(reports){
  for(const scope of ["full","omit-dev"]){
    const summary=reports?.[scope];
    if(!summary||summary.error||!Array.isArray(summary.affected)||summary.affected.length!==0||
      ![...levels,"total"].every(key=>summary.counts?.[key]===0))
      throw new Error("Security gate rejected npm audit scope: "+scope);
  }
}
