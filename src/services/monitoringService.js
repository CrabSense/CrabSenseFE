import fetchAPI from './api'

const monitoringService = {
  getOverview: async (farmingAreaId = null) => {
    const params = new URLSearchParams()

    if (farmingAreaId) {
      params.set('farmingAreaId', farmingAreaId)
    }

    const query = params.toString()

    const response = await fetchAPI(
      `/boxes/overview${query ? `?${query}` : ''}`
    )

    if (!response?.success) {
      throw new Error(
        response?.message ||
        'Unable to load monitoring data.'
      )
    }

    return response.data
  },
}

export default monitoringService