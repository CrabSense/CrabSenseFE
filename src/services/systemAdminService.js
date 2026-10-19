import fetchAPI from "./api";

function unwrapList(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function unwrapData(response) {
  return response?.data ?? response ?? null;
}

const systemAdminService = {
  async getDevices() {
    return unwrapList(await fetchAPI("/devices"));
  },

  async getDevice(id) {
    return unwrapData(await fetchAPI(`/devices/${id}`));
  },

  async createDevice(body) {
    return unwrapData(
      await fetchAPI("/devices", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  },

  async deleteDevice(id) {
    return unwrapData(await fetchAPI(`/devices/${id}`, { method: "DELETE" }));
  },

  async updateDevice(id, body) {
    return unwrapData(
      await fetchAPI(`/devices/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  },

  async createSensor(body) {
    return unwrapData(
      await fetchAPI("/sensors", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  },

  async updateSensor(id, body) {
    return unwrapData(
      await fetchAPI(`/sensors/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  },

  async deleteSensor(id) {
    return unwrapData(await fetchAPI(`/sensors/${id}`, { method: "DELETE" }));
  },

  async getSensors() {
    return unwrapList(await fetchAPI("/sensors"));
  },

  async getAlerts(activeOnly = false) {
    return unwrapList(await fetchAPI(`/alerts?activeOnly=${activeOnly}`));
  },

  async getAlertCount() {
    return unwrapData(await fetchAPI("/alerts/unread/count"));
  },

  async getDetections() {
    return unwrapList(await fetchAPI("/ai/detections?take=100"));
  },

  async getMedia() {
    return unwrapList(await fetchAPI("/media"));
  },

  async getBackups() {
    return unwrapList(await fetchAPI("/admin/db/backups"));
  },

  async createBackup() {
    return unwrapData(
      await fetchAPI("/admin/db/backup", {
        method: "POST",
      }),
    );
  },

  async restoreBackup(fileName) {
    return unwrapData(
      await fetchAPI(
        `/admin/db/backups/${encodeURIComponent(fileName)}/restore?confirm=RESTORE`,
        { method: "POST" },
      ),
    );
  },

  async getHealth() {
    return unwrapData(await fetchAPI("/system/health"));
  },

  async getServices() {
    return unwrapList(await fetchAPI("/system/services"));
  },

  async getMetrics() {
    return unwrapData(await fetchAPI("/system/metrics"));
  },

  async getVersions() {
    return unwrapList(await fetchAPI("/system/versions"));
  },

  async getDeployments() {
    return unwrapList(await fetchAPI("/system/deployments"));
  },

  async deploy(body) {
    return fetchAPI("/system/deploy", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async rollback(body) {
    return fetchAPI("/system/rollback", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async requestRestart(component) {
    return fetchAPI(`/system/restart?component=${encodeURIComponent(component)}`, {
      method: "POST",
    });
  },

  async getLogs(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const suffix = query.toString() ? `?${query}` : "";
    return unwrapList(await fetchAPI(`/system/logs${suffix}`));
  },

  async restartDevice(id) {
    return unwrapData(await fetchAPI(`/devices/${id}/restart`, { method: "POST" }));
  },

  async updateFirmware(id, firmwareVersion) {
    return unwrapData(
      await fetchAPI(`/devices/${id}/firmware`, {
        method: "POST",
        body: JSON.stringify({ firmwareVersion }),
      }),
    );
  },

  async disableDevice(id) {
    return unwrapData(await fetchAPI(`/devices/${id}/disable`, { method: "POST" }));
  },

  async getDiagnostics(id) {
    return unwrapData(await fetchAPI(`/devices/${id}/diagnostics`));
  },

  async testConnection(id) {
    return unwrapData(await fetchAPI(`/devices/${id}/test-connection`, { method: "POST" }));
  },

  async getDeviceLogs(id) {
    return unwrapList(await fetchAPI(`/devices/${id}/logs`));
  },

  async getRecordingSchedules() {
    return unwrapList(await fetchAPI("/cameras/recording-schedules"));
  },

  async saveRecording(id, body) {
    return unwrapData(
      await fetchAPI(`/cameras/${id}/recording`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  },

  async getRecordings(deviceId) {
    const suffix = deviceId ? `?deviceId=${deviceId}` : "";
    return unwrapList(await fetchAPI(`/cameras/recordings${suffix}`));
  },

  async getAiServices() {
    return unwrapList(await fetchAPI("/ai/services"));
  },

  async createAiService(body) {
    return unwrapData(
      await fetchAPI("/ai/services", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  },

  async restartAi(id) {
    return unwrapData(await fetchAPI(`/ai/services/${id}/restart`, { method: "POST" }));
  },

  async stopAi(id) {
    return unwrapData(await fetchAPI(`/ai/services/${id}/stop`, { method: "POST" }));
  },

  async deployAi(id, version) {
    return unwrapData(
      await fetchAPI(`/ai/services/${id}/deploy`, {
        method: "POST",
        body: JSON.stringify({ version }),
      }),
    );
  },

  async rollbackAi(id) {
    return unwrapData(await fetchAPI(`/ai/services/${id}/rollback`, { method: "POST" }));
  },

  async getStorageCapacity() {
    return unwrapData(await fetchAPI("/storage/capacity"));
  },

  async getStorageUsage() {
    return unwrapList(await fetchAPI("/storage/usage"));
  },

  async getStorageHistory(days = 30) {
    return unwrapList(await fetchAPI(`/storage/usage-history?days=${days}`));
  },

  async getBackupSchedule() {
    return unwrapData(await fetchAPI("/admin/db/backup-schedule"));
  },

  async saveBackupSchedule(body) {
    return unwrapData(
      await fetchAPI("/admin/db/backup-schedule", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  },

  async getSecurityOverview() {
    return unwrapData(await fetchAPI("/security/overview"));
  },

  async getSessions() {
    return unwrapList(await fetchAPI("/security/sessions"));
  },

  async terminateSession(userId) {
    return unwrapData(
      await fetchAPI(`/security/sessions/${userId}`, { method: "DELETE" }),
    );
  },

  async getApiKeys() {
    return unwrapList(await fetchAPI("/security/api-keys"));
  },

  async createApiKey(name) {
    return unwrapData(
      await fetchAPI("/security/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    );
  },

  async rotateApiKey(id) {
    return unwrapData(
      await fetchAPI(`/security/api-keys/${id}/rotate`, { method: "POST" }),
    );
  },

  async revokeApiKey(id) {
    return unwrapData(await fetchAPI(`/security/api-keys/${id}`, { method: "DELETE" }));
  },

  async getSecurityPolicy() {
    return unwrapData(await fetchAPI("/security/policies"));
  },

  async saveSecurityPolicy(body) {
    return unwrapData(
      await fetchAPI("/security/policies", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  },

  async getAuditLogs() {
    return unwrapList(await fetchAPI("/security/audit-logs"));
  },
};

export default systemAdminService;
