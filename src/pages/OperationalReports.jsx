
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  
  import {
    BarChart3,
    CalendarDays,
    RefreshCw,
    Package,
    Fish,
    Activity,
    TrendingUp,
    Download,
  } from "lucide-react";
  
  import reportService from "../services/reportService";
  import useSelectedArea from "../hooks/useSelectedArea";
  
  const panel =
    "rounded-xl border border-[#24382A] bg-[#0D1510] p-5";
  
  const field =
    "w-full rounded-lg border border-[#304736] " +
    "bg-[#050806] px-3 py-2 text-sm text-[#F4F7F4] " +
    "outline-none focus:border-[#77FF00]";
  
  const button =
    "inline-flex items-center justify-center gap-2 " +
    "rounded-lg border border-[#304736] px-4 py-2 " +
    "text-sm text-[#F4F7F4] hover:border-[#77FF00] " +
    "disabled:cursor-not-allowed disabled:opacity-40";
  
  const tabs = [
    { id: "harvest", label: "Harvest", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "survival", label: "Survival Rate", icon: Fish },
    { id: "molting", label: "Molting", icon: Activity },
    {
      id: "efficiency",
      label: "Operational Efficiency",
      icon: TrendingUp,
    },
  ];
  
  const formatNumber = (value, digits = 0) => {
    if (value === null || value === undefined) return "—";
  
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
  
    return n.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };
  
  const formatDate = (value) => {
    if (!value) return "—";
  
    // Preserve the calendar date returned by BE.
    const datePart = String(value).slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  
    return match
      ? `${match[3]}/${match[2]}/${match[1]}`
      : String(value);
  };
  
  const percent = (value) => `${formatNumber(value, 2)}%`;
  const kg = (value) => `${formatNumber(value, 2)} kg`;
  
  function KpiCard({ title, value, icon: Icon }) {
    return (
      <div className={panel}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[#91A394]">{title}</p>
  
            <p className="mt-3 break-words text-2xl font-semibold text-[#F4F7F4]">
              {value}
            </p>
          </div>
  
          <div className="rounded-lg bg-[#77FF00]/10 p-2 text-[#77FF00]">
            <Icon size={19} />
          </div>
        </div>
      </div>
    );
  }
  
  function Stats({ items }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <KpiCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon || BarChart3}
          />
        ))}
      </div>
    );
  }
  
  function DataTable({ columns, rows, emptyMessage }) {
    return (
      <div className={`${panel} overflow-x-auto`}>
        {rows.length === 0 ? (
          <p className="text-sm text-[#91A394]">
            {emptyMessage || "Không có dữ liệu trong phạm vi này."}
          </p>
        ) : (
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#24382A]">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-3 font-semibold text-[#91A394]"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
  
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id || row.areaId || row.lotCode || index}
                  className="border-b border-[#24382A]/70 last:border-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-3 text-[#E2EAE4]"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
  
  function SectionTitle({ children, description }) {
    return (
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#F4F7F4]">
          {children}
        </h2>
  
        {description && (
          <p className="text-sm text-[#91A394]">
            {description}
          </p>
        )}
      </div>
    );
  }
  
  function HarvestReport({ data }) {
    const periods = Array.isArray(data.byPeriod)
      ? data.byPeriod
      : [];
  
    const grades = Array.isArray(data.byGrade)
      ? data.byGrade
      : [];
  
    return (
      <div className="space-y-5">
        <Stats
          items={[
            {
              title: "Harvest Vouchers",
              value: formatNumber(data.totalVouchers),
            },
            {
              title: "Total Quantity",
              value: formatNumber(data.totalQuantity),
            },
            {
              title: "Harvest Weight",
              value: kg(data.totalWeightKg),
            },
            {
              title: "Soft-shell Weight",
              value: kg(data.softshellWeightKg),
            },
          ]}
        />
  
        <SectionTitle description="Số liệu từ HarvestPeriodItemDto.">
          Harvest by Period
        </SectionTitle>
  
        <DataTable
          rows={periods}
          columns={[
            {
              key: "periodStart",
              label: "From",
              render: (r) => formatDate(r.periodStart),
            },
            {
              key: "periodEnd",
              label: "To",
              render: (r) => formatDate(r.periodEnd),
            },
            {
              key: "voucherCount",
              label: "Vouchers",
              render: (r) => formatNumber(r.voucherCount),
            },
            {
              key: "quantity",
              label: "Quantity",
              render: (r) => formatNumber(r.quantity),
            },
            {
              key: "weightKg",
              label: "Weight",
              render: (r) => kg(r.weightKg),
            },
          ]}
        />
  
        <SectionTitle>Harvest by Grade</SectionTitle>
  
        <DataTable
          rows={grades}
          columns={[
            { key: "grade", label: "Grade" },
            {
              key: "weightKg",
              label: "Weight",
              render: (r) => kg(r.weightKg),
            },
          ]}
        />
      </div>
    );
  }
  
  function InventoryReport({ data }) {
    const grades = Array.isArray(data.byGrade)
      ? data.byGrade
      : [];
  
    const expiry = Array.isArray(data.expiryAlerts)
      ? data.expiryAlerts
      : [];
  
    const trend = Array.isArray(data.trend)
      ? data.trend
      : [];
  
    return (
      <div className="space-y-5">
        <Stats
          items={[
            {
              title: "Inventory Lots",
              value: formatNumber(data.totalInventoryLots),
              icon: Package,
            },
            {
              title: "Inventory Quantity",
              value: formatNumber(data.totalInventoryQuantity),
            },
            {
              title: "Inventory Weight",
              value: kg(data.totalInventoryWeightKg),
            },
            {
              title: "Available Lots",
              value: formatNumber(data.availableLots),
            },
            {
              title: "Reserved Lots",
              value: formatNumber(data.reservedLots),
            },
            {
              title: "Shipped Lots",
              value: formatNumber(data.shippedLots),
            },
            {
              title: "Expired Lots",
              value: formatNumber(data.expiredLots),
            },
          ]}
        />
  
        <SectionTitle>Inventory by Grade</SectionTitle>
  
        <DataTable
          rows={grades}
          columns={[
            { key: "grade", label: "Grade" },
            {
              key: "lotCount",
              label: "Lots",
              render: (r) => formatNumber(r.lotCount),
            },
            {
              key: "quantity",
              label: "Quantity",
              render: (r) => formatNumber(r.quantity),
            },
            {
              key: "weightKg",
              label: "Weight",
              render: (r) => kg(r.weightKg),
            },
          ]}
        />
  
        <SectionTitle description="Danh sách cảnh báo hạn sử dụng từ Backend.">
          Expiry Alerts
        </SectionTitle>
  
        <DataTable
          rows={expiry}
          columns={[
            { key: "lotCode", label: "Lot" },
            { key: "grade", label: "Grade" },
            {
              key: "quantity",
              label: "Quantity",
              render: (r) => formatNumber(r.quantity),
            },
            {
              key: "weightKg",
              label: "Weight",
              render: (r) => kg(r.weightKg),
            },
            {
              key: "expiryDate",
              label: "Expiry Date",
              render: (r) => formatDate(r.expiryDate),
            },
            {
              key: "daysUntilExpiry",
              label: "Days Left",
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <span
                  className={
                    r.status === "expired"
                      ? "text-red-400"
                      : r.status === "expiring_soon"
                        ? "text-yellow-400"
                        : "text-[#77FF00]"
                  }
                >
                  {r.status}
                </span>
              ),
            },
          ]}
        />
  
        <SectionTitle>Inventory Trend</SectionTitle>
  
        <DataTable
          rows={trend}
          columns={[
            {
              key: "date",
              label: "Date",
              render: (r) => formatDate(r.date),
            },
            { key: "lotCount", label: "Lots" },
            { key: "quantity", label: "Quantity" },
            {
              key: "weightKg",
              label: "Weight",
              render: (r) => kg(r.weightKg),
            },
          ]}
        />
      </div>
    );
  }
  
  function SurvivalReport({ data }) {
    const areas = Array.isArray(data.byAreas)
      ? data.byAreas
      : [];
  
    const trend = Array.isArray(data.trend)
      ? data.trend
      : [];
  
    return (
      <div className="space-y-5">
        <Stats
          items={[
            { title: "Total Crabs", value: formatNumber(data.totalCrabs) },
            { title: "Alive Crabs", value: formatNumber(data.aliveCrabs) },
            { title: "Dead Crabs", value: formatNumber(data.deadCrabs) },
            { title: "Harvested", value: formatNumber(data.harvestedCrabs) },
            { title: "Survival Rate", value: percent(data.survivalRate) },
            { title: "Mortality Rate", value: percent(data.mortalityRate) },
            { title: "Harvest Rate", value: percent(data.harvestRate) },
          ]}
        />
  
        <SectionTitle>Survival by Farming Area</SectionTitle>
  
        <DataTable
          rows={areas}
          columns={[
            { key: "areaName", label: "Area" },
            { key: "totalCrabs", label: "Total" },
            { key: "aliveCrabs", label: "Alive" },
            { key: "deadCrabs", label: "Dead" },
            { key: "harvestedCrabs", label: "Harvested" },
            {
              key: "survivalRate",
              label: "Survival",
              render: (r) => percent(r.survivalRate),
            },
            {
              key: "mortalityRate",
              label: "Mortality",
              render: (r) => percent(r.mortalityRate),
            },
          ]}
        />
  
        <SectionTitle>Survival Trend</SectionTitle>
  
        <DataTable
          rows={trend}
          columns={[
            {
              key: "date",
              label: "Date",
              render: (r) => formatDate(r.date),
            },
            { key: "totalCrabs", label: "Total" },
            { key: "aliveCrabs", label: "Alive" },
            { key: "deadCrabs", label: "Dead" },
            { key: "harvestedCrabs", label: "Harvested" },
            {
              key: "survivalRate",
              label: "Survival",
              render: (r) => percent(r.survivalRate),
            },
          ]}
        />
      </div>
    );
  }
  
  function MoltingReport({ data }) {
    const areas = Array.isArray(data.byAreas)
      ? data.byAreas
      : [];
  
    const trend = Array.isArray(data.trend)
      ? data.trend
      : [];
  
    return (
      <div className="space-y-5">
        <Stats
          items={[
            { title: "Total Crabs", value: formatNumber(data.totalCrabs) },
            { title: "Molting Crabs", value: formatNumber(data.moltingCrabs) },
            { title: "Molted Crabs", value: formatNumber(data.moltedCrabs) },
            { title: "Molting Rate", value: percent(data.moltingRate) },
          ]}
        />
  
        <SectionTitle>Molting by Farming Area</SectionTitle>
  
        <DataTable
          rows={areas}
          columns={[
            { key: "areaName", label: "Area" },
            { key: "totalCrabs", label: "Total" },
            { key: "moltingCrabs", label: "Molting" },
            { key: "moltedCrabs", label: "Molted" },
            {
              key: "moltingRate",
              label: "Rate",
              render: (r) => percent(r.moltingRate),
            },
          ]}
        />
  
        <SectionTitle>Molting Trend</SectionTitle>
  
        <DataTable
          rows={trend}
          columns={[
            {
              key: "date",
              label: "Date",
              render: (r) => formatDate(r.date),
            },
            { key: "moltingCount", label: "Molting" },
            { key: "moltedCount", label: "Molted" },
            {
              key: "moltingRate",
              label: "Rate",
              render: (r) => percent(r.moltingRate),
            },
          ]}
        />
      </div>
    );
  }
  
  function EfficiencyReport({ data }) {
    const counts = [
      ["Total Crabs", data.totalCrabs],
      ["Alive Crabs", data.aliveCrabs],
      ["Molting Crabs", data.moltingCrabs],
      ["Molted Crabs", data.moltedCrabs],
      ["Harvested Crabs", data.harvestedCrabs],
      ["Dead Crabs", data.deadCrabs],
      ["Unclassified Crabs", data.unclassifiedCrabs],
    ];
  
    const rates = [
      ["Survival Rate", data.survivalRate],
      ["Molting Rate", data.moltingRate],
      ["Harvest Rate", data.harvestRate],
      ["Mortality Rate", data.mortalityRate],
      ["Alive Rate", data.aliveRate],
      ["Health Score", data.healthScore],
    ];
  
    return (
      <div className="space-y-5">
        <Stats
          items={[
            {
              title: "Total Crabs",
              value: formatNumber(data.totalCrabs),
            },
            {
              title: "Survival Rate",
              value: percent(data.survivalRate),
            },
            {
              title: "Harvest Rate",
              value: percent(data.harvestRate),
            },
            {
              title: "Health Score",
              value: formatNumber(data.healthScore, 2),
            },
          ]}
        />
  
        <div className="grid gap-5 xl:grid-cols-2">
          <div className={panel}>
            <h2 className="mb-4 text-lg font-semibold">
              Crab Operations
            </h2>
  
            <div className="space-y-3">
              {counts.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-[#24382A] pb-3 text-sm last:border-0"
                >
                  <span className="text-[#91A394]">{label}</span>
                  <strong>{formatNumber(value)}</strong>
                </div>
              ))}
            </div>
          </div>
  
          <div className={panel}>
            <h2 className="mb-4 text-lg font-semibold">
              Efficiency Indicators
            </h2>
  
            <div className="space-y-3">
              {rates.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-[#24382A] pb-3 text-sm last:border-0"
                >
                  <span className="text-[#91A394]">{label}</span>
                  <strong className="text-[#77FF00]">
                    {label === "Health Score"
                      ? formatNumber(value, 2)
                      : percent(value)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  function ReportContent({ tab, data }) {
    if (!data) return null;
  
    switch (tab) {
      case "harvest":
        return <HarvestReport data={data} />;
  
      case "inventory":
        return <InventoryReport data={data} />;
  
      case "survival":
        return <SurvivalReport data={data} />;
  
      case "molting":
        return <MoltingReport data={data} />;
  
      case "efficiency":
        return <EfficiencyReport data={data} />;
  
      default:
        return null;
    }
  }
  
  export default function OperationalReports() {
    const { areas = [], selectedAreaId } = useSelectedArea();
  
    const [tab, setTab] = useState("harvest");
  
    const [filters, setFilters] = useState({
      areaId: selectedAreaId || "",
      fromDate: "",
      toDate: "",
      period: "Day",
      asOfDate: "",
      expiryWarningDays: 30,
    });
  
    const [appliedFilters, setAppliedFilters] = useState(null);
    const [data, setData] = useState(null);
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loadedAt, setLoadedAt] = useState(null);
  
    const requestRef = useRef(0);
  
    useEffect(() => {
      setFilters((current) => ({
        ...current,
        areaId: selectedAreaId || "",
      }));
    }, [selectedAreaId]);
  
    const runReport = useCallback(async (kind, filter) => {
      switch (kind) {
        case "harvest":
          return reportService.getHarvestByPeriod({
            fromDate: filter.fromDate,
            toDate: filter.toDate,
            period: filter.period,
            farmingAreaId: filter.areaId || null,
          });
  
        case "inventory":
          return reportService.getInventoryFiltered({
            asOfDate: filter.asOfDate,
            expiryWarningDays: Number(filter.expiryWarningDays),
          });
  
        case "survival":
          return reportService.getSurvivalRate({
            areaId: filter.areaId || null,
            fromDate: filter.fromDate,
            toDate: filter.toDate,
          });
  
        case "molting":
          return reportService.getMoltingFiltered({
            areaId: filter.areaId || null,
            fromDate: filter.fromDate,
            toDate: filter.toDate,
          });
  
        case "efficiency":
          return reportService.getOperationalEfficiency({
            fromDate: filter.fromDate,
            toDate: filter.toDate,
          });
  
        default:
          throw new Error("Unknown report type.");
      }
    }, []);
  
    const loadReport = useCallback(
      async (kind, filter) => {
        const requestId = ++requestRef.current;
  
        setLoading(true);
        setError("");
        setData(null);
  
        try {
          const result = await runReport(kind, filter);
  
          if (requestId !== requestRef.current) return;
  
          if (
            result === null ||
            typeof result !== "object" ||
            Array.isArray(result)
          ) {
            throw new Error("Backend trả về DTO báo cáo không hợp lệ.");
          }
  
          setData(result);
          setLoadedAt(new Date());
        } catch (err) {
          if (requestId !== requestRef.current) return;
  
          setError(err.message || "Không tải được báo cáo.");
        } finally {
          if (requestId === requestRef.current) {
            setLoading(false);
          }
        }
      },
      [runReport]
    );
  
    // Load initial report; reload when selecting a report type.
    useEffect(() => {
      const filterSnapshot = { ...filters };
      setAppliedFilters(filterSnapshot);
      loadReport(tab, filterSnapshot);
  
      return () => {
        requestRef.current += 1;
      };
      // Filters are deliberately applied by the Apply button.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, loadReport]);
  
    const changeFilter = (name, value) => {
      setFilters((current) => ({
        ...current,
        [name]: value,
      }));
    };
  
    const applyFilters = () => {
      if (
        filters.fromDate &&
        filters.toDate &&
        filters.fromDate > filters.toDate &&
        tab !== "inventory"
      ) {
        setError("From Date không được lớn hơn To Date.");
        return;
      }
  
      const snapshot = { ...filters };
  
      setAppliedFilters(snapshot);
      loadReport(tab, snapshot);
    };
  
    const refresh = () => {
      loadReport(tab, appliedFilters || filters);
    };
  
    const exportJson = () => {
      if (!data) return;
  
      const content = JSON.stringify(
        {
          reportType: tab,
          filters: appliedFilters,
          generatedAt: new Date().toISOString(),
          data,
        },
        null,
        2
      );
  
      const blob = new Blob([content], {
        type: "application/json;charset=utf-8",
      });
  
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
  
      anchor.href = url;
      anchor.download = `crabsense-${tab}-report.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    };
  
    const supportsArea = ["harvest", "survival", "molting"].includes(tab);
    const supportsDateRange = tab !== "inventory";
  
    return (
      <main className="mx-auto max-w-[1600px] space-y-6 text-[#F4F7F4]">
        {/* HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#77FF00]">
              <BarChart3 size={17} />
  
              <span className="text-xs font-bold uppercase tracking-widest">
                Farm Administrator
              </span>
            </div>
  
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Operational Reports
            </h1>
  
            <p className="mt-2 text-sm text-[#91A394]">
              Báo cáo hoạt động trang trại từ CrabSense Backend.
            </p>
          </div>
  
          <div className="flex gap-2">
            <button
              type="button"
              className={button}
              disabled={loading}
              onClick={refresh}
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
  
            <button
              type="button"
              className={button}
              disabled={!data || loading}
              onClick={exportJson}
            >
              <Download size={16} />
              Export JSON
            </button>
          </div>
        </div>
  
        {/* REPORT TABS */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
  
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={
                  "inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm " +
                  (active
                    ? "border-[#77FF00] bg-[#77FF00]/10 text-[#77FF00]"
                    : "border-[#304736] bg-[#0D1510] text-[#B3C0B6] hover:border-[#77FF00]/50")
                }
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
  
        {/* FILTERS */}
        <section className={panel}>
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays size={18} className="text-[#77FF00]" />
  
            <h2 className="font-semibold">
              Report Filters
            </h2>
          </div>
  
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportsArea && (
              <label className="block space-y-2 text-sm">
                <span>Farming Area</span>
  
                <select
                  className={field}
                  value={filters.areaId}
                  onChange={(event) =>
                    changeFilter("areaId", event.target.value)
                  }
                >
                  <option value="">All Areas</option>
  
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.code} — {area.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
  
            {supportsDateRange && (
              <>
                <label className="block space-y-2 text-sm">
                  <span>From Date</span>
  
                  <input
                    type="date"
                    className={field}
                    value={filters.fromDate}
                    onChange={(event) =>
                      changeFilter("fromDate", event.target.value)
                    }
                  />
                </label>
  
                <label className="block space-y-2 text-sm">
                  <span>To Date</span>
  
                  <input
                    type="date"
                    className={field}
                    value={filters.toDate}
                    onChange={(event) =>
                      changeFilter("toDate", event.target.value)
                    }
                  />
                </label>
              </>
            )}
  
            {tab === "harvest" && (
              <label className="block space-y-2 text-sm">
                <span>Period</span>
  
                <select
                  className={field}
                  value={filters.period}
                  onChange={(event) =>
                    changeFilter("period", event.target.value)
                  }
                >
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                </select>
              </label>
            )}
  
            {tab === "inventory" && (
              <>
                <label className="block space-y-2 text-sm">
                  <span>As Of Date</span>
  
                  <input
                    type="date"
                    className={field}
                    value={filters.asOfDate}
                    onChange={(event) =>
                      changeFilter("asOfDate", event.target.value)
                    }
                  />
                </label>
  
                <label className="block space-y-2 text-sm">
                  <span>Expiry Warning Days</span>
  
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={field}
                    value={filters.expiryWarningDays}
                    onChange={(event) =>
                      changeFilter(
                        "expiryWarningDays",
                        event.target.value
                      )
                    }
                  />
                </label>
              </>
            )}
          </div>
  
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#91A394]">
              {supportsArea
                ? "All Areas sẽ không gửi bộ lọc khu vực lên Backend."
                : "Backend hiện không hỗ trợ lọc khu vực cho báo cáo này."}
            </p>
  
            <button
              type="button"
              disabled={loading}
              onClick={applyFilters}
              className="rounded-lg bg-[#77FF00] px-5 py-2 text-sm font-semibold text-[#050806] hover:bg-[#63E600] disabled:opacity-40"
            >
              Apply Filters
            </button>
          </div>
        </section>
  
        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400"
          >
            {error}
          </div>
        )}
  
        {/* CONTENT */}
        {loading ? (
          <section className={panel}>
            <div className="flex items-center gap-3">
              <RefreshCw
                size={18}
                className="animate-spin text-[#77FF00]"
              />
              <span className="text-sm">
                Loading report from Backend...
              </span>
            </div>
          </section>
        ) : data ? (
          <>
            <div className="flex flex-wrap justify-between gap-3">
              <p className="text-xs text-[#91A394]">
                Report:{" "}
                <span className="text-[#77FF00]">
                  {tabs.find((item) => item.id === tab)?.label}
                </span>
              </p>
  
              <p className="text-xs text-[#91A394]">
                Last loaded:{" "}
                {loadedAt ? loadedAt.toLocaleString("vi-VN") : "—"}
              </p>
            </div>
  
            <ReportContent tab={tab} data={data} />
          </>
        ) : !error ? (
          <section className={panel}>
            <p className="text-sm text-[#91A394]">
              Chưa có kết quả báo cáo.
            </p>
          </section>
        ) : null}
      </main>
    );
  }
  