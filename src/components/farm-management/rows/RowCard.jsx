import { Boxes, Pencil, Shell, PowerOff, Check, MapPin } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import useTranslation from "@/hooks/useTranslation";

import { translateFarmStatus } from "@/utils/farmTranslations";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

// ============================================
// NUMBER HELPERS
// ============================================

function formatCount(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.round(number).toLocaleString()
    : String(value);
}

// ============================================
// ROW STAT ITEM
// ============================================

function RowStatItem({
  label,
  value,
  icon: Icon,
  cardIndex = 0,
  statIndex = 0,
}) {
  const rawNumber = Number(value ?? 0);

  const numericValue = Number.isFinite(rawNumber) ? rawNumber : null;

  const numberDelay = 200 + Math.min(cardIndex, 6) * 65 + statIndex * 55;

  return (
    <div className="min-w-0 rounded-lg border border-[#24382A]/70 bg-[#050806]/35 p-2.5">
      <Icon size={15} className="mb-2 text-[#77FF00]" aria-hidden="true" />

      <strong className="block text-base font-semibold tabular-nums text-[#E8EDE9]">
        <AnimatedKpiValue
          value={formatCount(value)}
          numericValue={numericValue}
          formatValue={formatCount}
          delay={numberDelay}
          duration={650}
        />
      </strong>

      <span className="text-[10px] text-[#8C9A90]">{label}</span>
    </div>
  );
}

// ============================================
// ROW CARD
// ============================================

function RowCard({
  row,
  selected = false,
  onSelect,
  onEdit,
  onDeactivate,
  index = 0,
}) {
  const { t } = useTranslation();

  const isRevealActive = useRevealActive();

  const boxCount = row.boxCount ?? 0;
  const crabCount = row.crabCount ?? 0;
  const capacity = row.capacity ?? 0;

  // Capacity = 0 means unlimited.
  const isUnlimited = Number(capacity) === 0;

  const statusLabel = row.status
    ? translateFarmStatus(row.status, t)
    : t("farm.rows");

  const cardDelay = Math.min(index, 6) * 65;

  return (
    <Card
      className={[
        "group min-w-0 gap-0 overflow-hidden",
        "rounded-xl bg-[#0D1510] py-0 shadow-none",

        isRevealActive ? "farm-row-card-reveal" : "",

        "transition-[background-color,border-color,box-shadow,transform]",
        "duration-[220ms]",
        "ease-out",
        "motion-reduce:transition-none",

        selected
          ? [
              "border-[#77FF00]/40",
              "bg-[#77FF00]/[0.035]",
              "shadow-[0_0_0_1px_rgba(119,255,0,0.07)]",
            ].join(" ")
          : [
              "border-[#24382A]",
              "hover:-translate-y-0.5",
              "hover:border-[#77FF00]/25",
              "hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
            ].join(" "),
      ].join(" ")}
      style={{
        "--row-card-delay": `${cardDelay}ms`,
      }}
    >
      <CardContent className="p-0">
        {/* ROW SELECTION */}
        <button
          type="button"
          onClick={() => onSelect?.(row.id)}
          aria-pressed={selected}
          className={[
            "w-full min-w-0 cursor-pointer p-4 text-left",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-inset",
            "focus-visible:ring-[#77FF00]/60",
          ].join(" ")}
        >
          {/* ROW INFORMATION */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* ROW CODE */}
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[#738477]">
                {row.code || t("farm.farmingRow")}
              </span>

              {/* ROW NAME */}
              <h3 className="truncate text-sm font-semibold text-[#F4F7F4]">
                {row.name}
              </h3>

              {/* ROW LOCATION */}
              {row.location && (
                <p className="mt-2 flex items-center gap-1.5 truncate text-[11px] text-[#8C9A90]">
                  <MapPin size={12} className="shrink-0" aria-hidden="true" />

                  <span className="truncate">{row.location}</span>
                </p>
              )}
            </div>

            {/* ROW STATUS BADGE */}
            {selected ? (
              <Badge
                variant="outline"
                className={[
                  "shrink-0 border-[#77FF00]/30",
                  "bg-[#77FF00]/10",
                  "text-[10px] text-[#77FF00]",
                ].join(" ")}
              >
                <Check size={12} className="mr-1" aria-hidden="true" />

                {t("farm.selected")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="shrink-0 border-[#24382A] text-[10px] text-[#8C9A90]"
              >
                {statusLabel}
              </Badge>
            )}
          </div>

          {/* ROW STATISTICS */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {/* BOX COUNT */}
            <RowStatItem
              label={t("farm.boxes")}
              value={boxCount}
              icon={Boxes}
              cardIndex={index}
              statIndex={0}
            />

            {/* CRAB COUNT */}
            <RowStatItem
              label={t("farm.crabs")}
              value={crabCount}
              icon={Shell}
              cardIndex={index}
              statIndex={1}
            />
          </div>
        </button>
      </CardContent>

      {/* ROW FOOTER */}
      <CardFooter className="flex flex-wrap items-center gap-2 border-t border-[#24382A] px-3 py-2.5">
        {/* CAPACITY */}
        <div className="mr-auto min-w-0">
          <span className="block text-[10px] uppercase tracking-wider text-[#647466]">
            {t("farm.capacity")}
          </span>

          <strong className="text-xs font-semibold text-[#DCE7DE]">
            {isUnlimited ? t("farm.unlimited") : `${boxCount}/${capacity}`}
          </strong>
        </div>

        {/* EDIT ROW */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(row)}
          className={[
            "h-8 gap-1.5 px-2 text-xs",
            "text-[#ACB9AE]",
            "transition-colors duration-200",
            "hover:bg-[#77FF00]/10",
            "hover:text-[#77FF00]",
          ].join(" ")}
        >
          <Pencil size={13} aria-hidden="true" />

          {t("farm.edit")}
        </Button>

        {/* DEACTIVATE ROW */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDeactivate?.(row)}
          className={[
            "h-8 gap-1.5 px-2 text-xs",
            "text-[#E4B85D]",
            "transition-colors duration-200",
            "hover:bg-[#E4B85D]/10",
            "hover:text-[#F3CB7B]",
          ].join(" ")}
        >
          <PowerOff size={13} aria-hidden="true" />

          {t("farm.deactivate")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RowCard;
