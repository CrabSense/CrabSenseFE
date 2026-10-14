import { useCallback, useEffect, useRef, useState } from "react";

import { Archive, AlertTriangle, RefreshCw, FolderArchive } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Alert, AlertDescription } from "@/components/ui/alert";

import farmManagementService from "../../../services/farmManagementService";
import useSelectedArea from "../../../hooks/useSelectedArea";
import useTranslation from "@/hooks/useTranslation";

import ConfirmActionModal from "../common/ConfirmActionModal";
import ArchivedAreaCard from "./ArchivedAreaCard";

function ArchivedAreaList({ onAreasChanged, refreshKey = 0 }) {
  const { t } = useTranslation();
  const { reloadAreas } = useSelectedArea();

  // ============================
  // ARCHIVED AREAS STATE
  // ============================
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Remember archived areas that have been displayed.
  // This survives local list refreshes.
  const seenAreaIdsRef = useRef(new Set());

  // Remember IDs after archived areas have loaded.
  // Do not mutate the Set inside JSX rendering.
  useEffect(() => {
    if (loading) return;

    areas.forEach((area) => {
      if (area.id != null) {
        seenAreaIdsRef.current.add(String(area.id));
      }
    });
  }, [areas, loading]);

  // ============================
  // REACTIVATE STATE
  // ============================
  const [reactivatingArea, setReactivatingArea] = useState(null);

  const [reactivating, setReactivating] = useState(false);

  const [reactivateError, setReactivateError] = useState(null);

  // ============================
  // LOAD ARCHIVED AREAS
  // ============================
  const loadArchivedAreas = useCallback(
    async (isCurrent = () => true) => {
      try {
        if (isCurrent()) {
          setLoading(true);
          setError(null);
        }

        const result = await farmManagementService.getInactiveAreas();

        if (!isCurrent()) return;

        setAreas(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!isCurrent()) return;

        console.error("Load archived areas failed:", err);

        setError(err.message || t("farmAreas.archivedLoadFailed"));
      } finally {
        if (isCurrent()) {
          setLoading(false);
        }
      }
    },
    [t],
  );

  // ============================
  // INITIAL LOAD / REFRESH
  // ============================
  useEffect(() => {
    let active = true;

    loadArchivedAreas(() => active);

    return () => {
      active = false;
    };
  }, [loadArchivedAreas, refreshKey]);

  // ============================
  // OPEN REACTIVATE MODAL
  // ============================
  const handleReactivateRequest = (area) => {
    if (reactivating) return;

    setReactivatingArea(area);
    setReactivateError(null);
  };

  // ============================
  // CLOSE REACTIVATE MODAL
  // ============================
  const handleReactivateClose = useCallback(() => {
    if (reactivating) return;

    setReactivatingArea(null);
    setReactivateError(null);
  }, [reactivating]);

  // ============================
  // CONFIRM REACTIVATION
  // ============================
  const handleReactivateConfirm = async () => {
    if (!reactivatingArea?.id || reactivating) {
      return;
    }

    const area = reactivatingArea;

    try {
      setReactivating(true);
      setReactivateError(null);

      // Reactivate through Backend API.
      await farmManagementService.reactivateArea(area);

      // Remove reactivated area from archived list.
      setAreas((current) => current.filter((item) => item.id !== area.id));

      // Close modal after successful reactivation.
      setReactivatingArea(null);

      // Refresh global farming area selector.
      try {
        await reloadAreas?.();
      } catch (err) {
        console.error("Global area refresh failed:", err);
      }

      // Notify parent component to refresh active areas.
      try {
        await onAreasChanged?.();
      } catch (err) {
        console.error("Active area refresh failed:", err);
      }

      // Reload archived area list.
      await loadArchivedAreas();
    } catch (err) {
      console.error("Reactivate area failed:", err);

      setReactivateError(err.message || t("farmAreas.reactivateFailed"));
    } finally {
      setReactivating(false);
    }
  };

  return (
    <>
      {/* ============================
          ARCHIVED AREA SECTION
         ============================ */}
      <section
        aria-label={t("farmAreas.archivedAria")}
        className="mb-6 min-w-0"
      >
        {/* SECTION HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#E4B85D]">
              {t("farmAreas.archivedCategory")}
            </p>

            <h2 className="text-xl font-semibold tracking-tight text-[#F4F7F4]">
              {t("farmAreas.archivedTitle")}
            </h2>

            <p className="mt-2 text-xs text-[#8C9A90]">
              {t("farmAreas.archivedDescription")}
            </p>
          </div>

          {/* REFRESH ACTION */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadArchivedAreas()}
              disabled={loading}
              aria-label={t("farmAreas.archivedRefresh")}
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
        {loading && areas.length === 0 && !error ? (
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
            aria-busy="true"
          >
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-56 rounded-xl bg-[#17251B]" />
            ))}
          </div>
        ) : error ? (
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
              <span>{error}</span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadArchivedAreas()}
              >
                {t("farm.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : areas.length === 0 ? (
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
                {t("farmAreas.archivedEmpty")}
              </h3>

              <p className="mt-2 text-xs text-[#8C9A90]">
                {t("farmAreas.archivedEmptyDescription")}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* ============================
              ARCHIVED AREA CARDS
             ============================ */

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {areas.map((area, index) => {
              const areaId = String(area.id);

              const animate = !seenAreaIdsRef.current.has(areaId);

              return (
                <ArchivedAreaCard
                  key={area.id}
                  area={area}
                  index={index}
                  animate={animate}
                  processing={reactivating && reactivatingArea?.id === area.id}
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
        open={Boolean(reactivatingArea)}
        title={t("farmAreas.reactivateTitle")}
        itemName={reactivatingArea?.code}
        itemLabel={t("farm.selectedAreaLabel")}
        description={t("farmAreas.reactivateDescription")}
        warning={t("farmAreas.reactivateWarning")}
        processing={reactivating}
        error={reactivateError}
        confirmLabel={t("farmAreas.reactivateTitle")}
        processingLabel={t("farm.reactivating")}
        onClose={handleReactivateClose}
        onConfirm={handleReactivateConfirm}
      />
    </>
  );
}

export default ArchivedAreaList;
