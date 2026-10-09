import useMonitoring from "../hooks/useMonitoring";
import useSelectedArea from "../hooks/useSelectedArea";
import useTranslation from "../hooks/useTranslation";

import PageReveal from "../components/ui/PageReveal";

import MonitoringHeader from "../components/monitoring/MonitoringHeader";
import MonitoringLoading from "../components/monitoring/MonitoringLoading";
import MonitoringError from "../components/monitoring/MonitoringError";

import EnvironmentGrid from "../components/monitoring/environment/EnvironmentGrid";
import MonitoringSummaryGrid from "../components/monitoring/summary/MonitoringSummaryGrid";
import BoxMonitoringSection from "../components/monitoring/boxes/BoxMonitoringSection";

import { RefreshCw } from "lucide-react";

function Monitoring() {
  const { t } = useTranslation();
  const { selectedAreaId } = useSelectedArea();

  const { data, loading, refreshing, error, reload, refreshInterval } =
    useMonitoring(selectedAreaId);

  if (loading) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <MonitoringLoading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <MonitoringError
          message={error}
          onRetry={reload}
          refreshing={refreshing}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 text-[#F4F7F4]">
      {/* MONITORING HEADER */}
      <PageReveal delay={0}>
        <MonitoringHeader
          syncedAt={data?.syncedAt}
          refreshing={refreshing}
          onRefresh={reload}
        />
      </PageReveal>

      {/* AUTO REFRESH INFORMATION */}
      <PageReveal delay={70}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#24382A] bg-[#0D1510] px-4 py-3">
          <div className="flex items-center gap-2">
            <RefreshCw
              size={14}
              className={[
                "text-[#77FF00]",
                refreshing ? "animate-spin" : "",
              ].join(" ")}
            />

            <span className="text-xs font-medium text-[#DCE7DE]">
              {t("monitoring.autoRefresh")}
            </span>

            <span className="rounded-md border border-[#77FF00]/20 bg-[#77FF00]/[0.05] px-2 py-1 text-[10px] font-semibold text-[#77FF00]">
              {t("monitoring.every")} {refreshInterval}s
            </span>
          </div>

          <span className="text-[11px] text-[#8C9A90]">
            {refreshing
              ? t("monitoring.syncingData")
              : t("monitoring.refreshActive")}
          </span>
        </div>
      </PageReveal>

      {/* WATER QUALITY & IoT DEVICES */}
      <PageReveal delay={140}>
        <EnvironmentGrid water={data?.areaWater} devices={data?.areaDevices} />
      </PageReveal>

      {/* BOX HEALTH SUMMARY */}
      <PageReveal delay={220}>
        <MonitoringSummaryGrid summary={data?.summary} />
      </PageReveal>

      {/* BOX MONITORING TABLE */}
      <PageReveal delay={0}>
        <BoxMonitoringSection boxes={data?.items ?? []} />
      </PageReveal>
    </main>
  );
}

export default Monitoring;
