import { HeartPulse } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import useTranslation from "../../../hooks/useTranslation";

import { useRevealActive } from "@/components/ui/PageReveal";

import useAnimatedHealthValue from "@/hooks/useAnimatedHealthValue";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

// ============================================
// HELPERS
// ============================================

function normalizeRate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? Math.min(Math.max(number, 0), 100) : null;
}

function formatCount(value, language) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString(language === "vi" ? "vi-VN" : "en-US")
    : "—";
}

const rateStyles = {
  good: "[&_[data-slot=progress-indicator]]:bg-[#77FF00]",
  danger: "[&_[data-slot=progress-indicator]]:bg-[#FF7777]",
  bio: "[&_[data-slot=progress-indicator]]:bg-[#65B8FF]",
};

// ============================================
// ANIMATED SURVIVAL RATE ROW
// ============================================

function SurvivalRateRow({
  label,
  value,
  tone = "good",
  index = 0,
  noDataText,
}) {
  const rate = normalizeRate(value);

  // This hook reads visibility from PageReveal.
  const animatedRate = useAnimatedHealthValue(rate, {
    delay: 220 + index * 100,
    duration: 800,
  });

  const displayRate = rate === null ? "—" : `${animatedRate.toFixed(1)}%`;

  const finalRate = rate === null ? noDataText : `${rate.toFixed(1)}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-[#8C9A90]">{label}</span>

        <strong
          className="font-semibold tabular-nums text-[#F4F7F4]"
          aria-label={finalRate}
        >
          <span aria-hidden="true">{displayRate}</span>
        </strong>
      </div>

      <Progress
        value={rate === null ? 0 : animatedRate}
        max={100}
        aria-label={`${label}: ${finalRate}`}
        className={[
          "h-2 bg-[#1B2A1F]",
          "[&_[data-slot=progress-indicator]]:transition-none",
          rateStyles[tone],
        ].join(" ")}
      />
    </div>
  );
}

// ============================================
// ANIMATED POPULATION ITEM
// ============================================

function PopulationItem({ label, value, language, index = 0 }) {
  const isRevealActive = useRevealActive();

  const validNumber =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value));

  const formatValue = (number) => formatCount(number, language);

  return (
    <div
      className={[
        "flex min-w-0 flex-col gap-2",
        "rounded-xl bg-[#111C15] p-3",
        isRevealActive ? "operation-item-reveal" : "",
      ].join(" ")}
      style={{
        animationDelay: `${350 + index * 80}ms`,
      }}
    >
      <span className="text-[10px] font-medium text-[#8C9A90]">{label}</span>

      <strong className="text-lg font-semibold tabular-nums text-[#F4F7F4]">
        <AnimatedKpiValue
          value={formatCount(value, language)}
          numericValue={validNumber ? value : null}
          formatValue={formatValue}
          delay={440 + index * 80}
          duration={750}
        />
      </strong>
    </div>
  );
}

// ============================================
// SURVIVAL PANEL
// ============================================

function SurvivalPanel({ report }) {
  const { t, language } = useTranslation();

  if (!report) return null;

  const metrics = [
    {
      key: "survival",
      value: report.survivalRate,
      tone: "good",
    },
    {
      key: "mortality",
      value: report.mortalityRate,
      tone: "danger",
    },
    {
      key: "harvested",
      value: report.harvestRate,
      tone: "bio",
    },
  ];

  const population = [
    {
      key: "total",
      value: report.totalCrabs,
    },
    {
      key: "alive",
      value: report.aliveCrabs,
    },
    {
      key: "dead",
      value: report.deadCrabs,
    },
    {
      key: "harvested",
      value: report.harvestedCrabs,
    },
  ];

  return (
    <Card
      className={[
        "h-full min-w-0 gap-0 rounded-2xl",
        "border border-[#24382A]",
        "bg-[#0D1510] py-0 shadow-none",
      ].join(" ")}
    >
      {/* HEADER */}
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#77FF00]">
              {t("analytics.survivalCategory")}
            </p>

            <CardTitle className="text-lg font-semibold text-[#F4F7F4]">
              {t("analytics.populationOutcome")}
            </CardTitle>

            <p className="mt-2 text-xs leading-relaxed text-[#8C9A90]">
              {t("analytics.populationDescription")}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#77FF00]/15 bg-[#77FF00]/[0.06] text-[#77FF00]">
            <HeartPulse size={19} aria-hidden="true" />
          </div>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex flex-1 flex-col justify-between gap-6 px-6 pb-6">
        {/* SURVIVAL RATES */}
        <div className="space-y-5">
          {metrics.map((item, index) => (
            <SurvivalRateRow
              key={item.key}
              label={t(`analytics.${item.key}`)}
              value={item.value}
              tone={item.tone}
              index={index}
              noDataText={t("analytics.noData")}
            />
          ))}
        </div>

        {/* POPULATION SUMMARY */}
        <div className="grid grid-cols-2 gap-3 border-t border-[#24382A] pt-5 sm:grid-cols-4">
          {population.map((item, index) => (
            <PopulationItem
              key={item.key}
              label={t(`analytics.${item.key}`)}
              value={item.value}
              language={language}
              index={index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SurvivalPanel;
