import {
    useCallback,
    useEffect,
    useState,
  } from 'react'
  
  import analyticsService
    from '../services/analyticsService'
  
  export default function useAnalytics({
    farmingAreaId = null,
    fromDate = null,
    toDate = null,
  }) {
    const [harvest, setHarvest] = useState(null)
    const [inventory, setInventory] = useState(null)
    const [survival, setSurvival] = useState(null)
    const [molting, setMolting] = useState(null)
    const [efficiency, setEfficiency] = useState(null)
  
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] =
      useState(false)
  
    const [error, setError] = useState(null)
  
    const loadAnalytics = useCallback(
      async (manualRefresh = false) => {
        try {
          if (manualRefresh) {
            setRefreshing(true)
          } else {
            setLoading(true)
          }
  
          setError(null)
  
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
              fromDate,
              toDate,
            }),
          ])
  
          setHarvest(harvestData)
          setInventory(inventoryData)
          setSurvival(survivalData)
          setMolting(moltingData)
          setEfficiency(efficiencyData)
        } catch (err) {
          console.error(
            'Analytics load failed:',
            err
          )
  
          setError(
            err.message ||
            'Unable to load analytics.'
          )
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      },
      [
        farmingAreaId,
        fromDate,
        toDate,
      ]
    )
  
    useEffect(() => {
      loadAnalytics(false)
    }, [loadAnalytics])
  
    return {
      harvest,
      inventory,
      survival,
      molting,
      efficiency,
  
      loading,
      refreshing,
      error,
  
      reload: () =>
        loadAnalytics(true),
    }
  }