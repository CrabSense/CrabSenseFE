import { Box, Activity, Boxes, TriangleAlert, Wifi } from "lucide-react";

import StatCard from "./StatCard";

import {
  formatNumber,
  formatPercentage,
} from "../../../utils/dashboardHelpers";

import useTranslation from "@/hooks/useTranslation";

function StatsGrid({ overview }) {
  const { t } = useTranslation();

  if (!overview) return null;

  const alertTone = overview.openAlerts > 0 ? "danger" : "success";

  return (
    <section
      aria-label={t("dashboard.kpiAria")}
      className={[
        "mb-6 grid min-w-0 gap-5",
        "grid-cols-1",
        "sm:grid-cols-2",
        "xl:grid-cols-3",
        "2xl:grid-cols-5",
      ].join(" ")}
    >
      {/* 1. TOTAL BOXES */}
      <StatCard
        label={t("dashboard.totalBoxes")}
        value={formatNumber(overview.totalBoxes)}
        numericValue={overview.totalBoxes}
        formatValue={formatNumber}
        description={t("dashboard.registeredBoxes")}
        icon={Box}
        tone="default"
        index={0}
      />

      {/* 2. LIVE CRABS */}
      <StatCard
        label={t("dashboard.liveCrabs")}
        value={formatNumber(overview.totalCrabs)}
        numericValue={overview.totalCrabs}
        formatValue={formatNumber}
        description={t("dashboard.currentlyAlive")}
        icon={Activity}
        tone="bio"
        index={1}
      />

      {/* 3. ACTIVE BOXES */}
      <StatCard
        label={t("dashboard.activeBoxes")}
        value={formatNumber(overview.activeBoxes)}
        numericValue={overview.activeBoxes}
        formatValue={formatNumber}
        description={t("dashboard.activeBoxesDescription")}
        icon={Boxes}
        tone="success"
        index={2}
      />

      {/* 4. OPEN ALERTS */}
      <StatCard
        label={t("dashboard.openAlerts")}
        value={formatNumber(overview.openAlerts)}
        numericValue={overview.openAlerts}
        formatValue={formatNumber}
        description={
          overview.openAlerts > 0
            ? t("dashboard.requiresAttention")
            : t("dashboard.noActiveAlerts")
        }
        icon={TriangleAlert}
        tone={alertTone}
        accentText={
          overview.openAlerts > 0 ? t("dashboard.action") : t("dashboard.clear")
        }
        index={3}
      />

      {/* 5. IOT ONLINE */}
      <StatCard
        label={t("dashboard.iotOnline")}
        value={formatPercentage(overview.iotOnlinePercentage)}
        numericValue={overview.iotOnlinePercentage}
        formatValue={formatPercentage}
        description={t("dashboard.connectedDevices")}
        icon={Wifi}
        tone="bio"
        index={4}
      />
    </section>
  );
}

export default StatsGrid;
