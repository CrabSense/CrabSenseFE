import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

import useTranslation from "@/hooks/useTranslation";

// ============================
// FARM MANAGEMENT ERROR
// ============================
function FarmManagementError({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="flex min-h-[300px] items-center justify-center"
    >
      <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/[0.035] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {/* ERROR ICON */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <ShieldAlert
                size={23}
                className="text-red-400"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 space-y-2">
              {/* ERROR CATEGORY */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                {t("farm.errorCategory")}
              </p>

              {/* ERROR TITLE */}
              <h2 className="text-base font-semibold text-[#F4F7F4]">
                {t("farm.unableToLoad")}
              </h2>

              {/* ERROR MESSAGE */}
              <p className="break-words text-xs leading-relaxed text-[#ACB9AE]">
                {message || t("farm.unexpectedError")}
              </p>
            </div>
          </div>

          {/* RETRY BUTTON */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onRetry?.()}
            disabled={typeof onRetry !== "function"}
            className="shrink-0 gap-2 border-red-500/25 bg-red-500/[0.06] text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <RefreshCw size={15} aria-hidden="true" />

            {t("farm.tryAgain")}
          </Button>
        </div>

        {/* ERROR HELP / TROUBLESHOOTING */}
        <Alert className="mt-6 border-[#24382A] bg-[#0D1510] text-[#ACB9AE]">
          <AlertTriangle
            size={15}
            className="text-[#E4B85D]"
            aria-hidden="true"
          />

          <AlertTitle className="text-xs font-semibold text-[#F4F7F4]">
            {t("farm.dataLoadingInterrupted")}
          </AlertTitle>

          <AlertDescription className="text-xs leading-relaxed text-[#8C9A90]">
            {t("farm.connectionHelp")}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default FarmManagementError;
