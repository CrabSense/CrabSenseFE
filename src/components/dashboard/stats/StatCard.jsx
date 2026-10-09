import { Card, CardContent } from "@/components/ui/card";

import AnimatedKpiValue from "./AnimatedKpiValue";

import { useRevealActive } from "@/components/ui/PageReveal";

const toneStyles = {
  default: {
    icon: "text-[#F4F7F4]",
    iconBackground: "bg-white/5",
    iconBorder: "border-white/10",
    value: "text-[#F4F7F4]",
    badge: "text-[#8C9A90] bg-white/5",
    line: "bg-[#8C9A90]",
  },

  bio: {
    icon: "text-[#77FF00]",
    iconBackground: "bg-[#77FF00]/10",
    iconBorder: "border-[#77FF00]/15",
    value: "text-[#77FF00]",
    badge: "text-[#77FF00] bg-[#77FF00]/10",
    line: "bg-[#77FF00]",
  },

  success: {
    icon: "text-[#55E887]",
    iconBackground: "bg-[#55E887]/10",
    iconBorder: "border-[#55E887]/15",
    value: "text-[#F4F7F4]",
    badge: "text-[#55E887] bg-[#55E887]/10",
    line: "bg-[#55E887]",
  },

  danger: {
    icon: "text-[#FF7777]",
    iconBackground: "bg-red-500/10",
    iconBorder: "border-red-500/20",
    value: "text-[#FF7777]",
    badge: "text-[#FF7777] bg-red-500/10",
    line: "bg-[#FF7777]",
  },
};

function StatCard({
  label,
  value,
  numericValue,
  formatValue,
  description,
  icon: Icon,
  tone = "default",
  accentText,
  index = 0,
}) {
  const styles = toneStyles[tone] ?? toneStyles.default;

  const isRevealActive = useRevealActive();

  // Stagger individual cards after the parent
  // Dashboard PageReveal has started.
  const cardDelay = 100 + index * 65;

  // The number starts counting after the card
  // has become partially visible.
  const numberDelay = 260 + index * 65;

  return (
    <Card
      className={[
        isRevealActive ? "kpi-card-reveal" : "",
        "group relative h-full min-w-0",

        // Card appearance
        "overflow-hidden rounded-2xl",
        "border border-[#24382A]",
        "bg-[#0D1510] py-0",
        "shadow-none",

        // Hover animation
        "transition-[background-color,border-color,box-shadow,transform]",
        "duration-[220ms]",
        "ease-out",
        "motion-reduce:transition-none",

        "hover:-translate-y-1",
        "hover:border-[#77FF00]/30",
        "hover:bg-[#111C15]",
        "hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
      ].join(" ")}
      style={{
        animationDelay: `${cardDelay}ms`,
      }}
    >
      <CardContent className="flex h-full flex-col gap-5 p-5">
        {/* ====================================
            ICON AND STATUS BADGE
           ==================================== */}

        <div className="flex items-start justify-between gap-3">
          <div
            className={[
              "flex h-11 w-11 shrink-0",
              "items-center justify-center",
              "rounded-xl border",

              styles.iconBackground,
              styles.iconBorder,
              styles.icon,

              "transition-[background-color,border-color]",
              "duration-200 ease-out",
            ].join(" ")}
          >
            {Icon && <Icon size={21} strokeWidth={1.9} aria-hidden="true" />}
          </div>

          {accentText && (
            <span
              className={[
                "rounded-full px-2.5 py-1",
                "text-[10px] font-bold",
                "tracking-wider",

                styles.badge,
              ].join(" ")}
            >
              {accentText}
            </span>
          )}
        </div>

        {/* ====================================
            KPI INFORMATION
           ==================================== */}

        <div className="flex flex-1 flex-col gap-1.5">
          {/* LABEL */}
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8C9A90]">
            {label}
          </p>

          {/* ANIMATED VALUE */}
          <strong
            className={[
              "block min-w-0 break-words",
              "text-3xl font-bold",
              "tracking-tight tabular-nums",
              styles.value,
            ].join(" ")}
          >
            <span className="inline-grid max-w-full align-bottom">
              {/* Invisible value reserves final text width.
                  Prevents layout shift while counting. */}
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1"
              >
                {value ?? "—"}
              </span>

              <span
                aria-label={String(value ?? "—")}
                className="col-start-1 row-start-1"
              >
                <AnimatedKpiValue
                  value={value}
                  numericValue={numericValue}
                  formatValue={formatValue}
                  delay={numberDelay}
                  duration={700}
                />
              </span>
            </span>
          </strong>

          {/* DESCRIPTION */}
          {description && (
            <p className="text-xs leading-relaxed text-[#718077]">
              {description}
            </p>
          )}
        </div>

        {/* ====================================
            BOTTOM ACCENT LINE
           ==================================== */}

        <div className="h-[3px] overflow-hidden rounded-full bg-[#1B2A1F]">
          <div
            className={[
              "h-full w-1/3 rounded-full",
              "transition-[width]",
              "duration-[350ms]",
              "ease-out",
              "group-hover:w-2/3",

              styles.line,
            ].join(" ")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
