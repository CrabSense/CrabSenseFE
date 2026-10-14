import { useCallback, useEffect, useState } from "react";

import useSelectedArea from "../hooks/useSelectedArea";
import useFarmManagement from "../hooks/useFarmManagement";

import PageReveal from "../components/ui/PageReveal";

import FarmManagementHeader from "../components/farm-management/FarmManagementHeader";
import FarmManagementLoading from "../components/farm-management/FarmManagementLoading";
import FarmManagementError from "../components/farm-management/FarmManagementError";

import FarmSummaryGrid from "../components/farm-management/summary/FarmSummaryGrid";

import AreaList from "../components/farm-management/areas/AreaList";
import RowList from "../components/farm-management/rows/RowList";
import BoxTable from "../components/farm-management/boxes/BoxTable";

import ArchivedAreaList from "../components/farm-management/archive/ArchivedAreaList";
import ArchivedRowList from "../components/farm-management/archive/ArchivedRowList";

function FarmManagement() {
  const { selectedAreaId } = useSelectedArea();

  // Currently selected farming row
  const [selectedRowId, setSelectedRowId] = useState(null);

  // Archive refresh signals
  const [archivedAreasVersion, setArchivedAreasVersion] = useState(0);

  const [archivedRowsVersion, setArchivedRowsVersion] = useState(0);

  const {
    areas,
    rows,
    boxes,
    loading,
    refreshing,
    error,
    reload,
    upsertRow,
    upsertBox,
    removeRow,
    removeArea,
  } = useFarmManagement(selectedAreaId);

  // Reset selected row when area changes
  useEffect(() => {
    setSelectedRowId(null);
  }, [selectedAreaId]);

  // Clear selection if row no longer exists
  useEffect(() => {
    if (selectedRowId && !rows.some((row) => row.id === selectedRowId)) {
      setSelectedRowId(null);
    }
  }, [rows, selectedRowId]);

  // Called after deactivating an area
  const handleAreaDeactivated = useCallback(
    (areaId) => {
      if (!areaId) return;

      removeArea(areaId);

      setArchivedAreasVersion((current) => current + 1);
    },
    [removeArea],
  );

  // Called after deactivating a row
  const handleRowDeactivated = useCallback(
    (rowId) => {
      if (!rowId) return;

      removeRow(rowId);

      setSelectedRowId((current) => (current === rowId ? null : current));

      setArchivedRowsVersion((current) => current + 1);
    },
    [removeRow],
  );

  // Refresh active data after area restoration
  const handleAreasChanged = useCallback(async () => {
    await reload();

    setArchivedRowsVersion((current) => current + 1);
  }, [reload]);

  // Refresh active data after row restoration
  const handleRowsChanged = useCallback(async () => {
    await reload();
  }, [reload]);

  if (loading) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <FarmManagementLoading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
        <FarmManagementError message={error} onRetry={reload} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 text-[#F4F7F4]">
      {/* HEADER */}
      <PageReveal delay={0}>
        <FarmManagementHeader refreshing={refreshing} onRefresh={reload} />
      </PageReveal>

      {/* SUMMARY */}
      <PageReveal delay={80}>
        <FarmSummaryGrid areas={areas} rows={rows} boxes={boxes} />
      </PageReveal>

      {/* ACTIVE FARMING AREAS */}
      <PageReveal delay={0}>
        <AreaList
          areas={areas}
          rows={rows}
          onAreasChanged={reload}
          onAreaDeactivated={handleAreaDeactivated}
        />
      </PageReveal>

      {/* ACTIVE FARMING ROWS */}
      <PageReveal delay={0}>
        <RowList
          rows={rows}
          selectedRowId={selectedRowId}
          onSelectRow={setSelectedRowId}
          onRowsChanged={reload}
          onRowSaved={upsertRow}
          onRowDeactivated={handleRowDeactivated}
        />
      </PageReveal>

      {/* ACTIVE FARMING BOXES */}
      <PageReveal delay={0}>
        <BoxTable
          boxes={boxes}
          rows={rows}
          selectedRowId={selectedRowId}
          onBoxesChanged={reload}
          onBoxSaved={upsertBox}
        />
      </PageReveal>

      {/* ARCHIVED AREAS */}
      <PageReveal delay={0}>
        <ArchivedAreaList
          refreshKey={archivedAreasVersion}
          onAreasChanged={handleAreasChanged}
        />
      </PageReveal>

      {/* ARCHIVED ROWS */}
      <PageReveal delay={0}>
        <ArchivedRowList
          activeAreas={areas}
          refreshKey={archivedRowsVersion}
          onRowsChanged={handleRowsChanged}
        />
      </PageReveal>
    </main>
  );
}

export default FarmManagement;
