import {
  Boxes,
  CircleHelp,
  WifiOff,
} from "lucide-react";

import { offlineBoxCount } from "../../../services/monitoringAssessment";
import MonitoringSummaryCard from "./MonitoringSummaryCard";

import useTranslation from "@/hooks/useTranslation";

function MonitoringSummaryGrid({ summary, boxes, scoped }) {
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
      key: "assessmentUnavailable",
      value: null,
      tone: "offline",
      icon: CircleHelp,
    },
    {
      key: "offlineBoxCount",
      value: offlineBoxCount(boxes, scoped, summary.total),
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
        "2xl:grid-cols-3",
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
