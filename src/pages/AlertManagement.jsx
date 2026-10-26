
import { useCallback, useEffect, useState } from "react";
import { BellRing, RefreshCw } from "lucide-react";
import alertService from "../services/alertService";
import useSelectedArea from "../hooks/useSelectedArea";

const panel = "rounded-xl border border-[#24382A] bg-[#0D1510] p-5";
const button = "rounded-lg border border-[#38513B] px-3 py-2 text-sm text-[#E3ECE4] hover:border-[#77FF00] disabled:opacity-40";
const field = "w-full rounded-lg border border-[#38513B] bg-[#050806] px-3 py-2 text-sm text-white";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "—";
}

export default function AlertManagement() {
  const { selectedAreaId } = useSelectedArea();

  const [tab, setTab] = useState("active");
  const [days, setDays] = useState(30);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resolveId, setResolveId] = useState(null);

  const [resolution, setResolution] = useState({
    reason: "",
    action: "",
    note: "",
    deviceRecovered: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = tab === "history"
        ? await alertService.getHistory({
            days,
            farmingAreaId: selectedAreaId,
          })
        : await alertService.getAll({
            activeOnly: true,
            farmingAreaId: selectedAreaId,
          });

      setAlerts(data);
    } catch (err) {
      setError(err.message || "Không tải được cảnh báo.");
    } finally {
      setLoading(false);
    }
  }, [tab, days, selectedAreaId]);

  useEffect(() => {
    load();
  }, [load]);

  const execute = async (id, operation) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (operation === "acknowledge") {
        await alertService.acknowledge(id);
      } else if (operation === "process") {
        await alertService.startProcessing(id);
      } else if (operation === "resolve") {
        await alertService.resolve(id, resolution);
        setResolveId(null);
      }

      await load();
      setNotice("Đã cập nhật trạng thái cảnh báo.");
    } catch (err) {
      setError(err.message || "Thao tác thất bại.");
    } finally {
      setBusy(false);
    }
  };

  const openResolve = (id) => {
    setResolveId(id);
    setResolution({
      reason: "",
      action: "",
      note: "",
      deviceRecovered: false,
    });
  };

  return (
    <main className="mx-auto max-w-[1500px] space-y-5 text-[#F4F7F4]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <BellRing className="text-[#77FF00]" />
            Alert Management
          </h1>
          <p className="mt-2 text-sm text-[#91A394]">
            Theo dõi và xử lý cảnh báo từ Backend CrabSense.
          </p>
        </div>

        <button
          className={button}
          disabled={loading || busy}
          onClick={load}
        >
          <RefreshCw size={16} className="mr-2 inline" />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className={`${button} ${
            tab === "active" ? "border-[#77FF00] text-[#77FF00]" : ""
          }`}
          onClick={() => setTab("active")}
        >
          Active Alerts
        </button>

        <button
          className={`${button} ${
            tab === "history" ? "border-[#77FF00] text-[#77FF00]" : ""
          }`}
          onClick={() => setTab("history")}
        >
          Alert History
        </button>

        {tab === "history" && (
          <select
            className={field}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        )}
      </div>

      {selectedAreaId && (
        <p className="text-xs text-[#91A394]">
          Đang sử dụng bộ lọc Farming Area từ Header.
          Theo logic BE hiện tại, cảnh báo không gắn SensorId
          vẫn có thể xuất hiện khi lọc theo khu.
        </p>
      )}

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

      <section className={panel}>
        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-[#91A394]">
            Không có cảnh báo trong phạm vi đang xem.
          </p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-xl border border-[#24382A] bg-[#09100B] p-4"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-semibold">
                      {alert.title || alert.message}
                    </h2>

                    <p className="mt-2 text-sm text-[#A1B0A4]">
                      {alert.description || alert.message}
                    </p>

                    <p className="mt-3 text-xs text-[#91A394]">
                      {alert.farmingAreaName ||
                        alert.locationLabel ||
                        "System"}
                      {" · "}
                      {formatDate(alert.createdAt)}
                    </p>

                    {alert.sensorCode && (
                      <p className="mt-1 text-xs text-[#91A394]">
                        Sensor: {alert.sensorCode}
                      </p>
                    )}

                    {alert.aiRecommendation && (
                      <p className="mt-3 rounded-lg border border-[#24382A] p-3 text-sm text-[#B9D3C0]">
                        Recommendation: {alert.aiRecommendation}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-sm">
                    <p
                      className={
                        alert.severity === "Critical"
                          ? "font-semibold text-red-400"
                          : "font-semibold text-yellow-400"
                      }
                    >
                      {alert.severity}
                    </p>

                    <p className="mt-1">{alert.status}</p>

                    {alert.triggerValue != null && (
                      <p className="mt-2 text-xs">
                        Value: {alert.triggerValue} {alert.unit || ""}
                      </p>
                    )}
                  </div>
                </div>

                {tab === "active" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {alert.status === "Active" && (
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() =>
                          execute(alert.id, "acknowledge")
                        }
                      >
                        Acknowledge
                      </button>
                    )}

                    {["Active", "Acknowledged"].includes(
                      alert.status
                    ) && (
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() => execute(alert.id, "process")}
                      >
                        Start Processing
                      </button>
                    )}

                    {!["Resolved", "Recovered"].includes(
                      alert.status
                    ) && (
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() => openResolve(alert.id)}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                )}

                {resolveId === alert.id && (
                  <form
                    className="mt-4 space-y-3 rounded-lg border border-[#38513B] p-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      execute(alert.id, "resolve");
                    }}
                  >
                    <h3 className="font-semibold">Resolve Alert</h3>

                    <input
                      className={field}
                      placeholder="Resolution reason"
                      value={resolution.reason}
                      onChange={(e) =>
                        setResolution((current) => ({
                          ...current,
                          reason: e.target.value,
                        }))
                      }
                    />

                    <input
                      className={field}
                      placeholder="Action taken"
                      value={resolution.action}
                      onChange={(e) =>
                        setResolution((current) => ({
                          ...current,
                          action: e.target.value,
                        }))
                      }
                    />

                    <textarea
                      className={field}
                      placeholder="Notes"
                      value={resolution.note}
                      onChange={(e) =>
                        setResolution((current) => ({
                          ...current,
                          note: e.target.value,
                        }))
                      }
                    />

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={resolution.deviceRecovered}
                        onChange={(e) =>
                          setResolution((current) => ({
                            ...current,
                            deviceRecovered: e.target.checked,
                          }))
                        }
                      />
                      Device recovered
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-[#77FF00] px-4 py-2 font-semibold text-black"
                        disabled={busy}
                      >
                        Confirm Resolve
                      </button>

                      <button
                        type="button"
                        className={button}
                        onClick={() => setResolveId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
