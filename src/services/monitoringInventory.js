// Do not coerce null, strings, booleans or invalid counters into zero.
export const validCount=value=>Number.isSafeInteger(value)&&value>=0;
export function deviceInventory(devices){
  const total=devices?.totalCount,online=devices?.onlineCount;
  if(!validCount(total)||!validCount(online)||online>total||
     typeof devices?.isOnline!=="boolean"||devices.isOnline!==(online>0))
    return {kind:"unknown",total:null,online:null,percentage:null,isOnline:null};
  if(total===0)return {kind:"empty",total,online,percentage:null,isOnline:null};
  return {kind:online===0?"offline":online===total?"normal":"warning",
    total,online,percentage:Math.round(online/total*100),isOnline:online>0};
}
