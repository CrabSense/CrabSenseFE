
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import HealthProgress from "./HealthProgress";
import useTranslation from "@/hooks/useTranslation";

function HealthBreakdown({
  metrics,
  iotOnlinePercentage,
}) {
  const { t } = useTranslation();

  if (!metrics) return null;

  const healthItems = [
    {
      key: "waterQuality",
      value: metrics.waterQualityScore,
    },
    {
      key: "crabHealth",
      value: metrics.crabHealthScore,
    },
    {
      key: "deviceStatus",
      value: metrics.deviceStatusScore,
    },
    {
      key: "iotOnline",
      value: iotOnlinePercentage,
    },
  ];

  return (
    <Card
      className={[
        "h-full min-w-0 gap-6",
        "rounded-2xl border",
        "border-[#24382A]",
        "bg-[#0D1510]",
        "shadow-none",
      ].join(" ")}
    >
      <CardHeader className="gap-1.5 px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
          {t("dashboard.systemHealthCategory")}
        </p>

        <CardTitle className="text-lg font-semibold tracking-tight text-[#F4F7F4]">
          {t("dashboard.healthBreakdown")}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="flex flex-col gap-6">
          {healthItems.map((item, index) => (
            <HealthProgress
              key={item.key}
              label={t(`dashboard.${item.key}`)}
              value={item.value}
              delay={340 + index * 100}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default HealthBreakdown;
