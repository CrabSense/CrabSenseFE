
import fetchAPI from "./api";

function unwrap(response) {
  if (!response?.success) {
    throw new Error(response?.message || "API request failed.");
  }

  return response.data;
}

const alertService = {
  async getAll({
    activeOnly = true,
    farmingAreaId = null,
    boxId = null,
  } = {}) {
    const params = new URLSearchParams();

    params.set("activeOnly", String(activeOnly));

    if (farmingAreaId) {
      params.set("farmingAreaId", farmingAreaId);
    }

    if (boxId) {
      params.set("boxId", boxId);
    }

    const response = await fetchAPI(`/alerts?${params}`);
    const data = unwrap(response);

    if (!Array.isArray(data)) {
      throw new Error("Invalid alerts response.");
    }

    return data;
  },

  async getHistory({
    days = 30,
    farmingAreaId = null,
  } = {}) {
    const params = new URLSearchParams();

    params.set("days", String(days));

    if (farmingAreaId) {
      params.set("farmingAreaId", farmingAreaId);
    }

    const response = await fetchAPI(
      `/alerts/history?${params}`
    );

    const data = unwrap(response);

    if (!Array.isArray(data)) {
      throw new Error("Invalid alert history response.");
    }

    return data;
  },

  async getById(id) {
    return unwrap(
      await fetchAPI(`/alerts/${encodeURIComponent(id)}`)
    );
  },

  async acknowledge(id) {
    return unwrap(
      await fetchAPI(
        `/alerts/${encodeURIComponent(id)}/acknowledge`,
        {
          method: "PATCH",
          body: JSON.stringify({ userId: null }),
        }
      )
    );
  },

  async startProcessing(id) {
    return unwrap(
      await fetchAPI(
        `/alerts/${encodeURIComponent(id)}/process`,
        {
          method: "POST",
          body: JSON.stringify({ userId: null }),
        }
      )
    );
  },

  async resolve(id, payload) {
    return unwrap(
      await fetchAPI(
        `/alerts/${encodeURIComponent(id)}/resolve`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...payload,
            userId: null,
          }),
        }
      )
    );
  },
};

export default alertService;
