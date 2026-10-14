import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

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

  warning: {
    border: "border-amber-500/20",
    value: "text-[#FBBF24]",
    icon: "border-amber-500/20 bg-amber-500/10 text-[#FBBF24]",
  },

  critical: {
    border: "border-red-500/20",
    value: "text-[#FF7777]",
    icon: "border-red-500/20 bg-red-500/10 text-[#FF7777]",
  },
};

function AnalyticsKpiCard({
  label,
  value,
  numericValue,
  formatValue,
  suffix,
  description,
  icon: Icon,
  tone = "default",
  index = 0,
}) {
  const styles = toneStyles[tone] ?? toneStyles.default;

  const isRevealActive = useRevealActive();

  const displayValue =
    value === null || value === undefined || value === "" ? "—" : value;

  // Stagger cards within the Analytics KPI section.
  const cardDelay = 100 + index * 65;

  // Start numbers after cards begin appearing.
  const numberDelay = 240 + index * 65;

  return (
    <Card
      className={[
        isRevealActive ? "kpi-card-reveal" : "",

        "group relative h-full min-w-0",
        "gap-0 overflow-hidden rounded-2xl",
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
            ICONS
           ==================================== */}

        <div className="flex items-start justify-between gap-3">
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
            KPI CONTENT
           ==================================== */}

        <div className="min-w-0">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8C9A90]">
            {label}
          </p>

          <div className="flex flex-wrap items-baseline gap-1.5">
            {/* ANIMATED NUMBER */}
            <strong
              className={[
                "text-[28px] font-semibold",
                "leading-none tracking-tight",
                "tabular-nums",
                styles.value,
              ].join(" ")}
            >
              <span className="inline-grid max-w-full align-bottom">
                {/* Reserve width to avoid layout shifts */}
                <span
                  aria-hidden="true"
                  className="invisible col-start-1 row-start-1"
                >
                  {displayValue}
                </span>

                <span
                  className="col-start-1 row-start-1"
                  aria-label={String(displayValue)}
                >
                  <AnimatedKpiValue
                    value={displayValue}
                    numericValue={numericValue}
                    formatValue={formatValue}
                    delay={numberDelay}
                    duration={750}
                  />
                </span>
              </span>
            </strong>

            {/* UNIT */}
            {suffix && (
              <span className="text-xs font-medium text-[#8C9A90]">
                {suffix}
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          {description && (
            <p className="mt-3 text-xs leading-relaxed text-[#647466]">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyticsKpiCard;
