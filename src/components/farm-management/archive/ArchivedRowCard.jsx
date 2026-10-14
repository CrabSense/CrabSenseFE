import {
  Archive,
  Boxes,
  LoaderCircle,
  RotateCcw,
  Shell,
  Warehouse,
  AlertTriangle,
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
// ARCHIVED ROW STAT
// ============================================

function ArchivedRowStat({
  label,
  value,
  icon: Icon,
  index = 0,
  statIndex = 0,
  animate = true,
}) {
  const isUnlimited = value === "∞";

  const numericValue = Number(value ?? 0);

  const numberDelay = 180 + Math.min(index, 5) * 65 + statIndex * 45;

  return (
    <div className="min-w-0 rounded-lg border border-[#24382A]/70 bg-[#050806]/35 p-2.5">
      <Icon size={14} className="mb-2 text-[#8C9A90]" aria-hidden="true" />

      <strong className="block text-base font-semibold tabular-nums text-[#F4F7F4]">
        {isUnlimited ? (
          "∞"
        ) : animate ? (
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
// ARCHIVED ROW CARD
// ============================================

function ArchivedRowCard({
  row,
  parentAreaActive = false,
  processing = false,
  onReactivate,
  index = 0,
  animate = true,
}) {
  const { t } = useTranslation();

  const isRevealActive = useRevealActive();

  const initialAnimateRef = useRef(animate);

  // A row cannot be reactivated while
  // its parent farming area is inactive.
  const disabled = !parentAreaActive || processing;

  const stats = [
    {
      key: "boxes",
      label: t("farm.boxes"),
      value: row.boxCount ?? 0,
      icon: Boxes,
    },
    {
      key: "crabs",
      label: t("farm.crabs"),
      value: row.crabCount ?? 0,
      icon: Shell,
    },
    {
      key: "capacity",
      label: t("farm.capacity"),
      value: Number(row.capacity) === 0 ? "∞" : (row.capacity ?? 0),
      icon: Warehouse,
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
        {/* ROW INFORMATION */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* ROW CODE */}
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#738477]">
              {row.code || t("farm.farmingRow")}
            </p>

            {/* ROW NAME */}
            <h3 className="truncate text-sm font-semibold text-[#F4F7F4]">
              {row.name}
            </h3>

            {/* PARENT AREA / LOCATION */}
            <p className="mt-2 truncate text-[11px] text-[#8C9A90]">
              {row.areaName || row.location || t("farm.noAreaInfo")}
            </p>
          </div>

          {/* ARCHIVED BADGE */}
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

        {/* ROW STATISTICS */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {stats.map((stat, statIndex) => (
            <ArchivedRowStat
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

        {/* PARENT AREA WARNING */}
        {!parentAreaActive && (
          <div
            role="note"
            className={[
              "mt-4 flex items-start gap-2",
              "rounded-lg border",
              "border-[#E4B85D]/15",
              "bg-[#E4B85D]/[0.05] p-3",
            ].join(" ")}
          >
            <AlertTriangle
              size={14}
              className="mt-0.5 shrink-0 text-[#E4B85D]"
              aria-hidden="true"
            />

            <p className="text-[11px] leading-relaxed text-[#E4B85D]">
              {t("farmRows.reactivateParentFirst")}
            </p>
          </div>
        )}
      </CardContent>

      {/* REACTIVATE BUTTON */}
      <CardFooter className="border-t border-[#24382A] px-4 py-3">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onReactivate?.(row)}
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

          {processing ? t("farm.reactivating") : t("farmRows.reactivateTitle")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ArchivedRowCard;
