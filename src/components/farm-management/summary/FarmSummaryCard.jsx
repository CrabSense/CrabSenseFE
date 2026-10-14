import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

import useTranslation from "@/hooks/useTranslation";

// ============================================
// SUMMARY CARD TONE STYLES
// ============================================

const toneStyles = {
  default: {
    border: "border-[#24382A]",
    value: "text-[#F4F7F4]",
    icon: "border-[#77FF00]/10 bg-[#77FF00]/[0.06] text-[#77FF00]",
  },

  bio: {
    border: "border-[#77FF00]/20",
    value: "text-[#77FF00]",
    icon: "border-[#77FF00]/20 bg-[#77FF00]/10 text-[#77FF00]",
  },
};

// ============================================
// FARM SUMMARY CARD
// ============================================

function FarmSummaryCard({
  label,
  labelKey,
  value,
  icon: Icon,
  tone = "default",
  index = 0,
}) {
  const { t } = useTranslation();

  const isRevealActive = useRevealActive();

  const styles = toneStyles[tone] ?? toneStyles.default;

  // Preserve original label translation.
  const displayLabel = labelKey ? t(labelKey) : label;

  // Validate numeric data.
  const hasValidValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value));

  const numericValue = hasValidValue ? Number(value) : null;

  // Preserve original number formatting.
  const displayValue =
    value === null || value === undefined
      ? "—"
      : Number(value).toLocaleString();

  // Card appearance timing.
  const cardDelay = 100 + index * 65;

  // Count-up starts after card fade begins.
  const numberDelay = 230 + index * 65;

  const formatAnimatedValue = (number) => Math.round(number).toLocaleString();

  return (
    <Card
      className={[
        isRevealActive ? "kpi-card-reveal" : "",

        "group h-full min-w-0 gap-0",
        "overflow-hidden rounded-2xl",
        "bg-[#0D1510] py-0 shadow-none",

        "transition-[border-color,background-color,box-shadow]",
        "duration-[220ms] ease-out",

        "hover:border-[#77FF00]/30",
        "hover:bg-[#111C15]",
        "hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]",

        styles.border,
      ].join(" ")}
      style={{
        animationDelay: `${cardDelay}ms`,
      }}
    >
      <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
        {/* ====================================
            CARD HEADER
           ==================================== */}

        <div className="flex items-start justify-between gap-3">
          {/* SUMMARY ICON */}
          <div
            className={[
              "flex h-11 w-11 shrink-0",
              "items-center justify-center",
              "rounded-xl border",
              styles.icon,
            ].join(" ")}
          >
            {Icon && <Icon size={20} strokeWidth={1.8} aria-hidden="true" />}
          </div>

          {/* ARROW ICON */}
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            className={[
              "text-[#647466]",
              "transition-colors duration-200",
              "group-hover:text-[#77FF00]",
            ].join(" ")}
          />
        </div>

        {/* ====================================
            SUMMARY CONTENT
           ==================================== */}

        <div className="min-w-0">
          {/* TRANSLATED LABEL */}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8C9A90]">
            {displayLabel}
          </p>

          {/* ANIMATED VALUE */}
          <strong
            className={[
              "block text-[28px]",
              "font-semibold leading-none",
              "tracking-tight tabular-nums",
              styles.value,
            ].join(" ")}
          >
            <span className="inline-grid max-w-full align-bottom">
              {/* Reserve final number width */}
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1"
              >
                {displayValue}
              </span>

              <span className="col-start-1 row-start-1">
                <AnimatedKpiValue
                  value={displayValue}
                  numericValue={numericValue}
                  formatValue={formatAnimatedValue}
                  delay={numberDelay}
                  duration={750}
                />
              </span>
            </span>
          </strong>
        </div>
      </CardContent>
    </Card>
  );
}

export default FarmSummaryCard;
