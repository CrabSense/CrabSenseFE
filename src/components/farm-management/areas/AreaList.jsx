import { useCallback, useState } from "react";

import { Plus, RotateCcw, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import useSelectedArea from "@/hooks/useSelectedArea";
import useTranslation from "@/hooks/useTranslation";

import farmManagementService from "@/services/farmManagementService";

import { formatFarmMessage } from "@/utils/farmTranslations";

import AreaCard from "./AreaCard";
import AreaFormModal from "./AreaFormModal";
import ConfirmActionModal from "../common/ConfirmActionModal";

function AreaList({ areas = [], onAreasChanged, onAreaDeactivated }) {
  const { t } = useTranslation();

  const { selectedAreaId, setSelectedAreaId, reloadAreas } = useSelectedArea();

  // ============================
  // CREATE / EDIT STATE
  // ============================
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  // ============================
  // DEACTIVATE STATE
  // ============================
  const [deactivatingArea, setDeactivatingArea] = useState(null);

  const [checkingArea, setCheckingArea] = useState(false);

  const [deactivating, setDeactivating] = useState(false);

  // Store translation keys for local validation,
  // and preserve raw Backend error messages.
  const [deactivateError, setDeactivateError] = useState(null);

  const [deactivateErrorIsKey, setDeactivateErrorIsKey] = useState(false);

  const [validatedAreaId, setValidatedAreaId] = useState(null);

  // ============================
  // ERROR HELPERS
  // ============================
  const setLocalDeactivateError = (key, values = {}) => {
    setDeactivateError({
      key,
      values,
    });
    setDeactivateErrorIsKey(true);
  };

  const setBackendDeactivateError = (message, fallbackKey) => {
    if (message) {
      setDeactivateError(message);
      setDeactivateErrorIsKey(false);
    } else {
      setLocalDeactivateError(fallbackKey);
    }
  };

  const displayDeactivateError =
    deactivateErrorIsKey && deactivateError
      ? formatFarmMessage(t(deactivateError.key), deactivateError.values)
      : deactivateError;

  // ============================
  // CREATE AREA
  // ============================
  const handleCreate = () => {
    setEditingArea(null);
    setModalOpen(true);
  };

  // ============================
  // EDIT AREA
  // ============================
  const handleEdit = (area) => {
    setEditingArea(area);
    setModalOpen(true);
  };

  // ============================
  // CLOSE CREATE / EDIT MODAL
  // ============================
  const handleClose = useCallback(() => {
    setModalOpen(false);
    setEditingArea(null);
  }, []);

  // ============================
  // REQUEST DEACTIVATION
  // ============================
  const handleDeactivateRequest = async (area) => {
    if (checkingArea || deactivating) return;

    setDeactivatingArea(area);
    setDeactivateError(null);
    setDeactivateErrorIsKey(false);
    setValidatedAreaId(null);
    setCheckingArea(true);

    try {
      // Area cannot be deactivated while crabs
      // or occupied boxes still exist.
      if ((area.crabCount ?? 0) > 0 || (area.occupiedBoxCount ?? 0) > 0) {
        setLocalDeactivateError("farmAreas.containsCrabs");
        return;
      }

      // All active rows must be deactivated first.
      const activeRows = await farmManagementService.getRows(area.id);

      if (activeRows.length > 0) {
        setLocalDeactivateError("farmAreas.activeRowsRemain", {
          count: activeRows.length,
        });
        return;
      }

      setValidatedAreaId(area.id);
    } catch (error) {
      console.error("Verify farming area failed:", error);

      setBackendDeactivateError(error?.message, "farmAreas.verifyFailed");
    } finally {
      setCheckingArea(false);
    }
  };

  // ============================
  // CLOSE DEACTIVATE MODAL
  // ============================
  const handleDeactivateClose = useCallback(() => {
    if (deactivating || checkingArea) return;

    setDeactivatingArea(null);
    setDeactivateError(null);
    setDeactivateErrorIsKey(false);
    setValidatedAreaId(null);
  }, [deactivating, checkingArea]);

  // ============================
  // CONFIRM DEACTIVATION
  // ============================
  const handleDeactivateConfirm = async () => {
    const area = deactivatingArea;

    if (
      !area?.id ||
      checkingArea ||
      deactivating ||
      deactivateError ||
      validatedAreaId !== area.id
    ) {
      return;
    }

    try {
      setDeactivating(true);
      setDeactivateError(null);
      setDeactivateErrorIsKey(false);

      // Verify active rows again before deactivation.
      const activeRows = await farmManagementService.getRows(area.id);

      if (activeRows.length > 0) {
        setLocalDeactivateError("farmAreas.activeRowsRemain", {
          count: activeRows.length,
        });
        setValidatedAreaId(null);
        return;
      }

      // Backend must also enforce the farming rules.
      await farmManagementService.deactivateArea(area);

      // Inform parent to remove deactivated area.
      onAreaDeactivated?.(area.id);

      // Clear selected area if necessary.
      if (selectedAreaId === area.id) {
        setSelectedAreaId(null);
      }

      // Close confirmation modal.
      setDeactivatingArea(null);
      setValidatedAreaId(null);

      // Refresh global area selector.
      try {
        await reloadAreas?.();
      } catch (error) {
        console.error("Area selector refresh failed:", error);
      }

      // Refresh farm management data.
      try {
        await onAreasChanged?.();
      } catch (error) {
        console.error("Farm data refresh failed:", error);
      }
    } catch (error) {
      console.error("Deactivate area failed:", error);

      setBackendDeactivateError(error?.message, "farmAreas.deactivateFailed");

      setValidatedAreaId(null);
    } finally {
      setDeactivating(false);
    }
  };

  // ============================
  // CREATE / UPDATE SUCCESS
  // ============================
  const handleSuccess = async (savedArea, mode) => {
    await reloadAreas?.();

    await onAreasChanged?.();

    if (mode === "create" && savedArea?.id) {
      setSelectedAreaId(savedArea.id);
    }
  };

  const safeAreas = Array.isArray(areas) ? areas : [];

  return (
    <>
      {/* ============================
          FARMING AREA SECTION
         ============================ */}
      <section aria-label={t("farmAreas.category")} className="mb-6 min-w-0">
        {/* ============================
            HEADER
           ============================ */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#77FF00]">
              {t("farmAreas.category")}
            </p>

            <h2 className="text-xl font-semibold tracking-tight text-[#F4F7F4]">
              {t("farmAreas.overview")}
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-[#8C9A90]">
              {t("farmAreas.overviewDescription")}
            </p>
          </div>

          {/* ============================
              HEADER ACTIONS
             ============================ */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedAreaId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAreaId(null)}
                className="gap-2 border-[#24382A] bg-[#0D1510] text-[#ACB9AE] hover:bg-[#17251B] hover:text-[#F4F7F4]"
              >
                <RotateCcw size={14} aria-hidden="true" />

                {t("farmAreas.viewAll")}
              </Button>
            )}

            <Button
              type="button"
              onClick={handleCreate}
              className="gap-2 bg-[#77FF00] font-semibold text-[#050806] hover:bg-[#63E600]"
            >
              <Plus size={15} aria-hidden="true" />

              {t("farmAreas.newArea")}
            </Button>
          </div>
        </div>

        {/* ============================
            EMPTY STATE
           ============================ */}
        {safeAreas.length === 0 ? (
          <Card className="border-dashed border-[#24382A] bg-[#0D1510] shadow-none">
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#77FF00]/20 bg-[#77FF00]/[0.06]">
                <MapPinned
                  size={22}
                  aria-hidden="true"
                  className="text-[#77FF00]"
                />
              </div>

              <h3 className="text-sm font-semibold text-[#F4F7F4]">
                {t("farmAreas.emptyTitle")}
              </h3>

              <p className="mt-2 max-w-sm text-xs text-[#8C9A90]">
                {t("farmAreas.emptyDescription")}
              </p>

              <Button
                type="button"
                onClick={handleCreate}
                className="mt-5 gap-2 bg-[#77FF00] text-[#050806] hover:bg-[#63E600]"
              >
                <Plus size={15} aria-hidden="true" />

                {t("farmAreas.createFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ============================
              ACTIVE AREA CARDS
             ============================ */

          <div
            className={[
              "grid min-w-0 grid-cols-1 gap-3",
              "min-[651px]:grid-cols-2",
              "min-[1151px]:grid-cols-3",
            ].join(" ")}
          >
            {safeAreas.map((area, index) => (
              <AreaCard
                key={area.id}
                index={index}
                area={area}
                selected={area.id === selectedAreaId}
                onSelect={setSelectedAreaId}
                onEdit={handleEdit}
                onDeactivate={handleDeactivateRequest}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============================
          CREATE / EDIT AREA MODAL
         ============================ */}
      <AreaFormModal
        open={modalOpen}
        area={editingArea}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      {/* ============================
          DEACTIVATE AREA MODAL
         ============================ */}
      <ConfirmActionModal
        open={Boolean(deactivatingArea)}
        title={t("farmAreas.deactivateTitle")}
        itemName={deactivatingArea?.code}
        itemLabel={t("farm.selectedAreaLabel")}
        description={t("farmAreas.deactivateDescription")}
        warning={t("farmAreas.deactivateWarning")}
        processing={checkingArea || deactivating}
        error={displayDeactivateError}
        confirmDisabled={
          checkingArea ||
          deactivating ||
          Boolean(deactivateError) ||
          validatedAreaId !== deactivatingArea?.id
        }
        confirmLabel={t("farmAreas.deactivateTitle")}
        processingLabel={
          checkingArea ? t("farm.checking") : t("farm.deactivating")
        }
        onClose={handleDeactivateClose}
        onConfirm={handleDeactivateConfirm}
      />
    </>
  );
}

export default AreaList;
