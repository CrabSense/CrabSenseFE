export const sources=["RAS_RETURN","RETURN_TANK","BIO_TANK","SETTLING_TANK","INLET"];
export const analytes=["NO2","NO3","NH3"];
const guid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function requireId(value){if(!guid.test(value??"")||/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value))throw new Error("Invalid ID");return value;}
export function schedulePayload(station,form){
 const times=form.times.split(/[,\n]/).map(t=>t.trim()).filter(Boolean).sort();
 const grace=Number(form.grace);
 if(!Number.isInteger(station.configurationVersion)||!Number.isInteger(grace)||grace<1||grace>15||times.length>8||
 (form.enabled&&!times.length)||times.some(t=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(t))||new Set(times).size!==times.length)throw new Error("Invalid schedule");
 const mins=times.map(t=>Number(t.slice(0,2))*60+Number(t.slice(3)));
 if(mins.length>1&&mins.some((m,i)=>(mins[(i+1)%mins.length]-m+1440)%1440<grace))throw new Error("Overlapping schedule windows");
 if(!sources.includes(form.source))throw new Error("Invalid sample source");
 const targets=analytes.map(analyte=>({analyte,calibrationId:requireId(form.targets[analyte])}));
 if(new Set(targets.map(t=>t.calibrationId)).size!==3)throw new Error("Duplicate calibration");
 return {expectedVersion:station.configurationVersion,enabled:form.enabled,times,graceMinutes:grace,targets,sampleSource:form.source};
}
export function estimatePayload(ready,form,id){
 if(ready?.status!=="operator_confirmation_required"||!form.confirmed||!sources.includes(form.source)||!form.reason.trim()||form.reason.length>500)throw new Error("Confirm actual sample conditions");
 const seconds=Number(form.seconds),salinity=Number(form.salinity);
 if(String(form.seconds).trim()===""||String(form.salinity).trim()===""||!Number.isInteger(seconds)||seconds<ready.reactionSeconds||
 seconds>ready.reactionSeconds+ready.timingToleranceSeconds||!Number.isFinite(salinity)||salinity<ready.minSalinityPpt||salinity>ready.maxSalinityPpt)throw new Error("Sample conditions outside calibration");
 return {requestId:requireId(id),action:"estimate",reason:form.reason.trim(),calibrationId:requireId(ready.calibrationId),
 reagentLot:ready.reagentLot,reactionSeconds:seconds,salinityPpt:salinity,sampleSource:form.source,operatorConditionsConfirmed:true};
}
export function savedRequestMatches(saved,attempt){
 return saved?.action==="estimate"&&attempt?.status==="retry_available"&&saved.requestId===attempt.requestId;
}
export function reasonPayload(reason,id){if(!reason.trim()||reason.length>500)throw new Error("Reason required");return {requestId:requireId(id),action:"needs_retest",reason:reason.trim()};}
