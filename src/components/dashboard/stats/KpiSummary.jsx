
import {
    Activity,
    Waves,
    TrendingUp,
    HeartPulse,
    Package,
    Scale,
  } from "lucide-react";
  
  const panel =
    "rounded-2xl border border-[#24382A] bg-[#0D1510] p-5";
  
  const kpis = [
    {
      key: "survivalRate",
      label: "Survival Rate",
      unit: "%",
      icon: HeartPulse,
    },
    {
      key: "moltingRate",
      label: "Molting Rate",
      unit: "%",
      icon: Waves,
    },
    {
      key: "harvestRate",
      label: "Harvest Rate",
      unit: "%",
      icon: TrendingUp,
    },
    {
      key: "mortalityRate",
      label: "Mortality Rate",
      unit: "%",
      icon: Activity,
    },
    {
      key: "totalHarvestWeightKg",
      label: "Total Harvest Weight",
      unit: " kg",
      icon: Scale,
    },
    {
      key: "frozenInventoryWeightKg",
      label: "Frozen Inventory Weight",
      unit: " kg",
      icon: Package,
    },
  ];
  
  function formatKpi(value, unit) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }
  
    const number = Number(value);
  
    if (!Number.isFinite(number)) {
      return "—";
    }
  
    return (
      number.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + unit
    );
  }
  
  function KpiSummary({ summary }) {
    return (
      <section className={`${panel} mb-5`}>
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
            FARM PERFORMANCE
          </p>
  
          <h2 className="mt-2 text-lg font-semibold text-[#F4F7F4]">
            KPI Summary
          </h2>
  
          <p className="mt-1 text-xs text-[#91A394]">
            Performance indicators calculated by CrabSense Backend.
          </p>
        </div>
  
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((item) => {
            const Icon = item.icon;
  
            const value = summary
              ? summary[item.key]
              : null;
  
            return (
              <div
                key={item.key}
                className="rounded-xl border border-[#304736] bg-[#071009] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-[#91A394]">
                    {item.label}
                  </p>
  
                  <Icon
                    size={17}
                    className="shrink-0 text-[#77FF00]"
                  />
                </div>
  
                <p className="mt-3 text-xl font-semibold tabular-nums text-[#F4F7F4]">
                  {formatKpi(value, item.unit)}
                </p>
              </div>
            );
          })}
        </div>
  
        {!summary && (
          <p className="mt-4 text-xs text-[#91A394]">
            KPI Summary is not available for the selected scope.
          </p>
        )}
      </section>
    );
  }
  
  export default KpiSummary;
  