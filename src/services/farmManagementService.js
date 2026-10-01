import fetchAPI from './api'

const unwrapPaged = (
  response,
  fallbackMessage
) => {
  if (!response?.success) {
    throw new Error(
      response?.message || fallbackMessage
    )
  }

  return response.data?.items ?? []
}

const farmManagementService = {
  getAreas: async () => {
    const response = await fetchAPI(
      '/farming-areas?isActive=true'
    )

    return unwrapPaged(
      response,
      'Unable to load farming areas.'
    )
  },

  getRows: async (
    farmingAreaId = null
  ) => {
    const params = new URLSearchParams()

    if (farmingAreaId) {
      params.set(
        'farmingAreaId',
        farmingAreaId
      )
    }

    params.set(
      'isActive',
      'true'
    )

    const response = await fetchAPI(
      `/farming-rows?${params.toString()}`
    )

    return unwrapPaged(
      response,
      'Unable to load farming rows.'
    )
  },

  getBoxes: async ({
    farmingAreaId = null,
    farmingRowId = null,
  } = {}) => {
    const params = new URLSearchParams()

    if (farmingAreaId) {
      params.set(
        'farmingAreaId',
        farmingAreaId
      )
    }

    if (farmingRowId) {
      params.set(
        'farmingRowId',
        farmingRowId
      )
    }

    const query = params.toString()

    const response = await fetchAPI(
      `/boxes${query ? `?${query}` : ''}`
    )

    return unwrapPaged(
      response,
      'Unable to load boxes.'
    )
  },
}

export default farmManagementService