import { useEffect, useRef, useState } from "react";

import { AlertTriangle, Wifi, WifiOff, CircleHelp } from "lucide-react";

import { deviceInventory, validCount } from "../../../services/monitoringInventory";

import { Badge } from "@/components/ui/badge";

import { TableCell, TableRow } from "@/components/ui/table";

import useTranslation from "@/hooks/useTranslation";

import { useRevealActive } from "@/components/ui/PageReveal";

import { operationalBoxStatus } from "../../../services/monitoringAssessment";

// ============================================
// BOX MONITORING ROW
// ============================================

function BoxMonitoringRow({
  box,
  rowId,
  index = 0,
  alreadyRevealed = false,
  onRevealed,
}) {
  const { t } = useTranslation();

  const isSectionVisible = useRevealActive();

  const rowRef = useRef(null);

  const [isRowVisible, setIsRowVisible] = useState(alreadyRevealed);

  // ==========================================
  // SCROLL REVEAL
  // ==========================================

  useEffect(() => {
    if (!isSectionVisible || isRowVisible || alreadyRevealed) {
      return;
    }

    const element = rowRef.current;

    if (!element) return;

    const revealRow = () => {
      setIsRowVisible(true);
      onRevealed?.(rowId);
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      revealRow();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealRow();
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -16px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isSectionVisible, isRowVisible, alreadyRevealed, onRevealed, rowId]);

  // ==========================================
  // HEALTH STATUS
  // ==========================================

  const statusKey = operationalBoxStatus(box);
  const statusLabel = t(`monitoring.${statusKey}`);

  // ==========================================
  // DEVICE AND ALERTS
  // ==========================================

  const deviceOnline = deviceInventory(box.devices).isOnline;

  const alertCount = validCount(box.alertCount) ? box.alertCount : null;

  const isVisible = alreadyRevealed || isRowVisible;

  // Short stagger for initially visible rows.
  const rowDelay = Math.min(index, 5) * 45;

  return (
    <TableRow
      ref={rowRef}
      className={[
        "border-[#24382A]/70",
        "hover:bg-white/[0.025]",

        "monitoring-table-row-reveal",
        isVisible ? "is-visible" : "",
      ].join(" ")}
      style={{
        "--row-delay": alreadyRevealed ? "0ms" : `${rowDelay}ms`,

        // Previously revealed rows must remain
        // visible without replaying their animation.
        ...(alreadyRevealed ? { animation: "none", opacity: 1 } : {}),
      }}
    >
      {/* BOX */}
      <TableCell className="px-4 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <strong className="text-sm font-semibold text-[#F4F7F4]">
            {box.code || "—"}
          </strong>

          <span className="text-xs text-[#8C9A90]">
            {box.areaName || box.farmName || "—"}

            {" / "}

            {box.rowName || "—"}
          </span>
        </div>
      </TableCell>

      {/* HEALTH */}
      <TableCell className="px-4 py-4">
        <Badge
          variant="outline"
          className={[
            "w-fit rounded-full px-2.5 py-1",
            "text-[10px] font-semibold",
            "border-white/10 bg-white/5 text-[#8C9A90]",
          ].join(" ")}
        >
          {statusLabel}
        </Badge>
      </TableCell>

      {/* Water is referenced from the area's RAS, not measured per box. */}
      <TableCell className="px-4 py-4 text-xs text-[#8C9A90]">
        Tham chiếu nước chung khu
      </TableCell>

      {/* DEVICE */}
      <TableCell className="px-4 py-4">
        {deviceOnline === true ? (
          <div className="flex items-center gap-2 text-xs font-medium text-[#77FF00]">
            <Wifi size={15} aria-hidden="true" />
            {t("monitoring.online")}
          </div>
        ) : deviceOnline === false ? (
          <div className="flex items-center gap-2 text-xs font-medium text-[#8C9A90]">
            <WifiOff size={15} aria-hidden="true" />
            {t("monitoring.offline")}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#8C9A90]">
            <CircleHelp size={15} aria-hidden="true" />
            {t("monitoring.unknown")}
          </div>
        )}
      </TableCell>

      {/* ALERTS */}
      <TableCell className="px-4 py-4">
        <div
          className={[
            "flex items-center gap-2",
            "text-xs font-semibold",

            alertCount > 0 ? "text-[#FF7777]" : "text-[#8C9A90]",
          ].join(" ")}
        >
          {alertCount > 0 && <AlertTriangle size={15} aria-hidden="true" />}

          <span>{alertCount ?? "—"}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default BoxMonitoringRow;
