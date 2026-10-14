import { AlertTriangle, Eraser, LoaderCircle, ShieldAlert } from "lucide-react";

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

function ConfirmActionModal({
  open,
  title,
  itemName,
  itemLabel,
  description,
  warning,
  processing = false,
  error = null,
  confirmDisabled = false,
  confirmLabel,
  processingLabel,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();

  // ============================
  // OPEN / CLOSE HANDLER
  // ============================
  // Prevent closing while an action is processing.
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && !processing) {
      onClose?.();
    }
  };

  // ============================
  // DEFAULT TRANSLATED LABELS
  // ============================
  const displayTitle = title || t("farm.confirmAction");

  const displayItemLabel = itemLabel || t("farm.selectedItem");

  const displayConfirmLabel = confirmLabel || t("farm.confirm");

  const displayProcessingLabel = processingLabel || t("farm.processing");

  return (
    <Dialog open={Boolean(open)} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!processing}
        onEscapeKeyDown={(event) => {
          if (processing) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (processing) {
            event.preventDefault();
          }
        }}
        className={[
          "w-[calc(100%-24px)] max-w-[500px]",
          "max-h-[calc(100dvh-24px)]",
          "overflow-y-auto rounded-2xl",
          "border-[#E4B85D]/20",
          "bg-[#0A110C] p-0",
          "text-[#F4F7F4] shadow-2xl",
        ].join(" ")}
      >
        {/* ============================
            MODAL HEADER
           ============================ */}
        <DialogHeader className="border-b border-[#24382A] px-5 py-4 pr-12 text-left">
          <div className="flex items-center gap-3">
            {/* ACTION ICON */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E4B85D]/20 bg-[#E4B85D]/[0.07]">
              <ShieldAlert
                size={19}
                className="text-[#E4B85D]"
                aria-hidden="true"
              />
            </div>

            {/* ACTION TITLE */}
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#E4B85D]">
                {t("farm.actionCategory")}
              </p>

              <DialogTitle className="text-lg font-semibold text-[#F4F7F4]">
                {displayTitle}
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="sr-only">
            {t("farm.reviewAction")}
          </DialogDescription>
        </DialogHeader>

        {/* ============================
            MODAL BODY
           ============================ */}
        <div className="space-y-4 px-5 py-5">
          {/* ACTION DESCRIPTION */}
          {description && (
            <p className="text-sm leading-relaxed text-[#ACB9AE]">
              {description}
            </p>
          )}

          {/* SELECTED ITEM */}
          {itemName && (
            <div className="rounded-lg border border-[#24382A] bg-[#0D1510] px-3 py-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#738477]">
                {displayItemLabel}
              </span>

              <strong className="mt-1 block break-words text-sm font-semibold text-[#F4F7F4]">
                {itemName}
              </strong>
            </div>
          )}

          {/* WARNING MESSAGE */}
          {warning && (
            <div className="flex items-start gap-3 rounded-lg border border-[#E4B85D]/20 bg-[#E4B85D]/[0.06] p-3">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-[#E4B85D]"
                aria-hidden="true"
              />

              <p className="text-xs leading-relaxed text-[#E4B85D]">
                {warning}
              </p>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <Alert
              variant="destructive"
              role="alert"
              className="border-red-500/20 bg-red-500/[0.06] text-red-300"
            >
              <AlertTriangle size={16} aria-hidden="true" />

              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* ============================
            MODAL FOOTER
           ============================ */}
        <DialogFooter className="flex flex-col-reverse gap-2 border-t border-[#24382A] px-5 py-4 sm:flex-row sm:justify-end">
          {/* CANCEL BUTTON */}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={processing}
            className={[
              "border-[#24382A]",
              "bg-[#0D1510] text-[#ACB9AE]",
              "hover:bg-[#17251B] hover:text-white",
            ].join(" ")}
          >
            {t("farm.cancel")}
          </Button>

          {/* CONFIRM BUTTON */}
          <Button
            type="button"
            onClick={onConfirm}
            disabled={
              processing || confirmDisabled || typeof onConfirm !== "function"
            }
            className={[
              "gap-2 border border-[#E4B85D]/25",
              "bg-[#E4B85D]/10 text-[#E4B85D]",
              "hover:bg-[#E4B85D]/20",
              "disabled:opacity-40",
            ].join(" ")}
          >
            {processing ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Eraser size={15} aria-hidden="true" />
            )}

            {processing ? displayProcessingLabel : displayConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmActionModal;
