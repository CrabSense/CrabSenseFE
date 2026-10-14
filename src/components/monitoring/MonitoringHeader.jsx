import { Clock3, Radio, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import useSelectedArea from "@/hooks/useSelectedArea";
import useTranslation from "@/hooks/useTranslation";

function formatSyncTime(value, language, t) {
  if (!value) {
    return t("monitoring.notSynced");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return t("monitoring.timeUnavailable");
  }

  return date.toLocaleString(language === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MonitoringHeader({ syncedAt, refreshing = false, onRefresh }) {
  const { selectedArea } = useSelectedArea();
  const { t, language } = useTranslation();

  const areaName = selectedArea?.name || t("monitoring.allAreas");

  return (
    <section
      aria-label={t("monitoring.overview")}
      className={[
        "relative mb-6 flex min-w-0",
        "flex-col gap-6 overflow-hidden",
        "rounded-2xl border border-[#77FF00]/10",
        "bg-[#0D1510] p-6",
        "xl:flex-row xl:items-center xl:justify-between",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#77FF00]/5 blur-3xl"
      />

      <div className="relative z-10 min-w-0">
        <Badge
          variant="outline"
          className="mb-4 gap-2 rounded-full border-[#77FF00]/20 bg-[#77FF00]/5 px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#77FF00]"
        >
          <Radio size={13} aria-hidden="true" />
          {t("monitoring.badge")}
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight text-[#F4F7F4] sm:text-3xl">
          {t("monitoring.title")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8C9A90]">
          {t("monitoring.description")}{" "}
          <strong className="font-semibold text-[#F4F7F4]">{areaName}</strong>.
        </p>
      </div>

      <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#77FF00]/10 bg-[#77FF00]/5">
            <Clock3 size={17} className="text-[#77FF00]" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C9A90]">
              {t("monitoring.lastSynced")}
            </span>

            <strong className="text-xs font-medium text-[#F4F7F4]">
              {formatSyncTime(syncedAt, language, t)}
            </strong>
          </div>
        </div>

        <Button
          type="button"
          onClick={onRefresh}
          disabled={refreshing || typeof onRefresh !== "function"}
          className="h-10 gap-2 bg-[#77FF00] px-4 font-semibold text-[#050806] hover:bg-[#48E600] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? t("monitoring.refreshing") : t("monitoring.refresh")}
        </Button>
      </div>
    </section>
  );
}

export default MonitoringHeader;
