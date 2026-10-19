import { useCallback, useEffect, useState } from "react";

import systemAdminService from "../../services/systemAdminService";
import { DataTable, KpiGrid, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatWhen } from "./deviceModel";

function SecurityAccess() {
  const [overview, setOverview] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [keys, setKeys] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [keyName, setKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [overviewRow, sessionRows, keyRows, policyRow] = await Promise.all([
        systemAdminService.getSecurityOverview(),
        systemAdminService.getSessions(),
        systemAdminService.getApiKeys(),
        systemAdminService.getSecurityPolicy(),
      ]);
      setOverview(overviewRow);
      setSessions(sessionRows);
      setKeys(keyRows);
      setPolicy(policyRow);
    } catch (loadError) {
      setError(loadError?.message || "Không tải được bảo mật.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createKey = async (event) => {
    event.preventDefault();
    setActionError("");
    try {
      const created = await systemAdminService.createApiKey(keyName.trim());
      setRevealedKey(created?.key || "");
      setKeyName("");
      await load();
    } catch (createError) {
      setActionError(createError?.message || "Không tạo được API key.");
    }
  };

  const rotate = async (id) => {
    setActionError("");
    try {
      const rotated = await systemAdminService.rotateApiKey(id);
      setRevealedKey(rotated?.key || "");
      await load();
    } catch (rotateError) {
      setActionError(rotateError?.message || "Không xoay được API key.");
    }
  };

  const revoke = async (id) => {
    setActionError("");
    try {
      await systemAdminService.revokeApiKey(id);
      await load();
    } catch (revokeError) {
      setActionError(revokeError?.message || "Không thu hồi được API key.");
    }
  };

  const terminate = async (userId) => {
    setActionError("");
    try {
      await systemAdminService.terminateSession(userId);
      await load();
    } catch (terminateError) {
      setActionError(terminateError?.message || "Không kết thúc được phiên.");
    }
  };

  const savePolicy = async (event) => {
    event.preventDefault();
    setActionError("");
    try {
      await systemAdminService.saveSecurityPolicy({
        sessionDays: Number(policy.sessionDays),
        failedLoginAlertThreshold: Number(policy.failedLoginAlertThreshold),
        requireConfirmRestore: Boolean(policy.requireConfirmRestore),
      });
      await load();
    } catch (saveError) {
      setActionError(saveError?.message || "Không lưu được chính sách.");
    }
  };

  return (
    <SystemPage
      title="Security & Access"
      description="Phiên đang hoạt động là tài khoản còn refresh token. Khóa bí mật chỉ hiện một lần lúc tạo hoặc xoay."
    >
      <SystemState loading={loading} error={error} onRetry={load}>
        <div className="space-y-4">
          {actionError ? <p className="text-sm text-[#FFB4B4]">{actionError}</p> : null}
          <KpiGrid
            items={[
              { label: "Failed logins 24h", value: overview?.failedLogins ?? 0, hint: "OperationLogs LoginFailed" },
              { label: "Active sessions", value: overview?.activeSessions ?? 0 },
              { label: "API keys", value: overview?.apiKeys ?? 0, hint: "Chưa thu hồi" },
              { label: "Security alerts", value: overview?.securityAlerts ?? 0, hint: "Cảnh báo đang active" },
            ]}
          />
          <Panel title="Sessions">
            <DataTable
              empty="Không có phiên còn hạn."
              rows={sessions.map((session) => ({ ...session, id: session.userId }))}
              columns={[
                { key: "username", label: "User" },
                { key: "role", label: "Role" },
                { key: "ipAddress", label: "IP" },
                { key: "userAgent", label: "Agent" },
                {
                  key: "lastActivityAt",
                  label: "Last activity",
                  render: (row) => formatWhen(row.lastActivityAt),
                },
                {
                  key: "end",
                  label: "Action",
                  render: (row) => (
                    <button type="button" onClick={() => terminate(row.userId)} className="text-[#FFB4B4]">
                      Terminate
                    </button>
                  ),
                },
              ]}
            />
          </Panel>
          <Panel title="API keys">
            <form onSubmit={createKey} className="mb-3 flex flex-wrap gap-2">
              <input
                required
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                placeholder="Tên khóa"
                className="h-10 rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
              />
              <button type="submit" className="rounded-xl bg-[#77FF00] px-4 text-sm font-bold text-[#071007]">
                Create key
              </button>
            </form>
            {revealedKey ? (
              <p className="mb-3 break-all rounded-xl border border-[#F5C451]/40 bg-[#F5C451]/10 p-3 font-mono text-sm text-[#F5C451]">
                Sao chép ngay. Khóa này không hiện lại: {revealedKey}
              </p>
            ) : null}
            <DataTable
              empty="Chưa có API key."
              rows={keys}
              columns={[
                { key: "name", label: "Name" },
                { key: "prefix", label: "Prefix" },
                { key: "createdAt", label: "Created", render: (row) => formatWhen(row.createdAt) },
                { key: "lastUsedAt", label: "Last used", render: (row) => formatWhen(row.lastUsedAt) },
                { key: "revoked", label: "Revoked", render: (row) => (row.revoked ? "Yes" : "No") },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) =>
                    row.revoked ? null : (
                      <div className="flex gap-3">
                        <button type="button" onClick={() => rotate(row.id)}>Rotate</button>
                        <button type="button" onClick={() => revoke(row.id)} className="text-[#FFB4B4]">
                          Revoke
                        </button>
                      </div>
                    ),
                },
              ]}
            />
          </Panel>
          {policy ? (
            <Panel title="Policies">
              <form onSubmit={savePolicy} className="grid gap-3 md:grid-cols-3">
                <label className="text-xs text-[#9AAB9E]">
                  Session days
                  <input
                    type="number"
                    value={policy.sessionDays}
                    onChange={(event) => setPolicy({ ...policy, sessionDays: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                  />
                </label>
                <label className="text-xs text-[#9AAB9E]">
                  Failed login alert threshold
                  <input
                    type="number"
                    value={policy.failedLoginAlertThreshold}
                    onChange={(event) =>
                      setPolicy({ ...policy, failedLoginAlertThreshold: event.target.value })
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                  />
                </label>
                <label className="flex items-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(policy.requireConfirmRestore)}
                    onChange={(event) =>
                      setPolicy({ ...policy, requireConfirmRestore: event.target.checked })
                    }
                  />
                  Require confirm restore
                </label>
                <button type="submit" className="h-10 rounded-xl bg-[#77FF00] text-sm font-bold text-[#071007]">
                  Lưu chính sách
                </button>
              </form>
            </Panel>
          ) : null}
        </div>
      </SystemState>
    </SystemPage>
  );
}

export default SecurityAccess;
