import { useCallback, useEffect, useRef, useState } from "react";

import analyticsService from "../services/analyticsService";

export default function useAnalytics({
  farmingAreaId = null,
  fromDate = null,
  toDate = null,
}) {
  const [harvest, setHarvest] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [survival, setSurvival] = useState(null);
  const [molting, setMolting] = useState(null);
  const [efficiency, setEfficiency] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);
  const generation = useRef(0);
  const scopeKey = JSON.stringify([farmingAreaId, fromDate, toDate]);
  const [loadedScope, setLoadedScope] = useState(null);

  const loadAnalytics = useCallback(
    async (manualRefresh = false) => {
      const request = ++generation.current;
      setLoadedScope(null);
      try {
        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [
          harvestData,
          inventoryData,
          survivalData,
          moltingData,
          efficiencyData,
        ] = await Promise.all([
          analyticsService.getHarvestReport(),

          analyticsService.getInventoryReport(),

          analyticsService.getSurvivalReport({
            areaId: farmingAreaId,
            fromDate,
            toDate,
          }),

          analyticsService.getMoltingReport(),

          analyticsService.getOperationalEfficiency({
            farmingAreaId,
            fromDate,
            toDate,
          }),
        ]);

        if (request !== generation.current) return;
        setHarvest(harvestData);
        setInventory(inventoryData);
        setSurvival(survivalData);
        setMolting(moltingData);
        setEfficiency(efficiencyData);
        setLoadedScope(scopeKey);
      } catch (err) {
        if (request !== generation.current) return;
        console.error("Analytics load failed:", err);

        setError(err.message || "Unable to load analytics.");
      } finally {
        if (request === generation.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [farmingAreaId, fromDate, toDate, scopeKey],
  );

  useEffect(() => {
    loadAnalytics(false);
    return () => { generation.current += 1; };
  }, [loadAnalytics]);

  return {
    harvest: loadedScope === scopeKey ? harvest : null,
    inventory: loadedScope === scopeKey ? inventory : null,
    survival: loadedScope === scopeKey ? survival : null,
    molting: loadedScope === scopeKey ? molting : null,
    efficiency: loadedScope === scopeKey ? efficiency : null,

    loading,
    refreshing,
    error,

    reload: () => loadAnalytics(true),
  };
}
