import { useCallback, useEffect, useState } from "react";

import systemAdminService from "../../services/systemAdminService";
import {
  DataTable,
  KpiGrid,
  Panel,
  SystemPage,
  SystemState,
} from "../../components/system/SystemChrome";
import { formatBytes, formatWhen } from "./deviceModel";

function StorageBackup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [restoreName, setRestoreName] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [mediaSummary, setMediaSummary] = useState(null);
  const [mediaError, setMediaError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMediaError("");
    const results = await Promise.allSettled([
      systemAdminService.getBackups(),
      systemAdminService.getBackupSchedule(),
      systemAdminService.getMediaStorageSummary(),
    ]);
    const mediaResult = results.pop();
    if (mediaResult.status === "fulfilled") setMediaSummary(mediaResult.value);
    else {
      setMediaSummary(null);
      setMediaError(mediaResult.reason?.message || "Không tải được thống kê media.");
    }
    const messages = [];
    const assign = [
      setBackups,
      setSchedule,
    ];
    const labels = ["backup", "schedule"];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") assign[index](result.value);
      else messages.push(result.reason?.message || `Không tải được ${labels[index]}.`);
    });
    setError(messages.join(" "));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);


  const runBackup = async () => {
    setBusy(true);
    setActionError("");
    try {
      await systemAdminService.createBackup();
      await load();
    } catch (backupError) {
      setActionError(backupError?.message || "Không tạo được backup.");
    } finally {
      setBusy(false);
    }
  };

  const runRestore = async (fileName) => {
    if (restoreName !== fileName) {
      setRestoreName(fileName);
      return;
    }
    setBusy(true);
    setActionError("");
    try {
      await systemAdminService.restoreBackup(fileName);
      setRestoreName("");
      await load();
    } catch (restoreError) {
      setActionError(restoreError?.message || "Không phục hồi được backup.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SystemPage
      title="Sao lưu và khôi phục"
      description="Theo dõi dung lượng media đã đăng ký, quản lý bản sao lưu Database và lịch tự động."
      actions={
        <button
          type="button"
          disabled={busy}
          onClick={runBackup}
          className="rounded-xl bg-[#147e75] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          Backup Now
        </button>
      }
    >
      <SystemState loading={loading} error={error && !schedule && !backups.length && !mediaSummary ? error : ""} onRetry={load}>
        <div className="space-y-4">
          {error ? <p className="text-sm text-[#b93838]">{error}</p> : null}
          {actionError ? <p className="text-sm text-[#b93838]">{actionError}</p> : null}
          <KpiGrid items={[
            { label: "Bản sao lưu Database", value: backups.length },
            { label: "Kết quả sao lưu tự động", value: schedule?.lastResult || "—" },
          ]} />
          <Panel title="Dung lượng lưu trữ media">
            <p className="mb-3 text-xs text-[#526f79]">
              Thống kê từ metadata Database, không phải quota Google Drive thực tế.
              Không bao gồm file chưa đăng ký hoặc file mồ côi.
            </p>
            {mediaError ? <div className="text-sm text-[#b93838]">{mediaError} <button type="button" onClick={load} className="underline">Thử lại</button></div> : null}
            {mediaSummary ? <>
              <KpiGrid items={[
                {label:"Số file đã đăng ký",value:mediaSummary.totalFiles},
                {label:"Dung lượng đã đăng ký",value:formatBytes(mediaSummary.totalBytes)},
              ]}/>
              <p className="my-2 text-xs text-[#526f79]">Cập nhật: {formatWhen(mediaSummary.measuredAtUtc)}</p>
              <DataTable empty="Chưa có media." rows={mediaSummary.groups.map(row=>({
                ...row,id:JSON.stringify([row.provider,row.category,row.isShared]),
              }))} columns={[
                {key:"provider",label:"Kho lưu trữ"},
                {key:"category",label:"Loại file"},
                {key:"isShared",label:"Chia sẻ",render:row=>row.isShared?"Đã chia sẻ":"Riêng tư"},
                {key:"fileCount",label:"Số file"},
                {key:"bytes",label:"Dung lượng",render:row=>formatBytes(row.bytes)},
              ]}/>
            </> : null}
          </Panel>
          {schedule ? (
            <Panel title="Backup schedule">
              <form
                className="grid gap-3 md:grid-cols-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setBusy(true);
                  setActionError("");
                  try {
                    await systemAdminService.saveBackupSchedule({
                      enabled: Boolean(schedule.enabled),
                      frequency: schedule.frequency,
                      backupTime: schedule.backupTime,
                      retentionDays: Number(schedule.retentionDays) || 30,
                    });
                    await load();
                  } catch (scheduleError) {
                    setActionError(scheduleError?.message || "Không lưu được lịch backup.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label className="flex items-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(schedule.enabled)}
                    onChange={(event) => setSchedule({ ...schedule, enabled: event.target.checked })}
                  />
                  Enabled
                </label>
                <label className="text-xs text-[#526f79]">
                  Frequency
                  <input
                    value={schedule.frequency || ""}
                    onChange={(event) => setSchedule({ ...schedule, frequency: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm"
                  />
                </label>
                <label className="text-xs text-[#526f79]">
                  Time
                  <input
                    value={schedule.backupTime || ""}
                    onChange={(event) => setSchedule({ ...schedule, backupTime: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm"
                  />
                </label>
                <label className="text-xs text-[#526f79]">
                  Retention days
                  <input
                    type="number"
                    value={schedule.retentionDays ?? 30}
                    onChange={(event) => setSchedule({ ...schedule, retentionDays: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm"
                  />
                </label>
                <button type="submit" disabled={busy} className="h-10 rounded-xl bg-[#147e75] text-sm font-bold text-white">
                  Lưu lịch
                </button>
              </form>
            </Panel>
          ) : null}
          <Panel title="Database backups">
            <DataTable
              empty="Chưa có bản sao lưu."
              rows={backups.map((backup) => ({
                ...backup,
                id: backup.fileName,
              }))}
              columns={[
                { key: "fileName", label: "File" },
                {
                  key: "sizeBytes",
                  label: "Size",
                  render: (row) => formatBytes(row.sizeBytes),
                },
                {
                  key: "createdAtUtc",
                  label: "Created",
                  render: (row) => formatWhen(row.createdAtUtc),
                },
                {
                  key: "action",
                  label: "Restore",
                  render: (row) => (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runRestore(row.fileName)}
                      className="text-[#95600d]"
                    >
                      {restoreName === row.fileName ? "Xác nhận restore" : "Restore"}
                    </button>
                  ),
                },
              ]}
            />
          </Panel>
        </div>
      </SystemState>
    </SystemPage>
  );
}

export default StorageBackup;
