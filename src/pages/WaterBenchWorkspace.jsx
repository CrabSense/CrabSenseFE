import { useEffect,useMemo,useState } from "react";
import { FlaskConical,RefreshCw } from "lucide-react";
import useSelectedArea from "../hooks/useSelectedArea";
import useTranslation from "../hooks/useTranslation";
import waterBench from "../services/waterBenchService";
import { batchKey,channels,verifySnapshot,verifyEstimates } from "../services/waterBenchModel";
import { StationOperations, BatchOperations } from "./waterBench/Operations";

const panel="rounded-xl border border-[#24382A] bg-[#0D1510] p-5";
const field="rounded-lg border border-[#38513B] bg-[#050806] px-3 py-2 text-sm text-[#F4F7F4]";
const display=(v)=>v===null||v===undefined?"—":String(v);
const states={
  not_attempted:["Chưa phân tích","Not attempted"],inference_running:["Đang phân tích","Inference running"],
  retry_available:["Có thể thử lại","Retry available"],retry_backoff:["Chờ thử lại","Retry backoff"],
  retry_exhausted:["Hết lượt thử","Retry exhausted"],technical_review_required:["Cần kiểm tra kỹ thuật","Technical review required"],
  retest_recommended:["Đề nghị đo lại","Retest recommended"],needs_retest:["Cần đo lại","Retest required"],
  estimate_review_required:["Ước tính — chờ duyệt","Estimate — review required"],
  awaiting_assessment:["Chờ đánh giá","Awaiting assessment"],operator_confirmation_required:["Cần xác nhận điều kiện","Operator confirmation required"],
  awaiting_terminal_evidence:["Chờ bằng chứng hoàn tất","Awaiting terminal evidence"],awaiting_media:["Chờ ảnh","Awaiting image"],
  already_assessed:["Đã đánh giá","Already assessed"],firmware_complete_reported:["Firmware báo hoàn tất","Firmware reports complete"],
  running_observed:["Đang chạy","Running observed"],interrupted_observed:["Gián đoạn","Interrupted"],fault_reported:["Báo lỗi","Fault reported"],
  awaiting_firmware_completion:["Chờ hoàn tất firmware","Awaiting firmware completion"],incomplete_evidence:["Thiếu bằng chứng","Incomplete evidence"],
  completed:["Hoàn tất xử lý","Processing complete"],missing_session:["Thiếu phiên","Missing session"]
};
function ScopeWorkspace({areaId,language}) {
  const en=language==="en", tr=(vi,eng)=>en?eng:vi;
  const label=(status)=>states[status]?.[en?1:0]??display(status);
  const [stationRevision,setStationRevision]=useState(0);
  const [batchRevision,setBatchRevision]=useState(0);
  const [overview,setOverview]=useState({loading:true,batches:[],station:null,error:null});
  const [selected,setSelected]=useState("");
  const [detail,setDetail]=useState({loading:false,error:null,data:null});
  const batch=useMemo(()=>{
    if(!selected)return null;
    const [stationId,bootId,firmwareBatchId]=selected.split(":");
    return {stationId,bootId,firmwareBatchId};
  },[selected]);
  useEffect(()=>{
    const controller=new AbortController();
    let active=true;
    setOverview(previous=>({...previous,refreshing:true,error:null}));
    Promise.all([waterBench.station(areaId,controller.signal),waterBench.batches(areaId,controller.signal)]).then(([station,batches])=>{
      if(!active)return;
      if(!Array.isArray(batches))throw new Error("Invalid batch list");
      setOverview({loading:false,refreshing:false,station,batches,error:null,loadedRevision:stationRevision});
      setSelected(previous=>batches.some(b=>batchKey(b)===previous)?previous:(batches.length?batchKey(batches[0]):""));
    }).catch(error=>{if(active)setOverview(previous=>({...previous,loading:false,refreshing:false,error:error.message}));});
    return ()=>{active=false;controller.abort();};
  },[areaId,stationRevision]);
  useEffect(()=>{
    const controller=new AbortController();
    let active=true;
    if(!batch){setDetail({loading:false,error:null,data:null});return ()=>controller.abort();}
    setDetail({loading:true,error:null,data:null});
    Promise.all([waterBench.detail(areaId,batch,controller.signal),waterBench.results(areaId,batch,controller.signal),
      waterBench.readiness(areaId,batch,controller.signal),waterBench.retry(areaId,batch,controller.signal),
      waterBench.receipts(areaId,batch,controller.signal)]).then(async ([timeline,results,readiness,retry,receipts])=>{
        if(!active)return;
        verifySnapshot(batch,timeline?.timeline,receipts,[results,readiness,retry]);
        await verifyEstimates(batch,results,receipts,(analyte,signal)=>waterBench.evidence(areaId,batch,analyte,signal),controller.signal);
        if(!active)return;
        setDetail({loading:false,error:null,data:{timeline,results,readiness,retry,receipts,key:batchKey(batch),revision:batchRevision}});
      }).catch(error=>{if(active)setDetail({loading:false,error:error.message,data:null});});
    return ()=>{active=false;controller.abort();};
  },[areaId,batch,batchRevision]);
  const data=detail.data?.key===selected&&detail.data?.revision===batchRevision?detail.data:null;
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3">
      <div><h2 className="text-lg font-semibold">{tr("Trạm và phiên phân tích","Station and batches")}</h2>
        <p className="text-sm text-[#98AA9A]">{tr("Tra cứu 50 phiên gần nhất trong khu đã chọn.","Latest 50 batches in the selected area.")}</p></div>
      <button className={field+" flex items-center gap-2"} onClick={()=>{setStationRevision(n=>n+1);setBatchRevision(n=>n+1);}} disabled={overview.refreshing||detail.loading}><RefreshCw size={16}/>{tr("Tải lại","Refresh")}</button>
    </div>
    {overview.loading&&<p role="status">{tr("Đang tải…","Loading…")}</p>}
    {overview.error&&<p role="alert" className="text-red-300">{overview.error}</p>}
    {!overview.loading&&!overview.error&&<>
      <section className={panel}>
        <h3 className="font-semibold">{tr("Cấu hình trạm","Station configuration")}</h3>
        {overview.station?<dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>{tr("Phiên bản","Version")}: {display(overview.station.configurationVersion)}</div>
          <div>{tr("Lịch","Schedule")}: {overview.station.enabled===true?tr("Có hiệu lực","Enabled"):tr("Chưa có hiệu lực","Not enabled")}</div>
          <div>{tr("Hiệu chuẩn","Calibration")}: {overview.station.profilesReady===true?tr("Sẵn sàng","Ready"):tr("Chưa sẵn sàng","Not ready")}</div>
          <div>{tr("Giờ chạy","Schedule times")}: {overview.station.times?.join(", ")||"—"} ({display(overview.station.timezone)})</div>
        </dl>:<p className="mt-2 text-sm">{tr("Chưa đăng ký trạm.","No station registered.")}</p>}
      </section>
      <fieldset disabled={overview.refreshing} className="min-w-0 disabled:opacity-60"><StationOperations key={(overview.station?.stationId??"unregistered")+":"+overview.loadedRevision} areaId={areaId} station={overview.station} language={language} onChanged={()=>setStationRevision(n=>n+1)}/></fieldset>
      <section className={panel}>
        <label className="block font-semibold" htmlFor="bench-batch">{tr("Phiên phân tích","Analysis batch")}</label>
        {overview.batches.length===0?<p className="mt-2">{tr("Chưa có phiên.","No batches.")}</p>:
          <select id="bench-batch" className={field+" mt-3 w-full"} value={selected} onChange={e=>setSelected(e.target.value)}>
            {overview.batches.map(b=><option key={batchKey(b)} value={batchKey(b)}>{b.firmwareBatchId} · {b.start?.mode??"—"} · {new Date(b.createdAt).toLocaleString(en?"en-GB":"vi-VN")}</option>)}
          </select>}
      </section>
      {detail.loading&&<p role="status">{tr("Đang tải chi tiết…","Loading details…")}</p>}
      {detail.error&&<p role="alert" className="text-red-300">{detail.error}</p>}
      {data&&<>
        <section className={panel}>
          <h3 className="font-semibold">{tr("Bằng chứng phiên","Batch evidence")}</h3>
          <p className="mt-2">{label(data.timeline?.timeline?.status)}</p>
          {data.timeline?.observationStale===true&&<p className="text-amber-300 text-sm">{tr("Quan sát đã cũ; không suy ra thiết bị đang chạy.","Observation is stale; live hardware state is unknown.")}</p>}
          <p className="mt-2 text-sm">{tr("Biên nhận","Receipts")}: {display(data.receipts?.total)} · {tr("Ảnh","Images")}: {display(data.receipts?.mediaCount)}</p>
        </section>
        <div className="grid gap-3 lg:grid-cols-3">
          {channels(data.results,data.readiness,data.retry).map(c=><section key={c.analyte} className={panel}>
            <h3 className="text-xl font-semibold">{c.analyte}</h3>
            <p className="mt-3 text-2xl font-semibold">{display(c.estimate)} {c.unit??""}</p>
            <p className="mt-2 text-sm text-amber-300">{tr("Ước tính, chưa xác thực hóa học.","Estimate, not chemically validated.")}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div>{tr("Kết quả","Result")}: {label(c.resultStatus)}</div>
              <div>{tr("Điều kiện AI","AI readiness")}: {label(c.readiness)}</div>
              <div>{tr("Retry","Retry")}: {label(c.retryStatus)}</div>
              <div>{tr("Lần thử","Attempts")}: {display(c.attempts)}/{display(c.maxAttempts)}</div>
              <div>{tr("Sai số kiểm định","Holdout error")}: {display(c.holdoutError)}</div>
            </dl>
          </section>)}
        </div>
        <BatchOperations key={selected} areaId={areaId} batch={batch} data={data} language={language} onChanged={()=>setBatchRevision(n=>n+1)}/>
      </>}
    </>}
  </div>;
}
export default function WaterBenchWorkspace() {
  const {areas,selectedAreaId,setSelectedAreaId,areasLoading,areasError}=useSelectedArea();
  const {language}=useTranslation();
  const en=language==="en";
  const area=areas.find(x=>x.id===selectedAreaId);
  return <div className="space-y-5 text-[#E3ECE4]">
    <header className="flex items-center gap-3"><FlaskConical className="text-[#77FF00]"/><h1 className="text-2xl font-semibold">{en?"Water analysis":"Phân tích nước"}</h1></header>
    <p className="text-sm text-[#98AA9A]">{en?"Manage station, schedule and AI assessments. No dosing or publication commands.":"Quản lý trạm, lịch và đánh giá AI; không phát lệnh hóa chất hoặc công bố kết quả."}</p>
    <label className="block" htmlFor="bench-area">{en?"Farm area":"Khu nuôi"}</label>
    <select id="bench-area" className={field+" w-full max-w-md"} value={area?.id??""} onChange={e=>setSelectedAreaId(e.target.value||null)} disabled={areasLoading}>
      <option value="">{en?"Select area":"Chọn khu nuôi"}</option>
      {areas.map(a=><option key={a.id} value={a.id}>{a.name??a.code??a.id}</option>)}
    </select>
    {areasError&&<p role="alert" className="text-red-300">{String(areasError)}</p>}
    {area&&<ScopeWorkspace key={area.id} areaId={area.id} language={language}/>}
  </div>;
}
