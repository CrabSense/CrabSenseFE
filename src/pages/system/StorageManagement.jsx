import { useCallback, useEffect, useState } from "react";
import systemAdminService from "../../services/systemAdminService";
import { DataTable, KpiGrid, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatBytes, formatWhen } from "./deviceModel";

export default function StorageManagement() {
  const [data, setData] = useState(null);
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
        <Panel title="Lịch sử sử dụng (30 ngày)"><DataTable rows={history.map(item => ({ ...item, id: item.day }))} columns={[
          { key: "day", label: "Ngày", render: row => formatWhen(row.day) },
          { key: "bytes", label: "Dung lượng", render: row => bytes(row.bytes) },
        ]}/></Panel>
      </div>
    </SystemState>
  </SystemPage>;
}
