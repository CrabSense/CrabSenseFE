import { useEffect, useState } from "react";

import { Grid3X3, Save, LoaderCircle } from "lucide-react";

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

import useTranslation from "@/hooks/useTranslation";

import farmManagementService from "@/services/farmManagementService";

import { formatFarmMessage } from "@/utils/farmTranslations";

import RowForm from "./RowForm";

// ============================
// DEFAULT FORM
// ============================
const emptyForm = {
  name: "",
  location: "",
  capacity: "0",
  sortOrder: "0",
  description: "",
};

// ============================
// INITIAL FORM
// ============================
function buildInitialForm(row) {
  if (!row) {
    return { ...emptyForm };
  }

  return {
    name: row.name ?? "",
    location: row.location ?? "",
    capacity: String(row.capacity ?? 0),
    sortOrder: String(row.sortOrder ?? 0),
    description: row.description ?? "",
  };
}

// ============================
// OPTIONAL STRING HELPER
// ============================
function normalizeOptional(value) {
  return String(value ?? "").trim() || null;
}

// ============================
// ROW FORM MODAL
// ============================
function RowFormModal({
  open,
  row,
  farmingAreaId,
  areaName,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();

  const isEdit = Boolean(row);

  // ============================
  // FORM STATE
  // ============================
  const [form, setForm] = useState(() => buildInitialForm(null));

  const [saving, setSaving] = useState(false);

  // Local errors use translation keys.
  // Backend errors remain unchanged.
  const [error, setError] = useState(null);
  const [errorIsKey, setErrorIsKey] = useState(false);

  const [errorValues, setErrorValues] = useState({});

  // ============================
  // RESET FORM WHEN OPENING
  // ============================
  useEffect(() => {
    if (!open) return;

    setForm(buildInitialForm(row));
    setError(null);
    setErrorIsKey(false);
    setErrorValues({});
  }, [open, row]);

  // ============================
  // HANDLE FORM CHANGE
  // ============================
  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
    setErrorIsKey(false);
    setErrorValues({});
  };

  // ============================
  // ERROR HELPERS
  // ============================
  const setLocalError = (key, values = {}) => {
    setError(key);
    setErrorIsKey(true);
    setErrorValues(values);
  };

  const setBackendError = (message, fallbackKey) => {
    if (message) {
      setError(message);
      setErrorIsKey(false);
      setErrorValues({});
    } else {
      setLocalError(fallbackKey);
    }
  };

  const displayError =
    errorIsKey && error ? formatFarmMessage(t(error), errorValues) : error;

  // ============================
  // HANDLE MODAL CLOSE
  // ============================
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && !saving) {
      onClose?.();
    }
  };

  // ============================
  // VALIDATE FORM
  // ============================
  const validateForm = () => {
    const name = String(form.name ?? "").trim();

    // Required row name.
    if (!name) {
      setLocalError("farmRows.nameRequired");
      return false;
    }

    // A new row needs a farming area.
    if (!isEdit && !farmingAreaId) {
      setLocalError("farmRows.areaRequired");
      return false;
    }

    const capacityRaw = String(form.capacity ?? "").trim();

    const capacity = Number(capacityRaw);

    // Capacity must be a whole,
    // non-negative integer.
    if (capacityRaw === "" || !Number.isSafeInteger(capacity) || capacity < 0) {
      setLocalError("farmRows.invalidCapacity");
      return false;
    }

    const sortOrderRaw = String(form.sortOrder ?? "").trim();

    const sortOrder = Number(sortOrderRaw);

    // Sort order must be a whole,
    // non-negative integer.
    if (
      sortOrderRaw === "" ||
      !Number.isSafeInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setLocalError("farmRows.invalidSortOrder");
      return false;
    }

    // ============================
    // EXISTING BOX CAPACITY RULE
    // ============================
    // Capacity = 0 means unlimited.
    // For a limited capacity, do not allow
    // fewer slots than existing boxes.
    if (isEdit && capacity !== 0) {
      const existingBoxes = Number(row.boxCount ?? 0);

      if (capacity < existingBoxes) {
        setLocalError("farmRows.capacityBelowBoxes", { count: existingBoxes });
        return false;
      }
    }

    return true;
  };

  // ============================
  // BUILD BACKEND PAYLOAD
  // ============================
  const buildPayload = () => ({
    name: String(form.name).trim(),

    location: normalizeOptional(form.location),

    capacity: Number(form.capacity),

    sortOrder: Number(form.sortOrder),

    description: normalizeOptional(form.description),
  });

  // ============================
  // CREATE / UPDATE ROW
  // ============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setErrorIsKey(false);
      setErrorValues({});

      const payload = buildPayload();

      let savedRow;

      if (isEdit) {
        // ============================
        // UPDATE EXISTING ROW
        // ============================
        savedRow = await farmManagementService.updateRow(row.id, payload);
      } else {
        // ============================
        // CREATE NEW ROW
        // ============================
        savedRow = await farmManagementService.createRow(
          farmingAreaId,
          payload,
        );
      }

      // Notify parent and refresh data.
      await onSuccess?.(savedRow, isEdit ? "update" : "create");

      onClose?.();
    } catch (err) {
      console.error("Save farming row failed:", err);

      setBackendError(
        err?.message,
        isEdit ? "farmRows.updateFailed" : "farmRows.createFailed",
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
          "max-w-[580px]",
          "overflow-y-auto rounded-2xl",
          "border-[#77FF00]/20",
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
              <Grid3X3
                size={19}
                className="text-[#77FF00]"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#77FF00]">
                {t("farm.farmingRow")}
              </p>

              <DialogTitle className="text-lg font-semibold text-[#F4F7F4]">
                {isEdit ? t("farmRows.editRow") : t("farmRows.createRow")}
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="mt-2 text-xs text-[#8C9A90]">
            {isEdit
              ? t("farmRows.editDescription")
              : t("farmRows.createDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* ============================
            CREATE / EDIT ROW FORM
           ============================ */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-5 py-5">
            {/* ============================
                PARENT FARMING AREA
               ============================ */}
            {areaName && (
              <div className="rounded-lg border border-[#24382A] bg-[#0D1510] px-3 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#738477]">
                  {t("farm.farmingArea")}
                </span>

                <strong className="mt-1 block truncate text-xs font-semibold text-[#DCE7DE]">
                  {areaName}
                </strong>
              </div>
            )}

            {/* ============================
                ROW CODE - EDIT ONLY
               ============================ */}
            {isEdit && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#24382A] bg-[#0D1510] px-3 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#738477]">
                  {t("farm.rowCode")}
                </span>

                <strong className="text-xs text-[#77FF00]">
                  {row.code || "—"}
                </strong>
              </div>
            )}

            {/* ============================
                INPUT FIELDS
               ============================ */}
            <RowForm form={form} onChange={handleChange} disabled={saving} />

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

            {/* CREATE / SAVE */}
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
                  : t("farmRows.createRow")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RowFormModal;
