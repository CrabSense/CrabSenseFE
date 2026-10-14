import { LoaderCircle, Sprout } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import useTranslation from "@/hooks/useTranslation";

// ============================
// FARM MANAGEMENT LOADING
// ============================
function FarmManagementLoading() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("farm.loadingManagement")}
      className="min-h-[450px] space-y-6"
    >
      {/* ============================
          LOADING HEADER
         ============================ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32 bg-[#17251B]" />
          <Skeleton className="h-7 w-56 bg-[#17251B]" />
          <Skeleton className="h-3 w-72 max-w-full bg-[#17251B]" />
        </div>

        <Skeleton className="h-10 w-28 rounded-lg bg-[#17251B]" />
      </div>

      {/* ============================
          SUMMARY SKELETON
         ============================ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card
            key={item}
            className="gap-3 border-[#24382A] bg-[#0D1510] shadow-none"
          >
            <CardContent className="space-y-4">
              <Skeleton className="h-3 w-24 bg-[#17251B]" />
              <Skeleton className="h-8 w-20 bg-[#17251B]" />
              <Skeleton className="h-3 w-32 max-w-full bg-[#17251B]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ============================
          FARMING AREA SKELETON
         ============================ */}
      <Card className="border-[#24382A] bg-[#0D1510] shadow-none">
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-[#17251B]" />
              <Skeleton className="h-6 w-44 bg-[#17251B]" />
            </div>

            <Skeleton className="h-9 w-28 rounded-lg bg-[#17251B]" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-40 rounded-xl bg-[#17251B]" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ============================
          LOADING INDICATOR
         ============================ */}
      <div className="flex flex-col items-center justify-center gap-3 py-5">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#77FF00]/20 bg-[#77FF00]/[0.05]">
          <Sprout size={21} className="text-[#77FF00]" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-2">
          <LoaderCircle
            size={15}
            className="animate-spin text-[#77FF00]"
            aria-hidden="true"
          />

          <p className="text-xs font-medium text-[#8C9A90]">
            {t("farm.loadingStructure")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FarmManagementLoading;
