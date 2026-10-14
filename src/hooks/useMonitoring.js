import { useCallback, useEffect, useRef, useState } from "react";

import monitoringService from "../services/monitoringService";
import { useSettings } from "../context/SettingsContext";

export default function useMonitoring(farmingAreaId = null) {
  const { settings } = useSettings();

  const refreshInterval = Number(settings.refreshInterval);

  const refreshSeconds =
    Number.isInteger(refreshInterval) &&
    refreshInterval >= 5 &&
    refreshInterval <= 300
      ? refreshInterval
      : 30;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Identify the latest request, so an older
  // response cannot overwrite newer data.
  const requestIdRef = useRef(0);

  // Prevent overlapping requests for the
  // same farming area.
  const inFlightRef = useRef(null);

  // Track the currently selected area,
  // including the "All Areas" case.
  const currentAreaRef = useRef(farmingAreaId);
  currentAreaRef.current = farmingAreaId;

  const loadMonitoring = useCallback(
    async (background = false) => {
      const requestAreaId = farmingAreaId;

      // Do not start another request for
      // the same area while one is running.
      if (inFlightRef.current?.areaId === requestAreaId) {
        return inFlightRef.current.promise;
      }

      const requestId = ++requestIdRef.current;

      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setData(null);
      }

      setError(null);

      const promise = (async () => {
        try {
          const result = await monitoringService.getOverview(requestAreaId);

          // Ignore outdated responses.
          if (
            requestId !== requestIdRef.current ||
            requestAreaId !== currentAreaRef.current
          ) {
            return;
          }

          setData(result);
          setError(null);
        } catch (err) {
          if (
            requestId !== requestIdRef.current ||
            requestAreaId !== currentAreaRef.current
          ) {
            return;
          }

          console.error("Monitoring load failed:", err);

          // Background refresh failures should
          // not destroy the current dashboard.
          if (!background) {
            setError(err.message || "Unable to load monitoring data.");
          }
        } finally {
          if (
            requestId === requestIdRef.current &&
            requestAreaId === currentAreaRef.current
          ) {
            setLoading(false);
            setRefreshing(false);
            inFlightRef.current = null;
          }
        }
      })();

      inFlightRef.current = {
        areaId: requestAreaId,
        promise,
      };

      return promise;
    },
    [farmingAreaId],
  );

  // Initial loading and Area changes.
  useEffect(() => {
    loadMonitoring(false);
  }, [loadMonitoring]);

  // Auto-refresh based on saved Settings.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadMonitoring(true);
    }, refreshSeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadMonitoring, refreshSeconds]);

  // Invalidate in-flight requests when the
  // component unmounts.
  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      inFlightRef.current = null;
    };
  }, []);

  const reload = useCallback(() => loadMonitoring(true), [loadMonitoring]);

  return {
    data,
    loading,
    refreshing,
    error,
    reload,
    refreshInterval: refreshSeconds,
  };
}
