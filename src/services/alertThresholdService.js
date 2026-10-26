
import fetchAPI from "./api";

function unwrap(response) {
  if (!response?.success) {
    throw new Error(response?.message || "API request failed.");
  }

  return response.data;
}

const alertThresholdService = {
  async getAll() {
    const response = await fetchAPI("/alert-thresholds");
    const data = unwrap(response);

    if (!Array.isArray(data)) {
      throw new Error("Invalid thresholds response.");
    }

    return data;
  },

  async create(payload) {
    const response = await fetchAPI("/alert-thresholds", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return unwrap(response);
  },

  async update(id, payload) {
    const response = await fetchAPI(
      `/alert-thresholds/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    return unwrap(response);
  },

  async remove(id) {
    const response = await fetchAPI(
      `/alert-thresholds/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );

    return unwrap(response);
  },
};

export default alertThresholdService;
