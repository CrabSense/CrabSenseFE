
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import alertThresholdService from "../services/alertThresholdService";

const panel = "rounded-xl border border-[#24382A] bg-[#0D1510] p-5";
const field = "w-full rounded-lg border border-[#304736] bg-[#050806] px-3 py-2 text-sm text-[#F4F7F4] outline-none focus:border-[#77FF00]";
const action = "rounded-lg bg-[#77FF00] px-4 py-2 text-sm font-semibold text-[#050806] disabled:opacity-40";

const emptyForm = {
  sensorType: "",
  minValue: "",
  maxValue: "",
  severity: "Warning",
  isActive: true,
};

export default function EnvironmentalThresholds() {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await alertThresholdService.getAll();
      setThresholds(data);
    } catch (err) {
      setError(err.message || "Không tải được cấu hình.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const change = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const startCreate = () => {
    setEditingId("new");
    setForm({ ...emptyForm });
    setError("");
    setNotice("");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      sensorType: item.sensorType,
      minValue: String(item.minValue),
      maxValue: String(item.maxValue),
      severity: item.severity,
      isActive: Boolean(item.isActive),
    });
    setError("");
    setNotice("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const minValue = Number(form.minValue);
    const maxValue = Number(form.maxValue);

    if (
      !form.sensorType.trim() ||
      form.minValue === "" ||
      form.maxValue === "" ||
      !Number.isFinite(minValue) ||
      !Number.isFinite(maxValue) ||
      minValue >= maxValue
    ) {
      setError("SensorType bắt buộc và Min phải nhỏ hơn Max.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (editingId === "new") {
        await alertThresholdService.create({
          sensorType: form.sensorType.trim(),
          minValue,
          maxValue,
          severity: form.severity,
        });
      } else {
        await alertThresholdService.update(editingId, {
          minValue,
          maxValue,
          severity: form.severity,
          isActive: form.isActive,
        });
      }

      setEditingId(null);
      await load();
      setNotice("Đã lưu cấu hình trên Backend.");
    } catch (err) {
      setError(err.message || "Không thể lưu cấu hình.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa ngưỡng ${item.sensorType}?`)) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await alertThresholdService.remove(item.id);
      await load();
      setNotice("Đã xóa cấu hình ngưỡng.");
    } catch (err) {
      setError(err.message || "Không thể xóa.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1500px] space-y-5 text-[#F4F7F4]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Environmental Thresholds
          </h1>
          <p className="mt-2 text-sm text-[#91A394]">
            Cấu hình ngưỡng cảnh báo cảm biến realtime.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className={field}
            onClick={load}
            disabled={loading || busy}
          >
            <RefreshCw size={16} className="mr-2 inline" />
            Refresh
          </button>

          <button
            className={action}
            onClick={startCreate}
            disabled={busy}
          >
            <Plus size={16} className="mr-2 inline" />
            Add Threshold
          </button>
        </div>
      </div>

      <div className={`${panel} text-sm text-[#AAC5B0]`}>
        Các ngưỡng trong trang này áp dụng theo SensorType.
        Backend ưu tiên MinThreshold và MaxThreshold riêng
        của cảm biến nếu đã cấu hình.
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/40 p-3 text-red-400">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-lg border border-[#77FF00]/40 p-3 text-[#77FF00]">
          {notice}
        </div>
      )}

      {editingId && (
        <form onSubmit={handleSave} className={`${panel} space-y-4`}>
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">
              {editingId === "new" ? "Create Threshold" : "Edit Threshold"}
            </h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <label className="space-y-2 text-sm">
              <span>Sensor Type</span>
              <input
                className={field}
                required
                disabled={editingId !== "new"}
                value={form.sensorType}
                onChange={(e) => change("sensorType", e.target.value)}
                placeholder="SensorType từ BE"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span>Min Value</span>
              <input
                type="number"
                step="any"
                required
                className={field}
                value={form.minValue}
                onChange={(e) => change("minValue", e.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span>Max Value</span>
              <input
                type="number"
                step="any"
                required
                className={field}
                value={form.maxValue}
                onChange={(e) => change("maxValue", e.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span>Severity</span>
              <select
                className={field}
                value={form.severity}
                onChange={(e) => change("severity", e.target.value)}
              >
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </label>
          </div>

          {editingId !== "new" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => change("isActive", e.target.checked)}
              />
              Active
            </label>
          )}

          <button type="submit" className={action} disabled={busy}>
            <Save size={16} className="mr-2 inline" />
            Save Changes
          </button>
        </form>
      )}

      <section className={`${panel} overflow-x-auto`}>
        {loading ? (
          <p>Loading thresholds...</p>
        ) : thresholds.length === 0 ? (
          <p className="text-[#91A394]">
            Backend chưa có cấu hình ngưỡng nào.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#24382A] text-[#91A394]">
                <th className="p-3">Sensor Type</th>
                <th className="p-3">Min</th>
                <th className="p-3">Max</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {thresholds.map((item) => (
                <tr key={item.id} className="border-b border-[#24382A]">
                  <td className="p-3 font-medium">{item.sensorType}</td>
                  <td className="p-3">{item.minValue}</td>
                  <td className="p-3">{item.maxValue}</td>
                  <td className="p-3">{item.severity}</td>
                  <td className="p-3">
                    <span className={item.isActive ? "text-[#77FF00]" : "text-[#91A394]"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="space-x-4 whitespace-nowrap p-3">
                    <button
                      className="text-[#77FF00]"
                      disabled={busy}
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400"
                      disabled={busy}
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={15} className="inline" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
