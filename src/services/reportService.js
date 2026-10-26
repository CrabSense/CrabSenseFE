
import fetchAPI from "./api";

function unwrap(response) {
  if (response == null) {
    throw new Error("Backend không trả dữ liệu.");
  }

  if (response.success === false) {
    throw new Error(response.message || "Report request failed.");
  }

  if (response.success === true) {
    return response.data;
  }

  // Supports endpoints returning DTO directly.
  return response;
}

function toQuery(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function get(path, filters) {
  const response = await fetchAPI(
    `${path}${toQuery(filters)}`
  );

  return unwrap(response);
}

const reportService = {
  // Harvest overview, unfiltered.
  getHarvest() {
    return get("/reports/harvest");
  },

  // Period: Day / Week / Month.
  getHarvestByPeriod(filters = {}) {
    return get("/reports/harvest/period", {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      period: filters.period || "Day",
      farmingAreaId: filters.farmingAreaId,
    });
  },

  getInventory() {
    return get("/reports/inventory");
  },

  getInventoryFiltered(filters = {}) {
    return get("/reports/inventory/filtered", {
      asOfDate: filters.asOfDate,
      expiryWarningDays: filters.expiryWarningDays ?? 30,
    });
  },

  getSurvivalRate(filters = {}) {
    return get("/reports/survival-rate", {
      areaId: filters.areaId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  },

  getMolting(filters = {}) {
    return get("/reports/molting");
  },

  getMoltingFiltered(filters = {}) {
    return get("/reports/molting/filtered", {
      areaId: filters.areaId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  },

  getOperationalEfficiency(filters = {}) {
    return get("/reports/operational-efficiency", {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  },
};

export default reportService;
