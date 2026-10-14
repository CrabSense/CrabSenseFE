import { Card, CardContent } from "@/components/ui/card";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

const statusStyles = {
  normal: {
    icon: "text-[#77FF00]",
    iconBackground: "border-[#77FF00]/15 bg-[#77FF00]/5",
    accent: "bg-[#77FF00]",
  },

  warning: {
    icon: "text-[#FBBF24]",
    iconBackground: "border-amber-500/20 bg-amber-500/10",
    accent: "bg-[#FBBF24]",
  },

  critical: {
    icon: "text-[#FF7777]",
    iconBackground: "border-red-500/20 bg-red-500/10",
    accent: "bg-[#FF7777]",
  },

  offline: {
    icon: "text-[#8C9A90]",
    iconBackground: "border-white/10 bg-white/5",
    accent: "bg-[#8C9A90]",
  },
};

function EnvironmentCard({
  icon: Icon,
  label,
  value,
  numericValue,
  unit,
  suffix,
  decimals = 1,
  description,
  status = "normal",
  index = 0,
}) {
  const isRevealActive = useRevealActive();

  const styles = statusStyles[status] ?? statusStyles.normal;

  const hasValue = value !== null && value !== undefined && value !== "";

  // Use explicit numericValue for formatted fields
  // such as "85%", otherwise use the raw API value.
  const rawNumeric = numericValue !== undefined ? numericValue : value;

  const parsedNumber = Number(rawNumeric);

  const hasNumericValue =
    rawNumeric !== null &&
    rawNumeric !== undefined &&
    rawNumeric !== "" &&
    Number.isFinite(parsedNumber);

  const displayValue = hasValue ? value : "—";

  const cardDelay = 100 + index * 65;
  const numberDelay = 220 + index * 65;

  const formatAnimatedValue = (number) => number.toFixed(decimals);

  return (
    <Card
      className={[
        isRevealActive ? "kpi-card-reveal" : "",

        "relative h-full min-w-0",
        "overflow-hidden rounded-2xl",
        "border border-[#24382A]",
        "bg-[#0D1510] py-0 shadow-none",

        "transition-[border-color,background-color,box-shadow]",
        "duration-[220ms] ease-out",

        "hover:border-[#77FF00]/25",
        "hover:bg-[#111C15]",
        "hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
      ].join(" ")}
      style={{
        animationDelay: `${cardDelay}ms`,
      }}
    >
      <CardContent className="flex items-center gap-4 p-5">
        {/* SENSOR ICON */}
        <div
          className={[
            "flex h-12 w-12 shrink-0",
            "items-center justify-center",
            "rounded-xl border",
            styles.iconBackground,
          ].join(" ")}
        >
          {Icon && (
            <Icon size={22} className={styles.icon} aria-hidden="true" />
          )}
        </div>

        {/* SENSOR INFORMATION */}
        <div className="min-w-0 flex-1">
          {/* LABEL */}
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8C9A90]">
            {label}
          </p>

          {/* ANIMATED VALUE */}
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <strong
              className={[
                "text-2xl font-bold tracking-tight",
                "text-[#F4F7F4] tabular-nums",
              ].join(" ")}
            >
              <AnimatedKpiValue
                value={
                  suffix && hasNumericValue
                    ? parsedNumber.toFixed(decimals)
                    : displayValue
                }
                numericValue={hasNumericValue ? parsedNumber : null}
                formatValue={formatAnimatedValue}
                delay={numberDelay}
                duration={750}
              />
            </strong>

            {/* UNIT / SUFFIX */}
            {unit && hasValue && (
              <span className="text-xs text-[#8C9A90]">{unit}</span>
            )}

            {suffix && hasNumericValue && (
              <span className="text-xs text-[#8C9A90]">{suffix}</span>
            )}
          </div>

          {/* DESCRIPTION */}
          {description && (
            <p className="mt-1.5 text-xs leading-relaxed text-[#647466]">
              {description}
            </p>
          )}
        </div>
      </CardContent>

      {/* BOTTOM STATUS ACCENT */}
      <div
        aria-hidden="true"
        className={[
          "absolute bottom-0 left-0",
          "h-[2px] w-full opacity-60",
          styles.accent,
        ].join(" ")}
      />
    </Card>
  );
}

export default EnvironmentCard;
