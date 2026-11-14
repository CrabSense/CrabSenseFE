import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import systemAdminService from "../../services/systemAdminService";
import { DataTable, KpiGrid, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatBytes, formatWhen } from "./deviceModel";

export default function StorageManagement() {
  const [data, setData] = useState(null);
  const [cameraStorage,setCameraStorage]=useState(null),[cameraError,setCameraError]=useState(""),[cameraPage,setCameraPage]=useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [capacity, usage, history] = await Promise.all([
        systemAdminService.getStorageCapacity(), systemAdminService.getStorageUsage(),
        systemAdminService.getStorageHistory(30),
      ]);
      setData({ capacity, usage, history });
    } catch (err) { setError(err?.message || "Không tải được dữ liệu lưu trữ."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(()=>{const ctrl=new AbortController();setCameraError("");systemAdminService.getRecordingStorage({page:cameraPage,pageSize:25},ctrl.signal).then(v=>{if(!ctrl.signal.aborted)setCameraStorage(v);}).catch(e=>{if(!ctrl.signal.aborted)setCameraError(e.message);});return()=>ctrl.abort();},[cameraPage,data]);
  const { capacity, usage = [], history = [] } = data || {};
  const bytes = value => value == null ? "—" : formatBytes(value);
  return <SystemPage title="Quản lý lưu trữ" description="Dung lượng ổ đĩa API, media theo nhóm và lịch sử sử dụng 30 ngày." actions={<button type="button" className="system-secondary-button" onClick={load}>Làm mới</button>}>
    <SystemState loading={loading} error={error} onRetry={load}>
      <div className="space-y-4">
        <KpiGrid items={[
          { label: "Tổng dung lượng ổ đĩa", value: bytes(capacity?.totalBytes) },
          { label: "Đã sử dụng", value: bytes(capacity?.usedBytes) },
          { label: "Còn trống", value: bytes(capacity?.availableBytes) },
          { label: "Dung lượng media", value: bytes(usage.reduce((sum, item) => sum + (Number(item.bytes) || 0), 0)) },
        ]}/>
        <Panel title="Media theo nhóm"><DataTable rows={usage.map(item => ({ ...item, id: item.category }))} columns={[
          { key: "category", label: "Nhóm" }, { key: "files", label: "Số file" },
          { key: "bytes", label: "Dung lượng", render: row => bytes(row.bytes) },
        ]}/></Panel>
        <Panel title="Dung lượng ghi hình từng Camera">{cameraError?<p role="alert">{cameraError}</p>:cameraStorage?<><DataTable rows={cameraStorage.items} empty="Chưa có Camera." columns={[{key:"deviceCode",label:"Camera"},{key:"scheduleName",label:"Lịch",render:r=><Link className="text-[#13796e] underline" to={"/system/cameras?deviceId="+encodeURIComponent(r.deviceId)}>{r.scheduleName||"Chưa gán"}</Link>},{key:"usedBytes",label:"Đã dùng",render:r=>bytes(r.usedBytes)},{key:"limitBytes",label:"Giới hạn",render:r=>r.limitBytes==null?"Không giới hạn":bytes(r.limitBytes)},{key:"expiredCount",label:"Video hết hạn"},{key:"expiredBytes",label:"Dung lượng hết hạn",render:r=>bytes(r.expiredBytes)},{key:"autoDeleteExpired",label:"Dọn tự động",render:r=>r.autoDeleteExpired?"Đã cấu hình":"Tắt"},{key:"quotaReached",label:"Trạng thái",render:r=>r.quotaReached?"Đã đầy":"Còn hạn mức"}]}/><div className="flex justify-between mt-3"><span>{cameraStorage.totalCount} Camera</span><div className="flex gap-2"><button disabled={cameraPage<=1} onClick={()=>setCameraPage(p=>p-1)}>Trước</button><button disabled={cameraPage*25>=cameraStorage.totalCount} onClick={()=>setCameraPage(p=>p+1)}>Sau</button></div></div></>:<p>Đang tải dữ liệu Camera…</p>}</Panel>
        <Panel title="Lịch sử sử dụng (30 ngày)"><DataTable rows={history.map(item => ({ ...item, id: item.day }))} columns={[
          { key: "day", label: "Ngày", render: row => formatWhen(row.day) },
          { key: "bytes", label: "Dung lượng", render: row => bytes(row.bytes) },
        ]}/></Panel>
      </div>
    </SystemState>
  </SystemPage>;
}
