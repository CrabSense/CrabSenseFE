import {
    useCallback,
    useEffect,
    useState,
  } from 'react'
  
  import monitoringService from '../services/monitoringService'
  
  export default function useMonitoring(
    farmingAreaId = null
  ) {
    const [data, setData] = useState(null)
  
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] =
      useState(false)
  
    const [error, setError] = useState(null)
  
    const loadMonitoring = useCallback(
      async (manualRefresh = false) => {
        try {
          if (manualRefresh) {
            setRefreshing(true)
          } else {
            setLoading(true)
          }
  
          setError(null)
  
          const result =
            await monitoringService.getOverview(
              farmingAreaId
            )
  
          setData(result)
        } catch (err) {
          console.error(
            'Monitoring load failed:',
            err
          )
  
          setError(
            err.message ||
            'Unable to load monitoring data.'
          )
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      },
      [farmingAreaId]
    )
  
    useEffect(() => {
      loadMonitoring(false)
    }, [loadMonitoring])
  
    return {
      data,
      loading,
      refreshing,
      error,
  
      reload: () =>
        loadMonitoring(true),
    }
  }