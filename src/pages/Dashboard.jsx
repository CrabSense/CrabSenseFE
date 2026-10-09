import useSelectedArea from "../hooks/useSelectedArea";
import useDashboard from "../hooks/useDashboard";
import useTranslation from "../hooks/useTranslation";

// Shared page entrance animation
import PageReveal from "../components/ui/PageReveal";

// Dashboard components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardLoading from "../components/dashboard/DashboardLoading";
import DashboardError from "../components/dashboard/DashboardError";

// Overview KPI
import StatsGrid from "../components/dashboard/stats/StatsGrid";

// Farm Health
import FarmHealthCard from "../components/dashboard/health/FarmHealthCard";
import HealthBreakdown from "../components/dashboard/health/HealthBreakdown";

// Operations
import TodayTasks from "../components/dashboard/operations/TodayTasks";
import RecentActivity from "../components/dashboard/operations/RecentActivity";

function Dashboard() {
  const { t } = useTranslation();

  const { selectedAreaId } = useSelectedArea();

  const {
    overview,
    metrics,
    todayTasks,
    recentActivity,
    loading,
    refreshing,
    error,
    reload,
  } = useDashboard(selectedAreaId);

  // ============================================
  // INITIAL LOADING
  // ============================================

  if (loading) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <DashboardLoading />
      </main>
    );
  }

  // ============================================
  // API ERROR
  // ============================================

  if (error) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <DashboardError message={error} onRetry={reload} />
      </main>
    );
  }

  // ============================================
  // DASHBOARD CONTENT
  // ============================================

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
      {/* ======================================
          1. DASHBOARD HEADER
          Delay: 0ms
         ====================================== */}

      <PageReveal delay={0}>
        <DashboardHeader
          lastUpdated={overview?.lastUpdated}
          onRefresh={reload}
          refreshing={refreshing}
        />
      </PageReveal>

      {/* ======================================
          2. OVERVIEW KPI
          Delay: 90ms
         ====================================== */}

      <PageReveal delay={90}>
        <StatsGrid overview={overview} />
      </PageReveal>

      {/* ======================================
          3. FARM HEALTH
         ====================================== */}

      <section
        aria-label={t("dashboard.farmHealthAria")}
        className={[
          "mb-5 grid min-w-0 grid-cols-1 gap-5",
          "min-[1100px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
        ].join(" ")}
      >
        {/* OVERALL FARM HEALTH */}
        <PageReveal delay={170} className="h-full">
          <FarmHealthCard metrics={metrics} />
        </PageReveal>

        {/* HEALTH BREAKDOWN */}
        <PageReveal delay={230} className="h-full">
          <HealthBreakdown
            metrics={metrics}
            iotOnlinePercentage={overview?.iotOnlinePercentage}
          />
        </PageReveal>
      </section>

      {/* FARM OPERATIONS */}
      <section
        aria-label={t("dashboard.farmOperationsAria")}
        className={[
          "grid min-w-0 grid-cols-1 gap-5",
          "min-[1200px]:grid-cols-2",
        ].join(" ")}
      >
        <PageReveal delay={0} className="h-full">
          <TodayTasks tasks={todayTasks} />
        </PageReveal>

        <PageReveal delay={100} className="h-full">
          <RecentActivity activities={recentActivity} />
        </PageReveal>
      </section>
    </main>
  );
}

export default Dashboard;
