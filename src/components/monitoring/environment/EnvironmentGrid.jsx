import { Droplets, Gauge, Thermometer, Wifi } from "lucide-react";

import EnvironmentCard from "./EnvironmentCard";

import useTranslation from "@/hooks/useTranslation";

function EnvironmentGrid({ water, devices }) {
  const { t } = useTranslation();

  const rawTotal = Number(devices?.totalCount);
  const rawOnline = Number(devices?.onlineCount);

  const totalDevices = Number.isFinite(rawTotal) ? Math.max(0, rawTotal) : 0;

  const onlineDevices = Number.isFinite(rawOnline) ? Math.max(0, rawOnline) : 0;

  const devicePercentage =
    totalDevices > 0
      ? Math.min(100, Math.round((onlineDevices / totalDevices) * 100))
      : null;

  const deviceStatus =
    totalDevices === 0
      ? "offline"
      : onlineDevices < totalDevices
        ? "warning"
        : "normal";

  const deviceCountDescription =
    totalDevices === 0
      ? t("monitoring.noRegisteredDevices")
      : t("monitoring.devicesOnlineCount")
          .replace("{online}", String(onlineDevices))
          .replace("{total}", String(totalDevices));

  return (
    <section
      aria-label={t("monitoring.environmentMetrics")}
      className={[
        "mb-6 grid min-w-0 gap-5",
        "grid-cols-1",
        "sm:grid-cols-2",
        "2xl:grid-cols-4",
      ].join(" ")}
    >
      {/* WATER TEMPERATURE */}
      <EnvironmentCard
        index={0}
        icon={Thermometer}
        label={t("monitoring.waterTemperature")}
        value={water?.temperature}
        unit="°C"
        decimals={1}
        description={t("monitoring.temperatureDescription")}
      />

      {/* PH LEVEL */}
      <EnvironmentCard
        index={1}
        icon={Gauge}
        label={t("monitoring.phLevel")}
        value={water?.ph}
        decimals={2}
        description={t("monitoring.phDescription")}
      />

      {/* DISSOLVED OXYGEN */}
      <EnvironmentCard
        index={2}
        icon={Droplets}
        label={t("monitoring.dissolvedOxygen")}
        value={water?.dissolvedOxygen}
        unit="mg/L"
        decimals={2}
        description={t("monitoring.oxygenDescription")}
      />

      {/* IOT DEVICES ONLINE */}
      <EnvironmentCard
        index={3}
        icon={Wifi}
        label={t("monitoring.devicesOnline")}
        value={devicePercentage === null ? null : `${devicePercentage}%`}
        numericValue={devicePercentage}
        suffix="%"
        decimals={0}
        description={deviceCountDescription}
        status={deviceStatus}
      />
    </section>
  );
}

export default EnvironmentGrid;
