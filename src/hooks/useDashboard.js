
import { useCallback, useEffect, useRef, useState } from "react";
import dashboardService from "../services/dashboardService";

export default function useDashboard(farmingAreaId = null) {
  const [overview, setOverview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const loadedAreaRef = useRef(undefined);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      const requestId = ++requestIdRef.current;
      const areaId = farmingAreaId || null;

      const canRefresh =
        isRefresh &&
        loadedAreaRef.current === areaId;

      if (canRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setRefreshing(false);
        setOverview(null);
      }

      setError(null);

      try {
        const overviewData = await dashboardService.getOverview(areaId);

        if (requestId !== requestIdRef.current) return;

        setOverview(overviewData);
        loadedAreaRef.current = areaId;
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        console.error("Dashboard loading failed:", err);
        setError(err?.message || "Unable to load dashboard.");

        setOverview(null);
        loadedAreaRef.current = undefined;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [farmingAreaId]
  );

  useEffect(() => {
    loadDashboard(false);

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadDashboard]);

  const reload = useCallback(
    () => loadDashboard(true),
    [loadDashboard]
  );

  return {
    overview,
    loading,
    refreshing,
    error,
    reload,
  };
}
