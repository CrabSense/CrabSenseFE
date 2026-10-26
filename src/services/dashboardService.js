
import fetchAPI from "./api";

function unwrap(response) {
  if (response == null) {
    throw new Error("Backend returned no response.");
  }

  if (response.success === false) {
    throw new Error(response.message || "Dashboard request failed.");
  }

  if (response.success === true) {
    return response.data;
  }

  return response;
}

function createQuery(farmingAreaId) {
  if (!farmingAreaId) return "";

  const params = new URLSearchParams({
    farmingAreaId: String(farmingAreaId),
  });

  return `?${params.toString()}`;
}

const dashboardService = {
  async getOverview(farmingAreaId = null) {
    const response = await fetchAPI(
      `/dashboard/overview${createQuery(farmingAreaId)}`
    );
    return unwrap(response);
  },

  async getMetrics(farmingAreaId = null) {
    const response = await fetchAPI(
      `/dashboard/metrics${createQuery(farmingAreaId)}`
    );
    return unwrap(response);
  },
};

export default dashboardService;
