import { Activity, PackageCheck, Shell, TrendingUp } from "lucide-react";

import AnalyticsKpiCard from "./AnalyticsKpiCard";

import useTranslation from "../../../hooks/useTranslation";

// ============================================
// FORMAT DECIMAL METRICS
// ============================================

function formatMetric(value, decimals = 1) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number) ? number.toFixed(decimals) : "—";
}

// ============================================
// FORMAT COUNTS BY LANGUAGE
// ============================================

function formatCount(value, language) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString(language === "vi" ? "vi-VN" : "en-US")
    : "—";
}

// ============================================
// ANALYTICS KPI GRID
// ============================================

function AnalyticsKpiGrid({ survival, harvest, molting, efficiency }) {
  const { t, language } = useTranslation();

  return (
    <section
      aria-label={t("analytics.kpiOverview")}
      className={[
        "mb-6 grid min-w-0 gap-5",
        "grid-cols-1 sm:grid-cols-2",
        "2xl:grid-cols-4",
      ].join(" ")}
    >
      {/* ====================================
          1. SURVIVAL RATE
         ==================================== */}

      <AnalyticsKpiCard
        index={0}
        icon={Activity}
        label={t("analytics.survivalRate")}
        value={formatMetric(survival?.survivalRate)}
        numericValue={survival?.survivalRate}
        formatValue={formatMetric}
        suffix="%"
        description={`${formatCount(
          survival?.aliveCrabs,
          language,
        )} ${t("analytics.aliveCrabs")}`}
        tone="bio"
      />

      {/* ====================================
          2. HARVEST WEIGHT
         ==================================== */}

      <AnalyticsKpiCard
        index={1}
        icon={PackageCheck}
        label={t("analytics.harvestWeight")}
        value={formatMetric(harvest?.totalWeightKg)}
        numericValue={harvest?.totalWeightKg}
        formatValue={formatMetric}
        suffix="kg"
        description={`${formatCount(
          harvest?.totalQuantity,
          language,
        )} ${t("analytics.harvestedCrabs")}`}
        tone="default"
      />

      {/* ====================================
          3. MOLTING RATE
         ==================================== */}

      <AnalyticsKpiCard
        index={2}
        icon={Shell}
        label={t("analytics.moltingRate")}
        value={formatMetric(molting?.moltingRate)}
        numericValue={molting?.moltingRate}
        formatValue={formatMetric}
        suffix="%"
        description={`${formatCount(
          molting?.moltedCrabs,
          language,
        )} ${t("analytics.moltedCrabs")}`}
        tone="default"
      />

      {/* ====================================
          4. HARVEST RATE
         ==================================== */}

      <AnalyticsKpiCard
        index={3}
        icon={TrendingUp}
        label={t("analytics.harvestRate")}
        value={formatMetric(efficiency?.harvestRate)}
        numericValue={efficiency?.harvestRate}
        formatValue={formatMetric}
        suffix="%"
        description={t("analytics.operationalEfficiencyDescription")}
        tone="default"
      />
    </section>
  );
}

export default AnalyticsKpiGrid;
