const guid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const count=(v)=>{if(!Number.isSafeInteger(v)||v<0)throw new Error("Invalid technical counter");return v;};
const str=v=>typeof v==="string"?v:null;
const fields=["technicalReceipts24h","cameraErrors24h","clockObservations24h","retryableFailures24h","contractBlocked24h","expiredRunningLeases24h","activeRunningLeases24h"];
export function technicalPage(response,expectedPage,expectedSize){
 const d=response?.data;
 if(response?.success!==true||!d||d.source!=="persisted_technical_metadata"||
    d.chemicalDataIncluded!==false||d.commandsEnabled!==false||d.liveHardwareVerified!==false||
    d.attemptCountsAreHistorical!==true||d.windowHours!==24||d.page!==expectedPage||d.pageSize!==expectedSize||
    !Array.isArray(d.items)||d.items.length>expectedSize||!Number.isFinite(Date.parse(d.generatedAt))||
    !Number.isFinite(Date.parse(d.windowStart)))throw new Error("Invalid WaterBench technical response");
 const total=count(d.total);
 const rows=d.items.map(r=>{
    if(!guid.test(r?.id??"")||!guid.test(r?.kioskId??"")||
        typeof r.stationRevoked!=="boolean"||!["recent","stale","unobserved"].includes(r.technicalReceiptFreshness))
      throw new Error("Invalid station metadata");
    return {id:r.id,kioskId:r.kioskId,kioskCode:str(r.kioskCode),kioskReportedStatus:str(r.kioskReportedStatus),
      kioskLastSeenAt:str(r.kioskLastSeenAt),kioskSoftwareVersion:str(r.kioskSoftwareVersion),
      masterHardwareId:str(r.masterHardwareId),slaveHardwareId:str(r.slaveHardwareId),
      configurationVersion:count(r.configurationVersion),stationRevoked:r.stationRevoked,
      lastTechnicalReceiptAt:str(r.lastTechnicalReceiptAt),technicalReceiptFreshness:r.technicalReceiptFreshness,
      ...Object.fromEntries(fields.map(f=>[f,count(r[f])]))};
 });
 if(new Set(rows.map(r=>r.id)).size!==rows.length||rows.length>total)throw new Error("Invalid station page");
 return {rows,total,page:d.page,pageSize:d.pageSize,generatedAt:d.generatedAt,windowStart:d.windowStart};
}
export function pageCounters(rows){
 return {stations:rows.length,revoked:rows.filter(r=>r.stationRevoked).length,
   stale:rows.filter(r=>r.technicalReceiptFreshness!=="recent").length,
   cameraErrors:rows.reduce((n,r)=>n+r.cameraErrors24h,0),
   aiTechnical:rows.reduce((n,r)=>n+r.contractBlocked24h+r.expiredRunningLeases24h,0)};
}
