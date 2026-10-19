import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [media, setMedia] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [restoreName, setRestoreName] = useState("");
  const [capacity, setCapacity] = useState(null);
  const [usage, setUsage] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedule, setSchedule] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      systemAdminService.getMedia(),
      systemAdminService.getBackups(),
      systemAdminService.getStorageCapacity(),
      systemAdminService.getStorageUsage(),
      systemAdminService.getStorageHistory(30),
      systemAdminService.getBackupSchedule(),
    ]);
    const messages = [];
    const assign = [
      setMedia,
      setBackups,
      setCapacity,
      setUsage,
      setHistory,
      setSchedule,
    ];
    const labels = ["media", "backup", "capacity", "usage", "history", "schedule"];
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

  const mediaGroups = useMemo(() => {
    const groups = new Map();
    media.forEach((item) => {
      const key = item.category || "unknown";
      const current = groups.get(key) || { id: key, category: key, files: 0, bytes: 0 };
      current.files += 1;
      current.bytes += Number(item.sizeBytes) || 0;
      groups.set(key, current);
    });
    return [...groups.values()];
  }, [media]);

  const mediaBytes = mediaGroups.reduce((sum, group) => sum + group.bytes, 0);

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
      title="Storage & Backup"
      description="Dung lượng ổ chứa API, file media và bản sao lưu database. Lịch backup được lưu nhưng chưa có job tự chạy."
      actions={
        <button
          type="button"
          disabled={busy}
          onClick={runBackup}
          className="rounded-xl bg-[#77FF00] px-4 py-2 text-sm font-bold text-[#071007] disabled:opacity-60"
        >
          Backup Now
        </button>
      }
    >
      <SystemState loading={loading} error={error && !media.length && !backups.length ? error : ""} onRetry={load}>
        <div className="space-y-4">
          {error ? <p className="text-sm text-[#FFB4B4]">{error}</p> : null}
          {actionError ? <p className="text-sm text-[#FFB4B4]">{actionError}</p> : null}
          <KpiGrid
            items={[
              {
                label: "Media stored",
                value: formatBytes(mediaBytes),
                hint: `${media.length} file từ GET /api/media`,
              },
              {
                label: "DB backups",
                value: backups.length,
                hint: "GET /api/admin/db/backups",
              },
              {
                label: "Drive used",
                value: capacity ? formatBytes(capacity.usedBytes) : "—",
                hint: capacity
                  ? `${capacity.driveName} / ${formatBytes(capacity.totalBytes)}`
                  : "GET /api/storage/capacity",
              },
              {
                label: "Drive free",
                value: capacity ? formatBytes(capacity.availableBytes) : "—",
              },
            ]}
          />
          <Panel title="Storage usage">
            <DataTable
              empty="Chưa có nhóm dung lượng."
              rows={usage.map((item) => ({ ...item, id: item.category }))}
              columns={[
                { key: "category", label: "Category" },
                { key: "files", label: "Files" },
                { key: "bytes", label: "Size", render: (row) => formatBytes(row.bytes) },
              ]}
            />
          </Panel>
          <Panel title="Usage history (30 days)">
            <DataTable
              empty="Chưa có file media trong 30 ngày."
              rows={history.map((point) => ({ ...point, id: point.day }))}
              columns={[
                { key: "day", label: "Day", render: (row) => formatWhen(row.day) },
                { key: "bytes", label: "Bytes", render: (row) => formatBytes(row.bytes) },
              ]}
            />
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
                <label className="text-xs text-[#9AAB9E]">
                  Frequency
                  <input
                    value={schedule.frequency || ""}
                    onChange={(event) => setSchedule({ ...schedule, frequency: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                  />
                </label>
                <label className="text-xs text-[#9AAB9E]">
                  Time
                  <input
                    value={schedule.backupTime || ""}
                    onChange={(event) => setSchedule({ ...schedule, backupTime: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                  />
                </label>
                <label className="text-xs text-[#9AAB9E]">
                  Retention days
                  <input
                    type="number"
                    value={schedule.retentionDays ?? 30}
                    onChange={(event) => setSchedule({ ...schedule, retentionDays: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                  />
                </label>
                <button type="submit" disabled={busy} className="h-10 rounded-xl bg-[#77FF00] text-sm font-bold text-[#071007]">
                  Lưu lịch
                </button>
              </form>
            </Panel>
          ) : null}
          <Panel title="Media by category">
            <DataTable
              empty="Chưa có file media."
              rows={mediaGroups}
              columns={[
                { key: "category", label: "Category" },
                { key: "files", label: "Files" },
                {
                  key: "bytes",
                  label: "Size",
                  render: (row) => formatBytes(row.bytes),
                },
              ]}
            />
          </Panel>
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
                      className="text-[#F5C451]"
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
