
import {
  Box,
  Activity,
  Boxes,
  TriangleAlert,
  Wifi,
} from "lucide-react";

import StatCard from "./StatCard";

import {
  formatNumber,
  formatPercentage,
} from "../../../utils/dashboardHelpers";

import useTranslation from "@/hooks/useTranslation";

function validNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

function numberDisplay(value) {
  return validNumber(value)
    ? formatNumber(value)
    : "—";
}

function percentageDisplay(value) {
  return validNumber(value)
    ? formatPercentage(value)
    : "—";
}

function StatsGrid({ overview }) {
  const { t } = useTranslation();

  if (!overview) return null;

  const hasOpenAlerts = validNumber(overview.openAlerts);
  const alertCount = hasOpenAlerts
    ? Number(overview.openAlerts)
    : null;

  const alertTone =
    alertCount === null
      ? "default"
      : alertCount > 0
        ? "danger"
        : "success";

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
        value={numberDisplay(overview.totalBoxes)}
        numericValue={
          validNumber(overview.totalBoxes)
            ? Number(overview.totalBoxes)
            : null
        }
        formatValue={numberDisplay}
        description={t("dashboard.registeredBoxes")}
        icon={Box}
        tone="default"
        index={0}
      />

      {/* 2. TOTAL CRABS */}
      <StatCard
        label="Total Crabs"
        value={numberDisplay(overview.totalCrabs)}
        numericValue={
          validNumber(overview.totalCrabs)
            ? Number(overview.totalCrabs)
            : null
        }
        formatValue={numberDisplay}
        description="Total crabs in the selected scope"
        icon={Activity}
        tone="bio"
        index={1}
      />

      {/* 3. ACTIVE BOXES */}
      <StatCard
        label={t("dashboard.activeBoxes")}
        value={numberDisplay(overview.activeBoxes)}
        numericValue={
          validNumber(overview.activeBoxes)
            ? Number(overview.activeBoxes)
            : null
        }
        formatValue={numberDisplay}
        description={t("dashboard.activeBoxesDescription")}
        icon={Boxes}
        tone="success"
        index={2}
      />

      {/* 4. OPEN ALERTS */}
      <StatCard
        label={t("dashboard.openAlerts")}
        value={numberDisplay(overview.openAlerts)}
        numericValue={alertCount}
        formatValue={numberDisplay}
        description={
          alertCount === null
            ? "Alert data unavailable"
            : alertCount > 0
              ? t("dashboard.requiresAttention")
              : t("dashboard.noActiveAlerts")
        }
        icon={TriangleAlert}
        tone={alertTone}
        accentText={
          alertCount === null
            ? undefined
            : alertCount > 0
              ? t("dashboard.action")
              : t("dashboard.clear")
        }
        index={3}
      />

      {/* 5. IOT ONLINE */}
      <StatCard
        label={t("dashboard.iotOnline")}
        value={percentageDisplay(overview.iotOnlinePercentage)}
        numericValue={
          validNumber(overview.iotOnlinePercentage)
            ? Number(overview.iotOnlinePercentage)
            : null
        }
        formatValue={percentageDisplay}
        description={t("dashboard.connectedDevices")}
        icon={Wifi}
        tone="bio"
        index={4}
      />
    </section>
  );
}

export default StatsGrid;
