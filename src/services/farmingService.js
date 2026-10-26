
import fetchAPI from "./api";

const farmingService = {
  getAreas: async ({
    search = null,
    isActive = true,
    status = null,
  } = {}) => {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (typeof isActive === "boolean") {
      params.set("isActive", String(isActive));
    }

    if (status) {
      params.set("status", status);
    }

    const query = params.toString();

    const response = await fetchAPI(
      `/farming-areas${query ? `?${query}` : ""}`
    );

    if (!response?.success) {
      throw new Error(
        response?.message || "Unable to load farming areas."
      );
    }

    const data = response.data;

    // Case 1: Backend returns an array.
    if (Array.isArray(data)) {
      return data;
    }

    // Case 2: Backend returns paginated items.
    if (Array.isArray(data?.items)) {
      return data.items;
    }

    console.error(
      "[FarmingAreas] Unexpected API response:",
      response
    );

    throw new Error("Invalid farming areas response format.");
  },

  getAreaById: async (id) => {
    const response = await fetchAPI(
      `/farming-areas/${encodeURIComponent(id)}`
    );

    if (!response?.success) {
      throw new Error(
        response?.message || "Unable to load farming area."
      );
    }

    return response.data;
  },
};

export default farmingService;
