import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import systemAdminService from "../../services/systemAdminService";
import useTranslation from "../../hooks/useTranslation";
import { useSettings } from "../../context/SettingsContext";
import { SystemState } from "../../components/system/SystemChrome";
import {
  countBuckets,
  deviceKind,
  formatBytes,
  formatWhen,
  statusBucket,
  statusClass,
} from "./deviceModel";

const SILENT_SENSOR_MS = 15 * 60 * 1000;

function SystemOverview() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState(null);
  const [health, setHealth] = useState(null);
  const [services, setServices] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [versions, setVersions] = useState([]);
  const [aiServices, setAiServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [usage, setUsage] = useState([]);
  const [history, setHistory] = useState([]);
  const [backups, setBackups] = useState([]);
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notices, setNotices] = useState([]);

  const load = useCallback(async () => {
    setError("");
    const jobs = [
      ["devices", systemAdminService.getDevices()],
      ["sensors", systemAdminService.getSensors()],
      ["alerts", systemAdminService.getAlerts(false)],
      ["alertCount", systemAdminService.getAlertCount()],
      ["health", systemAdminService.getHealth()],
      ["services", systemAdminService.getServices()],
      ["metrics", systemAdminService.getMetrics()],
      ["deployments", systemAdminService.getDeployments()],
      ["versions", systemAdminService.getVersions()],
      ["aiServices", systemAdminService.getAiServices()],
      ["schedules", systemAdminService.getRecordingSchedules()],
      ["capacity", systemAdminService.getStorageCapacity()],
      ["usage", systemAdminService.getStorageUsage()],
      ["history", systemAdminService.getStorageHistory(30)],
      ["backups", systemAdminService.getBackups()],
      ["security", systemAdminService.getSecurityOverview()],
    ];
    const settled = await Promise.allSettled(jobs.map((job) => job[1]));
    const failed = [];
    const apply = {
      devices: setDevices,
      sensors: setSensors,
      alerts: setAlerts,
      alertCount: setAlertCount,
      health: setHealth,
      services: setServices,
      metrics: setMetrics,
      deployments: setDeployments,
      versions: setVersions,
      aiServices: setAiServices,
      schedules: setSchedules,
      capacity: setCapacity,
      usage: setUsage,
      history: setHistory,
      backups: setBackups,
      security: setSecurity,
    };
    settled.forEach((result, index) => {
      const key = jobs[index][0];
      if (result.status === "fulfilled") apply[key](result.value);
      else failed.push(result.reason?.message || key);
    });
    setNotices(failed);
    if (failed.length === jobs.length) {
      setError(failed[0] || "Không tải được tổng quan hệ thống.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshSeconds = Number.isInteger(Number(settings.refreshInterval))
    ? Number(settings.refreshInterval)
    : 30;

  useEffect(() => {
    const timer = window.setInterval(load, refreshSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [load, refreshSeconds]);

  const cameras = useMemo(
    () => devices.filter((device) => deviceKind(device) === "camera"),
    [devices],
  );
  const controllers = useMemo(
    () => devices.filter((device) => deviceKind(device) === "controller"),
    [devices],
  );
  const cameraCounts = countBuckets(cameras, (item) => item.status);
  const sensorCounts = countBuckets(sensors, (item) =>
    item.isActive === false ? "offline" : item.lastSeenAt ? "online" : "other",
  );
  const controllerCounts = countBuckets(controllers, (item) => item.status);
  const onlineDevices = cameraCounts.online + sensorCounts.online + controllerCounts.online;
  const knownDevices = cameras.length + sensors.length + controllers.length;
  const offlineDevices =
    cameraCounts.offline + sensorCounts.offline + controllerCounts.offline;

  const overall = overallStatus(health, services, offlineDevices);
  const storageUsed = capacity?.usedBytes ?? metrics?.storageUsedBytes;
  const storageTotal = capacity?.totalBytes ?? metrics?.storageTotalBytes;
  const storagePct = percent(storageUsed, storageTotal);
  const ramPct = percent(metrics?.ramUsedBytes, metrics?.ramTotalBytes);
  const activeAlerts = alertCount?.unreadCount ?? alertCount?.count ?? alerts.filter((alert) => alert.status === "Active").length;
  const aiRunning = aiServices.filter((service) => service.status === "Running").length;
  const recording = schedules.filter((camera) => camera.mode && camera.mode !== "Disabled");
  const latestBackup = [...backups].sort(
    (a, b) => new Date(b.createdAtUtc) - new Date(a.createdAtUtc),
  )[0];
  const latestDeploy = deployments[0];
  const backendVersion = versions.find((row) => row.component === "Backend API");

  const silentSensors = sensors.filter((sensor) => {
    if (sensor.isActive === false) return false;
    if (!sensor.lastSeenAt) return true;
    return Date.now() - new Date(sensor.lastSeenAt).getTime() > SILENT_SENSOR_MS;
  });
  const offlineCameras = cameras.filter((camera) => statusBucket(camera.status) === "offline");
  const offlineControllers = controllers.filter(
    (device) => statusBucket(device.status) === "offline",
  );
  const stoppedAi = aiServices.filter((service) => service.status !== "Running");

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.6px]">{t("nav.systemOverview")}</h1>
          <p className="mt-1 text-sm text-[#9AAB9E]">CrabSense Infrastructure Monitoring</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusPill status={overall} />
          <span className="text-[#9AAB9E]">Cập nhật {formatWhen(health?.checkedAtUtc || metrics?.sampledAtUtc)}</span>
          <button type="button" onClick={load} className="rounded-full border border-white/15 px-3 py-1 text-xs">
            Làm mới
          </button>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#C6D7C9]">
            Tự làm mới {refreshSeconds}s
          </span>
        </div>
      </div>

      <SystemState loading={loading} error={error} onRetry={load}>
        <div className="space-y-4">
          {notices.length ? (
            <p className="rounded-xl border border-[#F5C451]/30 bg-[#F5C451]/10 px-3 py-2 text-sm text-[#F5C451]">
              Một số nguồn không tải được: {notices.join(" · ")}
            </p>
          ) : null}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Kpi label="System Health" value={overall} hint="Healthy / Degraded / Critical / Unknown" />
            <Kpi
              label="Devices Online"
              value={knownDevices ? `${onlineDevices}/${knownDevices}` : "0"}
              hint={offlineDevices ? `${offlineDevices} offline` : "Không có thiết bị offline"}
            />
            <Kpi
              label="AI Services"
              value={aiServices.length ? `${aiRunning}/${aiServices.length}` : "0"}
              hint={aiServices.length ? "Theo sổ dịch vụ đã đăng ký" : "Chưa đăng ký dịch vụ AI"}
            />
            <Kpi
              label="Storage Usage"
              value={storagePct == null ? "—" : `${storagePct}%`}
              hint={storageTotal ? `${formatBytes(storageUsed)} / ${formatBytes(storageTotal)}` : "Chưa đọc được ổ đĩa"}
            />
            <Kpi label="Active Alerts" value={activeAlerts} hint="Cảnh báo chưa đọc" />
            <Kpi label="System Uptime" value="—" hint="API chưa trả thời gian chạy máy chủ" />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card title="Device Status" action="View Devices" to="/system/devices">
              <DeviceBar label="Cameras" counts={cameraCounts} total={cameras.length} />
              <DeviceBar label="Sensors" counts={sensorCounts} total={sensors.length} />
              <DeviceBar label="Controllers" counts={controllerCounts} total={controllers.length} />
            </Card>
            <Card title="Core Services" action="Xem tại trang này">
              <ServiceList rows={services} />
            </Card>
            <Card title="AI Services Health" action="View AI" to="/system/ai">
              {aiServices.length === 0 ? (
                <Empty text="Chưa có dịch vụ AI. Không suy ra latency hay GPU." />
              ) : (
                <ul className="space-y-2 text-sm">
                  {aiServices.map((service) => (
                    <li key={service.id} className="flex items-center justify-between gap-3">
                      <span>
                        <span className="font-semibold">{service.name}</span>
                        <span className="ml-2 text-[#8EA292]">{service.version}</span>
                      </span>
                      <span className={statusClass(service.status)}>{service.status}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-[#8EA292]">Inference latency không được lưu trên backend.</p>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card title="Server Resources" action="Mẫu hiện tại, không phải 24 giờ">
              <Meter label="CPU" value={metrics ? Math.round(metrics.cpuPercent) : null} hint="Mẫu 150ms của tiến trình API" />
              <Meter label="RAM" value={ramPct} hint={metrics ? `${formatBytes(metrics.ramUsedBytes)} / ${formatBytes(metrics.ramTotalBytes)}` : ""} />
              <Meter label="Disk" value={storagePct} hint={capacity?.driveName || ""} />
              <p className="mt-2 text-xs text-[#8EA292]">
                GPU không được đo. Network hiện tại: vào {formatBytes(metrics?.networkBytesReceived)} · ra {formatBytes(metrics?.networkBytesSent)}.
              </p>
            </Card>
            <Card title="Recording & Storage" action="View Recording" to="/system/cameras">
              <p className="text-sm">
                Camera đang bật ghi: {recording.length}/{schedules.length || cameras.length}
              </p>
              <UsageList rows={usage} />
              <HistoryBars points={history} />
              <p className="mt-2 text-xs text-[#8EA292]">
                Biểu đồ là dung lượng media theo ngày. API chưa có sự kiện recording failure.
              </p>
            </Card>
            <Card title="Security Overview" action="View Security" to="/system/security">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Failed logins 24h" value={security?.failedLogins ?? "—"} />
                <Stat label="Active sessions" value={security?.activeSessions ?? "—"} />
                <Stat label="API keys" value={security?.apiKeys ?? "—"} />
                <Stat label="Security alerts" value={security?.securityAlerts ?? "—"} />
              </dl>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card title="Backup & Deployment" action="View Infrastructure" to="/system/storage">
              <p className="text-sm">
                Backup gần nhất: {latestBackup ? `${latestBackup.fileName} · ${formatBytes(latestBackup.sizeBytes)} · ${formatWhen(latestBackup.createdAtUtc)}` : "Chưa có bản sao lưu"}
              </p>
              <p className="mt-2 text-sm">
                Backend đang chạy: {backendVersion?.version || "—"} ({backendVersion?.source || "assembly"})
              </p>
              <p className="mt-2 text-sm">
                Triển khai gần nhất: {latestDeploy ? `${latestDeploy.component} ${latestDeploy.version} · ${latestDeploy.status}` : "Chưa ghi triển khai"}
              </p>
              <Link to="/system/deployment" className="mt-3 inline-block text-xs font-semibold text-[#77FF00]">
                Xem lịch sử triển khai
              </Link>
            </Card>
            <Card title="Alerts & Activity" action="View Logs" to="/system/logs" className="xl:col-span-2">
              {alerts.length === 0 ? (
                <Empty text="Không có cảnh báo." />
              ) : (
                <ul className="divide-y divide-white/10 text-sm">
                  {alerts.slice(0, 6).map((alert) => (
                    <li key={alert.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                      <span>
                        <span className={statusClass(alert.severity)}>{alert.severity}</span>
                        <span className="ml-2">{alert.title || alert.message}</span>
                      </span>
                      <span className="text-xs text-[#8EA292]">
                        {alert.sensorCode || alert.category || "alert"} · {formatWhen(alert.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <Card title="Tình huống CrabSense">
            <ul className="grid gap-2 text-sm md:grid-cols-2">
              <Situation
                label="Camera mất kết nối"
                items={offlineCameras.map((camera) => camera.name || camera.deviceCode)}
                empty="Không có camera offline."
              />
              <Situation
                label="Sensor không gửi dữ liệu (hơn 15 phút)"
                items={silentSensors.map((sensor) => sensor.sensorCode)}
                empty="Không có sensor im lặng."
              />
              <Situation
                label="Controller offline"
                items={offlineControllers.map((device) => device.name || device.deviceCode)}
                empty="Không có controller offline."
              />
              <Situation
                label="AI không chạy"
                items={stoppedAi.map((service) => `${service.name} (${service.status})`)}
                empty={aiServices.length ? "Mọi dịch vụ đã đăng ký đang Running." : "Chưa đăng ký dịch vụ AI."}
              />
              <li>
                Dung lượng: {storagePct != null && storagePct >= 85 ? `ổ đĩa đã dùng ${storagePct}%.` : "chưa chạm ngưỡng 85%."}
              </li>
              <li>
                Backup: {latestBackup ? `bản gần nhất lúc ${formatWhen(latestBackup.createdAtUtc)}.` : "chưa có bản sao lưu thành công nào được ghi nhận."}
              </li>
            </ul>
          </Card>
        </div>
      </SystemState>
    </div>
  );
}

function overallStatus(health, services, offlineDevices) {
  if (!health) return "Unknown";
  const failed = services.some((service) => /error|critical|failed/i.test(service.status || ""));
  if (!health.databaseConnected || failed) return "Critical";
  const degraded = services.some((service) => /warning|degraded|stopped/i.test(service.status || ""));
  if (degraded || offlineDevices > 0 || health.status !== "Healthy") return "Degraded";
  return "Healthy";
}

function percent(used, total) {
  const u = Number(used);
  const t = Number(total);
  if (!Number.isFinite(u) || !Number.isFinite(t) || t <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((u / t) * 100)));
}

function Kpi({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#101810] px-4 py-4">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8EA292] uppercase">{label}</p>
      <p className="mt-2 text-[26px] font-bold tracking-[-0.5px]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#8EA292]">{hint}</p> : null}
    </article>
  );
}

function Card({ title, action, to, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#101810] p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold tracking-[0.04em] text-[#D7E6DA] uppercase">{title}</h2>
        {to ? (
          <Link to={to} className="text-xs font-semibold text-[#77FF00]">{action}</Link>
        ) : action ? (
          <span className="text-xs text-[#8EA292]">{action}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DeviceBar({ label, counts, total }) {
  const online = counts.online || 0;
  const warning = counts.warning || 0;
  const offline = counts.offline || 0;
  const other = counts.other || 0;
  const width = (count) => (total ? `${(count / total) * 100}%` : "0%");
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-[#C6D7C9]">{online} / {total}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
        <span className="bg-[#77FF00]" style={{ width: width(online) }} />
        <span className="bg-[#F5C451]" style={{ width: width(warning) }} />
        <span className="bg-[#FF8D8D]" style={{ width: width(offline) }} />
        <span className="bg-white/30" style={{ width: width(other) }} />
      </div>
    </div>
  );
}

function ServiceList({ rows }) {
  if (!rows.length) return <Empty text="Không đọc được dịch vụ." />;
  return (
    <ul className="space-y-2 text-sm">
      {rows.map((service) => (
        <li key={service.name} className="flex items-center justify-between gap-3">
          <span>{service.name}</span>
          <span className={statusClass(service.status)}>{service.status}</span>
        </li>
      ))}
    </ul>
  );
}

function Meter({ label, value, hint }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>{value == null ? "—" : `${value}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full bg-[#7AA2FF]" style={{ width: `${value || 0}%` }} />
      </div>
      {hint ? <p className="mt-1 text-xs text-[#8EA292]">{hint}</p> : null}
    </div>
  );
}

function UsageList({ rows }) {
  if (!rows.length) return null;
  return (
    <ul className="mt-3 space-y-1 text-xs text-[#C6D7C9]">
      {rows.slice(0, 5).map((row) => (
        <li key={row.category} className="flex justify-between">
          <span>{row.category}</span>
          <span>{formatBytes(row.bytes)}</span>
        </li>
      ))}
    </ul>
  );
}

function HistoryBars({ points }) {
  if (!points.length) return <p className="mt-3 text-xs text-[#8EA292]">Chưa có media trong 30 ngày.</p>;
  const max = Math.max(...points.map((point) => Number(point.bytes) || 0), 1);
  return (
    <div className="mt-3 flex h-16 items-end gap-1">
      {points.slice(-30).map((point) => (
        <span
          key={point.day}
          title={`${formatWhen(point.day)} · ${formatBytes(point.bytes)}`}
          className="flex-1 rounded-sm bg-[#77FF00]/70"
          style={{ height: `${Math.max(4, ((Number(point.bytes) || 0) / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-[#8EA292]">{label}</dt>
      <dd className="text-xl font-bold">{value}</dd>
    </div>
  );
}

function Situation({ label, items, empty }) {
  const names = items.filter(Boolean).slice(0, 4);
  return (
    <li>
      <span className="font-semibold">{label}: </span>
      {names.length ? names.join(", ") : empty}
      {items.length > names.length ? ` +${items.length - names.length}` : ""}
    </li>
  );
}

function StatusPill({ status }) {
  return <span className={`rounded-full bg-white/5 px-3 py-1 text-sm font-semibold ${statusClass(status)}`}>{status}</span>;
}

function Empty({ text }) {
  return <p className="text-sm text-[#9AAB9E]">{text}</p>;
}

Kpi.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired, hint: PropTypes.string };
Card.propTypes = { title: PropTypes.string.isRequired, action: PropTypes.string, to: PropTypes.string, children: PropTypes.node, className: PropTypes.string };
DeviceBar.propTypes = { label: PropTypes.string.isRequired, counts: PropTypes.object.isRequired, total: PropTypes.number.isRequired };
ServiceList.propTypes = { rows: PropTypes.array.isRequired };
Meter.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number, hint: PropTypes.string };
UsageList.propTypes = { rows: PropTypes.array.isRequired };
HistoryBars.propTypes = { points: PropTypes.array.isRequired };
Stat.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired };
Situation.propTypes = { label: PropTypes.string.isRequired, items: PropTypes.array.isRequired, empty: PropTypes.string.isRequired };
StatusPill.propTypes = { status: PropTypes.string.isRequired };
Empty.propTypes = { text: PropTypes.string.isRequired };

export default SystemOverview;
