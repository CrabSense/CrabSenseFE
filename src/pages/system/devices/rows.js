import { deviceKind, formatWhen } from "../deviceModel";

const STALE_MS = 15 * 60 * 1000;

export const STATUS_LABEL = {
  online: "Online",
  offline: "Offline",
  warning: "Cảnh báo",
  maintenance: "Bảo trì",
  other: "Khác",
};

export function formatAgo(value) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff) || diff < 0) return formatWhen(value);
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return `${seconds} giây trước`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} giờ trước`;
  return formatWhen(value);
}

export function kindLabel(kind) {
  if (kind === "camera") return "Camera";
  if (kind === "sensor") return "Cảm biến";
  return "Bộ điều khiển";
}

export function hardwareLabel(raw) {
  const value = String(raw || "").toLowerCase();
  if (value === "ras") return "RAS";
  if (value === "esp32" || value === "esp32-s3") return "ESP32";
  if (value.includes("camera")) return "Camera IP";
  if (value === "gateway") return "Gateway";
  if (!value || value === "sensor") return "";
  return value;
}

function isStale(value) {
  if (!value) return false;
  const diff = Date.now() - new Date(value).getTime();
  return !Number.isNaN(diff) && diff > STALE_MS;
}

function sensorWarning(sensor) {
  const reading = Number(sensor?.latestValue);
  if (!Number.isFinite(reading)) return false;
  const min = sensor?.minThreshold;
  const max = sensor?.maxThreshold;
  if (min != null && reading < Number(min)) return true;
  if (max != null && reading > Number(max)) return true;
  return false;
}

export function statusKeyOf(row) {
  if (row.source === "sensor") {
    if (row.raw?.isActive === false || !row.raw?.lastSeenAt) return "offline";
    if (sensorWarning(row.raw) || isStale(row.raw.lastSeenAt)) return "warning";
    return "online";
  }
  const value = String(row.raw?.status || "").toLowerCase();
  if (value === "maintenance") return "maintenance";
  if (["offline", "disconnected", "inactive"].includes(value)) return "offline";
  if (["error", "warning", "degraded"].includes(value)) return "warning";
  if (["online", "connected", "active", "running"].includes(value)) {
    if (row.issues?.length || isStale(row.lastSeen)) return "warning";
    return "online";
  }
  return row.lastSeen ? "warning" : "offline";
}

export function connectionLabel(row) {
  if (row.ip) return row.ip;
  if (row.source === "sensor") return row.raw?.deviceId ? "Qua bộ điều khiển" : "Chưa gắn";
  return "Chưa có IP";
}

export function mapDeviceRows(devices, sensors) {
  const codeCounts = new Map();
  const ipCounts = new Map();
  devices.forEach((device) => {
    const code = String(device.deviceCode || "").trim().toLowerCase();
    const ip = String(device.ipAddress || "").trim();
    if (code) codeCounts.set(code, (codeCounts.get(code) || 0) + 1);
    if (ip) ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
  });

  const deviceRows = devices.map((device) => {
    const kind = deviceKind(device);
    const issues = [];
    const code = String(device.deviceCode || "").trim().toLowerCase();
    const ip = String(device.ipAddress || "").trim();
    if (code && codeCounts.get(code) > 1) issues.push("Trùng mã");
    if (ip && ipCounts.get(ip) > 1) issues.push("Trùng IP");
    return {
      id: device.id,
      source: "device",
      code: device.deviceCode,
      name: device.name || device.deviceCode,
      type: kind,
      typeLabel: kindLabel(kind),
      hardware: hardwareLabel(device.deviceType),
      area: device.areaName || device.areaCode || "",
      row: device.rowName || device.rowCode || "",
      location: [device.areaName, device.rowName, device.installationLocation].filter(Boolean).join(" · ") || "—",
      ip: device.ipAddress || "",
      mac: device.macAddress || "",
      lastSeen: device.lastSeenAt,
      firmware: device.firmwareVersion || "",
      issues,
      raw: device,
    };
  });
  const sensorRows = sensors.map((sensor) => ({
    id: sensor.id,
    source: "sensor",
    code: sensor.sensorCode,
    name: sensor.sensorCode,
    type: "sensor",
    typeLabel: "Cảm biến",
    hardware: hardwareLabel(sensor.sensorType),
    area: "",
    row: "",
    location: "—",
    ip: "",
    mac: "",
    lastSeen: sensor.lastSeenAt,
    firmware: "",
    issues: [],
    raw: sensor,
  }));
  return [...deviceRows, ...sensorRows].map((row) => ({
    ...row,
    statusKey: statusKeyOf(row),
  }));
}

export function duplicateSummary(devices) {
  const byCode = new Map();
  const byIp = new Map();
  devices.forEach((device) => {
    const code = String(device.deviceCode || "").trim();
    const ip = String(device.ipAddress || "").trim();
    if (code) {
      const key = code.toLowerCase();
      const list = byCode.get(key) || [];
      list.push(device);
      byCode.set(key, list);
    }
    if (ip) {
      const list = byIp.get(ip) || [];
      list.push(device);
      byIp.set(ip, list);
    }
  });
  return {
    codes: [...byCode.values()].filter((list) => list.length > 1),
    ips: [...byIp.values()].filter((list) => list.length > 1),
  };
}
