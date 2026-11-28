
import useSelectedArea from "../hooks/useSelectedArea";
import useDashboard from "../hooks/useDashboard";
import useRasWater from "../hooks/useRasWater";

import PageReveal from "../components/ui/PageReveal";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardLoading from "../components/dashboard/DashboardLoading";
import DashboardError from "../components/dashboard/DashboardError";

import StatsGrid from "../components/dashboard/stats/StatsGrid";
import KpiSummary from "../components/dashboard/stats/KpiSummary";

import EnvironmentGrid from "../components/monitoring/environment/EnvironmentGrid";

function Dashboard() {
  const { selectedAreaId, selectedArea, areasLoading } = useSelectedArea();
  const waterArea = !areasLoading && selectedArea?.id === selectedAreaId ? selectedAreaId : null;
  const ras = useRasWater(waterArea);

  const {
    overview,
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

      {/* Actual scoped readings, never the legacy operational health score. */}
      <PageReveal delay={170}>
        <EnvironmentGrid readings={ras.readings} now={ras.now} areaId={waterArea} showDevices={false} />
        <p className="mb-5 text-xs text-[#8C9A90]">
          Điểm sức khỏe tổng hợp tạm không hiển thị vì chưa có hợp đồng xác minh chất lượng nước.
        </p>
      </PageReveal>
    </main>
  );
}

export default Dashboard;
