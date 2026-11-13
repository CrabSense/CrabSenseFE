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
      title="Quản lý lịch trình ghi hình"
      description="Lưu cấu hình lịch ghi trên API. Camera Agent chưa tích hợp; chưa thể xác nhận đang ghi hình."
    >
      <SystemState loading={loading} error={error} onRetry={load}>
        <div className="space-y-4">
          <p className="text-sm text-[#355b6a]">
            Camera system {online} / {cameras.length} online
          </p>
          {cameras.length === 0 ? (
            <p className="text-sm text-[#526f79]">Chưa có camera trên API thiết bị.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cameras.map((camera) => (
                <article
                  key={camera.deviceId}
                  className="overflow-hidden rounded-2xl border border-[#dcebe8] bg-white"
                >
                  {camera.snapshotUrl ? (
                    <img
                      src={camera.snapshotUrl}
                      alt={camera.deviceCode}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-[#eaf2f0] text-xs text-[#54747e]">
                      Không có snapshotUrl
                    </div>
                  )}
                  <div className="space-y-1 p-4 text-sm">
                    <h2 className="font-bold">{camera.name || camera.deviceCode}</h2>
                    <p className="text-[#526f79]">{camera.areaName || "Chưa gán khu"}</p>
                    <p className={statusClass(camera.status)}>{camera.status || "—"}</p>
                    <p className="text-[#355b6a]">
                      {camera.mode} · giữ {camera.retentionDays} ngày
                    </p>
                    <p className="text-xs text-[#526f79]">Runtime: {camera.runtimeStatus === "NotIntegrated" ? "Chưa tích hợp" : camera.runtimeStatus || "Chưa xác minh"}
                    </p>
                    <button
                      type="button"
                      onClick={() => openSchedule(camera)}
                      className="pt-1 text-[#13796e]"
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
                <label className="text-xs text-[#526f79]">
                  Mode
                  <select
                    value={form.mode}
                    onChange={(event) => setForm({ ...form, mode: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm text-[#153b56]"
                  >
                    {MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </label>
                <NumberField label="Retention days" value={form.retentionDays} onChange={(value) => setForm({ ...form, retentionDays: value })} />
                <NumberField label="FPS" value={form.fps} onChange={(value) => setForm({ ...form, fps: value })} />
                <NumberField label="Max storage GB" value={form.maxStorageGb} onChange={(value) => setForm({ ...form, maxStorageGb: value })} />
                <label className="text-xs text-[#526f79] md:col-span-2">
                  Video quality
                  <input
                    value={form.videoQuality}
                    onChange={(event) => setForm({ ...form, videoQuality: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm text-[#153b56]"
                  />
                </label>
                <label className="text-xs text-[#526f79] md:col-span-3">
                  Lịch tuần JSON (day 1–7, thứ Hai đến Chủ nhật)
                  <textarea
                    placeholder={JSON.stringify({timezone:"Asia/Ho_Chi_Minh",slots:[{day:1,start:"08:00",end:"17:00"}]})}
                    value={form.weeklyScheduleJson}
                    onChange={(event) => setForm({ ...form, weeklyScheduleJson: event.target.value })}
                    className="mt-1 min-h-20 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 py-2 text-sm text-[#153b56]"
                  />
                </label>
                <button type="submit" className="h-10 rounded-xl bg-[#147e75] text-sm font-bold text-white">
                  Lưu lịch
                </button>
              </form>
              {actionError ? <p className="mt-3 text-sm text-[#b93838]">{actionError}</p> : null}
            </Panel>
          ) : null}

          <Panel title="Video Camera đã lưu (không xác nhận do lịch ghi tạo)">
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
    <label className="text-xs text-[#526f79]">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-[#dcebe8] bg-[#f7fbfa] px-3 text-sm text-[#153b56]"
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
