import { Gauge } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import useTranslation from "../../../hooks/useTranslation";

import useAnimatedHealthValue from "@/hooks/useAnimatedHealthValue";

// ============================================
// TONE STYLES
// ============================================

const toneStyles = {
  good: {
    text: "text-[#77FF00]",
    progress: "[&_[data-slot=progress-indicator]]:bg-[#77FF00]",
  },

  bio: {
    text: "text-[#65B8FF]",
    progress: "[&_[data-slot=progress-indicator]]:bg-[#65B8FF]",
  },

  danger: {
    text: "text-[#FF7777]",
    progress: "[&_[data-slot=progress-indicator]]:bg-[#FF7777]",
  },
};

// ============================================
// RATE HELPERS
// ============================================

function getRate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function clampProgress(value) {
  return Math.min(Math.max(value, 0), 100);
}

// ============================================
// ANIMATED EFFICIENCY ROW
// ============================================

function EfficiencyRateRow({
  label,
  value,
  tone = "good",
  index = 0,
  noDataText,
}) {
  const rate = getRate(value);

  const styles = toneStyles[tone] ?? toneStyles.good;

  const progressTarget = rate === null ? 0 : clampProgress(rate);

  // Same animation value controls both the
  // displayed percentage and progress bar.
  const animatedProgress = useAnimatedHealthValue(progressTarget, {
    delay: 200 + index * 110,
    duration: 850,
  });

  const displayedRate = rate === null ? "—" : `${animatedProgress.toFixed(1)}%`;

  const finalRate = rate === null ? noDataText : `${rate.toFixed(1)}%`;

  return (
    <div className="space-y-2.5">
      {/* LABEL AND ANIMATED VALUE */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[#8C9A90]">{label}</span>

        <strong
          className={[
            "text-sm font-semibold tabular-nums",
            rate === null ? "text-[#8C9A90]" : styles.text,
          ].join(" ")}
          aria-label={finalRate}
        >
          <span aria-hidden="true">{displayedRate}</span>
        </strong>
      </div>

      {/* ANIMATED PROGRESS BAR */}
      <Progress
        value={rate === null ? 0 : animatedProgress}
        max={100}
        aria-label={`${label}: ${finalRate}`}
        className={[
          "h-2.5 bg-[#1B2A1F]",
          "[&_[data-slot=progress-indicator]]:transition-none",
          styles.progress,
        ].join(" ")}
      />
    </div>
  );
}

// ============================================
// EFFICIENCY PANEL
// ============================================

function EfficiencyPanel({ data }) {
  const { t } = useTranslation();

  if (!data) return null;

  const rows = [
    {
      key: "aliveRate",
      value: data.aliveRate,
      tone: "good",
    },
    {
      key: "moltingRate",
      value: data.moltingRate,
      tone: "bio",
    },
    {
      key: "harvestRate",
      value: data.harvestRate,
      tone: "bio",
    },
    {
      key: "mortalityRate",
      value: data.mortalityRate,
      tone: "danger",
    },
  ];

  return (
    <Card
      className={[
        "h-full min-w-0 gap-0 overflow-hidden",
        "rounded-2xl border",
        "border-[#24382A]",
        "bg-[#0D1510] py-0 shadow-none",
      ].join(" ")}
    >
      {/* ======================================
          HEADER
         ====================================== */}

      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#77FF00]">
              {t("analytics.operationsCategory")}
            </p>

            <CardTitle className="text-lg font-semibold text-[#F4F7F4]">
              {t("analytics.operationalEfficiency")}
            </CardTitle>

            <p className="mt-2 text-xs leading-relaxed text-[#8C9A90]">
              {t("analytics.efficiencyDescription")}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#77FF00]/15 bg-[#77FF00]/[0.06] text-[#77FF00]">
            <Gauge size={19} aria-hidden="true" />
          </div>
        </div>
      </CardHeader>

      {/* ======================================
          CONTENT
         ====================================== */}

      <CardContent className="flex flex-1 flex-col justify-center px-6 pb-6">
        <div className="space-y-6">
          {rows.map((row, index) => (
            <EfficiencyRateRow
              key={row.key}
              label={t(`analytics.${row.key}`)}
              value={row.value}
              tone={row.tone}
              index={index}
              noDataText={t("analytics.noData")}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default EfficiencyPanel;
