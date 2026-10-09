import {
  Archive,
  Boxes,
  Grid3X3,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Shell,
} from "lucide-react";

import { useRef } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import useTranslation from "@/hooks/useTranslation";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

// ============================================
// NUMBER FORMAT
// ============================================

function formatCount(value) {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? Math.round(number).toLocaleString()
    : String(value);
}

// ============================================
// ARCHIVED AREA STAT
// ============================================

function ArchivedAreaStat({
  label,
  value,
  icon: Icon,
  index = 0,
  statIndex = 0,
  animate = true,
}) {
  const numericValue = Number(value ?? 0);

  const numberDelay = 180 + Math.min(index, 5) * 65 + statIndex * 45;

  return (
    <div className="min-w-0 rounded-lg border border-[#24382A]/70 bg-[#050806]/35 p-2.5">
      <Icon size={14} className="mb-2 text-[#8C9A90]" aria-hidden="true" />

      <strong className="block text-base font-semibold tabular-nums text-[#F4F7F4]">
        {animate ? (
          <AnimatedKpiValue
            value={formatCount(value)}
            numericValue={Number.isFinite(numericValue) ? numericValue : null}
            formatValue={formatCount}
            delay={numberDelay}
            duration={650}
          />
        ) : (
          formatCount(value)
        )}
      </strong>

      <span className="text-[10px] text-[#738477]">{label}</span>
    </div>
  );
}

// ============================================
// ARCHIVED AREA CARD
// ============================================

function ArchivedAreaCard({
  area,
  onReactivate,
  processing = false,
  index = 0,
  animate = true,
}) {
  const { t } = useTranslation();

  const isRevealActive = useRevealActive();

  const initialAnimateRef = useRef(animate);

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

  const cardDelay = Math.min(index, 5) * 65;

  const shouldAnimate = initialAnimateRef.current && isRevealActive;

  return (
    <Card
      className={[
        "min-w-0 gap-0 overflow-hidden",
        "rounded-xl border-[#24382A]",
        "bg-[#0D1510] py-0 shadow-none",

        "transition-[border-color,background-color,box-shadow]",
        "duration-200",

        "hover:border-[#E4B85D]/25",
        "hover:bg-[#111911]",

        shouldAnimate
          ? "farm-archive-card-reveal"
          : "farm-archive-card-reveal-done",
      ].join(" ")}
      style={{
        "--archive-card-delay": `${cardDelay}ms`,
      }}
    >
      <CardContent className="p-4">
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

            {/* LOCATION */}
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#8C9A90]">
              <MapPin size={12} className="shrink-0" aria-hidden="true" />

              <span className="truncate">
                {area.location || area.region || t("farm.noLocation")}
              </span>
            </p>
          </div>

          {/* ARCHIVED STATUS */}
          <Badge
            variant="outline"
            className={[
              "shrink-0 gap-1.5",
              "border-[#E4B85D]/20",
              "bg-[#E4B85D]/[0.07]",
              "text-[10px] text-[#E4B85D]",
            ].join(" ")}
          >
            <Archive size={11} aria-hidden="true" />

            {t("farm.closed")}
          </Badge>
        </div>

        {/* AREA STATISTICS */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {stats.map((stat, statIndex) => (
            <ArchivedAreaStat
              key={stat.key}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              index={index}
              statIndex={statIndex}
              animate={initialAnimateRef.current}
            />
          ))}
        </div>
      </CardContent>

      {/* REACTIVATE ACTION */}
      <CardFooter className="border-t border-[#24382A] px-4 py-3">
        <Button
          type="button"
          variant="outline"
          disabled={processing}
          onClick={() => onReactivate?.(area)}
          className={[
            "w-full gap-2",
            "border-[#77FF00]/20",
            "bg-[#77FF00]/[0.06]",
            "text-[#77FF00]",
            "hover:bg-[#77FF00]/10",
            "hover:text-[#77FF00]",
            "disabled:opacity-40",
          ].join(" ")}
        >
          {processing ? (
            <LoaderCircle
              size={15}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RotateCcw size={15} aria-hidden="true" />
          )}

          {processing ? t("farm.reactivating") : t("farmAreas.reactivateTitle")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ArchivedAreaCard;
