import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import useTranslation from "@/hooks/useTranslation";

function DashboardError({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <Alert
      variant="destructive"
      className={[
        "rounded-2xl border",
        "border-red-500/20",
        "bg-red-500/5",
        "p-5 text-[#F4F7F4]",
      ].join(" ")}
    >
      <AlertCircle size={20} className="text-[#FF7777]" aria-hidden="true" />

      <AlertTitle className="text-base font-semibold text-[#FFE1E1]">
        {t("dashboard.loadError")}
      </AlertTitle>

      <AlertDescription className="mt-2 text-sm leading-relaxed text-[#E0A4A4]">
        {message || t("dashboard.unexpectedError")}
      </AlertDescription>

      <div className="col-start-2 mt-4">
        <Button
          type="button"
          onClick={onRetry}
          disabled={typeof onRetry !== "function"}
          className={[
            "gap-2 bg-[#FF7777]",
            "text-[#190909]",
            "hover:bg-[#FF9292]",
          ].join(" ")}
        >
          <RefreshCw size={16} aria-hidden="true" />

          {t("dashboard.retry")}
        </Button>
      </div>
    </Alert>
  );
}

export default DashboardError;
