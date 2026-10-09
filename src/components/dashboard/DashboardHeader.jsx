import { Activity, Clock3, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDashboardTime } from "../../utils/dashboardHelpers";
import useTranslation from "@/hooks/useTranslation";

function DashboardHeader({ lastUpdated, onRefresh, refreshing = false }) {
  const { t, language } = useTranslation();

  const formatLocalizedTime = (value) => {
    if (!value) {
      return formatDashboardTime(value);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return formatDashboardTime(value);
    }

    return date.toLocaleString(language === "vi" ? "vi-VN" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <section
      aria-label={t("dashboard.overviewAria")}
      className={[
        "relative mb-6 flex min-w-0",
        "flex-col gap-6 overflow-hidden",
        "rounded-2xl border border-[#77FF00]/10",
        "bg-[#0D1510] p-6",
        "xl:flex-row xl:items-center",
        "xl:justify-between",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-right-16 -top-24",
          "h-64 w-64 rounded-full",
          "bg-[#77FF00]/5 blur-3xl",
        ].join(" ")}
      />

      <div className="relative z-10 min-w-0">
        <Badge
          variant="outline"
          className={[
            "mb-4 gap-2 rounded-full",
            "border-[#77FF00]/20",
            "bg-[#77FF00]/5",
            "px-3 py-1.5",
            "text-[10px] font-bold",
            "tracking-widest text-[#77FF00]",
          ].join(" ")}
        >
          <Activity size={13} aria-hidden="true" />
          {t("dashboard.overviewBadge")}
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight text-[#F4F7F4] sm:text-3xl">
          {t("dashboard.overviewTitle")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8C9A90]">
          {t("dashboard.overviewDescription")}
        </p>
      </div>

      <div
        className={[
          "relative z-10 flex shrink-0",
          "flex-wrap items-center gap-4",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#77FF00]/10 bg-[#77FF00]/5">
            <Clock3 size={17} className="text-[#77FF00]" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C9A90]">
              {t("dashboard.lastUpdated")}
            </span>

            <strong className="text-xs font-medium text-[#F4F7F4]">
              {formatLocalizedTime(lastUpdated)}
            </strong>
          </div>
        </div>

        <Button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={t("dashboard.refreshAria")}
          className={[
            "h-10 gap-2 px-4",
            "bg-[#77FF00]",
            "font-semibold text-[#050806]",
            "hover:bg-[#48E600]",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          ].join(" ")}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
            aria-hidden="true"
          />

          {refreshing ? t("dashboard.refreshing") : t("dashboard.refresh")}
        </Button>
      </div>
    </section>
  );
}

export default DashboardHeader;
