import fetchAPI from './api'

const buildAreaQuery = (farmingAreaId) => {
  if (!farmingAreaId) return ''

  return `?farmingAreaId=${encodeURIComponent(farmingAreaId)}`
}

const dashboardService = {
  getOverview: async (farmingAreaId = null) => {
    const response = await fetchAPI(
      `/dashboard/overview${buildAreaQuery(farmingAreaId)}`
    )

    if (!response?.success) {
      throw new Error(
        response?.message || 'Unable to load dashboard overview.'
      )
    }

    return response.data
  },

  getMetrics: async (farmingAreaId = null) => {
    const response = await fetchAPI(
      `/dashboard/metrics${buildAreaQuery(farmingAreaId)}`
    )

    if (!response?.success) {
      throw new Error(
        response?.message || 'Unable to load dashboard metrics.'
      )
    }

    return response.data
  },

  getTodayTasks: async (farmingAreaId = null) => {
    const response = await fetchAPI(
      `/operations/today${buildAreaQuery(farmingAreaId)}`
    )

    if (!response?.success) {
      throw new Error(
        response?.message || 'Unable to load today tasks.'
      )
    }

    return response.data ?? []
  },

  getRecentActivity: async (
    limit = 6,
    farmingAreaId = null
  ) => {
    const params = new URLSearchParams()

    params.set('limit', String(limit))

    if (farmingAreaId) {
      params.set('farmingAreaId', farmingAreaId)
    }

    const response = await fetchAPI(
      `/operations/recent?${params.toString()}`
    )

    if (!response?.success) {
      throw new Error(
        response?.message || 'Unable to load recent activity.'
      )
    }

    return response.data ?? []
  },
}

export default dashboardService