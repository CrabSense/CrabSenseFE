import { Skeleton } from "@/components/ui/skeleton";
import useTranslation from "@/hooks/useTranslation";

function DashboardLoading() {
  const { t } = useTranslation();

  return (
    <div
      className="w-full space-y-6"
      role="status"
      aria-label={t("dashboard.loading")}
    >
      {/* Header skeleton */}
      <div className="rounded-2xl border border-[#24382A] bg-[#0D1510] p-6">
        <Skeleton className="mb-4 h-6 w-36 bg-[#1B2A1F]" />
        <Skeleton className="mb-3 h-9 w-56 max-w-full bg-[#1B2A1F]" />
        <Skeleton className="h-4 w-full max-w-md bg-[#1B2A1F]" />
      </div>

      {/* KPI skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#24382A] bg-[#0D1510] p-5"
          >
            <Skeleton className="mb-5 h-11 w-11 rounded-xl bg-[#1B2A1F]" />
            <Skeleton className="mb-3 h-4 w-24 bg-[#1B2A1F]" />
            <Skeleton className="mb-3 h-9 w-20 bg-[#1B2A1F]" />
            <Skeleton className="h-3 w-32 max-w-full bg-[#1B2A1F]" />
          </div>
        ))}
      </div>

      {/* Health skeleton */}
      <div className="grid grid-cols-1 gap-5 min-[1100px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-5 rounded-2xl border border-[#24382A] bg-[#0D1510] p-6">
          <Skeleton className="h-5 w-40 bg-[#1B2A1F]" />
          <Skeleton className="h-16 w-28 bg-[#1B2A1F]" />
          <Skeleton className="h-2 w-full bg-[#1B2A1F]" />
          <Skeleton className="h-4 w-full bg-[#1B2A1F]" />
        </div>

        <div className="space-y-5 rounded-2xl border border-[#24382A] bg-[#0D1510] p-6">
          <Skeleton className="h-5 w-40 bg-[#1B2A1F]" />

          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-28 bg-[#1B2A1F]" />
              <Skeleton className="h-2 w-full bg-[#1B2A1F]" />
            </div>
          ))}
        </div>
      </div>

      {/* Operations skeleton */}
      <div className="grid grid-cols-1 gap-5 min-[1200px]:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="space-y-5 rounded-2xl border border-[#24382A] bg-[#0D1510] p-6"
          >
            <Skeleton className="h-6 w-44 bg-[#1B2A1F]" />

            {Array.from({ length: 3 }).map((_, row) => (
              <Skeleton key={row} className="h-12 w-full bg-[#1B2A1F]" />
            ))}
          </div>
        ))}
      </div>

      <span className="sr-only">{t("dashboard.loadingDescription")}</span>
    </div>
  );
}

export default DashboardLoading;
