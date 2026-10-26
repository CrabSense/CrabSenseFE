
import useSelectedArea from "../hooks/useSelectedArea";
import useDashboard from "../hooks/useDashboard";
import useTranslation from "../hooks/useTranslation";

import PageReveal from "../components/ui/PageReveal";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardLoading from "../components/dashboard/DashboardLoading";
import DashboardError from "../components/dashboard/DashboardError";

import StatsGrid from "../components/dashboard/stats/StatsGrid";
import KpiSummary from "../components/dashboard/stats/KpiSummary";

import FarmHealthCard from "../components/dashboard/health/FarmHealthCard";
import HealthBreakdown from "../components/dashboard/health/HealthBreakdown";

function Dashboard() {
  const { t } = useTranslation();
  const { selectedAreaId } = useSelectedArea();

  const {
    overview,
    metrics,
    loading,
    refreshing,
    error,
    reload,
  } = useDashboard(selectedAreaId);

  if (loading) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <DashboardLoading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <DashboardError
          message={error}
          onRetry={reload}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
      {/* 1. DASHBOARD HEADER */}
      <PageReveal delay={0}>
        <DashboardHeader
          lastUpdated={overview?.lastUpdated}
          onRefresh={reload}
          refreshing={refreshing}
        />
      </PageReveal>

      {/* 2. OVERVIEW KPI */}
      <PageReveal delay={90}>
        <StatsGrid overview={overview} />
      </PageReveal>

      {/* 3. KPI SUMMARY FROM BACKEND */}
      <PageReveal delay={130}>
        <KpiSummary summary={overview?.kpiSummary} />
      </PageReveal>

      {/* 4. FARM HEALTH */}
      <section
        aria-label={t("dashboard.farmHealthAria")}
        className={[
          "mb-5 grid min-w-0 grid-cols-1 gap-5",
          "min-[1100px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
        ].join(" ")}
      >
        <PageReveal delay={170} className="h-full">
          <FarmHealthCard metrics={metrics} />
        </PageReveal>

        <PageReveal delay={230} className="h-full">
          <HealthBreakdown
            metrics={metrics}
            iotOnlinePercentage={overview?.iotOnlinePercentage}
          />
        </PageReveal>
      </section>
    </main>
  );
}

export default Dashboard;
