import { useEffect, useState } from "react";

import { Box, Save, LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { BOX_STATUS } from "@/constants/boxStatuses";

import farmManagementService from "@/services/farmManagementService";

import useTranslation from "@/hooks/useTranslation";

import BoxForm from "./BoxForm";

// ============================
// DEFAULT BOX FORM
// ============================
const emptyForm = {
  code: "",
  status: BOX_STATUS.EMPTY,
  isOccupied: false,
};

// ============================
// INITIAL FORM VALUES
// ============================
function buildInitialForm(box) {
  if (!box) {
    return { ...emptyForm };
  }

  return {
    code: box.code ?? "",
    status: box.status ?? BOX_STATUS.EMPTY,
    isOccupied: Boolean(box.isOccupied),
  };
}

function BoxFormModal({
  open,
  box,
  farmingRowId,
  rowName,
  areaName,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();

  const isEdit = Boolean(box);

  // ============================
  // FORM STATE
  // ============================
  const [form, setForm] = useState(() => ({
    ...emptyForm,
  }));

  const [saving, setSaving] = useState(false);

  // Local validation errors use translation keys.
  // Backend errors keep their original messages.
  const [error, setError] = useState(null);
  const [errorIsKey, setErrorIsKey] = useState(false);

  // ============================
  // RESET FORM ON OPEN
  // ============================
  useEffect(() => {
    if (!open) return;

    setForm(buildInitialForm(box));
    setError(null);
    setErrorIsKey(false);
  }, [open, box]);

  // ============================
  // HANDLE FORM CHANGES
  // ============================
  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
    setErrorIsKey(false);
  };

  // ============================
  // HANDLE DIALOG CLOSE
  // ============================
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && !saving) {
      onClose?.();
    }
  };

  // ============================
  // ERROR HELPERS
  // ============================
  const setLocalError = (key) => {
    setError(key);
    setErrorIsKey(true);
  };

  const setBackendError = (message, fallbackKey) => {
    if (message) {
      setError(message);
      setErrorIsKey(false);
    } else {
      setLocalError(fallbackKey);
    }
  };

  const displayError = errorIsKey && error ? t(error) : error;

  // ============================
  // CREATE / EDIT BOX
  // ============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    // Creating a box requires a selected row.
    if (!isEdit && !farmingRowId) {
      setLocalError("farmBoxes.rowRequired");
      return;
    }

    // Editing an existing box requires a code.
    if (isEdit && !form.code.trim()) {
      setLocalError("farmBoxes.codeRequired");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setErrorIsKey(false);

      let savedBox;

      if (isEdit) {
        // ============================
        // EDIT EXISTING BOX
        // ============================
        const nextCode = form.code.trim();

        const codeChanged = nextCode !== (box.code ?? "");

        const statusChanged = form.status !== box.status;

        const isOccupied = Boolean(box.isOccupied);

        savedBox = box;

        // Update the code only when changed.
        // PUT /boxes/{id}
        if (codeChanged) {
          savedBox = await farmManagementService.updateBox(box.id, {
            code: nextCode,
            status: box.status,
            isOccupied,
          });
        }

        // Only unoccupied boxes may have
        // their status changed manually.
        if (!isOccupied && statusChanged) {
          savedBox = await farmManagementService.updateBoxStatus(box.id, {
            status: form.status,
            isOccupied: false,
          });
        }
      } else {
        // ============================
        // CREATE NEW BOX
        // ============================
        // Backend automatically generates
        // a new box code.
        savedBox = await farmManagementService.createBox(farmingRowId);
      }

      // Notify parent component.
      await onSuccess?.(savedBox, isEdit ? "update" : "create");

      // Close after successful operation.
      onClose?.();
    } catch (err) {
      console.error("Box save failed:", err);

      setBackendError(
        err?.message,
        isEdit ? "farmBoxes.updateFailed" : "farmBoxes.createFailed",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!saving}
        onEscapeKeyDown={(event) => {
          if (saving) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (saving) {
            event.preventDefault();
          }
        }}
        className={[
          "max-h-[calc(100dvh-24px)]",
          "w-[calc(100%-24px)]",
          "max-w-[520px] overflow-y-auto",
          "rounded-2xl border-[#77FF00]/20",
          "bg-[#0A110C] p-0",
          "text-[#F4F7F4] shadow-2xl",
        ].join(" ")}
      >
        {/* ============================
            MODAL HEADER
           ============================ */}
        <DialogHeader className="border-b border-[#24382A] px-5 py-4 pr-12 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#77FF00]/20 bg-[#77FF00]/[0.06]">
              <Box size={19} className="text-[#77FF00]" aria-hidden="true" />
            </div>

            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#77FF00]">
                {t("farm.farmBox")}
              </p>

              <DialogTitle className="text-lg font-semibold text-[#F4F7F4]">
                {isEdit ? t("farmBoxes.editBox") : t("farmBoxes.createBox")}
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="mt-2 text-xs text-[#8C9A90]">
            {isEdit
              ? t("farmBoxes.editDescription")
              : t("farmBoxes.createDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* ============================
            CREATE / EDIT FORM
           ============================ */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-5 py-5">
            {/* ============================
                SELECTED FARM STRUCTURE
               ============================ */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* FARMING AREA */}
              <div className="min-w-0 rounded-lg border border-[#24382A] bg-[#0D1510] px-3 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#738477]">
                  {t("farm.farmingArea")}
                </span>

                <strong className="mt-1 block truncate text-xs text-[#DCE7DE]">
                  {areaName || t("farm.selectedArea")}
                </strong>
              </div>

              {/* FARMING ROW */}
              <div className="min-w-0 rounded-lg border border-[#24382A] bg-[#0D1510] px-3 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#738477]">
                  {t("farm.farmingRow")}
                </span>

                <strong className="mt-1 block truncate text-xs text-[#DCE7DE]">
                  {rowName || t("farm.selectedRow")}
                </strong>
              </div>
            </div>

            {/* ============================
                NEW BOX INFORMATION
               ============================ */}
            {!isEdit && (
              <>
                {/* AUTO-GENERATED BOX CODE */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#77FF00]/15 bg-[#77FF00]/[0.035] px-3 py-3">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#738477]">
                      {t("farm.boxCode")}
                    </span>

                    <strong className="mt-1 block text-xs text-[#77FF00]">
                      {t("farm.autoGenerated")}
                    </strong>
                  </div>

                  <span className="text-[10px] text-[#738477]">
                    BOX-0001, BOX-0002, ...
                  </span>
                </div>

                {/* CREATE BOX NOTICE */}
                <div className="rounded-lg border border-dashed border-[#77FF00]/15 bg-[#77FF00]/[0.025] p-4">
                  <p className="text-xs leading-relaxed text-[#ACB9AE]">
                    {t("farmBoxes.createNotice")}
                  </p>
                </div>
              </>
            )}

            {/* ============================
                EDIT BOX FORM
               ============================ */}
            {isEdit && (
              <BoxForm
                form={form}
                onChange={handleChange}
                disabled={saving}
                isOccupied={Boolean(box?.isOccupied)}
              />
            )}

            {/* ============================
                ERROR MESSAGE
               ============================ */}
            {displayError && (
              <Alert
                variant="destructive"
                role="alert"
                className="border-red-500/20 bg-red-500/[0.06] text-red-300"
              >
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* ============================
              MODAL FOOTER
             ============================ */}
          <DialogFooter className="flex flex-col-reverse gap-2 border-t border-[#24382A] px-5 py-4 sm:flex-row sm:justify-end">
            {/* CANCEL */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="border-[#24382A] bg-[#0D1510] text-[#ACB9AE] hover:bg-[#17251B] hover:text-white"
            >
              {t("farm.cancel")}
            </Button>

            {/* SAVE / CREATE */}
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 bg-[#77FF00] font-semibold text-[#050806] hover:bg-[#63E600]"
            >
              {saving ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save size={15} aria-hidden="true" />
              )}

              {saving
                ? t("farm.saving")
                : isEdit
                  ? t("farm.saveChanges")
                  : t("farmBoxes.createBox")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BoxFormModal;
