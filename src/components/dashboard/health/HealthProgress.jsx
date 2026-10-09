import { Progress } from "@/components/ui/progress";

import useAnimatedHealthValue from "@/hooks/useAnimatedHealthValue";

function HealthProgress({ label, value, delay = 0 }) {
  const numericValue = Number(value ?? 0);

  const safeValue = Number.isFinite(numericValue)
    ? Math.min(Math.max(numericValue, 0), 100)
    : 0;

  const animatedValue = useAnimatedHealthValue(safeValue, {
    delay,
    duration: 750,
  });

  const displayedValue = Number(animatedValue.toFixed(1));

  return (
    <div className="flex w-full flex-col gap-2.5">
      {/* LABEL + PERCENTAGE */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[#8C9A90]">{label}</span>

        <strong
          className="text-sm font-semibold text-[#F4F7F4] tabular-nums"
          aria-label={`${safeValue}%`}
        >
          <span aria-hidden="true">{displayedValue}%</span>
        </strong>
      </div>

      {/* ANIMATED PROGRESS BAR */}
      <Progress
        value={animatedValue}
        max={100}
        aria-label={label}
        className={[
          "h-2 w-full",
          "rounded-full bg-[#1B2A1F]",
          "[&>div]:bg-[#77FF00]",
          "[&>div]:transition-none",
        ].join(" ")}
      />
    </div>
  );
}

export default HealthProgress;
