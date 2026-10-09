import { useCallback, useMemo, useRef, useState } from "react";

import { Inbox } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import MonitoringFilters from "./MonitoringFilters";
import BoxMonitoringRow from "./BoxMonitoringRow";

import useTranslation from "@/hooks/useTranslation";

// ============================================
// HEALTH GROUP HELPER
// ============================================

function getHealthGroup(box) {
  const raw = box.health?.statusLevel ?? box.healthStatus ?? "";

  const level = String(raw).toLowerCase().trim();

  if (["healthy", "good", "excellent"].includes(level)) {
    return "healthy";
  }

  if (["critical", "danger"].includes(level)) {
    return "critical";
  }

  if (level === "warning") {
    return "warning";
  }

  if (level === "offline") {
    return "offline";
  }

  return "unknown";
}

// ============================================
// BOX MONITORING SECTION
// ============================================

function BoxMonitoringSection({ boxes = [] }) {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Store which rows have already appeared.
  // A ref avoids re-rendering the entire table.
  const revealedRowsRef = useRef(new Set());

  const handleRowRevealed = useCallback((rowId) => {
    revealedRowsRef.current.add(rowId);
  }, []);

  // ==========================================
  // FILTER DATA
  // ==========================================

  const safeBoxes = useMemo(() => (Array.isArray(boxes) ? boxes : []), [boxes]);

  const filteredBoxes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return safeBoxes.filter((box) => {
      const healthGroup = getHealthGroup(box);

      const matchesStatus =
        status === "all" ||
        healthGroup === status ||
        (status === "offline" && box.devices?.isOnline === false);

      const matchesSearch =
        !keyword ||
        [box.code, box.name, box.rowName, box.areaName, box.farmName]
          .filter((value) => value != null)
          .some((value) => String(value).toLowerCase().includes(keyword));

      return matchesStatus && matchesSearch;
    });
  }, [safeBoxes, search, status]);

  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns = [
    "columnBox",
    "columnHealth",
    "columnScore",
    "columnWater",
    "columnDevice",
    "columnAlerts",
  ];

  return (
    <Card
      className={[
        "min-w-0 gap-0 overflow-hidden",
        "rounded-2xl border",
        "border-[#24382A]",
        "bg-[#0D1510]",
        "py-0 shadow-none",
      ].join(" ")}
    >
      {/* ======================================
          HEADER AND FILTERS
         ====================================== */}

      <CardHeader className="gap-5 p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
              {t("monitoring.boxStatus")}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg font-semibold text-[#F4F7F4]">
                {t("monitoring.boxMonitoring")}
              </CardTitle>

              <Badge
                variant="outline"
                className="border-[#77FF00]/20 bg-[#77FF00]/10 text-[#77FF00]"
              >
                {filteredBoxes.length} / {safeBoxes.length}
              </Badge>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[#8C9A90]">
              {t("monitoring.boxDescription")}
            </p>
          </div>

          {/* SEARCH AND STATUS FILTER */}
          <MonitoringFilters
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
          />
        </div>
      </CardHeader>

      {/* ======================================
          TABLE
         ====================================== */}

      <CardContent className="px-0 pb-2">
        <div className="w-full min-w-0 overflow-x-auto">
          <Table className="min-w-[850px]">
            {/* TABLE HEADER */}
            <TableHeader>
              <TableRow className="border-[#24382A] bg-[#111C15]/60 hover:bg-[#111C15]/60">
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="h-12 px-4 text-[10px] font-bold uppercase tracking-wider text-[#8C9A90]"
                  >
                    {t(`monitoring.${column}`)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* TABLE BODY */}
            <TableBody>
              {filteredBoxes.length === 0 ? (
                // EMPTY STATE
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Inbox
                        size={28}
                        className="text-[#647466]"
                        aria-hidden="true"
                      />

                      <p className="text-sm text-[#8C9A90]">
                        {safeBoxes.length === 0
                          ? t("monitoring.noBoxes")
                          : t("monitoring.noMatchingBoxes")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // MONITORING ROWS
                filteredBoxes.map((box, index) => {
                  // Use the real box ID whenever available.
                  // Avoid generating random React keys.
                  const rowId = String(box.id ?? box.code ?? index);

                  return (
                    <BoxMonitoringRow
                      key={rowId}
                      rowId={rowId}
                      box={box}
                      index={index}
                      alreadyRevealed={revealedRowsRef.current.has(rowId)}
                      onRevealed={handleRowRevealed}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default BoxMonitoringSection;
