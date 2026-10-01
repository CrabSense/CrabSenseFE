import fetchAPI from './api'

const farmingService = {
  getAreas: async ({
    search = null,
    isActive = true,
    status = null,
  } = {}) => {
    const params = new URLSearchParams()

    if (search) {
      params.set('search', search)
    }

    if (typeof isActive === 'boolean') {
      params.set('isActive', String(isActive))
    }

    if (status) {
      params.set('status', status)
    }

    const query = params.toString()

    const response = await fetchAPI(
      `/farming-areas${query ? `?${query}` : ''}`
    )

    if (!response?.success) {
      throw new Error(
        response?.message ||
        'Unable to load farming areas.'
      )
    }

    return response.data?.items ?? []
  },

  getAreaById: async (id) => {
    const response = await fetchAPI(
      `/farming-areas/${id}`
    )

    if (!response?.success) {
      throw new Error(
        response?.message ||
        'Unable to load farming area.'
      )
    }

    return response.data
  },
}

export default farmingService