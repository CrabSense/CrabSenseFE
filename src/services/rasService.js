
import fetchAPI from "./api";

function unwrap(response) {
  if (!response?.success) {
    throw new Error(response?.message || "API request failed.");
  }

  return response.data;
}

const areaPath = (areaId) =>
  `/areas/${encodeURIComponent(areaId)}/ras-flow`;

const rasService = {
  async getDiagram(areaId) {
    return unwrap(await fetchAPI(areaPath(areaId)));
  },

  async addNode(areaId, payload) {
    return unwrap(
      await fetchAPI(`${areaPath(areaId)}/nodes`, {
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
  },

  async deleteNode(areaId, nodeId) {
    return unwrap(
      await fetchAPI(
        `${areaPath(areaId)}/nodes/${encodeURIComponent(nodeId)}`,
        { method: "DELETE" }
      )
    );
  },

  async addFlow(areaId, payload) {
    return unwrap(
      await fetchAPI(`${areaPath(areaId)}/flows`, {
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
  },

  async deleteFlow(areaId, flowId) {
    return unwrap(
      await fetchAPI(
        `${areaPath(areaId)}/flows/${encodeURIComponent(flowId)}`,
        { method: "DELETE" }
      )
    );
  },

  async reorder(areaId, nodeIds) {
    return unwrap(
      await fetchAPI(`${areaPath(areaId)}/reorder`, {
        method: "POST",
        body: JSON.stringify({ nodeIds }),
      })
    );
  },

  async updateRelay(areaId, nodeId, payload) {
    return unwrap(
      await fetchAPI(
        `${areaPath(areaId)}/nodes/${encodeURIComponent(nodeId)}/relay`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      )
    );
  },

  async command(areaId, nodeId, command) {
    return unwrap(
      await fetchAPI(
        `${areaPath(areaId)}/nodes/${encodeURIComponent(nodeId)}/command`,
        {
          method: "POST",
          body: JSON.stringify({ command }),
        }
      )
    );
  },
};

export default rasService;
