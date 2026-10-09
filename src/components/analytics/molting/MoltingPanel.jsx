import { Activity, Waves, Inbox } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useSelectedArea from "../../../hooks/useSelectedArea";
import useTranslation from "../../../hooks/useTranslation";

import { useRevealActive } from "@/components/ui/PageReveal";

import AnimatedKpiValue from "@/components/dashboard/stats/AnimatedKpiValue";

// ============================================
// NUMBER FORMATTERS
// ============================================

function formatNumber(value, language) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString(language === "vi" ? "vi-VN" : "en-US")
    : "—";
}

function formatRate(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "—";
}

// ============================================
// ANIMATED STAT ITEM
// ============================================

function MoltingStatItem({ label, value, language, index }) {
  const isRevealActive = useRevealActive();

  const hasValidValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value));

  const displayValue = formatNumber(value, language);

  const formatAnimatedValue = (number) => formatNumber(number, language);

  return (
    <div
      className={[
        "flex min-w-0 flex-col gap-2",
        "rounded-xl bg-[#111C15] p-4",
        isRevealActive ? "operation-item-reveal" : "",
      ].join(" ")}
      style={{
        animationDelay: `${220 + index * 80}ms`,
      }}
    >
      <span className="text-[10px] font-medium text-[#8C9A90]">{label}</span>

      <strong className="text-xl font-semibold tabular-nums text-[#F4F7F4]">
        <AnimatedKpiValue
          value={displayValue}
          numericValue={hasValidValue ? value : null}
          formatValue={formatAnimatedValue}
          delay={320 + index * 80}
          duration={750}
        />
      </strong>
    </div>
  );
}

// ============================================
// MOLTING PANEL
// ============================================

function MoltingPanel({ report }) {
  const { selectedAreaId, selectedArea } = useSelectedArea();

  const { t, language } = useTranslation();

  if (!report) return null;

  // Find the currently selected farming area.
  const scopedArea = selectedAreaId
    ? report.byAreas?.find(
        (area) =>
          String(area.areaId).toLowerCase() ===
          String(selectedAreaId).toLowerCase(),
      )
    : null;

  // Use selected area data when filtered;
  // otherwise use the overall report.
  const data = selectedAreaId ? scopedArea : report;

  const stats = data
    ? [
        {
          key: "totalCrabs",
          value: data.totalCrabs,
        },
        {
          key: "molting",
          value: data.moltingCrabs,
        },
        {
          key: "molted",
          value: data.moltedCrabs,
        },
      ]
    : [];

  const moltingRate = data ? formatRate(data.moltingRate) : "—";

  const numericMoltingRate =
    data?.moltingRate === null ||
    data?.moltingRate === undefined ||
    data?.moltingRate === "" ||
    !Number.isFinite(Number(data.moltingRate))
      ? null
      : Number(data.moltingRate);

  return (
    <Card
      className={[
        "h-full min-w-0 gap-0 overflow-hidden",
        "rounded-2xl border border-[#24382A]",
        "bg-[#0D1510] py-0 shadow-none",
      ].join(" ")}
    >
      {/* ======================================
          HEADER
         ====================================== */}

      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#77FF00]">
              {t("analytics.moltingCategory")}
            </p>

            <CardTitle className="text-lg font-semibold text-[#F4F7F4]">
              {t("analytics.moltingPerformance")}
            </CardTitle>

            <p className="mt-2 text-xs leading-relaxed text-[#8C9A90]">
              {selectedAreaId
                ? `${t("analytics.selectedAreaDescription")} ${
                    selectedArea?.name ?? t("analytics.selectedFarmingArea")
                  }`
                : t("analytics.overallMoltingDescription")}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#77FF00]/15 bg-[#77FF00]/[0.06] text-[#77FF00]">
            <Waves size={19} aria-hidden="true" />
          </div>
        </div>
      </CardHeader>

      {/* ======================================
          CONTENT
         ====================================== */}

      <CardContent className="flex flex-1 flex-col justify-between gap-6 px-6 pb-6">
        {!data ? (
          // EMPTY STATE
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <Inbox size={28} className="text-[#647466]" aria-hidden="true" />

            <p className="text-sm font-medium text-[#F4F7F4]">
              {t("analytics.noMoltingData")}
            </p>

            <p className="max-w-xs text-xs leading-relaxed text-[#8C9A90]">
              {t("analytics.noMoltingBreakdown")}
            </p>
          </div>
        ) : (
          <>
            {/* ==================================
                MOLTING RATE
               ================================== */}

            <div className="rounded-xl border border-[#77FF00]/10 bg-[#77FF00]/[0.035] p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#8C9A90]">
                <Activity
                  size={15}
                  className="text-[#77FF00]"
                  aria-hidden="true"
                />

                {t("analytics.moltingRate")}
              </div>

              <strong
                className={[
                  "block text-4xl font-semibold",
                  "tracking-tight tabular-nums",
                  "text-[#77FF00]",
                  "sm:text-[44px]",
                ].join(" ")}
              >
                <AnimatedKpiValue
                  value={moltingRate}
                  numericValue={numericMoltingRate}
                  formatValue={formatRate}
                  delay={160}
                  duration={850}
                />
              </strong>

              <p className="mt-3 text-xs text-[#647466]">
                {t("analytics.moltingRateDescription")}
              </p>
            </div>

            {/* ==================================
                MOLTING STATISTICS
               ================================== */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((item, index) => (
                <MoltingStatItem
                  key={item.key}
                  label={t(`analytics.${item.key}`)}
                  value={item.value}
                  language={language}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MoltingPanel;
