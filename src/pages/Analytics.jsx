import { useState } from "react";

import useAnalytics from "../hooks/useAnalytics";
import useSelectedArea from "../hooks/useSelectedArea";
import useTranslation from "../hooks/useTranslation";

import PageReveal from "../components/ui/PageReveal";

import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import AnalyticsDateFilter from "../components/analytics/filters/AnalyticsDateFilter";
import AnalyticsKpiGrid from "../components/analytics/kpi/AnalyticsKpiGrid";

import HarvestTrendChart from "../components/analytics/harvest/HarvestTrendChart";
import SurvivalPanel from "../components/analytics/survival/SurvivalPanel";
import MoltingPanel from "../components/analytics/molting/MoltingPanel";
import EfficiencyPanel from "../components/analytics/operations/EfficiencyPanel";

import AnalyticsLoading from "../components/analytics/AnalyticsLoading";
import AnalyticsError from "../components/analytics/AnalyticsError";

// ============================================
// DATE HELPERS
// ============================================

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultFromDate() {
  const date = new Date();

  date.setDate(date.getDate() - 30);

  return formatLocalDate(date);
}

function getToday() {
  return formatLocalDate(new Date());
}

// ============================================
// ANALYTICS PAGE
// ============================================

function Analytics() {
  const { t } = useTranslation();

  const { selectedAreaId } = useSelectedArea();

  const [fromDate, setFromDate] = useState(getDefaultFromDate);

  const [toDate, setToDate] = useState(getToday);

  const {
    harvest,
    survival,
    molting,
    efficiency,
    loading,
    refreshing,
    error,
    reload,
  } = useAnalytics({
    farmingAreaId: selectedAreaId,
    fromDate,
    toDate,
  });

  // INITIAL LOADING
  if (loading) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <AnalyticsLoading />
      </main>
    );
  }

  // API ERROR
  if (error) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <AnalyticsError
          message={error}
          onRetry={reload}
          refreshing={refreshing}
        />
      </main>
    );
  }

  // ANALYTICS CONTENT
  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
      {/* HEADER */}
      <PageReveal delay={0}>
        <AnalyticsHeader refreshing={refreshing} onRefresh={reload} />
      </PageReveal>

      {/* DATE FILTER */}
      <PageReveal delay={60}>
        <div className="mb-6 flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <AnalyticsDateFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
          />

          <p className="max-w-md text-xs leading-relaxed text-[#8C9A90]">
            {t("analytics.dateRangeNote")}
          </p>
        </div>
      </PageReveal>

      {/* KPI OVERVIEW */}
      <PageReveal delay={80}>
        <AnalyticsKpiGrid
          survival={survival}
          harvest={harvest}
          molting={molting}
          efficiency={efficiency}
        />
      </PageReveal>

      {/* REPORT CHARTS */}
      <section
        aria-label={t("analytics.reportsAria")}
        className={[
          "grid min-w-0 grid-cols-1",
          "items-stretch gap-5",
          "xl:grid-cols-2",
        ].join(" ")}
      >
        {/* HARVEST TREND */}
        <PageReveal delay={0} className="h-full">
          <HarvestTrendChart data={harvest?.byDate ?? []} />
        </PageReveal>

        {/* SURVIVAL REPORT */}
        <PageReveal delay={80} className="h-full">
          <SurvivalPanel report={survival} />
        </PageReveal>

        {/* MOLTING REPORT */}
        <PageReveal delay={0} className="h-full">
          <MoltingPanel report={molting} />
        </PageReveal>

        {/* EFFICIENCY REPORT */}
        <PageReveal delay={80} className="h-full">
          <EfficiencyPanel data={efficiency} />
        </PageReveal>
      </section>
    </main>
  );
}

export default Analytics;
