import { useEffect, useState } from "react";
import { MapPin, Save, LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Alert, AlertDescription } from "@/components/ui/alert";

import farmManagementService from "../../../services/farmManagementService";
import useTranslation from "@/hooks/useTranslation";

import AreaForm from "./AreaForm";

// ============================
// DATE HELPERS
// ============================
function getTodayLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

// ============================
// INITIAL FORM STATE
// ============================
function buildInitialForm(area) {
  if (!area) {
    return {
      name: "",
      location: "",
      address: "",
      region: "",
      areaSquareMeters: "",
      establishedAt: getTodayLocalDate(),
      description: "",
    };
  }

  return {
    name: area.name ?? "",
    location: area.location ?? "",
    address: area.address ?? "",
    region: area.region ?? "",
    areaSquareMeters: area.areaSquareMeters ?? "",
    establishedAt: toDateInputValue(area.establishedAt),
    description: area.description ?? "",
  };
}

function normalizeOptional(value) {
  return String(value ?? "").trim() || null;
}

// ============================
// COMPONENT
// ============================
function AreaFormModal({ open, area, onClose, onSuccess }) {
  const { t } = useTranslation();

  const isEdit = Boolean(area);

  const [form, setForm] = useState(() => buildInitialForm(null));

  const [saving, setSaving] = useState(false);

  // Store translation keys for local errors.
  // Keep Backend errors as their original messages.
  const [error, setError] = useState(null);
  const [errorIsKey, setErrorIsKey] = useState(false);

  // ============================
  // RESET FORM ON OPEN
  // ============================
  useEffect(() => {
    if (!open) return;

    setForm(buildInitialForm(area));
    setError(null);
    setErrorIsKey(false);
  }, [open, area]);

  // ============================
  // HANDLE FIELD CHANGE
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
  // BUILD BACKEND PAYLOAD
  // ============================
  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),

      location: normalizeOptional(form.location),

      areaSquareMeters:
        form.areaSquareMeters === "" ? null : Number(form.areaSquareMeters),

      description: normalizeOptional(form.description),

      status: isEdit ? (area?.status ?? null) : null,

      address: normalizeOptional(form.address),

      region: normalizeOptional(form.region),

      establishedAt: form.establishedAt || null,

      avatarUrl: isEdit ? (area?.avatarUrl ?? null) : null,

      latitude: isEdit ? (area?.latitude ?? null) : null,

      longitude: isEdit ? (area?.longitude ?? null) : null,
    };

    if (isEdit) {
      payload.isActive = area?.isActive ?? true;
    }

    return payload;
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
  // SUBMIT CREATE / UPDATE
  // ============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const name = form.name.trim();

    // Validate required name.
    if (!name) {
      setLocalError("farmAreas.nameRequired");
      return;
    }

    // Validate area size.
    const size = Number(form.areaSquareMeters);

    if (form.areaSquareMeters !== "" && (!Number.isFinite(size) || size < 0)) {
      setLocalError("farmAreas.invalidSize");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setErrorIsKey(false);

      const payload = buildPayload();

      // CREATE / UPDATE API
      const result = isEdit
        ? await farmManagementService.updateArea(area.id, payload)
        : await farmManagementService.createArea(payload);

      // Notify parent component.
      await onSuccess?.(result, isEdit ? "update" : "create");

      onClose?.();
    } catch (err) {
      console.error("Area save failed:", err);

      setBackendError(
        err?.message,
        isEdit ? "farmAreas.updateFailed" : "farmAreas.createFailed",
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
          "max-w-[620px] overflow-y-auto",
          "rounded-2xl border-[#77FF00]/20",
          "bg-[#0A110C] p-0",
          "text-[#F4F7F4]",
          "shadow-2xl",
        ].join(" ")}
      >
        {/* ============================
            MODAL HEADER
           ============================ */}
        <DialogHeader className="border-b border-[#24382A] px-5 py-4 pr-12 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#77FF00]/20 bg-[#77FF00]/[0.06]">
              <MapPin size={19} className="text-[#77FF00]" aria-hidden="true" />
            </div>

            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#77FF00]">
                {t("farm.farmingArea")}
              </p>

              <DialogTitle className="text-lg font-semibold text-[#F4F7F4]">
                {isEdit ? t("farmAreas.editArea") : t("farmAreas.createArea")}
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="mt-2 text-xs text-[#8C9A90]">
            {isEdit
              ? t("farmAreas.editDescription")
              : t("farmAreas.createDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* ============================
            CREATE / EDIT FORM
           ============================ */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-5 py-5">
            {/* AREA CODE - EDIT ONLY */}
            {isEdit && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#24382A] bg-[#0D1510] px-3 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C9A90]">
                  {t("farm.areaCode")}
                </span>

                <strong className="text-xs text-[#77FF00]">
                  {area.code || "—"}
                </strong>

                <span className="ml-auto text-[10px] text-[#647466]">
                  {t("farm.systemGenerated")}
                </span>
              </div>
            )}

            {/* AREA INPUT FIELDS */}
            <AreaForm form={form} onChange={handleChange} disabled={saving} />

            {/* ERROR MESSAGE */}
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
              FORM ACTIONS
             ============================ */}
          <DialogFooter className="flex flex-col-reverse gap-2 border-t border-[#24382A] px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="border-[#24382A] bg-[#0D1510] text-[#ACB9AE] hover:bg-[#17251B] hover:text-white"
            >
              {t("farm.cancel")}
            </Button>

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
                  : t("farmAreas.createArea")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AreaFormModal;
