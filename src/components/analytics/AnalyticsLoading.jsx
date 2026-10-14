import { Skeleton } from "@/components/ui/skeleton";
import useTranslation from "../../hooks/useTranslation";

const skeletonColor = "bg-[#1B2A1F]";

function AnalyticsLoading() {
  const { t } = useTranslation();

  return (
    <main
      role="status"
      aria-label={t("analytics.loading")}
      aria-busy="true"
      className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6"
    >
      {/* ANALYTICS HEADER */}
      <section className="rounded-2xl border border-[#24382A] bg-[#0D1510] p-6">
        <Skeleton className={`mb-4 h-6 w-36 ${skeletonColor}`} />

        <Skeleton className={`mb-3 h-9 w-full max-w-md ${skeletonColor}`} />

        <Skeleton className={`h-4 w-full max-w-lg ${skeletonColor}`} />
      </section>

      {/* DATE FILTER */}
      <section className="flex flex-col gap-3 sm:flex-row">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="w-full rounded-xl border border-[#24382A] bg-[#0D1510] p-4 sm:w-44"
          >
            <Skeleton className={`mb-3 h-3 w-16 ${skeletonColor}`} />

            <Skeleton className={`h-10 w-full ${skeletonColor}`} />
          </div>
        ))}
      </section>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[180px] flex-col justify-between rounded-2xl border border-[#24382A] bg-[#0D1510] p-5"
          >
            <Skeleton className={`h-11 w-11 rounded-xl ${skeletonColor}`} />

            <div className="space-y-3">
              <Skeleton className={`h-3 w-28 ${skeletonColor}`} />

              <Skeleton className={`h-8 w-24 ${skeletonColor}`} />

              <Skeleton className={`h-3 w-36 max-w-full ${skeletonColor}`} />
            </div>
          </div>
        ))}
      </section>

      {/* ANALYTICS PANELS */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="min-w-0 rounded-2xl border border-[#24382A] bg-[#0D1510] p-6"
          >
            <div className="mb-7 space-y-3">
              <Skeleton className={`h-3 w-20 ${skeletonColor}`} />

              <Skeleton className={`h-6 w-44 ${skeletonColor}`} />

              <Skeleton className={`h-3 w-56 max-w-full ${skeletonColor}`} />
            </div>

            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, row) => (
                <div key={row} className="space-y-2">
                  <Skeleton className={`h-3 w-28 ${skeletonColor}`} />

                  <Skeleton className={`h-3 w-full ${skeletonColor}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <span className="sr-only">{t("analytics.loadingDescription")}</span>
    </main>
  );
}

export default AnalyticsLoading;
