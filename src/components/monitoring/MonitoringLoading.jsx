import { Skeleton } from "@/components/ui/skeleton";

import useTranslation from "@/hooks/useTranslation";

const skeletonClass = "bg-[#1B2A1F]";

function MonitoringLoading() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-label={t("monitoring.loading")}
      aria-busy="true"
      className="w-full min-w-0 space-y-6"
    >
      {/* Monitoring Header */}
      <section className="rounded-2xl border border-[#24382A] bg-[#0D1510] p-6">
        <Skeleton className={`mb-4 h-6 w-36 ${skeletonClass}`} />

        <Skeleton className={`mb-3 h-9 w-full max-w-md ${skeletonClass}`} />

        <Skeleton className={`h-4 w-full max-w-lg ${skeletonClass}`} />
      </section>

      {/* Environment Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-[#24382A] bg-[#0D1510] p-5"
          >
            <Skeleton
              className={`h-12 w-12 shrink-0 rounded-xl ${skeletonClass}`}
            />

            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className={`h-3 w-24 max-w-full ${skeletonClass}`} />

              <Skeleton className={`h-8 w-20 ${skeletonClass}`} />

              <Skeleton className={`h-3 w-32 max-w-full ${skeletonClass}`} />
            </div>
          </div>
        ))}
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#24382A] bg-[#0D1510] p-5"
          >
            <div className="space-y-3">
              <Skeleton className={`h-4 w-20 ${skeletonClass}`} />

              <Skeleton className={`h-8 w-14 ${skeletonClass}`} />
            </div>

            <Skeleton className={`h-11 w-11 rounded-xl ${skeletonClass}`} />
          </div>
        ))}
      </section>

      {/* Box Monitoring Table */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#24382A] bg-[#0D1510] p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className={`h-3 w-24 ${skeletonClass}`} />

            <Skeleton className={`h-6 w-44 ${skeletonClass}`} />
          </div>

          <Skeleton className={`h-10 w-full sm:w-64 ${skeletonClass}`} />
        </div>

        <div className="space-y-4">
          <Skeleton className={`h-10 w-full ${skeletonClass}`} />

          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className={`h-14 w-full ${skeletonClass}`} />
          ))}
        </div>
      </section>

      <span className="sr-only">{t("monitoring.loadingDescription")}</span>
    </div>
  );
}

export default MonitoringLoading;
