import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

import systemAdminService from "../../services/systemAdminService";
import { DataTable, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatBytes, formatWhen, statusClass } from "./deviceModel";

const MODES = ["Disabled", "Continuous", "MotionDetection", "AiEvent", "Scheduled"];

function CameraRecording() {
  const [cameras, setCameras] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [schedules, recordings] = await Promise.all([
        systemAdminService.getRecordingSchedules(),
        systemAdminService.getRecordings(),
      ]);
      setCameras(schedules);
      setHistory(recordings);
    } catch (loadError) {
      setError(loadError?.message || "Không tải được camera.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const online = cameras.filter((camera) =>
    ["online", "connected", "active", "running"].includes(
      String(camera.status || "").toLowerCase(),
    ),
  ).length;

  const openSchedule = (camera) => {
    setSelectedId(camera.deviceId);
    setForm({
      mode: camera.mode || "Disabled",
      retentionDays: camera.retentionDays ?? 30,
      videoQuality: camera.videoQuality || "",
      fps: camera.fps ?? "",
      maxStorageGb: camera.maxStorageGb ?? "",
      weeklyScheduleJson: camera.weeklyScheduleJson || "",
    });
    setActionError("");
  };

  const save = async (event) => {
    event.preventDefault();
    if (!selectedId || !form) return;
    setActionError("");
    try {
      await systemAdminService.saveRecording(selectedId, {
        mode: form.mode,
        retentionDays: Number(form.retentionDays) || 30,
        videoQuality: form.videoQuality || null,
        fps: form.fps === "" ? null : Number(form.fps),
        maxStorageGb: form.maxStorageGb === "" ? null : Number(form.maxStorageGb),
        weeklyScheduleJson: form.weeklyScheduleJson || null,
      });
      await load();
    } catch (saveError) {
      setActionError(saveError?.message || "Không lưu được lịch ghi.");
    }
  };

  return (
    <SystemPage
      title="Camera & Recording"
      description="Camera là thiết bị loại camera hoặc có stream/snapshot. Lịch ghi lưu trên API; file lịch sử lấy từ media video đã có."
    >
      <SystemState loading={loading} error={error} onRetry={load}>
        <div className="space-y-4">
          <p className="text-sm text-[#C6D7C9]">
            Camera system {online} / {cameras.length} online
          </p>
          {cameras.length === 0 ? (
            <p className="text-sm text-[#9AAB9E]">Chưa có camera trên API thiết bị.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cameras.map((camera) => (
                <article
                  key={camera.deviceId}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#101810]"
                >
                  {camera.snapshotUrl ? (
                    <img
                      src={camera.snapshotUrl}
                      alt={camera.deviceCode}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-black/30 text-xs text-[#8EA292]">
                      Không có snapshotUrl
                    </div>
                  )}
                  <div className="space-y-1 p-4 text-sm">
                    <h2 className="font-bold">{camera.name || camera.deviceCode}</h2>
                    <p className="text-[#9AAB9E]">{camera.areaName || "Chưa gán khu"}</p>
                    <p className={statusClass(camera.status)}>{camera.status || "—"}</p>
                    <p className="text-[#C6D7C9]">
                      {camera.mode} · giữ {camera.retentionDays} ngày
                    </p>
                    <button
                      type="button"
                      onClick={() => openSchedule(camera)}
                      className="pt-1 text-[#77FF00]"
                    >
                      Recording schedule
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {form ? (
            <Panel title="Recording schedule">
              <form onSubmit={save} className="grid gap-3 md:grid-cols-3">
                <label className="text-xs text-[#9AAB9E]">
                  Mode
                  <select
                    value={form.mode}
                    onChange={(event) => setForm({ ...form, mode: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]"
                  >
                    {MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </label>
                <NumberField label="Retention days" value={form.retentionDays} onChange={(value) => setForm({ ...form, retentionDays: value })} />
                <NumberField label="FPS" value={form.fps} onChange={(value) => setForm({ ...form, fps: value })} />
                <NumberField label="Max storage GB" value={form.maxStorageGb} onChange={(value) => setForm({ ...form, maxStorageGb: value })} />
                <label className="text-xs text-[#9AAB9E] md:col-span-2">
                  Video quality
                  <input
                    value={form.videoQuality}
                    onChange={(event) => setForm({ ...form, videoQuality: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]"
                  />
                </label>
                <label className="text-xs text-[#9AAB9E] md:col-span-3">
                  Weekly schedule JSON
                  <textarea
                    value={form.weeklyScheduleJson}
                    onChange={(event) => setForm({ ...form, weeklyScheduleJson: event.target.value })}
                    className="mt-1 min-h-20 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 py-2 text-sm text-[#F4F7F4]"
                  />
                </label>
                <button type="submit" className="h-10 rounded-xl bg-[#77FF00] text-sm font-bold text-[#071007]">
                  Lưu lịch
                </button>
              </form>
              {actionError ? <p className="mt-3 text-sm text-[#FFB4B4]">{actionError}</p> : null}
            </Panel>
          ) : null}

          <Panel title="Recording history">
            <DataTable
              empty="Chưa có file video trong media."
              rows={history}
              columns={[
                { key: "createdAt", label: "Time", render: (row) => formatWhen(row.createdAt) },
                { key: "fileName", label: "File" },
                { key: "category", label: "Category" },
                { key: "sizeBytes", label: "Size", render: (row) => formatBytes(row.sizeBytes) },
              ]}
            />
          </Panel>
        </div>
      </SystemState>
    </SystemPage>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="text-xs text-[#9AAB9E]">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]"
      />
    </label>
  );
}

NumberField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
};

export default CameraRecording;
