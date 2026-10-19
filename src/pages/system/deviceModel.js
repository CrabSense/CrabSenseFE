export function deviceKind(device) {
  const type = String(device?.deviceType || "").toLowerCase();
  if (
    type.includes("camera") ||
    device?.streamUrl ||
    device?.snapshotUrl
  ) {
    return "camera";
  }
  return "controller";
}

export function statusBucket(status) {
  const value = String(status || "").toLowerCase();
  if (["online", "connected", "active", "running"].includes(value)) return "online";
  if (["offline", "disconnected", "inactive"].includes(value)) return "offline";
  if (["warning", "degraded"].includes(value)) return "warning";
  return "other";
}

export function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (["online", "connected", "active", "running", "healthy", "success"].includes(value)) {
    return "text-[#77FF00]";
  }
  if (["offline", "disconnected", "error", "critical", "failed"].includes(value)) {
    return "text-[#FF8D8D]";
  }
  if (["warning", "degraded", "maintenance"].includes(value)) {
    return "text-[#F5C451]";
  }
  return "text-[#C6D7C9]";
}

export function formatWhen(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
}

export function countBuckets(items, getStatus) {
  return items.reduce(
    (totals, item) => {
      const bucket = statusBucket(getStatus(item));
      totals[bucket] += 1;
      return totals;
    },
    { online: 0, offline: 0, warning: 0, other: 0 },
  );
}
