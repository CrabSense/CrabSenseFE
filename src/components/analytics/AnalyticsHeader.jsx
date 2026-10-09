import { BarChart3, RefreshCw, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import useSelectedArea from "../../hooks/useSelectedArea";
import useTranslation from "../../hooks/useTranslation";

function AnalyticsHeader({ refreshing = false, onRefresh }) {
  const { selectedArea } = useSelectedArea();
  const { t } = useTranslation();

  const areaName = selectedArea?.name || t("analytics.allAreas");

  return (
    <section
      aria-label={t("analytics.title")}
      className={[
        "relative mb-6 flex min-w-0 flex-col",
        "gap-6 overflow-hidden rounded-2xl",
        "border border-[#77FF00]/10",
        "bg-[#0D1510] p-6",
        "xl:flex-row xl:items-center",
        "xl:justify-between",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#77FF00]/[0.035] blur-3xl"
      />

      <div className="relative z-10 min-w-0">
        <Badge
          variant="outline"
          className={[
            "mb-4 w-fit gap-1.5",
            "border-[#77FF00]/20",
            "bg-[#77FF00]/[0.06]",
            "px-2.5 py-1",
            "text-[10px] font-bold",
            "tracking-[0.12em] text-[#77FF00]",
          ].join(" ")}
        >
          <BarChart3 size={12} />
          {t("analytics.badge")}
        </Badge>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F7F4] sm:text-[28px]">
            {t("analytics.title")}
          </h1>

          <TrendingUp
            size={21}
            aria-hidden="true"
            className="hidden shrink-0 text-[#77FF00]/50 sm:block"
          />
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8C9A90]">
          {t("analytics.description")}{" "}
          <strong className="font-semibold text-[#DCE7DE]">{areaName}</strong>.
        </p>
      </div>

      <div className="relative z-10 flex shrink-0 items-center">
        <Button
          type="button"
          onClick={onRefresh}
          disabled={refreshing || typeof onRefresh !== "function"}
          className={[
            "h-10 gap-2 rounded-lg px-5",
            "bg-[#77FF00] font-semibold",
            "text-[#050806]",
            "hover:bg-[#63E600]",
            "disabled:opacity-60",
          ].join(" ")}
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? t("analytics.refreshing") : t("analytics.refresh")}
        </Button>
      </div>
    </section>
  );
}

export default AnalyticsHeader;
