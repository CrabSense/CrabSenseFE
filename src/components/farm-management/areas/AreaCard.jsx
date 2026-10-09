import { Boxes, Grid3X3, Pencil, Shell, PowerOff, Check } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import useTranslation from "@/hooks/useTranslation";

import { translateFarmStatus } from "@/utils/farmTranslations";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

// ============================================
// HELPERS
// ============================================

function formatCount(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  return Number.isFinite(number) ? number.toLocaleString() : String(value);
}

// ============================================
// AREA STAT ITEM
// ============================================

function AreaStatItem({
  label,
  value,
  icon: Icon,
  cardIndex = 0,
  statIndex = 0,
}) {
  const numericValue = Number(value ?? 0);

  const hasValidValue = Number.isFinite(numericValue);

  const numberDelay = 180 + Math.min(cardIndex, 6) * 65 + statIndex * 45;

  return (
    <div
      className={[
        "min-w-0 rounded-lg",
        "border border-[#24382A]/70",
        "bg-[#050806]/35 p-2.5",
      ].join(" ")}
    >
      <Icon size={15} className="mb-2 text-[#77FF00]" aria-hidden="true" />

      <strong
        className={[
          "block text-base font-semibold",
          "tabular-nums text-[#E8EDE9]",
        ].join(" ")}
      >
        <AnimatedKpiValue
          value={formatCount(value)}
          numericValue={hasValidValue ? numericValue : null}
          formatValue={(number) => Math.round(number).toLocaleString()}
          delay={numberDelay}
          duration={650}
        />
      </strong>

      <span className="text-[10px] text-[#8C9A90]">{label}</span>
    </div>
  );
}

// ============================================
// AREA CARD
// ============================================

function AreaCard({
  area,
  selected = false,
  onSelect,
  onEdit,
  onDeactivate,
  index = 0,
}) {
  const { t } = useTranslation();

  const isRevealActive = useRevealActive();

  // ==========================================
  // AREA STATUS
  // ==========================================

  const isActive = Boolean(area.isActive);

  const statusLabel = area.status
    ? translateFarmStatus(area.status, t)
    : isActive
      ? t("farm.active")
      : t("farm.inactive");

  // ==========================================
  // AREA STATISTICS
  // ==========================================

  const stats = [
    {
      key: "rows",
      label: t("farm.rows"),
      value: area.rowCount ?? 0,
      icon: Grid3X3,
    },
    {
      key: "boxes",
      label: t("farm.boxes"),
      value: area.boxCount ?? 0,
      icon: Boxes,
    },
    {
      key: "crabs",
      label: t("farm.crabs"),
      value: area.crabCount ?? 0,
      icon: Shell,
    },
  ];

  const cardDelay = Math.min(index, 6) * 65;

  return (
    <Card
      className={[
        "group min-w-0 gap-0 overflow-hidden",
        "rounded-xl bg-[#0D1510] py-0 shadow-none",

        // Safe reveal: never hide cards by default.
        isRevealActive ? "farm-area-card-reveal" : "",

        // Smooth interaction
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
        "--area-reveal-delay": `${cardDelay}ms`,
      }}
    >
      <CardContent className="p-0">
        {/* AREA SELECTION */}
        <button
          type="button"
          onClick={() => onSelect?.(area.id)}
          aria-pressed={selected}
          className={[
            "w-full min-w-0 cursor-pointer",
            "p-4 text-left",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-inset",
            "focus-visible:ring-[#77FF00]/60",
          ].join(" ")}
        >
          {/* AREA INFORMATION */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* AREA CODE */}
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#738477]">
                {area.code || t("farm.farmingArea")}
              </p>

              {/* AREA NAME */}
              <h3 className="truncate text-sm font-semibold text-[#F4F7F4]">
                {area.name}
              </h3>
            </div>

            {/* STATUS BADGE */}
            <Badge
              variant="outline"
              className={[
                "shrink-0 rounded-full px-2 py-0.5",
                "text-[10px] font-medium",

                "transition-[background-color,border-color,color]",
                "duration-200",

                isActive
                  ? [
                      "border-[#77FF00]/20",
                      "bg-[#77FF00]/10",
                      "text-[#77FF00]",
                    ].join(" ")
                  : [
                      "border-[#7B867E]/20",
                      "bg-white/[0.04]",
                      "text-[#9CA89F]",
                    ].join(" "),
              ].join(" ")}
            >
              {statusLabel}
            </Badge>
          </div>

          {/* AREA STATISTICS */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {stats.map((stat, statIndex) => (
              <AreaStatItem
                key={stat.key}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                cardIndex={index}
                statIndex={statIndex}
              />
            ))}
          </div>

          {/* SELECTED AREA INDICATOR */}
          {selected && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#77FF00]">
              <Check size={13} aria-hidden="true" />

              {t("farmAreas.selectedMessage")}
            </p>
          )}
        </button>
      </CardContent>

      {/* ======================================
          AREA ACTIONS
         ====================================== */}

      <CardFooter className="flex items-center justify-end gap-2 border-t border-[#24382A] px-3 py-2.5">
        {/* EDIT AREA */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(area)}
          className={[
            "h-8 gap-1.5 text-xs",
            "text-[#ACB9AE]",
            "transition-colors duration-200",
            "hover:bg-[#77FF00]/10",
            "hover:text-[#77FF00]",
          ].join(" ")}
        >
          <Pencil size={13} aria-hidden="true" />

          {t("farm.edit")}
        </Button>

        {/* DEACTIVATE AREA */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDeactivate?.(area)}
          className={[
            "h-8 gap-1.5 text-xs",
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

export default AreaCard;
