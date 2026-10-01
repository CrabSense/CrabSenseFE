import fetchAPI from './api'

const unwrapWrappedReport = (response, fallbackMessage) => {
  if (!response?.success) {
    throw new Error(
      response?.message || fallbackMessage
    )
  }

  return response.data
}

const buildDateParams = ({
  fromDate,
  toDate,
  areaId,
} = {}) => {
  const params = new URLSearchParams()

  if (areaId) {
    params.set('areaId', areaId)
  }

  if (fromDate) {
    params.set('fromDate', fromDate)
  }

  if (toDate) {
    params.set('toDate', toDate)
  }

  return params
}

const analyticsService = {
  getHarvestReport: async () => {
    const response = await fetchAPI(
      '/reports/harvest'
    )

    /*
     * Harvest endpoint khác các report còn lại:
     * Controller trả trực tiếp HarvestReportDto,
     * không wrap { success, data }.
     */
    return response
  },

  getInventoryReport: async () => {
    const response = await fetchAPI(
      '/reports/inventory'
    )

    return unwrapWrappedReport(
      response,
      'Unable to load inventory report.'
    )
  },

  getSurvivalReport: async ({
    areaId = null,
    fromDate = null,
    toDate = null,
  } = {}) => {
    const params = buildDateParams({
      areaId,
      fromDate,
      toDate,
    })

    const response = await fetchAPI(
      `/reports/survival-rate?${params.toString()}`
    )

    return unwrapWrappedReport(
      response,
      'Unable to load survival report.'
    )
  },

  getMoltingReport: async () => {
    const response = await fetchAPI(
      '/reports/molting'
    )

    return unwrapWrappedReport(
      response,
      'Unable to load molting report.'
    )
  },

  getOperationalEfficiency: async ({
    fromDate = null,
    toDate = null,
  } = {}) => {
    const params = buildDateParams({
      fromDate,
      toDate,
    })

    const response = await fetchAPI(
      `/reports/operational-efficiency?${params.toString()}`
    )

    return unwrapWrappedReport(
      response,
      'Unable to load operational efficiency.'
    )
  },
}

export default analyticsService