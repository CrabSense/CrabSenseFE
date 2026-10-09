import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { getHealthClass } from "../../../utils/dashboardHelpers";

import useTranslation from "@/hooks/useTranslation";
import useAnimatedHealthValue from "@/hooks/useAnimatedHealthValue";

const toneStyles = {
  good: {
    text: "text-[#77FF00]",
    badge: "border-[#77FF00]/20 bg-[#77FF00]/10 text-[#77FF00]",
    indicator: "[&>div]:bg-[#77FF00]",
  },

  warning: {
    text: "text-[#FBBF24]",
    badge: "border-amber-500/20 bg-amber-500/10 text-[#FBBF24]",
    indicator: "[&>div]:bg-[#FBBF24]",
  },

  danger: {
    text: "text-[#FF7777]",
    badge: "border-red-500/20 bg-red-500/10 text-[#FF7777]",
    indicator: "[&>div]:bg-[#FF7777]",
  },
};

const statusKeys = {
  excellent: "excellent",
  healthy: "healthy",
  good: "good",
  normal: "normal",
  warning: "warning",
  critical: "critical",
  danger: "danger",
  poor: "poor",
  healthyfarm: "healthy",
};

function FarmHealthCard({ metrics }) {
  const { t } = useTranslation();

  // Always call hooks before conditional returns.
  const animatedScore = useAnimatedHealthValue(metrics?.score, {
    delay: 260,
    duration: 850,
  });

  if (!metrics) return null;

  const healthClass = getHealthClass(metrics.statusLevel);

  const statusText = String(
    `${healthClass} ${metrics.statusLabel ?? ""}`,
  ).toLowerCase();

  let tone = "good";

  if (statusText.includes("danger") || statusText.includes("critical")) {
    tone = "danger";
  } else if (statusText.includes("warning")) {
    tone = "warning";
  }

  const styles = toneStyles[tone];

  const rawStatus = String(metrics.statusLabel ?? "").trim();

  const normalizedStatus = rawStatus.toLowerCase().replace(/[\s_-]+/g, "");

  const translatedStatusKey = statusKeys[normalizedStatus];

  const statusLabel = translatedStatusKey
    ? t(`dashboard.${translatedStatusKey}`)
    : rawStatus || t("dashboard.unknown");

  const numericScore = Number(metrics.score);

  const hasValidScore =
    metrics.score !== null &&
    metrics.score !== undefined &&
    metrics.score !== "" &&
    Number.isFinite(numericScore);

  const safeScore = hasValidScore
    ? Math.min(Math.max(numericScore, 0), 100)
    : 0;

  // Same animated value drives the number and bar.
  const displayedScore = Math.round(animatedScore);

  return (
    <Card
      className={[
        "h-full min-w-0 gap-6",
        "rounded-2xl border",
        "border-[#24382A]",
        "bg-[#0D1510]",
        "shadow-none",
      ].join(" ")}
    >
      {/* HEADER */}
      <CardHeader className="gap-3 px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
              {t("dashboard.farmHealthCategory")}
            </p>

            <CardTitle className="text-lg font-semibold tracking-tight text-[#F4F7F4]">
              {t("dashboard.overallHealth")}
            </CardTitle>
          </div>

          <Badge
            variant="outline"
            className={[
              "rounded-full px-3 py-1",
              "text-xs font-semibold",
              styles.badge,
            ].join(" ")}
          >
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex flex-1 flex-col gap-5 px-6 pb-6">
        {/* ANIMATED SCORE */}
        <div className="flex items-baseline gap-2">
          <strong
            className={[
              "inline-grid text-6xl font-bold",
              "tracking-tight tabular-nums",
              styles.text,
            ].join(" ")}
            aria-label={hasValidScore ? String(metrics.score) : undefined}
          >
            {/* Reserve final width */}
            <span
              aria-hidden="true"
              className="invisible col-start-1 row-start-1"
            >
              {hasValidScore ? safeScore : "—"}
            </span>

            <span aria-hidden="true" className="col-start-1 row-start-1">
              {hasValidScore ? displayedScore : "—"}
            </span>
          </strong>

          <span className="text-base text-[#8C9A90]">/ 100</span>
        </div>

        {/* ANIMATED PROGRESS */}
        <Progress
          value={animatedScore}
          max={100}
          aria-label={t("dashboard.overallHealthScore")}
          className={[
            "h-2.5 w-full rounded-full",
            "bg-[#1B2A1F]",
            "[&>div]:bg-[#77FF00]",
            "[&>div]:transition-none",
            styles.indicator,
          ].join(" ")}
        />

        {/* EXPLANATION */}
        {metrics.explanation && (
          <p className="text-sm leading-relaxed text-[#8C9A90]">
            {metrics.explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default FarmHealthCard;
