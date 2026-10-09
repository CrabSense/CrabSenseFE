import { Card, CardContent } from "@/components/ui/card";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

const toneStyles = {
  default: {
    text: "text-[#F4F7F4]",
    icon: "text-[#77FF00]",
    iconBackground: "border-[#77FF00]/15 bg-[#77FF00]/5",
  },

  healthy: {
    text: "text-[#77FF00]",
    icon: "text-[#77FF00]",
    iconBackground: "border-[#77FF00]/15 bg-[#77FF00]/5",
  },

  warning: {
    text: "text-[#FBBF24]",
    icon: "text-[#FBBF24]",
    iconBackground: "border-amber-500/20 bg-amber-500/10",
  },

  critical: {
    text: "text-[#FF7777]",
    icon: "text-[#FF7777]",
    iconBackground: "border-red-500/20 bg-red-500/10",
  },

  offline: {
    text: "text-[#8C9A90]",
    icon: "text-[#8C9A90]",
    iconBackground: "border-white/10 bg-white/5",
  },
};

function MonitoringSummaryCard({
  label,
  value,
  tone = "default",
  icon: Icon,
  index = 0,
}) {
  const isRevealActive = useRevealActive();

  const styles = toneStyles[tone] ?? toneStyles.default;

  const hasValidValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value));

  // Preserve original fallback behavior.
  const displayValue = value ?? 0;

  const cardDelay = 100 + index * 65;
  const numberDelay = 230 + index * 65;

  return (
    <Card
      className={[
        isRevealActive ? "kpi-card-reveal" : "",

        "group h-full min-w-0 gap-0",
        "rounded-2xl border border-[#24382A]",
        "bg-[#0D1510] py-0 shadow-none",

        "transition-[border-color,background-color,box-shadow]",
        "duration-[220ms] ease-out",

        "hover:border-[#77FF00]/20",
        "hover:bg-[#111C15]",
        "hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
      ].join(" ")}
      style={{
        animationDelay: `${cardDelay}ms`,
      }}
    >
      <CardContent className="flex h-full items-center justify-between gap-3 p-5">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-medium text-[#8C9A90]">{label}</span>

          <strong
            className={[
              "text-2xl font-bold",
              "tracking-tight tabular-nums",
              styles.text,
            ].join(" ")}
          >
            <span className="inline-grid max-w-full align-bottom">
              {/* Reserve width and prevent layout shift */}
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1"
              >
                {displayValue}
              </span>

              <span className="col-start-1 row-start-1">
                <AnimatedKpiValue
                  value={displayValue}
                  numericValue={hasValidValue ? Number(value) : null}
                  formatValue={(number) => Math.round(number).toString()}
                  delay={numberDelay}
                  duration={750}
                />
              </span>
            </span>
          </strong>
        </div>

        {/* STATUS ICON */}
        {Icon && (
          <div
            className={[
              "flex h-11 w-11 shrink-0",
              "items-center justify-center",
              "rounded-xl border",
              styles.iconBackground,
            ].join(" ")}
          >
            <Icon size={21} className={styles.icon} aria-hidden="true" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MonitoringSummaryCard;
