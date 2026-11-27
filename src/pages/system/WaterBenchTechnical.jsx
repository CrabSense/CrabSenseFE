import {useEffect,useState} from "react";
import {RefreshCw} from "lucide-react";
import fetchAPI from "../../services/api";
import {DataTable,KpiGrid,Panel,SystemPage,SystemState} from "../../components/system/SystemChrome";
import {technicalPage,pageCounters} from "./waterBenchTechnicalModel";
import useTranslation from "../../hooks/useTranslation";

const size=25;
const show=v=>v==null||v===""?"—":String(v);
const time=v=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleString():"—";
export default function WaterBenchTechnical(){
 const {language}=useTranslation();
 const en=language==="en",t=(vi,eng)=>en?eng:vi;
 const [page,setPage]=useState(1),[revision,setRevision]=useState(0);
 const [state,setState]=useState({loading:true,value:null,error:""});
 useEffect(()=>{
   let active=true,busy=false,controller;
   const run=async()=>{
      if(busy)return;busy=true;controller=new AbortController();
      setState({loading:true,value:null,error:""});
      try{
        const result=await fetchAPI("/system/water-bench/stations?"+new URLSearchParams({page:String(page),pageSize:String(size)}),
          {signal:controller.signal,cache:"no-store"});
        const value=technicalPage(result,page,size);
        if(active)setState({loading:false,value,error:""});
      }catch(e){if(active&&!controller.signal.aborted)setState({loading:false,value:null,error:e.message||"WaterBench unavailable"});}
      finally{busy=false;}
   };
   run();const timer=setInterval(run,30000);
   return()=>{active=false;controller?.abort();clearInterval(timer);};
 },[page,revision]);
 const data=state.value?.page===page?state.value:null;
 const c=data?pageCounters(data.rows):null;
 const freshness=r=>r.technicalReceiptFreshness==="recent"?t("Biên nhận gần đây","Recent receipt"):
   r.technicalReceiptFreshness==="stale"?t("Biên nhận cũ","Stale receipt"):t("Chưa quan sát","Unobserved");
 const columns=[
   {key:"kioskCode",label:"Kiosk",render:r=><div className="min-w-32"><strong>{show(r.kioskCode)}</strong><p>{show(r.kioskSoftwareVersion)}</p><p className="text-xs">{r.stationRevoked?t("Trạm đã thu hồi","Station revoked"):t("Trạm chưa thu hồi","Station not revoked")}</p></div>},
   {key:"hardware",label:t("Cặp phần cứng","Hardware pair"),render:r=><div className="font-mono text-xs">Master: {show(r.masterHardwareId)}<br/>Slave: {show(r.slaveHardwareId)}<br/>Config: {r.configurationVersion}</div>},
   {key:"kioskReportedStatus",label:t("Kiosk báo cáo","Kiosk report"),render:r=><div>{show(r.kioskReportedStatus)}<p className="text-xs">{time(r.kioskLastSeenAt)}</p></div>},
   {key:"technicalReceiptFreshness",label:t("Biên nhận kỹ thuật","Technical receipt"),render:r=><div>{freshness(r)}<p className="text-xs">{time(r.lastTechnicalReceiptAt)}</p><p>{r.technicalReceipts24h} / 24h</p></div>},
   {key:"cameraErrors24h",label:t("Camera / đồng hồ (24h)","Camera / clock (24h)"),render:r=><div>{t("Lỗi camera","Camera errors")}: {r.cameraErrors24h}<p>{t("Quan sát đồng hồ","Clock observations")}: {r.clockObservations24h}</p></div>},
   {key:"ai",label:t("Xử lý AI (24h)","AI processing (24h)"),render:r=><div className="min-w-36">{t("Lỗi có thể retry","Retryable failures")}: {r.retryableFailures24h}<p>{t("Lỗi hợp đồng","Contract blocked")}: {r.contractBlocked24h}</p><p>{t("Lease hết hạn","Expired lease")}: {r.expiredRunningLeases24h}</p><p>{t("Lease còn hạn","Active lease")}: {r.activeRunningLeases24h}</p></div>},
 ];
 return <SystemPage title={t("Kỹ thuật WaterBench","WaterBench diagnostics")}
    description={t("Giám sát kỹ thuật toàn hệ thống — chỉ đọc","Platform technical monitoring — read only")}
    actions={<button className="system-secondary-button" disabled={state.loading} onClick={()=>setRevision(n=>n+1)}><RefreshCw size={16}/>{t("Tải lại","Refresh")}</button>}>
    <p className="mb-4 text-sm text-[#54747e]">{t("Biên nhận gần đây không xác nhận phần cứng đang chạy. Bộ đếm AI 24h là lịch sử lần thử, không phải số sự cố đang mở. Không hiển thị dữ liệu hóa học hoặc phát lệnh.","Recent receipts do not prove live hardware operation. AI counts are historical attempts, not open incidents. No chemical data or commands.")}</p>
    <SystemState loading={state.loading} error={state.error} onRetry={()=>setRevision(n=>n+1)}>
      {data&&c&&<>
       <KpiGrid items={[
         {label:t("Tổng trạm","Total stations"),value:data.total,hint:t("Toàn hệ thống","All stations")},
         {label:t("Trạm trên trang","Stations on page"),value:c.stations},
         {label:t("Biên nhận cũ / chưa có","Stale / unobserved"),value:c.stale,hint:t("Trang hiện tại","Current page")},
         {label:t("Lỗi camera 24h","Camera errors 24h"),value:c.cameraErrors,hint:t("Trang hiện tại","Current page")},
         {label:t("Lỗi AI / lease hết hạn","AI contract / expired lease"),value:c.aiTechnical,hint:t("Trang hiện tại, 24h","Current page, 24h")},
       ]}/>
       <Panel title={t("Trạm và bằng chứng kỹ thuật","Stations and technical evidence")}>
        <p className="mb-3 text-xs text-[#54747e]">{t("Dữ liệu lúc","Data as of")}: {time(data.generatedAt)} · {t("Từ","Since")}: {time(data.windowStart)}</p>
        <DataTable columns={columns} rows={data.rows} empty={t("Không có trạm trên trang này.","No stations on this page.")}/>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <span>{t("Trang","Page")} {page}/{Math.max(1,Math.ceil(data.total/size))}</span>
          <div className="flex gap-2"><button className="system-secondary-button" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{t("Trước","Previous")}</button><button className="system-secondary-button" disabled={page*size>=data.total} onClick={()=>setPage(p=>p+1)}>{t("Sau","Next")}</button></div>
        </div>
       </Panel>
      </>}
    </SystemState>
 </SystemPage>;
}
