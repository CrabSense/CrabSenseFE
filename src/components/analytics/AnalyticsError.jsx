import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

import useTranslation from "../../hooks/useTranslation";

function AnalyticsError({ message, onRetry, refreshing = false }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px]">
      <Alert
        variant="destructive"
        className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-[#F4F7F4]"
      >
        <AlertCircle size={20} aria-hidden="true" className="text-[#FF7777]" />

        <AlertTitle className="text-base font-semibold text-[#FFE1E1]">
          {t("analytics.loadError")}
        </AlertTitle>

        <AlertDescription className="mt-2 text-sm leading-relaxed text-[#E0A4A4]">
          {message || t("analytics.unexpectedError")}
        </AlertDescription>

        <div className="col-start-2 mt-4">
          <Button
            type="button"
            onClick={onRetry}
            disabled={refreshing || typeof onRetry !== "function"}
            className="gap-2 bg-[#FF7777] text-[#190909] hover:bg-[#FF9292]"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? t("analytics.retrying") : t("analytics.retry")}
          </Button>
        </div>
      </Alert>
    </div>
  );
}

export default AnalyticsError;
