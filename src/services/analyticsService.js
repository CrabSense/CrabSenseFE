import fetchAPI from "./api";

const unwrapWrappedReport = (response, fallbackMessage) => {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage);
  }

  return response.data;
};

// Convert YYYY-MM-DD to YYYY-MM-DDTHH:mm:ssZ

function formatDateForApi(value) {
  if (!value) return null;

  const dateString = String(value).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return `${dateString}T00:00:00Z`;
  }

  // YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return `${dateString}Z`;
  }

  // YYYY-MM-DDTHH:mm:ssZ
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/i.test(dateString)) {
    return dateString;
  }

  throw new Error(`Invalid analytics date format: ${dateString}`);
}

const buildDateParams = ({ fromDate, toDate, areaId } = {}) => {
  const params = new URLSearchParams();

  if (areaId) {
    params.set("areaId", areaId);
  }

  if (fromDate) {
    params.set("fromDate", formatDateForApi(fromDate));
  }

  if (toDate) {
    params.set("toDate", formatDateForApi(toDate));
  }

  return params;
};

const analyticsService = {
  getHarvestReport: async () => {
    const response = await fetchAPI("/reports/harvest");

    /*
     * Harvest endpoint khác các report còn lại:
     * Controller trả trực tiếp HarvestReportDto,
     * không wrap { success, data }.
     */
    return response;
  },

  getInventoryReport: async () => {
    const response = await fetchAPI("/reports/inventory");

    return unwrapWrappedReport(response, "Unable to load inventory report.");
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
    });

    const response = await fetchAPI(
      `/reports/survival-rate?${params.toString()}`,
    );

    return unwrapWrappedReport(response, "Unable to load survival report.");
  },

  getMoltingReport: async () => {
    const response = await fetchAPI("/reports/molting");

    return unwrapWrappedReport(response, "Unable to load molting report.");
  },

  getOperationalEfficiency: async ({ fromDate = null, toDate = null } = {}) => {
    const params = buildDateParams({
      fromDate,
      toDate,
    });

    const response = await fetchAPI(
      `/reports/operational-efficiency?${params.toString()}`,
    );

    return unwrapWrappedReport(
      response,
      "Unable to load operational efficiency.",
    );
  },
};

export default analyticsService;
