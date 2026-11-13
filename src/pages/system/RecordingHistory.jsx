import {useEffect,useRef,useState} from "react";
import PropTypes from "prop-types";
import {Film,HardDrive,Video,Search,RefreshCw,Download,Trash2,PlayCircle,ChevronLeft,ChevronRight,X,Clock,Filter} from "lucide-react";
import systemAdminService from "../../services/systemAdminService";
import {formatBytes} from "./deviceModel";
import {EMPTY_FILTERS,PREVIEW_LIMIT,DOWNLOAD_LIMIT,recordingQuery,recordingTime,durationLabel,modeLabel,csvCell} from "./recordingHistoryModel.js";

function saveBlob(blob,name){
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function RecordingDetails({item,onClose,onDeleted,onNotice}){
  const [detail,setDetail]=useState(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState("");
  const [url,setUrl]=useState("");
  const [confirm,setConfirm]=useState(false);
  const active=useRef(true), request=useRef(null), busyRef=useRef(false), objectUrl=useRef("");
  useEffect(()=>{
    active.current=true;
    const controller=new AbortController();
    systemAdminService.getRecordingDetail(item.id,controller.signal).then(data=>{if(!controller.signal.aborted)setDetail(data);}).catch(err=>{if(!controller.signal.aborted)setError(err.message||"Không tải được chi tiết.");}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>{active.current=false;controller.abort();request.current?.abort();if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);};
  },[item.id]);
  const data=detail||item;
  const act=async action=>{
    if(busyRef.current)return;
    busyRef.current=true;setBusy(action);setError("");
    const controller=new AbortController();request.current=controller;
    try{
      if(action==="delete"){
        await systemAdminService.deleteRecording(item.id);
        onNotice("Đã xóa bản ghi và file video.");onDeleted(item.id);
        return;
      }
      const limit=action==="play"?PREVIEW_LIMIT:DOWNLOAD_LIMIT;
      if(data.sizeBytes>limit)throw new Error(action==="play"?"Video lớn hơn 128 MiB. Hãy tải xuống để xem.":"Video lớn hơn 500 MiB, vượt giới hạn tải của trang.");
      const blob=await systemAdminService.getRecordingBlob(item.id,action==="download",controller.signal,limit);
      if(!active.current||controller.signal.aborted)return;
      if(action==="download"){saveBlob(blob,data.fileName||"camera-video");onNotice("Đã nhận file video từ BE.");}
      else{
        if(!blob.type.startsWith("video/"))throw new Error("Định dạng chưa hỗ trợ phát trong trình duyệt. Hãy tải xuống.");
        if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);
        objectUrl.current=URL.createObjectURL(blob);setUrl(objectUrl.current);
      }
    }catch(err){if(active.current&&!controller.signal.aborted)setError(err.message||"Thao tác thất bại.");}
    finally{busyRef.current=false;if(active.current)setBusy("");}
  };
  return <aside className="rec-detail" aria-label="Chi tiết bản ghi">
    <header><div><h2>Xem lại bản ghi</h2><p>{data.deviceCode||"Camera"}</p></div><button type="button" className="rec-icon" aria-label="Đóng chi tiết" disabled={busy==="delete"} onClick={onClose}><X size={20}/></button></header>
    <div className="rec-detail-body">
      {error&&<p role="alert" className="rec-error">{error}</p>}
      {loading&&<p role="status" className="rec-muted">Đang tải thông tin…</p>}
      <div className="rec-player">{url?<video controls playsInline preload="metadata" src={url} onError={()=>setError("Không phát được định dạng/codec video. Bạn có thể tải xuống để xem bằng trình phát phù hợp.")}/>:<div><Film size={36}/><strong>{data.fileName}</strong><span>Video đã lưu · không phải live</span><button type="button" disabled={Boolean(busy)||loading||!detail||data.sizeBytes>PREVIEW_LIMIT} onClick={()=>act("play")}><PlayCircle size={18}/>{busy==="play"?"Đang tải video…":"Phát lại video"}</button>{data.sizeBytes>PREVIEW_LIMIT&&<small>Video lớn hơn 128 MiB, hãy tải xuống để xem.</small>}</div>}</div>
      <h3>Thông tin bản ghi</h3>
      <dl className="rec-facts"><dt>Tên file</dt><dd>{data.fileName}</dd><dt>Camera</dt><dd>{[data.deviceCode,data.cameraName].filter(Boolean).join(" · ")||"—"}</dd><dt>Vị trí hiện tại</dt><dd>{[data.areaName,data.rowName].filter(Boolean).join(" / ")||"Chưa gán"}</dd><dt>Thời điểm lưu</dt><dd>{recordingTime(data.createdAt)}</dd><dt>Bắt đầu quay</dt><dd>{recordingTime(data.startedAt)}</dd><dt>Kết thúc quay</dt><dd>{recordingTime(data.endedAt)}</dd><dt>Thời lượng</dt><dd>{durationLabel(data.durationSeconds)}</dd><dt>Dung lượng</dt><dd>{formatBytes(data.sizeBytes)}</dd><dt>Chế độ ghi</dt><dd>{modeLabel(data.recordingMode)}</dd><dt>Kho lưu trữ</dt><dd>{data.provider||"—"}</dd><dt>Nguồn bản ghi</dt><dd>{data.source==="LegacyMedia"?"Media đã lưu":data.source||"Chưa xác định"}</dd></dl>
      <p className="rec-muted">Thời điểm lưu không phải thời điểm quay. Metadata chưa có từ Camera Agent được để chưa xác định.</p>
      {busy&&busy!=="delete"&&<button className="system-secondary-button" type="button" onClick={()=>request.current?.abort()}>Hủy tải</button>}
      {data.sizeBytes>DOWNLOAD_LIMIT&&<p className="rec-muted">File lớn hơn 500 MiB, trang này chưa hỗ trợ tải xuống.</p>}
    </div>
    <footer>{confirm?<div className="rec-confirm"><strong>Xóa video vĩnh viễn?</strong><p>{data.fileName} sẽ bị xóa khỏi kho lưu trữ nếu BE xác nhận đủ quyền và không còn liên kết nghiệp vụ.</p><div><button className="system-secondary-button" type="button" disabled={Boolean(busy)} onClick={()=>setConfirm(false)}>Hủy</button><button className="rec-danger" type="button" disabled={Boolean(busy)} onClick={()=>act("delete")}>{busy==="delete"?"Đang xóa…":"Xác nhận xóa"}</button></div></div>:<><button type="button" className="system-primary-button rec-button" disabled={Boolean(busy)||loading||!detail||data.sizeBytes>DOWNLOAD_LIMIT} onClick={()=>act("download")}><Download size={16}/>{busy==="download"?"Đang tải…":"Tải xuống"}</button><button className="rec-danger rec-button" type="button" disabled={Boolean(busy)||loading||!detail} onClick={()=>setConfirm(true)}><Trash2 size={16}/> Xóa bản ghi</button></>}</footer>
  </aside>;
}
RecordingDetails.propTypes={item:PropTypes.object.isRequired,onClose:PropTypes.func.isRequired,onDeleted:PropTypes.func.isRequired,onNotice:PropTypes.func.isRequired};

export default function RecordingHistory({initialDeviceId=""}){
  const [draft,setDraft]=useState(()=>({...EMPTY_FILTERS,deviceId:initialDeviceId}));
  const [filters,setFilters]=useState(()=>({...EMPTY_FILTERS,deviceId:initialDeviceId}));
  const [page,setPage]=useState(1),[pageSize,setPageSize]=useState(25);
  const [result,setResult]=useState(null),[cameras,setCameras]=useState([]),[areas,setAreas]=useState([]);
  const [catalogError,setCatalogError]=useState(""),[error,setError]=useState(""),[filterError,setFilterError]=useState(""),[notice,setNotice]=useState("");
  const [loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[selected,setSelected]=useState(null),[exporting,setExporting]=useState(false);
  const exportAbort=useRef(null),exportBusy=useRef(false);
  useEffect(()=>{
    let active=true;
    Promise.allSettled([systemAdminService.getCameras(),systemAdminService.getDeviceLocations()]).then(([c,a])=>{
      if(!active)return;
      if(c.status==="fulfilled")setCameras(c.value);
      if(a.status==="fulfilled")setAreas(a.value);
      setCatalogError(c.status==="rejected"||a.status==="rejected"?"Không tải được toàn bộ danh mục Camera/khu/dãy. Vẫn có thể tìm theo tên và ngày.":"");
    });return()=>{active=false;};
  },[revision]);
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setError("");
    systemAdminService.getRecordingLibrary(recordingQuery(filters,page,pageSize),controller.signal).then(data=>{
      if(controller.signal.aborted)return;
      if(page>1&&data.totalPages<page){setPage(Math.max(1,data.totalPages));return;}
      setResult(data);
    }).catch(err=>{if(!controller.signal.aborted)setError(err.message||"Không tải được lịch sử ghi hình.");}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[filters,page,pageSize,revision]);
  useEffect(()=>()=>exportAbort.current?.abort(),[]);
  const refresh=()=>{setSelected(null);setRevision(n=>n+1);};
  const change=(key,value)=>setDraft(old=>({...old,[key]:value,...(key==="farmingAreaId"?{farmingRowId:""}:{})}));
  const apply=event=>{event.preventDefault();try{recordingQuery(draft,1,pageSize);setFilterError("");setFilters({...draft});setPage(1);setSelected(null);}catch(err){setFilterError(err.message);}};
  const clear=()=>{setDraft({...EMPTY_FILTERS});setFilters({...EMPTY_FILTERS});setPage(1);setSelected(null);setFilterError("");};
  const exportList=async()=>{
    if(exportBusy.current||loading||error||!result)return;
    exportBusy.current=true;setExporting(true);setNotice("");
    const controller=new AbortController();exportAbort.current=controller;
    try{
      const max=5000;if(result.totalCount>max)throw new Error("Hãy thu hẹp bộ lọc xuống tối đa 5.000 bản ghi để xuất CSV.");
      const records=[];let p=1;
      while(true){
        const data=await systemAdminService.getRecordingLibrary(recordingQuery(filters,p,200),controller.signal);
        if(data.totalCount>max||records.length+data.items.length>max)throw new Error("Danh sách thay đổi. Hãy thu hẹp bộ lọc trước khi xuất.");
        records.push(...data.items);if(p>=data.totalPages||!data.items.length)break;p++;
      }
      if(controller.signal.aborted)return;
      const rows=[["Tên file","Mã Camera","Tên Camera","Khu hiện tại","Dãy hiện tại","Thời điểm lưu","Dung lượng (bytes)","Thời lượng (giây)","Chế độ ghi"],...records.map(r=>[r.fileName,r.deviceCode,r.cameraName,r.areaName,r.rowName,recordingTime(r.createdAt),r.sizeBytes,r.durationSeconds,modeLabel(r.recordingMode)])];
      saveBlob(new Blob(["\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}),"crabsense-recordings.csv");setNotice("Đã xuất "+records.length+" bản ghi theo bộ lọc.");
    }catch(err){if(!controller.signal.aborted)setNotice(err.message||"Không xuất được danh sách.");}
    finally{exportBusy.current=false;if(!controller.signal.aborted)setExporting(false);}
  };
  const rows=draft.farmingAreaId?areas.find(a=>a.id===draft.farmingAreaId)?.rows||[]:areas.flatMap(a=>a.rows||[]);
  const current=result?.items||[];
  return <div className="rec-history">
    <div className="rec-toolbar"><div><h2>Lịch sử ghi hình</h2><p>Video kỹ thuật Camera đã lưu · Múi giờ Việt Nam (UTC+7)</p></div><div><button type="button" className="system-secondary-button rec-button" disabled={loading} onClick={refresh}><RefreshCw size={16} className={loading?"animate-spin":""}/> Làm mới</button><button type="button" className="system-primary-button rec-button" disabled={loading||exporting||!result||Boolean(error)} onClick={exportList}><Download size={16}/>{exporting?"Đang xuất…":"Xuất danh sách"}</button></div></div>
    {notice&&<p role="status" className="rec-notice">{notice}</p>}
    <div className="rec-metrics">{[[Film,"Tổng video",result?.totalCount],[HardDrive,"Tổng dung lượng",result?formatBytes(result.totalBytes):null],[Video,"Camera có video",result?.cameraCount]].map(([Icon,label,value])=><article key={label}><span><Icon size={23}/></span><div><small>{label}</small><strong>{loading||error?"—":value??"—"}</strong><small>Theo bộ lọc hiện tại</small></div></article>)}</div>
    <form className="rec-filter" onSubmit={apply}><h3><Filter size={17}/> Bộ lọc bản ghi</h3>
      {catalogError&&<p role="alert" className="rec-notice">{catalogError}</p>}{filterError&&<p role="alert" className="rec-error">{filterError}</p>}
      <div className="rec-filter-grid">
        <label className="rec-search"><span>Tìm kiếm</span><div><Search size={16}/><input value={draft.search} onChange={e=>change("search",e.target.value)} maxLength={200} placeholder="Tên file, mã Camera…"/></div></label>
        <label>Camera<select value={draft.deviceId} onChange={e=>change("deviceId",e.target.value)}><option value="">Tất cả Camera</option>{draft.deviceId&&!cameras.some(c=>c.id===draft.deviceId)&&<option value={draft.deviceId}>Camera đã chọn</option>}{cameras.map(c=><option key={c.id} value={c.id}>{c.deviceCode} · {c.name||"Camera"}</option>)}</select></label>
        <label>Khu nuôi<select value={draft.farmingAreaId} onChange={e=>change("farmingAreaId",e.target.value)}><option value="">Tất cả khu</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name||a.code}</option>)}</select></label>
        <label>Dãy nuôi<select value={draft.farmingRowId} onChange={e=>change("farmingRowId",e.target.value)}><option value="">Tất cả dãy</option>{rows.map(r=><option key={r.id} value={r.id}>{r.name||r.code}</option>)}</select></label>
        <label>Từ ngày lưu<input type="date" value={draft.from} onChange={e=>change("from",e.target.value)}/></label><label>Đến ngày lưu<input type="date" value={draft.to} onChange={e=>change("to",e.target.value)}/></label>
        <div className="rec-filter-actions"><button type="button" className="system-secondary-button" onClick={clear}>Đặt lại</button><button className="system-primary-button rec-button" type="submit"><Filter size={15}/> Lọc</button></div>
      </div>
    </form>
    {error?<div role="alert" className="rec-error">{error} <button className="system-secondary-button" type="button" onClick={refresh}>Thử lại</button></div>:loading?<div className="rec-loading" role="status"><RefreshCw size={20} className="animate-spin"/> Đang tải bản ghi từ API…</div>:<div className="rec-layout">
      <section className="rec-list"><header><h3><Film size={18}/> Danh sách bản ghi</h3><span>{result?.totalCount||0} kết quả</span></header>
        {current.length?<div className="rec-table-scroll" tabIndex={0} role="region" aria-label="Bảng video Camera"><table className="rec-table"><thead><tr><th scope="col">Tên file / Camera</th><th scope="col">Khu / Dãy hiện tại</th><th scope="col">Thời điểm lưu</th><th scope="col">Thời lượng</th><th scope="col">Dung lượng</th><th scope="col">Chế độ ghi</th><th scope="col">Thao tác</th></tr></thead><tbody>{current.map(r=><tr key={r.id} className={selected?.id===r.id?"selected":""}><td><button className="rec-file" type="button" onClick={()=>setSelected(r)}><span><Film size={21}/></span><div><strong>{r.fileName}</strong><small>{r.deviceCode} · {r.cameraName||"Camera"}</small></div></button></td><td>{[r.areaName,r.rowName].filter(Boolean).join(" / ")||"Chưa gán"}</td><td>{recordingTime(r.createdAt)}</td><td>{durationLabel(r.durationSeconds)}</td><td>{formatBytes(r.sizeBytes)}</td><td><span className="rec-mode">{modeLabel(r.recordingMode)}</span></td><td><button type="button" className="rec-icon" title="Xem video" aria-label={"Xem "+r.fileName} onClick={()=>setSelected(r)}><PlayCircle size={19}/></button></td></tr>)}</tbody></table></div>:<div className="rec-empty"><Film size={36}/><strong>Chưa có video phù hợp</strong><p>Video sẽ xuất hiện khi được lưu vào kho media kỹ thuật Camera. Thử đổi bộ lọc hoặc làm mới.</p></div>}
        <div className="rec-pagination"><span>Hiển thị {result?.totalCount?(page-1)*pageSize+1:0}–{Math.min(page*pageSize,result?.totalCount||0)} / {result?.totalCount||0} bản ghi</span><div><label>Số dòng <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);setSelected(null);}}>{[10,25,50,100].map(n=><option key={n}>{n}</option>)}</select></label><button className="rec-icon" type="button" disabled={page<=1} onClick={()=>{setPage(n=>n-1);setSelected(null);}} aria-label="Trang trước"><ChevronLeft size={19}/></button><strong>{page} / {Math.max(1,result?.totalPages||0)}</strong><button className="rec-icon" type="button" disabled={page>=(result?.totalPages||0)} onClick={()=>{setPage(n=>n+1);setSelected(null);}} aria-label="Trang sau"><ChevronRight size={19}/></button></div></div>
      </section>
      {selected&&<RecordingDetails key={selected.id} item={selected} onClose={()=>setSelected(null)} onNotice={setNotice} onDeleted={id=>{setSelected(old=>old?.id===id?null:old);setRevision(n=>n+1);}}/>}
    </div>}
    <p className="rec-footnote"><Clock size={14}/> Ngày lọc là ngày lưu file; khu/dãy là vị trí hiện tại của Camera. Không suy đoán thời lượng hoặc chế độ ghi.</p>
  </div>;
}
RecordingHistory.propTypes={initialDeviceId:PropTypes.string};
