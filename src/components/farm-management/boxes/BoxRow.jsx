import { useEffect, useRef } from "react";

import { AlertTriangle, Circle, Eraser, Pencil } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import useTranslation from "@/hooks/useTranslation";
import { translateFarmStatus } from "@/utils/farmTranslations";

const statusStyles = {
  empty: "text-[#8C9A90] border-[#8C9A90]/20 bg-[#8C9A90]/[0.06]",
  active: "text-[#77FF00] border-[#77FF00]/20 bg-[#77FF00]/[0.06]",
  occupied: "text-[#77FF00] border-[#77FF00]/20 bg-[#77FF00]/[0.06]",
  molting: "text-[#8EE7FF] border-[#8EE7FF]/20 bg-[#8EE7FF]/[0.06]",
  quarantine: "text-[#FF7B7B] border-[#FF7B7B]/20 bg-[#FF7B7B]/[0.06]",
  maintenance: "text-[#A8A8A8] border-[#A8A8A8]/20 bg-[#A8A8A8]/[0.06]",
  harvested: "text-[#BD9CFF] border-[#BD9CFF]/20 bg-[#BD9CFF]/[0.06]",
  watch: "text-[#E4B85D] border-[#E4B85D]/20 bg-[#E4B85D]/[0.06]",
};

// Keep exported: BoxTable uses this business rule.
export function boxHasCrab(box) {
  return (
    Boolean(box.isOccupied) ||
    (Number(box.crabCount) || 0) > 0 ||
    Boolean(box.crabId)
  );
}

function BoxRow({
  box,
  onEdit,
  onClear,
  index = 0,
  animateEntrance = false,
  onRowSeen,
}) {
  const { t } = useTranslation();

  // Preserve the initial animation decision
  // across API refresh and React re-renders.
  const animateOnMountRef = useRef(animateEntrance);
  const animateOnMount = animateOnMountRef.current;

  // Remember this row even if search hides it later.
  useEffect(() => {
    if (box.id != null) {
      onRowSeen?.(String(box.id));
    }
  }, [box.id, onRowSeen]);

  const status = String(box.status ?? "empty")
    .trim()
    .toLowerCase();

  const hasCrab = boxHasCrab(box);
  const cannotClear = hasCrab || status === "empty";

  const statusStyle = statusStyles[status] ?? statusStyles.empty;

  const translatedStatus = translateFarmStatus(status, t, "box");

  const clearTooltip = hasCrab
    ? t("farmBoxes.containsCrab")
    : status === "empty"
      ? t("farmBoxes.alreadyEmpty")
      : t("farmBoxes.clearBox");

  const rowDelay = Math.min(index, 5) * 45;

  return (
    <TableRow
      className={[
        "border-[#24382A]",
        "hover:bg-white/[0.025]",
        animateOnMount ? "farm-box-row-reveal" : "",
      ].join(" ")}
      style={
        animateOnMount ? { "--box-row-delay": `${rowDelay}ms` } : undefined
      }
    >
      {/* BOX CODE AND NAME */}
      <TableCell className="py-3">
        <div className="min-w-[125px]">
          <strong className="block text-xs font-semibold text-[#F4F7F4]">
            {box.code || "—"}
          </strong>

          <span className="mt-1 block max-w-[180px] truncate text-[11px] text-[#738477]">
            {box.displayName || box.rowName || t("farm.farmBoxFallback")}
          </span>
        </div>
      </TableCell>

      {/* FARMING ROW */}
      <TableCell className="text-xs text-[#ACB9AE]">
        {box.rowCode || box.rowName || "—"}
      </TableCell>

      {/* BOX STATUS */}
      <TableCell>
        <Badge
          variant="outline"
          className={[
            "w-fit gap-1.5 rounded-full",
            "px-2 py-1 text-[10px]",
            "font-medium",
            statusStyle,
          ].join(" ")}
        >
          <Circle size={7} fill="currentColor" aria-hidden="true" />

          {translatedStatus}
        </Badge>
      </TableCell>

      {/* CRAB COUNT */}
      <TableCell className="text-xs tabular-nums text-[#DCE7DE]">
        {box.crabCount ?? 0}
      </TableCell>

      {/* CRAB TAG */}
      <TableCell className="text-xs text-[#ACB9AE]">
        {box.crabTag || "—"}
      </TableCell>

      {/* ACTIONS */}
      <TableCell>
        <div className="flex items-center justify-end gap-1.5">
          {(box.alertCount ?? 0) > 0 && (
            <Badge
              variant="outline"
              className="gap-1 border-red-500/20 bg-red-500/[0.06] text-red-300"
            >
              <AlertTriangle size={12} aria-hidden="true" />

              {box.alertCount}
            </Badge>
          )}

          {/* EDIT BOX */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(box)}
            className="h-8 gap-1 px-2 text-xs text-[#ACB9AE] hover:bg-[#77FF00]/10 hover:text-[#77FF00]"
          >
            <Pencil size={13} aria-hidden="true" />

            {t("farm.edit")}
          </Button>

          {/* CLEAR BOX */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onClear?.(box)}
            disabled={cannotClear}
            title={clearTooltip}
            className="h-8 gap-1 px-2 text-xs text-[#E4B85D] hover:bg-[#E4B85D]/10 hover:text-[#F3CB7B] disabled:opacity-30"
          >
            <Eraser size={13} aria-hidden="true" />

            {t("farm.clear")}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default BoxRow;
