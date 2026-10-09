import { useCallback, useState } from "react";

import { Plus, RotateCcw, Grid3X3, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import useSelectedArea from "../../../hooks/useSelectedArea";
import useTranslation from "@/hooks/useTranslation";

import farmManagementService from "../../../services/farmManagementService";

import { formatFarmMessage } from "@/utils/farmTranslations";

import RowCard from "./RowCard";
import RowFormModal from "./RowFormModal";
import ConfirmActionModal from "../common/ConfirmActionModal";

function RowList({
  rows = [],
  selectedRowId,
  onSelectRow,
  onRowsChanged,
  onRowSaved,
  onRowDeactivated,
}) {
  const { t } = useTranslation();

  const { selectedAreaId, selectedArea } = useSelectedArea();

  // ============================
  // CREATE / EDIT STATE
  // ============================
  const [modalOpen, setModalOpen] = useState(false);

  const [editingRow, setEditingRow] = useState(null);

  // ============================
  // DEACTIVATE STATE
  // ============================
  const [deactivatingRow, setDeactivatingRow] = useState(null);

  const [deactivating, setDeactivating] = useState(false);

  // ============================
  // ERROR STATE
  // ============================
  const [deactivateError, setDeactivateError] = useState(null);

  // ============================
  // DERIVED VALUES
  // ============================
  const canCreate = Boolean(selectedAreaId);

  const safeRows = Array.isArray(rows) ? rows : [];

  // Translate local error keys dynamically.
  // Backend errors remain unchanged.
  const displayDeactivateError = deactivateError
    ? deactivateError.key
      ? formatFarmMessage(t(deactivateError.key), deactivateError.values ?? {})
      : deactivateError.message
    : null;

  // ============================
  // ERROR HELPERS
  // ============================
  const setLocalDeactivateError = (key, values = {}) => {
    setDeactivateError({
      key,
      values,
    });
  };

  const setBackendDeactivateError = (message, fallbackKey) => {
    if (message) {
      setDeactivateError({
        message,
      });
    } else {
      setLocalDeactivateError(fallbackKey);
    }
  };

  // ============================
  // CREATE ROW
  // ============================
  const handleCreate = () => {
    if (!canCreate) return;

    setEditingRow(null);
    setModalOpen(true);
  };

  // ============================
  // EDIT ROW
  // ============================
  const handleEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  // ============================
  // CLOSE CREATE / EDIT
  // ============================
  const handleClose = useCallback(() => {
    setModalOpen(false);
    setEditingRow(null);
  }, []);

  // ============================
  // REQUEST DEACTIVATE
  // ============================
  const handleDeactivateRequest = (row) => {
    setDeactivatingRow(row);

    if ((row.crabCount ?? 0) > 0 || (row.occupiedBoxCount ?? 0) > 0) {
      setLocalDeactivateError("farmRows.containsCrabs");
    } else {
      setDeactivateError(null);
    }
  };

  // ============================
  // CLOSE DEACTIVATE MODAL
  // ============================
  const handleDeactivateClose = useCallback(() => {
    if (deactivating) return;

    setDeactivatingRow(null);
    setDeactivateError(null);
  }, [deactivating]);

  // ============================
  // CONFIRM DEACTIVATE
  // ============================
  const handleDeactivateConfirm = async () => {
    const row = deactivatingRow;

    if (!row?.id || deactivating || deactivateError) {
      return;
    }

    try {
      setDeactivating(true);
      setDeactivateError(null);

      // Defensive check against invalid local state.
      if ((row.crabCount ?? 0) > 0 || (row.occupiedBoxCount ?? 0) > 0) {
        setLocalDeactivateError("farmRows.containsCrabs");
        return;
      }

      // IMPORTANT:
      // Keep the original API signature.
      // The service receives the entire row object.
      await farmManagementService.deactivateRow(row);

      // Remove row from the active list immediately.
      onRowDeactivated?.(row.id);

      // Clear selection if this row was selected.
      if (selectedRowId === row.id) {
        onSelectRow?.(null);
      }

      setDeactivatingRow(null);

      try {
        await onRowsChanged?.();
      } catch (error) {
        console.error("Row refresh failed:", error);
      }
    } catch (error) {
      console.error("Deactivate row failed:", error);

      setBackendDeactivateError(error?.message, "farmRows.deactivateFailed");
    } finally {
      setDeactivating(false);
    }
  };

  // ============================
  // CREATE / UPDATE SUCCESS
  // ============================
  const handleSuccess = async (savedRow, mode) => {
    if (savedRow?.id) {
      onRowSaved?.(savedRow);
    }

    if (mode === "create" && savedRow?.id) {
      onSelectRow?.(savedRow.id);
    }

    try {
      await onRowsChanged?.();
    } catch (error) {
      console.error("Row refresh failed:", error);
    }
  };

  return (
    <>
      {/* ============================
          FARMING ROW SECTION
         ============================ */}
      <section aria-label={t("farmRows.category")} className="mb-6 min-w-0">
        {/* ============================
            SECTION HEADER
           ============================ */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
              {t("farmRows.category")}
            </p>

            <h2 className="text-xl font-semibold tracking-tight text-[#F4F7F4]">
              {t("farmRows.structure")}
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-[#8C9A90]">
              {selectedArea
                ? formatFarmMessage(t("farmRows.manageInArea"), {
                    area: selectedArea.name,
                  })
                : t("farmRows.selectAreaFirst")}
            </p>
          </div>

          {/* ============================
              HEADER ACTIONS
             ============================ */}
          <div className="flex flex-wrap items-center gap-2">
            {/* CLEAR SELECTED ROW */}
            {selectedRowId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onSelectRow?.(null)}
                className="gap-2 border-[#24382A] bg-[#0D1510] text-[#ACB9AE] hover:bg-[#17251B] hover:text-[#F4F7F4]"
              >
                <RotateCcw size={14} aria-hidden="true" />

                {t("farmRows.clearRow")}
              </Button>
            )}

            {/* CREATE ROW */}
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate}
              title={
                canCreate
                  ? t("farmRows.createRow")
                  : t("farmBoxes.selectRowFirst").replace(
                      t("farm.farmingRow"),
                      t("farm.farmingArea"),
                    )
              }
              className="gap-2 bg-[#77FF00] font-semibold text-[#050806] hover:bg-[#63E600] disabled:opacity-40"
            >
              <Plus size={15} aria-hidden="true" />

              {t("farmRows.newRow")}
            </Button>
          </div>
        </div>

        {/* ============================
            NO SELECTED AREA
           ============================ */}
        {!selectedAreaId ? (
          <Card className="border-dashed border-[#77FF00]/15 bg-[#77FF00]/[0.015] shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <Grid3X3
                size={25}
                className="mb-4 text-[#77FF00]"
                aria-hidden="true"
              />

              <h3 className="text-sm font-semibold text-[#DCE7DE]">
                {t("farmRows.selectArea")}
              </h3>

              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8C9A90]">
                {t("farmRows.selectAreaDescription")}
              </p>
            </CardContent>
          </Card>
        ) : safeRows.length === 0 ? (
          /* ============================
              EMPTY ROW STATE
             ============================ */
          <Card className="border-dashed border-[#24382A] bg-[#0D1510] shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <Grid3X3
                size={25}
                className="mb-4 text-[#77FF00]"
                aria-hidden="true"
              />

              <h3 className="text-sm font-semibold text-[#F4F7F4]">
                {t("farmRows.emptyTitle")}
              </h3>

              <p className="mt-2 text-xs text-[#8C9A90]">
                {t("farmRows.emptyDescription")}
              </p>

              <Button
                type="button"
                onClick={handleCreate}
                className="mt-5 gap-2 bg-[#77FF00] text-[#050806] hover:bg-[#63E600]"
              >
                <Plus size={15} aria-hidden="true" />

                {t("farmRows.createFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ============================
              ROW CARDS
             ============================ */

          <div
            className={[
              "grid min-w-0 grid-cols-1 gap-3",
              "min-[651px]:grid-cols-2",
              "min-[1151px]:grid-cols-4",
            ].join(" ")}
          >
            {safeRows.map((row, index) => (
              <RowCard
                key={row.id}
                index={index}
                row={row}
                selected={row.id === selectedRowId}
                onSelect={onSelectRow}
                onEdit={handleEdit}
                onDeactivate={handleDeactivateRequest}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============================
          CREATE / EDIT ROW MODAL
         ============================ */}
      <RowFormModal
        open={modalOpen}
        row={editingRow}
        farmingAreaId={selectedAreaId}
        areaName={selectedArea?.name}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      {/* ============================
          DEACTIVATE ROW MODAL
         ============================ */}
      <ConfirmActionModal
        open={Boolean(deactivatingRow)}
        title={t("farmRows.deactivateTitle")}
        itemName={deactivatingRow?.code}
        itemLabel={t("farm.selectedRowLabel")}
        description={t("farmRows.deactivateDescription")}
        warning={t("farmRows.deactivateWarning")}
        processing={deactivating}
        error={displayDeactivateError}
        confirmDisabled={Boolean(deactivateError)}
        confirmLabel={t("farmRows.deactivateTitle")}
        processingLabel={t("farm.deactivating")}
        onClose={handleDeactivateClose}
        onConfirm={handleDeactivateConfirm}
      />
    </>
  );
}

export default RowList;
