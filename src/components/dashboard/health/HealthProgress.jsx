
import { Progress } from "@/components/ui/progress";
import useAnimatedHealthValue from "@/hooks/useAnimatedHealthValue";

function HealthProgress({
  label,
  value,
  delay = 0,
}) {
  const numericValue = Number(value);

  const hasValidValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(numericValue);

  const safeValue = hasValidValue
    ? Math.min(Math.max(numericValue, 0), 100)
    : 0;

  const animatedValue = useAnimatedHealthValue(
    safeValue,
    {
      delay,
      duration: 750,
    }
  );

  const displayedValue = hasValidValue
    ? Number(animatedValue.toFixed(1))
    : null;

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[#8C9A90]">
          {label}
        </span>

        <strong
          className="text-sm font-semibold tabular-nums text-[#F4F7F4]"
          aria-label={
            hasValidValue
              ? `${safeValue}%`
              : "No data"
          }
        >
          <span aria-hidden="true">
            {hasValidValue
              ? `${displayedValue}%`
              : "—"}
          </span>
        </strong>
      </div>

      <Progress
        value={hasValidValue ? animatedValue : 0}
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
