import { useEffect, useMemo, useRef, useState } from "react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartNoAxesCombined, Inbox } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useTranslation from "../../../hooks/useTranslation";

import { useRevealActive } from "@/components/ui/PageReveal";

// ============================================
// DATE FORMAT
// ============================================

function formatChartDate(value) {
  if (!value) return "—";

  const datePart = String(value).slice(0, 10);
  const parts = datePart.split("-");

  if (parts.length !== 3) return datePart;

  const [year, month, day] = parts;

  return `${day}/${month}`;
}

// ============================================
// NUMBER NORMALIZATION
// ============================================

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// ============================================
// HARVEST TREND CHART
// ============================================

function HarvestTrendChart({ data = [] }) {
  const { t, language } = useTranslation();

  const isRevealActive = useRevealActive();

  const locale = language === "vi" ? "vi-VN" : "en-US";

  // ==========================================
  // CHART DATA
  // ==========================================

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => item?.date)
      .map((item) => ({
        date: formatChartDate(item.date),
        fullDate: String(item.date).slice(0, 10),
        quantity: toNumberOrNull(item.quantity),
        weightKg: toNumberOrNull(item.weightKg),
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [data]);

  const hasMeasurements = chartData.some(
    (item) => item.quantity !== null || item.weightKg !== null,
  );

  // ==========================================
  // ANIMATION STATE
  // ==========================================

  const [animationReady, setAnimationReady] = useState(false);

  const [animationFinished, setAnimationFinished] = useState(false);

  const startedRef = useRef(false);

  useEffect(() => {
    if (!isRevealActive || !hasMeasurements || startedRef.current) {
      return;
    }

    startedRef.current = true;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setAnimationReady(true);
      setAnimationFinished(true);
      return;
    }

    // Wait slightly for PageReveal to begin.
    const timeoutId = window.setTimeout(() => {
      setAnimationReady(true);
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isRevealActive, hasMeasurements]);

  // ==========================================
  // TOOLTIP DATE FORMAT
  // ==========================================

  const formatTooltipDate = (dateString) => {
    if (!dateString) {
      return t("analytics.unknownDate");
    }

    const parts = dateString.split("-").map(Number);

    if (parts.length !== 3) {
      return dateString;
    }

    const [year, month, day] = parts;

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // ==========================================
  // RECHARTS ANIMATION
  // ==========================================

  const shouldAnimate = animationReady && !animationFinished;

  return (
    <Card
      className={[
        "h-full min-w-0 gap-0 overflow-hidden",
        "rounded-2xl border border-[#24382A]",
        "bg-[#0D1510] py-0 shadow-none",
      ].join(" ")}
    >
      {/* HEADER */}
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#77FF00]">
              {t("analytics.harvestCategory")}
            </p>

            <CardTitle className="text-lg font-semibold text-[#F4F7F4]">
              {t("analytics.harvestTrend")}
            </CardTitle>

            <p className="mt-2 text-xs leading-relaxed text-[#8C9A90]">
              {t("analytics.harvestTrendDescription")}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#77FF00]/15 bg-[#77FF00]/[0.06] text-[#77FF00]">
            <ChartNoAxesCombined size={19} aria-hidden="true" />
          </div>
        </div>
      </CardHeader>

      {/* CHART CONTENT */}
      <CardContent className="px-4 pb-5 sm:px-6">
        {!hasMeasurements ? (
          // EMPTY STATE
          <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
            <Inbox size={28} className="text-[#647466]" aria-hidden="true" />

            <p className="text-sm text-[#8C9A90]">
              {t("analytics.noHarvestData")}
            </p>
          </div>
        ) : (
          // CHART
          <div
            className="h-[300px] w-full min-w-0"
            role="img"
            aria-label={t("analytics.harvestChartAria")}
          >
            {animationReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 4,
                    bottom: 10,
                    left: 0,
                  }}
                >
                  {/* GRID */}
                  <CartesianGrid
                    stroke="#24382A"
                    strokeOpacity={0.65}
                    strokeDasharray="3 4"
                    vertical={false}
                  />

                  {/* X AXIS */}
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#8C9A90",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />

                  {/* WEIGHT Y AXIS */}
                  <YAxis
                    yAxisId="weight"
                    orientation="left"
                    tick={{
                      fill: "#77FF00",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={38}
                    domain={[0, "auto"]}
                    allowDecimals
                  />

                  {/* QUANTITY Y AXIS */}
                  <YAxis
                    yAxisId="quantity"
                    orientation="right"
                    tick={{
                      fill: "#A1AFA4",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={38}
                    domain={[0, "auto"]}
                    allowDecimals={false}
                  />

                  {/* TOOLTIP */}
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      formatTooltipDate(payload?.[0]?.payload?.fullDate)
                    }
                    formatter={(value, name) => [
                      value == null
                        ? "—"
                        : Number(value).toLocaleString(locale),
                      name,
                    ]}
                    contentStyle={{
                      background: "#111C15",
                      border: "1px solid #24382A",
                      borderRadius: 12,
                      color: "#F4F7F4",
                      fontSize: 12,
                    }}
                    labelStyle={{
                      color: "#F4F7F4",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                    itemStyle={{
                      color: "#DCE7DE",
                    }}
                  />

                  {/* LEGEND */}
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: 11,
                      color: "#8C9A90",
                    }}
                  />

                  {/* WEIGHT LINE */}
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="weightKg"
                    name={t("analytics.weightKg")}
                    stroke="#77FF00"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#77FF00",
                    }}
                    connectNulls={false}
                    isAnimationActive={shouldAnimate}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    onAnimationEnd={() => {
                      setAnimationFinished(true);
                    }}
                  />

                  {/* QUANTITY LINE */}
                  <Line
                    yAxisId="quantity"
                    type="monotone"
                    dataKey="quantity"
                    name={t("analytics.quantityCrabs")}
                    stroke="#A1AFA4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "#A1AFA4",
                    }}
                    connectNulls={false}
                    isAnimationActive={shouldAnimate}
                    animationBegin={120}
                    animationDuration={1100}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HarvestTrendChart;
