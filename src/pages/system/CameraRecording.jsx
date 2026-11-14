import { useSearchParams } from "react-router-dom";
import { CalendarClock, Film } from "lucide-react";
import RecordingHistory from "./RecordingHistory";
import CameraRecordingAgents from "./CameraRecordingAgents";
import "./recording-history.css";

import { SystemPage } from "../../components/system/SystemChrome";

import ScheduleWorkspace from "./CameraScheduleWorkspace";
export default function CameraRecording(){
  const [params,setParams]=useSearchParams();
  const tab=["history","agents"].includes(params.get("tab"))?params.get("tab"):"schedule";
  const changeTab=value=>setParams(prev=>{const next=new URLSearchParams(prev);if(value==="history"||value==="agents")next.set("tab",value);else next.delete("tab");return next;},{replace:true});
  return <SystemPage title="Quản lý lịch trình ghi hình" description="Cấu hình lịch ghi và tra cứu video Camera đã lưu trong hệ thống.">
    <div className="recording-workspace">
      <div className="rec-tabs" role="group" aria-label="Chế độ quản lý ghi hình">
        <button type="button" aria-pressed={tab==="schedule"} onClick={()=>changeTab("schedule")}><CalendarClock size={18}/> Lịch trình ghi hình</button>
        <button type="button" aria-pressed={tab==="history"} onClick={()=>changeTab("history")}><Film size={18}/> Lịch sử ghi hình</button><button type="button" aria-pressed={tab==="agents"} onClick={()=>changeTab("agents")}>Recording Agent</button>
      </div>
      {tab==="history"?<RecordingHistory key={(params.get("deviceId")||"all")+":"+(params.get("recordingId")||"")} initialDeviceId={params.get("deviceId")||""} initialRecordingId={params.get("recordingId")||""}/>:tab==="agents"?<CameraRecordingAgents/>:<ScheduleWorkspace key={params.get("deviceId")||"all"}/>}
    </div>
  </SystemPage>;
}
