import { useCallback, useMemo, useRef, useState } from "react";

import { useRevealActive } from "@/components/ui/PageReveal";

import { Plus, Search, Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import useSelectedArea from "@/hooks/useSelectedArea";
import useTranslation from "@/hooks/useTranslation";

import farmManagementService from "@/services/farmManagementService";

import { BOX_STATUS } from "@/constants/boxStatuses";

import { formatFarmMessage } from "@/utils/farmTranslations";

import BoxRow, { boxHasCrab } from "./BoxRow";
import BoxFormModal from "./BoxFormModal";
import ConfirmActionModal from "../common/ConfirmActionModal";

function BoxTable({
  boxes = [],
  rows = [],
  selectedRowId,
  onBoxesChanged,
  onBoxSaved,
}) {
  const { t } = useTranslation();
  const { selectedArea } = useSelectedArea();

  const isRevealActive = useRevealActive();

  // Track rows already mounted once.
  // This survives search/filter changes.
  const seenBoxIdsRef = useRef(new Set());

  // Avoid replaying animation after user interaction.
  const hasInteractedRef = useRef(false);

  const handleRowSeen = useCallback((boxId) => {
    seenBoxIdsRef.current.add(boxId);
  }, []);

  // ============================
  // SEARCH STATE
  // ============================
  const [search, setSearch] = useState("");

  // ============================
  // CREATE / EDIT STATE
  // ============================
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const [modalRow, setModalRow] = useState(null);

  // ============================
  // CLEAR BOX STATE
  // ============================
  const [clearingBox, setClearingBox] = useState(null);
  const [clearing, setClearing] = useState(false);

  // Store local error keys separately from
  // raw Backend error messages.
  const [clearError, setClearError] = useState(null);
  const [clearErrorIsKey, setClearErrorIsKey] = useState(false);

  // ============================
  // SAFE DATA
  // ============================
  const safeBoxes = Array.isArray(boxes) ? boxes : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  const selectedRow = safeRows.find((row) => row.id === selectedRowId) ?? null;

  // ============================
  // CHECK ROW CAPACITY
  // ============================
  const canCreate =
    Boolean(selectedRow) &&
    (Number(selectedRow.capacity) === 0 ||
      (Number(selectedRow.boxCount) || 0) < Number(selectedRow.capacity));

  // ============================
  // FILTER BOXES
  // ============================
  const filteredBoxes = useMemo(() => {
    const rowBoxes = selectedRowId
      ? safeBoxes.filter((box) => box.farmingRowId === selectedRowId)
      : [];

    const term = search.trim().toLowerCase();

    if (!term) return rowBoxes;

    return rowBoxes.filter((box) =>
      [box.code, box.crabTag, box.status].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [safeBoxes, selectedRowId, search]);

  // ============================
  // TRANSLATED TABLE HEADERS
  // ============================
  const tableColumns = [
    {
      key: "box",
      label: t("farmBoxes.boxColumn"),
    },
    {
      key: "row",
      label: t("farmBoxes.rowColumn"),
    },
    {
      key: "status",
      label: t("farm.status"),
    },
    {
      key: "crabs",
      label: t("farm.crabs"),
    },
    {
      key: "crabTag",
      label: t("farmBoxes.crabTag"),
    },
    {
      key: "actions",
      label: t("farm.actions"),
    },
  ];

  // ============================
  // ERROR HELPERS
  // ============================
  const setLocalClearError = (key) => {
    setClearError(key);
    setClearErrorIsKey(true);
  };

  const setBackendClearError = (message, fallbackKey) => {
    if (message) {
      setClearError(message);
      setClearErrorIsKey(false);
    } else {
      setLocalClearError(fallbackKey);
    }
  };

  const displayClearError =
    clearErrorIsKey && clearError ? t(clearError) : clearError;

  // ============================
  // CREATE BOX
  // ============================
  const handleCreate = () => {
    if (!canCreate) return;

    setEditingBox(null);
    setModalRow(selectedRow);
    setModalOpen(true);
  };

  // ============================
  // EDIT BOX
  // ============================
  const handleEdit = (box) => {
    const parentRow =
      safeRows.find((row) => row.id === box.farmingRowId) ?? selectedRow;

    setEditingBox(box);
    setModalRow(parentRow);
    setModalOpen(true);
  };

  // ============================
  // CLOSE CREATE / EDIT MODAL
  // ============================
  const handleClose = useCallback(() => {
    setModalOpen(false);
    setEditingBox(null);
    setModalRow(null);
  }, []);

  // ============================
  // HANDLE SAVE SUCCESS
  // ============================
  const handleSuccess = async (savedBox) => {
    if (savedBox?.id) {
      onBoxSaved?.(savedBox);
    }

    try {
      await onBoxesChanged?.();
    } catch (error) {
      console.error("Box refresh failed:", error);
    }
  };

  // ============================
  // REQUEST CLEAR BOX
  // ============================
  const handleClearRequest = (box) => {
    setClearingBox(box);

    setClearError(null);
    setClearErrorIsKey(false);

    if (boxHasCrab(box)) {
      setLocalClearError("farmBoxes.containsCrab");
    }
  };

  // ============================
  // CLOSE CLEAR MODAL
  // ============================
  const handleClearClose = useCallback(() => {
    if (clearing) return;

    setClearingBox(null);
    setClearError(null);
    setClearErrorIsKey(false);
  }, [clearing]);

  // ============================
  // CONFIRM CLEAR BOX
  // ============================
  const handleClearConfirm = async () => {
    if (!clearingBox?.id || clearing || clearError) {
      return;
    }

    // Box must not contain a crab.
    if (boxHasCrab(clearingBox)) {
      setLocalClearError("farmBoxes.containsCrab");
      return;
    }

    const status = String(clearingBox.status ?? "").toLowerCase();

    // An empty box cannot be cleared again.
    if (status === "empty") {
      setLocalClearError("farmBoxes.alreadyEmpty");
      return;
    }

    try {
      setClearing(true);
      setClearError(null);
      setClearErrorIsKey(false);

      // Reset box status to Empty.
      // Keep Backend status values unchanged.
      const savedBox = await farmManagementService.updateBoxStatus(
        clearingBox.id,
        {
          status: BOX_STATUS.EMPTY,
          isOccupied: false,
        },
      );

      // Update local box data if available.
      if (savedBox?.id) {
        onBoxSaved?.(savedBox);
      }

      setClearingBox(null);

      // Refresh box inventory.
      try {
        await onBoxesChanged?.();
      } catch (refreshError) {
        console.error("Refresh after clearing box failed:", refreshError);
      }
    } catch (error) {
      console.error("Clear box failed:", error);

      setBackendClearError(error?.message, "farmBoxes.clearFailed");
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      {/* ============================
          BOX INVENTORY SECTION
         ============================ */}
      <section
        aria-label={t("farmBoxes.inventoryAria")}
        className="mb-6 min-w-0"
      >
        {/* HEADER */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
              {t("farmBoxes.category")}
            </p>

            <h2 className="text-xl font-semibold tracking-tight text-[#F4F7F4]">
              {t("farmBoxes.inventory")}
            </h2>

            <p className="mt-2 text-xs text-[#8C9A90]">
              {selectedRow
                ? formatFarmMessage(t("farmBoxes.boxesInside"), {
                    row: selectedRow.name,
                  })
                : t("farmBoxes.selectRowBeforeCreate")}
            </p>
          </div>

          {/* SEARCH & CREATE */}
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            {/* SEARCH INPUT */}
            <div className="relative min-w-0 flex-1 sm:min-w-[230px]">
              <Search
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#738477]"
              />

              <Input
                type="search"
                aria-label={t("farmBoxes.search")}
                value={search}
                onChange={(event) => {
                  hasInteractedRef.current = true;
                  setSearch(event.target.value);
                }}
                placeholder={t("farmBoxes.searchPlaceholder")}
                className={[
                  "h-10 w-full pl-9",
                  "border-[#24382A] bg-[#0D1510]",
                  "text-[#DCE4DE]",
                  "placeholder:text-[#647466]",
                  "focus-visible:border-[#77FF00]/40",
                  "focus-visible:ring-[#77FF00]/15",
                ].join(" ")}
              />
            </div>

            {/* CREATE BOX BUTTON */}
            <Button
              type="button"
              disabled={!canCreate}
              onClick={handleCreate}
              title={
                !selectedRow
                  ? t("farmBoxes.selectRowFirst")
                  : !canCreate
                    ? t("farmBoxes.capacityReached")
                    : t("farmBoxes.createBox")
              }
              className="h-10 gap-2 bg-[#77FF00] font-semibold text-[#050806] hover:bg-[#63E600] disabled:opacity-40"
            >
              <Plus size={15} aria-hidden="true" />

              {t("farmBoxes.newBox")}
            </Button>
          </div>
        </div>

        {/* ============================
            NO SELECTED ROW
           ============================ */}
        {!selectedRowId ? (
          <Card className="border-dashed border-[#77FF00]/15 bg-[#77FF00]/[0.015] shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <Boxes
                size={25}
                aria-hidden="true"
                className="mb-4 text-[#77FF00]"
              />

              <h3 className="text-sm font-semibold text-[#DCE7DE]">
                {t("farmBoxes.selectRow")}
              </h3>

              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8C9A90]">
                {t("farmBoxes.selectRowDescription")}
              </p>
            </CardContent>
          </Card>
        ) : filteredBoxes.length === 0 ? (
          /* ============================
              EMPTY / NO SEARCH RESULTS
             ============================ */
          <Card className="border-dashed border-[#24382A] bg-[#0D1510] shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <Boxes
                size={25}
                aria-hidden="true"
                className="mb-4 text-[#77FF00]"
              />

              <h3 className="text-sm font-semibold text-[#F4F7F4]">
                {search.trim()
                  ? t("farmBoxes.noSearchResults")
                  : t("farmBoxes.emptyTitle")}
              </h3>

              <p className="mt-2 text-xs text-[#8C9A90]">
                {search.trim()
                  ? t("farmBoxes.searchSuggestion")
                  : t("farmBoxes.emptyDescription")}
              </p>

              {!search.trim() && (
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className="mt-5 gap-2 bg-[#77FF00] text-[#050806] hover:bg-[#63E600]"
                >
                  <Plus size={15} aria-hidden="true" />

                  {t("farmBoxes.createFirst")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          /* ============================
              BOX INVENTORY TABLE
             ============================ */
          <Card className="min-w-0 gap-0 overflow-hidden border-[#24382A] bg-[#0D1510] py-0 shadow-none">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow className="border-[#24382A] hover:bg-transparent">
                    {tableColumns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={[
                          "h-11 text-[10px]",
                          "font-bold uppercase tracking-wider",
                          "text-[#738477]",
                          column.key === "actions" ? "text-right" : "",
                        ].join(" ")}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBoxes.map((box, index) => {
                    const boxId = String(box.id);

                    const animateEntrance =
                      isRevealActive &&
                      !hasInteractedRef.current &&
                      !seenBoxIdsRef.current.has(boxId);

                    return (
                      <BoxRow
                        key={box.id}
                        box={box}
                        index={index}
                        animateEntrance={animateEntrance}
                        onRowSeen={handleRowSeen}
                        onEdit={handleEdit}
                        onClear={handleClearRequest}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </section>

      {/* ============================
          CREATE / EDIT BOX MODAL
         ============================ */}
      <BoxFormModal
        open={modalOpen}
        box={editingBox}
        farmingRowId={modalRow?.id}
        rowName={modalRow?.name}
        areaName={selectedArea?.name}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      {/* ============================
          CONFIRM CLEAR BOX MODAL
         ============================ */}
      <ConfirmActionModal
        open={Boolean(clearingBox)}
        title={t("farmBoxes.clearBox")}
        itemName={clearingBox?.code}
        itemLabel={t("farm.selectedBoxLabel")}
        description={t("farmBoxes.clearDescription")}
        warning={t("farmBoxes.clearWarning")}
        processing={clearing}
        error={displayClearError}
        confirmDisabled={
          Boolean(clearError) || (clearingBox ? boxHasCrab(clearingBox) : true)
        }
        confirmLabel={t("farmBoxes.clearBox")}
        processingLabel={t("farm.clearing")}
        onClose={handleClearClose}
        onConfirm={handleClearConfirm}
      />
    </>
  );
}

export default BoxTable;
