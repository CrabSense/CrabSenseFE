import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Activity, Clock3 } from "lucide-react";

import useTranslation from "@/hooks/useTranslation";

import { useRevealActive } from "@/components/ui/PageReveal";

// ============================================
// FORMAT ACTIVITY TIME
// ============================================

function formatActivityTime(timestamp, language, unavailableText) {
  if (!timestamp) return unavailableText;

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return unavailableText;
  }

  return date.toLocaleString(language === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ============================================
// RECENT ACTIVITY COMPONENT
// ============================================

function RecentActivity({ activities = [] }) {
  const { t, language } = useTranslation();

  const isRevealActive = useRevealActive();

  const safeActivities = Array.isArray(activities) ? activities : [];

  return (
    <Card
      className={[
        "h-full min-w-0 gap-0",
        "rounded-2xl border",
        "border-[#24382A]",
        "bg-[#0D1510]",
        "py-0 shadow-none",
      ].join(" ")}
    >
      {/* ======================================
          HEADER
         ====================================== */}

      <CardHeader className="flex flex-row items-center justify-between gap-4 p-6">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
            {t("dashboard.activityCategory")}
          </p>

          <CardTitle className="text-lg font-semibold tracking-tight text-[#F4F7F4]">
            {t("dashboard.recentActivity")}
          </CardTitle>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#77FF00]/15 bg-[#77FF00]/10">
          <Activity size={18} className="text-[#77FF00]" aria-hidden="true" />
        </div>
      </CardHeader>

      {/* ======================================
          CONTENT
         ====================================== */}

      <CardContent className="px-6 pb-6">
        {/* EMPTY STATE */}
        {safeActivities.length === 0 ? (
          <div
            className={[
              isRevealActive ? "operation-item-reveal" : "",
              "flex min-h-40 flex-col items-center justify-center gap-3 text-center",
            ].join(" ")}
          >
            <Activity size={27} className="text-[#647466]" aria-hidden="true" />

            <p className="text-sm text-[#8C9A90]">
              {t("dashboard.noRecentActivity")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {safeActivities.map((activity, index) => {
              const itemDelay = 180 + Math.min(index, 8) * 75;

              return (
                <div
                  key={activity.id ?? index}
                  className={[
                    isRevealActive ? "operation-item-reveal" : "",
                    "flex min-w-0 gap-4",
                  ].join(" ")}
                  style={{
                    animationDelay: `${itemDelay}ms`,
                  }}
                >
                  {/* TIMELINE */}
                  <div className="flex w-3 shrink-0 flex-col items-center">
                    <span
                      className={[
                        "mt-1.5 h-2.5 w-2.5 shrink-0",
                        "rounded-full bg-[#77FF00]",
                        "shadow-[0_0_8px_#77FF0060]",
                      ].join(" ")}
                    />

                    {index < safeActivities.length - 1 && (
                      <span className="my-1 min-h-5 w-px flex-1 bg-[#24382A]" />
                    )}
                  </div>

                  {/* ACTIVITY INFORMATION */}
                  <div
                    className={[
                      "min-w-0 flex-1",
                      index < safeActivities.length - 1 ? "pb-6" : "pb-0",
                    ].join(" ")}
                  >
                    <strong className="block break-words text-sm font-semibold text-[#F4F7F4]">
                      {activity.title}
                    </strong>

                    {activity.description && (
                      <p className="mt-1 break-words text-xs leading-relaxed text-[#8C9A90]">
                        {activity.description}
                      </p>
                    )}

                    <time
                      dateTime={
                        activity.timestamp
                          ? String(activity.timestamp)
                          : undefined
                      }
                      className="mt-2 flex items-center gap-1.5 text-[11px] text-[#647466]"
                    >
                      <Clock3 size={12} aria-hidden="true" />

                      {formatActivityTime(
                        activity.timestamp,
                        language,
                        t("dashboard.timeUnavailable"),
                      )}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;
