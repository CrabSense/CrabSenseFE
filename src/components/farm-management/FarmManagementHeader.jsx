import { Boxes, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import useSelectedArea from "../../hooks/useSelectedArea";
import useTranslation from "@/hooks/useTranslation";

import { formatFarmMessage } from "@/utils/farmTranslations";

// ============================
// FARM MANAGEMENT HEADER
// ============================
function FarmManagementHeader({ refreshing = false, onRefresh }) {
  const { t } = useTranslation();

  // ============================
  // SELECTED FARMING AREA
  // ============================
  const { selectedArea } = useSelectedArea();

  // Keep actual area names from Backend.
  // Only translate the fallback label.
  const areaName = selectedArea?.name || t("farm.allFarmingAreas");

  // ============================
  // TRANSLATED DESCRIPTION
  // ============================
  const description = formatFarmMessage(t("farm.managementDescription"), {
    area: areaName,
  });

  return (
    <section
      aria-label={t("farm.managementOverview")}
      className={[
        "relative mb-6 flex min-w-0 flex-col",
        "gap-6 overflow-hidden rounded-2xl",
        "border border-[#77FF00]/10",
        "bg-[#0D1510] p-6",
        "xl:flex-row xl:items-center",
        "xl:justify-between",
      ].join(" ")}
    >
      {/* ============================
          BACKGROUND DECORATION
         ============================ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#77FF00]/[0.035] blur-3xl"
      />

      {/* ============================
          HEADER CONTENT
         ============================ */}
      <div className="relative z-10 min-w-0">
        {/* FARM STRUCTURE BADGE */}
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
          <Boxes size={12} aria-hidden="true" />

          {t("farm.structure")}
        </Badge>

        {/* PAGE TITLE */}
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F7F4] sm:text-[28px]">
          {t("farm.managementTitle")}
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8C9A90]">
          {selectedArea ? (
            <>
              {t("farm.managementDescriptionPrefix")}{" "}
              <strong className="font-semibold text-[#DCE7DE]">
                {areaName}
              </strong>
              .
            </>
          ) : (
            description
          )}
        </p>
      </div>

      {/* ============================
          REFRESH ACTION
         ============================ */}
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
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? t("farm.refreshing") : t("farm.refresh")}
        </Button>
      </div>
    </section>
  );
}

export default FarmManagementHeader;
