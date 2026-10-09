import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { CheckCircle2, Circle, ClipboardList } from "lucide-react";

import useTranslation from "@/hooks/useTranslation";

import { useRevealActive } from "@/components/ui/PageReveal";

// ============================================
// PRIORITY STYLES
// ============================================

const priorityStyles = {
  high: "border-red-500/20 bg-red-500/10 text-[#FF7777]",
  medium: "border-amber-500/20 bg-amber-500/10 text-[#FBBF24]",
  low: "border-[#77FF00]/20 bg-[#77FF00]/10 text-[#77FF00]",
};

const priorityTranslationKeys = {
  high: "priorityHigh",
  medium: "priorityMedium",
  low: "priorityLow",
};

// ============================================
// TODAY'S TASKS
// ============================================

function TodayTasks({ tasks = [] }) {
  const { t } = useTranslation();

  const isRevealActive = useRevealActive();

  const safeTasks = Array.isArray(tasks) ? tasks : [];

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
            {t("dashboard.operationsCategory")}
          </p>

          <CardTitle className="text-lg font-semibold tracking-tight text-[#F4F7F4]">
            {t("dashboard.todaysTasks")}
          </CardTitle>
        </div>

        <Badge
          variant="outline"
          className={[
            "min-w-8 justify-center",
            "rounded-lg px-2.5 py-1",
            "border-[#77FF00]/15",
            "bg-[#77FF00]/10",
            "text-xs font-bold text-[#77FF00]",
          ].join(" ")}
        >
          {safeTasks.length}
        </Badge>
      </CardHeader>

      {/* ======================================
          CONTENT
         ====================================== */}

      <CardContent className="px-6 pb-6">
        {/* EMPTY STATE */}
        {safeTasks.length === 0 ? (
          <div
            className={[
              isRevealActive ? "operation-item-reveal" : "",
              "flex min-h-40 flex-col items-center justify-center gap-3 text-center",
            ].join(" ")}
          >
            <ClipboardList
              size={27}
              className="text-[#647466]"
              aria-hidden="true"
            />

            <p className="text-sm text-[#8C9A90]">{t("dashboard.noTasks")}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {safeTasks.map((task, index) => {
              const priority = String(task.priority ?? "")
                .trim()
                .toLowerCase();

              const priorityClass =
                priorityStyles[priority] ??
                "border-white/10 bg-white/5 text-[#8C9A90]";

              const priorityKey = priorityTranslationKeys[priority];

              const priorityLabel = priorityKey
                ? t(`dashboard.${priorityKey}`)
                : task.priority;

              const itemDelay = 120 + Math.min(index, 8) * 75;

              return (
                <div
                  key={task.id ?? index}
                  className={[
                    isRevealActive ? "operation-item-reveal" : "",
                    "flex min-w-0 items-start gap-3",
                    "py-4 first:pt-0 last:pb-0",
                  ].join(" ")}
                  style={{
                    animationDelay: `${itemDelay}ms`,
                  }}
                >
                  {/* COMPLETION ICON */}
                  <div className="mt-0.5 shrink-0">
                    {task.isCompleted ? (
                      <CheckCircle2
                        size={19}
                        className="text-[#77FF00]"
                        aria-label={t("dashboard.completed")}
                      />
                    ) : (
                      <Circle
                        size={19}
                        className="text-[#77FF00]"
                        aria-label={t("dashboard.pending")}
                      />
                    )}
                  </div>

                  {/* TASK INFORMATION */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <strong
                      className={[
                        "break-words text-sm font-semibold",
                        task.isCompleted ? "text-[#8C9A90]" : "text-[#F4F7F4]",
                      ].join(" ")}
                    >
                      {task.title}
                    </strong>

                    {task.target && (
                      <span className="break-words text-xs text-[#8C9A90]">
                        {task.target}
                      </span>
                    )}
                  </div>

                  {/* PRIORITY BADGE */}
                  {task.priority && (
                    <Badge
                      variant="outline"
                      className={[
                        "shrink-0 rounded-md px-2 py-1",
                        "text-[10px] font-semibold uppercase",
                        priorityClass,
                      ].join(" ")}
                    >
                      {priorityLabel}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TodayTasks;
