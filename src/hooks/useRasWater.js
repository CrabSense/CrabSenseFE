import {useEffect,useState} from "react";
import {fetchQualifiedAreaLive} from "../services/api";
import {explicitArea,qualifiedAreaReadings,visibleAreaReadings} from "../services/rasWaterModel";

function identity(){
  try {
    const user=JSON.parse(localStorage.getItem("user")||"null");
    const token=localStorage.getItem("accessToken");
    return user?.role==="FarmAdministrator"&&typeof user.id==="string"&&user.id&&token
      ? JSON.stringify([user.id,token]) : null;
  }catch{return null;}
}
export default function useRasWater(area){
  const [snapshot,setSnapshot]=useState(null);
  const [now,setNow]=useState(Date.now);
  const currentIdentity=identity();
  useEffect(()=>{
    let generation=0,active=true,inFlight=null,controller=null,lastIdentity=identity();
    const invalidate=()=>{
      generation++;controller?.abort();controller=null;inFlight=null;
      if(active)setSnapshot(null);
    };
    const eligible=()=>explicitArea(area)&&navigator.onLine&&document.visibilityState==="visible"&&identity();
    const poll=async()=>{
      const who=identity();
      if(who!==lastIdentity){invalidate();lastIdentity=who;}
      if(!eligible()){invalidate();return;}
      if(inFlight!==null)return;
      const request=++generation;
      inFlight=request;
      const abort=new AbortController();
      controller=abort;
      const timeout=setTimeout(()=>abort.abort(),10000);
      try{
        const [,token]=JSON.parse(who);
        const rows=await fetchQualifiedAreaLive(area,token,abort.signal);
        if(active&&generation===request&&!abort.signal.aborted&&eligible()&&identity()===who){
          const at=Date.now();
          setSnapshot({area,identity:who,verifiedAt:at,readings:qualifiedAreaReadings(area,rows,at)});
        }
      }catch{
        if(active&&generation===request)setSnapshot(null);
      }finally{
        clearTimeout(timeout);
        if(inFlight===request){inFlight=null;controller=null;}
      }
    };
    const changed=()=>{invalidate();lastIdentity=identity();void poll();};
    setSnapshot(null);
    void poll();
    const timer=setInterval(()=>void poll(),5000);
    const clock=setInterval(()=>{
      const at=Date.now();
      setNow(at);
      const who=identity();
      if(who!==lastIdentity){invalidate();lastIdentity=who;void poll();}
      if(!eligible())invalidate();
      setSnapshot(prev=>prev&&(at<prev.verifiedAt||at-prev.verifiedAt>=15000)?null:prev);
    },1000);
    window.addEventListener("online",changed);
    window.addEventListener("offline",changed);
    window.addEventListener("storage",changed);
    document.addEventListener("visibilitychange",changed);
    return ()=>{
      active=false;invalidate();clearInterval(timer);clearInterval(clock);
      window.removeEventListener("online",changed);
      window.removeEventListener("offline",changed);
      window.removeEventListener("storage",changed);
      document.removeEventListener("visibilitychange",changed);
    };
  },[area,currentIdentity]);
  return {readings:visibleAreaReadings(snapshot,{area,identity:currentIdentity,
    online:navigator.onLine,visible:document.visibilityState==="visible",now:Date.now()}),now};
}
