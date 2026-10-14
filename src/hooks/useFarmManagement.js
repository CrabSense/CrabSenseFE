import { useCallback, useEffect, useState } from "react";

import farmManagementService from "../services/farmManagementService";

export default function useFarmManagement(farmingAreaId = null) {
  const [areas, setAreas] = useState([]);

  const [rows, setRows] = useState([]);

  const [boxes, setBoxes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const load = useCallback(
    async (manualRefresh = false) => {
      try {
        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [areaData, rowData, boxData] = await Promise.all([
          farmManagementService.getAreas(),

          farmManagementService.getRows(farmingAreaId),

          farmManagementService.getBoxes({
            farmingAreaId,
          }),
        ]);

        setAreas(areaData);
        setRows(rowData);
        setBoxes(boxData);
      } catch (err) {
        console.error("Farm management load failed:", err);

        setError(err.message || "Unable to load farm data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [farmingAreaId],
  );

  const upsertRow = useCallback((savedRow) => {
    if (!savedRow?.id) {
      return;
    }

    setRows((currentRows) => {
      const exists = currentRows.some((row) => row.id === savedRow.id);

      if (exists) {
        return currentRows.map((row) =>
          row.id === savedRow.id ? savedRow : row,
        );
      }

      return [...currentRows, savedRow];
    });
  }, []);

  const upsertBox = useCallback((savedBox) => {
    if (!savedBox?.id) {
      return;
    }

    setBoxes((currentBoxes) => {
      const exists = currentBoxes.some((box) => box.id === savedBox.id);

      if (exists) {
        return currentBoxes.map((box) =>
          box.id === savedBox.id ? savedBox : box,
        );
      }

      return [...currentBoxes, savedBox];
    });
  }, []);

  const removeRow = useCallback((rowId) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  }, []);

  const removeArea = useCallback((areaId) => {
    setAreas((currentAreas) =>
      currentAreas.filter((area) => area.id !== areaId),
    );
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    areas,
    rows,
    boxes,

    loading,
    refreshing,
    error,

    reload: () => load(true),

    upsertRow,
    upsertBox,
    removeRow,
    removeArea,
  };
}
