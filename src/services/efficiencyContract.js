// Verify the new Backend contract before rendering or exporting an efficiency report.
export function efficiencyRate(value) {
  return typeof value === "number" && Number.isFinite(value) &&
    value >= 0 && value <= 100 ? value : null;
}

const counts = ["totalCrabs", "aliveCrabs", "moltingCrabs", "moltedCrabs",
  "harvestedCrabs", "deadCrabs", "unclassifiedCrabs"];
const rates = ["survivalRate", "moltingRate", "harvestRate", "mortalityRate", "aliveRate"];

export function verifyEfficiency(data, areaId = null) {
  if (!data || data.cohortBasis !== "stockedAt-current-status-v1" ||
      (data.farmingAreaId ?? null) !== (areaId || null) ||
      counts.some(key => !Number.isSafeInteger(data[key]) || data[key] < 0) ||
      counts.slice(1).reduce((sum, key) => sum + data[key], 0) !== data.totalCrabs) {
    throw new Error("Unverified operational efficiency report.");
  }
  const result = Object.fromEntries(counts.map(key => [key, data[key]]));
  for (const key of rates) {
    const raw = data[key];
    if (data.totalCrabs === 0 ? raw != null : efficiencyRate(raw) === null) {
      throw new Error("Invalid operational efficiency rate.");
    }
    result[key] = data.totalCrabs === 0 ? null : raw;
  }
  return { ...result, farmingAreaId: areaId || null,
    cohortBasis: data.cohortBasis, healthScore: null };
}
