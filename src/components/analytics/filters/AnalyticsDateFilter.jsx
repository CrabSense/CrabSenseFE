import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import useTranslation from "../../../hooks/useTranslation";

function AnalyticsDateFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) {
  const { t } = useTranslation();

  const handleFromDateChange = (event) => {
    const nextDate = event.target.value;

    if (nextDate && toDate && nextDate > toDate) {
      return;
    }

    onFromDateChange(nextDate);
  };

  const handleToDateChange = (event) => {
    const nextDate = event.target.value;

    if (nextDate && fromDate && nextDate < fromDate) {
      return;
    }

    onToDateChange(nextDate);
  };

  const inputStyles = [
    "h-10 w-full min-w-0",
    "border-[#24382A]",
    "bg-[#111C15]",
    "text-sm text-[#F4F7F4]",
    "scheme-dark",
    "focus-visible:border-[#77FF00]/50",
    "focus-visible:ring-[#77FF00]/20",
  ].join(" ");

  return (
    <div
      role="group"
      aria-label={t("analytics.dateRange")}
      className={[
        "flex w-full min-w-0 flex-col",
        "gap-4 rounded-xl",
        "border border-[#24382A]",
        "bg-[#0D1510] p-4",
        "sm:w-auto sm:flex-row",
        "sm:items-end",
      ].join(" ")}
    >
      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#77FF00]/15 bg-[#77FF00]/[0.06] text-[#77FF00] lg:flex">
        <CalendarDays size={18} aria-hidden="true" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:w-40">
        <Label
          htmlFor="analytics-from-date"
          className="text-[10px] font-bold uppercase tracking-wider text-[#8C9A90]"
        >
          {t("analytics.fromDate")}
        </Label>

        <Input
          id="analytics-from-date"
          type="date"
          value={fromDate ?? ""}
          max={toDate || undefined}
          onChange={handleFromDateChange}
          className={inputStyles}
        />
      </div>

      <span
        aria-hidden="true"
        className="hidden pb-3 text-xs text-[#647466] sm:block"
      >
        —
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:w-40">
        <Label
          htmlFor="analytics-to-date"
          className="text-[10px] font-bold uppercase tracking-wider text-[#8C9A90]"
        >
          {t("analytics.toDate")}
        </Label>

        <Input
          id="analytics-to-date"
          type="date"
          value={toDate ?? ""}
          min={fromDate || undefined}
          onChange={handleToDateChange}
          className={inputStyles}
        />
      </div>
    </div>
  );
}

export default AnalyticsDateFilter;
