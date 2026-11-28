import {deviceInventory,validCount} from "./monitoringInventory.js";
const statusKeys = new Map([
  ["empty","operationalEmpty"],["active","operationalActive"],["occupied","operationalActive"],
  ["molting","operationalMolting"],["maintenance","operationalMaintenance"],
  ["quarantine","operationalQuarantine"],["watch","operationalWatch"],["harvested","operationalHarvested"]
]);
export function operationalBoxStatus(box){
  return statusKeys.get(typeof box?.status==="string"?box.status.trim().toLowerCase():"") ?? "unknown";
}
export function hasRecordedAlerts(box){return validCount(box?.alertCount)&&box.alertCount>0;}
export function offlineBoxCount(boxes,scoped,total){
  if(!scoped||!Array.isArray(boxes)||!validCount(total)||boxes.length!==total||boxes.length===0)return null;
  const states=boxes.map(b=>deviceInventory(b.devices).isOnline);
  return states.some(v=>v===null)?null:states.filter(v=>v===false).length;
}
