import fetchAPI from "./api";

const unwrapPaged = (response, fallbackMessage) => {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage);
  }

  return response.data?.items ?? [];
};

const unwrapData = (response, fallbackMessage) => {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage);
  }

  return response.data;
};

const farmManagementService = {
  getAreas: async () => {
    const response = await fetchAPI("/farming-areas?isActive=true");

    return unwrapPaged(response, "Unable to load farming areas.");
  },

  getRows: async (farmingAreaId = null) => {
    const params = new URLSearchParams();

    if (farmingAreaId) {
      params.set("farmingAreaId", farmingAreaId);
    }

    params.set("isActive", "true");

    const response = await fetchAPI(`/farming-rows?${params.toString()}`);

    return unwrapPaged(response, "Unable to load farming rows.");
  },

  getBoxes: async ({ farmingAreaId = null, farmingRowId = null } = {}) => {
    const params = new URLSearchParams();

    if (farmingAreaId) {
      params.set("farmingAreaId", farmingAreaId);
    }

    if (farmingRowId) {
      params.set("farmingRowId", farmingRowId);
    }

    const query = params.toString();

    const response = await fetchAPI(`/boxes${query ? `?${query}` : ""}`);

    return unwrapPaged(response, "Unable to load boxes.");
  },

  createArea: async (payload) => {
    const response = await fetchAPI("/farming-areas", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return unwrapData(response, "Unable to create farming area.");
  },

  updateArea: async (areaId, payload) => {
    const response = await fetchAPI(`/farming-areas/${areaId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return unwrapData(response, "Unable to update farming area.");
  },

  createRow: async (payload) => {
    const response = await fetchAPI("/farming-rows", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return unwrapData(response, "Unable to create farming row.");
  },

  updateRow: async (rowId, payload) => {
    const response = await fetchAPI(`/farming-rows/${rowId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return unwrapData(response, "Unable to update farming row.");
  },

  createBox: async (farmingRowId) => {
    const response = await fetchAPI("/boxes", {
      method: "POST",
      body: JSON.stringify({
        farmingRowId,
      }),
    });

    return unwrapData(response, "Unable to create box.");
  },

  updateBox: async (boxId, payload) => {
    const response = await fetchAPI(`/boxes/${boxId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return unwrapData(response, "Unable to update box.");
  },

  updateBoxStatus: async (boxId, payload) => {
    const response = await fetchAPI(`/boxes/${boxId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return unwrapData(response, "Unable to update box status.");
  },

  deactivateRow: async (row) => {
    const response = await fetchAPI(`/farming-rows/${row.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: row.name,
        location: row.location ?? null,
        capacity: row.capacity ?? 0,
        description: row.description ?? null,

        status: "Closed",
        isActive: false,

        sortOrder: row.sortOrder ?? 0,
      }),
    });

    return unwrapData(response, "Unable to deactivate farming row.");
  },

  deactivateArea: async (area) => {
    const response = await fetchAPI(`/farming-areas/${area.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: area.name,

        location: area.location ?? null,

        areaSquareMeters: area.areaSquareMeters ?? null,

        description: area.description ?? null,

        status: "Closed",

        isActive: false,

        address: area.address ?? "",

        region: area.region ?? null,

        establishedAt: area.establishedAt ?? null,

        avatarUrl: area.avatarUrl ?? null,

        latitude: area.latitude ?? null,

        longitude: area.longitude ?? null,
      }),
    });

    return unwrapData(response, "Unable to deactivate farming area.");
  },

  getInactiveAreas: async () => {
    const response = await fetchAPI("/farming-areas?isActive=false");

    return response?.data?.items ?? response?.data ?? [];
  },

  reactivateArea: async (area) => {
    const response = await fetchAPI(`/farming-areas/${area.id}`, {
      method: "PUT",

      body: JSON.stringify({
        name: area.name,

        location: area.location ?? null,

        areaSquareMeters: area.areaSquareMeters ?? null,

        description: area.description ?? null,

        status: "Active",

        isActive: true,

        address: area.address ?? "",

        region: area.region ?? null,

        establishedAt: area.establishedAt ?? null,

        avatarUrl: area.avatarUrl ?? null,

        latitude: area.latitude ?? null,

        longitude: area.longitude ?? null,
      }),
    });

    return unwrapData(response, "Unable to reactivate farming area.");
  },

  getInactiveRows: async (farmingAreaId = null) => {
    const params = new URLSearchParams();

    params.set("isActive", "false");

    if (farmingAreaId) {
      params.set("farmingAreaId", farmingAreaId);
    }

    const response = await fetchAPI(`/farming-rows?${params.toString()}`);

    return response?.data?.items ?? response?.data ?? [];
  },

  reactivateRow: async (row) => {
    const response = await fetchAPI(`/farming-rows/${row.id}`, {
      method: "PUT",

      body: JSON.stringify({
        name: row.name,

        location: row.location ?? null,

        capacity: row.capacity ?? 0,

        description: row.description ?? null,

        status: "Active",

        isActive: true,

        sortOrder: row.sortOrder ?? 0,
      }),
    });

    return unwrapData(response, "Unable to reactivate farming row.");
  },
};

export default farmManagementService;
