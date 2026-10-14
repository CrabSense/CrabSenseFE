import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Archive, AlertTriangle, RefreshCw, FolderArchive } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Alert, AlertDescription } from "@/components/ui/alert";

import farmManagementService from "../../../services/farmManagementService";
import useSelectedArea from "../../../hooks/useSelectedArea";
import useTranslation from "@/hooks/useTranslation";

import ConfirmActionModal from "../common/ConfirmActionModal";
import ArchivedRowCard from "./ArchivedRowCard";

function ArchivedRowList({ activeAreas = [], onRowsChanged, refreshKey = 0 }) {
  const { t } = useTranslation();

  const { selectedAreaId } = useSelectedArea();

  // ============================
  // ARCHIVED ROWS STATE
  // ============================
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const seenRowIdsRef = useRef(new Set());

  useEffect(() => {
    if (loading) return;

    rows.forEach((row) => {
      if (row.id != null) {
        seenRowIdsRef.current.add(String(row.id));
      }
    });
  }, [rows, loading]);

  // ============================
  // REACTIVATION STATE
  // ============================
  const [reactivatingRow, setReactivatingRow] = useState(null);

  const [reactivating, setReactivating] = useState(false);

  const [reactivateError, setReactivateError] = useState(null);

  // ============================
  // ACTIVE AREA IDS
  // ============================
  const activeAreaIds = useMemo(
    () =>
      new Set(
        (Array.isArray(activeAreas) ? activeAreas : []).map((area) => area.id),
      ),
    [activeAreas],
  );

  // ============================
  // LOAD ARCHIVED ROWS
  // ============================
  // Store translation-independent error keys
  // so changing language does not trigger
  // unnecessary API requests.
  const [loadErrorKey, setLoadErrorKey] = useState(null);

  const loadArchivedRows = useCallback(
    async (isCurrent = () => true) => {
      try {
        if (isCurrent()) {
          setLoading(true);
          setError(null);
          setLoadErrorKey(null);
        }

        const result = await farmManagementService.getInactiveRows(
          selectedAreaId || null,
        );

        if (!isCurrent()) return;

        setRows(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!isCurrent()) return;

        console.error("Load archived rows failed:", err);

        if (err?.message) {
          setError(err.message);
        } else {
          setLoadErrorKey("farmRows.archivedLoadFailed");
        }
      } finally {
        if (isCurrent()) {
          setLoading(false);
        }
      }
    },
    [selectedAreaId],
  );

  // ============================
  // INITIAL LOAD / REFRESH
  // ============================
  useEffect(() => {
    let active = true;

    loadArchivedRows(() => active);

    return () => {
      active = false;
    };
  }, [loadArchivedRows, refreshKey]);

  // ============================
  // OPEN REACTIVATE MODAL
  // ============================
  const handleReactivateRequest = (row) => {
    if (reactivating) return;

    setReactivatingRow(row);
    setReactivateError(null);

    // Parent area must be active.
    if (!activeAreaIds.has(row.farmingAreaId)) {
      setReactivateError("farmRows.reactivateParentFirst");
    }
  };

  // ============================
  // CLOSE REACTIVATE MODAL
  // ============================
  const handleReactivateClose = useCallback(() => {
    if (reactivating) return;

    setReactivatingRow(null);
    setReactivateError(null);
  }, [reactivating]);

  // ============================
  // CONFIRM REACTIVATION
  // ============================
  const handleReactivateConfirm = async () => {
    const row = reactivatingRow;

    if (!row?.id || reactivating || reactivateError) {
      return;
    }

    // Defensive validation.
    if (!activeAreaIds.has(row.farmingAreaId)) {
      setReactivateError("farmRows.parentMustBeActive");
      return;
    }

    try {
      setReactivating(true);
      setReactivateError(null);

      // Reactivate using Backend API.
      await farmManagementService.reactivateRow(row);

      // Update archived list immediately.
      setRows((current) => current.filter((item) => item.id !== row.id));

      setReactivatingRow(null);

      // Notify the parent to reload active rows.
      try {
        await onRowsChanged?.();
      } catch (err) {
        console.error("Active row refresh failed:", err);
      }

      // Reload archived rows from Backend.
      await loadArchivedRows();
    } catch (err) {
      console.error("Reactivate row failed:", err);

      setReactivateError(err?.message || "farmRows.reactivateFailed");
    } finally {
      setReactivating(false);
    }
  };

  // ============================
  // DISPLAY ERRORS
  // ============================
  const displayLoadError = error || (loadErrorKey ? t(loadErrorKey) : null);

  const translationErrorKeys = [
    "farmRows.reactivateParentFirst",
    "farmRows.parentMustBeActive",
    "farmRows.reactivateFailed",
  ];

  const displayReactivateError =
    reactivateError && translationErrorKeys.includes(reactivateError)
      ? t(reactivateError)
      : reactivateError;

  return (
    <>
      {/* ============================
          ARCHIVED ROW SECTION
         ============================ */}
      <section aria-label={t("farmRows.archivedAria")} className="mb-6 min-w-0">
        {/* HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#E4B85D]">
              {t("farmRows.archivedCategory")}
            </p>

            <h2 className="text-xl font-semibold tracking-tight text-[#F4F7F4]">
              {t("farmRows.archivedTitle")}
            </h2>

            <p className="mt-2 text-xs text-[#8C9A90]">
              {t("farmRows.archivedDescription")}
            </p>
          </div>

          {/* REFRESH BUTTON */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadArchivedRows()}
              disabled={loading}
              aria-label={t("farm.refresh")}
              className="gap-2 border-[#24382A] bg-[#0D1510] text-[#ACB9AE] hover:bg-[#17251B] hover:text-white"
            >
              <RefreshCw
                size={14}
                aria-hidden="true"
                className={loading ? "animate-spin" : ""}
              />

              {t("farm.refresh")}
            </Button>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4B85D]/15 bg-[#E4B85D]/[0.05]">
              <Archive
                size={17}
                aria-hidden="true"
                className="text-[#E4B85D]"
              />
            </div>
          </div>
        </div>

        {/* ============================
            LOADING STATE
           ============================ */}
        {loading && rows.length === 0 && !displayLoadError ? (
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
            aria-busy="true"
          >
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-56 rounded-xl bg-[#17251B]" />
            ))}
          </div>
        ) : displayLoadError ? (
          /* ============================
              ERROR STATE
             ============================ */
          <Alert
            variant="destructive"
            role="alert"
            className="border-red-500/20 bg-red-500/[0.06] text-red-300"
          >
            <AlertTriangle size={16} aria-hidden="true" />

            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>{displayLoadError}</span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadArchivedRows()}
              >
                {t("farm.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : rows.length === 0 ? (
          /* ============================
              EMPTY STATE
             ============================ */
          <Card className="border-dashed border-[#24382A] bg-[#0D1510] shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <FolderArchive
                size={25}
                aria-hidden="true"
                className="mb-4 text-[#738477]"
              />

              <h3 className="text-sm font-semibold text-[#F4F7F4]">
                {t("farmRows.archivedEmpty")}
              </h3>

              <p className="mt-2 text-xs text-[#8C9A90]">
                {t("farmRows.archivedEmptyDescription")}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* ============================
              ARCHIVED ROW CARDS
             ============================ */

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((row, index) => {
              const rowId = String(row.id);

              return (
                <ArchivedRowCard
                  key={row.id}
                  row={row}
                  index={index}
                  animate={!seenRowIdsRef.current.has(rowId)}
                  parentAreaActive={activeAreaIds.has(row.farmingAreaId)}
                  processing={reactivating && reactivatingRow?.id === row.id}
                  onReactivate={handleReactivateRequest}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ============================
          REACTIVATE CONFIRM MODAL
         ============================ */}
      <ConfirmActionModal
        open={Boolean(reactivatingRow)}
        title={t("farmRows.reactivateTitle")}
        itemName={reactivatingRow?.code}
        itemLabel={t("farm.selectedRowLabel")}
        description={t("farmRows.reactivateDescription")}
        warning={t("farmRows.reactivateWarning")}
        processing={reactivating}
        error={displayReactivateError}
        confirmDisabled={
          Boolean(reactivateError) ||
          (reactivatingRow
            ? !activeAreaIds.has(reactivatingRow.farmingAreaId)
            : true)
        }
        confirmLabel={t("farmRows.reactivateTitle")}
        processingLabel={t("farm.reactivating")}
        onClose={handleReactivateClose}
        onConfirm={handleReactivateConfirm}
      />
    </>
  );
}

export default ArchivedRowList;
