import { useCallback, useEffect, useState } from 'react'
import dashboardService from '../services/dashboardService'

export default function useDashboard(farmingAreaId = null) {
  const [overview, setOverview] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [todayTasks, setTodayTasks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [refreshing, setRefreshing] = useState(false)

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }
  
        setError(null)
  
        const [
          overviewData,
          metricsData,
          taskData,
          activityData,
        ] = await Promise.all([
          dashboardService.getOverview(farmingAreaId),
          dashboardService.getMetrics(farmingAreaId),
          dashboardService.getTodayTasks(farmingAreaId),
          dashboardService.getRecentActivity(
            6,
            farmingAreaId
          ),
        ])
  
        setOverview(overviewData)
        setMetrics(metricsData)
        setTodayTasks(taskData)
        setRecentActivity(activityData)
      } catch (err) {
        console.error(
          'Dashboard load failed:',
          err
        )
  
        setError(
          err.message ||
          'Unable to load dashboard.'
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [farmingAreaId]
  )

  useEffect(() => {
    loadDashboard(false)
  }, [loadDashboard])

  return {
    overview,
    metrics,
    todayTasks,
    recentActivity,
    loading,
    refreshing,
    error,
  
    reload: () => loadDashboard(true),
  }
}