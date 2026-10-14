import {
  Boxes,
  CircleCheck,
  TriangleAlert,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

import MonitoringSummaryCard from "./MonitoringSummaryCard";

import useTranslation from "@/hooks/useTranslation";

function MonitoringSummaryGrid({ summary }) {
  const { t } = useTranslation();

  if (!summary) return null;

  const summaryItems = [
    {
      key: "totalBoxes",
      value: summary.total,
      tone: "default",
      icon: Boxes,
    },
    {
      key: "healthy",
      value: summary.healthy,
      tone: "healthy",
      icon: CircleCheck,
    },
    {
      key: "warning",
      value: summary.warning,
      tone: "warning",
      icon: TriangleAlert,
    },
    {
      key: "critical",
      value: summary.critical,
      tone: "critical",
      icon: ShieldAlert,
    },
    {
      key: "offline",
      value: summary.offline,
      tone: "offline",
      icon: WifiOff,
    },
  ];

  return (
    <section
      aria-label={t("monitoring.boxSummary")}
      className={[
        "mb-6 grid min-w-0 gap-5",
        "grid-cols-1",
        "sm:grid-cols-2",
        "xl:grid-cols-3",
        "2xl:grid-cols-5",
      ].join(" ")}
    >
      {summaryItems.map((item, index) => (
        <MonitoringSummaryCard
          key={item.key}
          index={index}
          label={t(`monitoring.${item.key}`)}
          value={item.value}
          tone={item.tone}
          icon={item.icon}
        />
      ))}
    </section>
  );
}

export default MonitoringSummaryGrid;
