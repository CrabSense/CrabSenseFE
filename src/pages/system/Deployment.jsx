import { useCallback, useEffect, useState } from "react";

import systemAdminService from "../../services/systemAdminService";
import { DataTable, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatWhen, statusClass } from "./deviceModel";

function Deployment() {
  const [versions, setVersions] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    component: "Backend API",
    version: "",
    environment: "Staging",
  });
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [versionRows, deploymentRows] = await Promise.all([
        systemAdminService.getVersions(),
        systemAdminService.getDeployments(),
      ]);
      setVersions(versionRows);
      setHistory(deploymentRows);
    } catch (loadError) {
      setError(loadError?.message || "Không tải được triển khai.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deploy = async (event) => {
    event.preventDefault();
    setNotice("");
    try {
      const result = await systemAdminService.deploy(form);
      setNotice(result?.message || "Đã ghi bản triển khai. Binary không được phát hành từ API này.");
      setForm({ ...form, version: "" });
      await load();
    } catch (deployError) {
      setNotice(deployError?.message || "Không ghi được triển khai.");
    }
  };

  const rollback = async (row) => {
    setNotice("");
    try {
      await systemAdminService.rollback({
        component: row.component,
        environment: row.environment,
      });
      await load();
    } catch (rollbackError) {
      setNotice(rollbackError?.message || "Không rollback được.");
    }
  };

  const restart = async (component) => {
    setNotice("");
    try {
      const result = await systemAdminService.requestRestart(component);
      setNotice(result?.message || "Đã ghi yêu cầu restart. Tiến trình API không bị tắt.");
      await load();
    } catch (restartError) {
      setNotice(restartError?.message || "Không ghi được yêu cầu restart.");
    }
  };

  return (
    <SystemPage
      title="Deployment"
      description="Phiên bản backend lấy từ assembly đang chạy. Deploy và rollback chỉ ghi lịch sử, không phát hành binary."
    >
      <SystemState loading={loading} error={error} onRetry={load}>
        <div className="space-y-4">
          {notice ? <p className="text-sm text-[#F5C451]">{notice}</p> : null}
          <Panel title="Current versions">
            <DataTable
              empty="Không đọc được phiên bản."
              rows={versions.map((row) => ({ ...row, id: row.component }))}
              columns={[
                { key: "component", label: "Component" },
                { key: "version", label: "Version" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => <span className={statusClass(row.status)}>{row.status}</span>,
                },
                { key: "source", label: "Source" },
                {
                  key: "restart",
                  label: "Restart",
                  render: (row) => (
                    <button type="button" onClick={() => restart(row.component)} className="text-[#77FF00]">
                      Request restart
                    </button>
                  ),
                },
              ]}
            />
          </Panel>
          <Panel title="Record deployment">
            <form onSubmit={deploy} className="grid gap-3 md:grid-cols-4">
              <label className="text-xs text-[#9AAB9E]">
                Component
                <input
                  required
                  value={form.component}
                  onChange={(event) => setForm({ ...form, component: event.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                />
              </label>
              <label className="text-xs text-[#9AAB9E]">
                Version
                <input
                  required
                  value={form.version}
                  onChange={(event) => setForm({ ...form, version: event.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                />
              </label>
              <label className="text-xs text-[#9AAB9E]">
                Environment
                <select
                  value={form.environment}
                  onChange={(event) => setForm({ ...form, environment: event.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                >
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </label>
              <button
                type="submit"
                className={[
                  "h-10 self-end rounded-xl text-sm font-bold",
                  form.environment === "Production"
                    ? "bg-[#F5C451] text-[#1A1404]"
                    : "bg-[#77FF00] text-[#071007]",
                ].join(" ")}
              >
                {form.environment === "Production" ? "Record production" : "Record staging"}
              </button>
            </form>
          </Panel>
          <Panel title="Deployment history">
            <DataTable
              empty="Chưa có lịch sử triển khai."
              rows={history}
              columns={[
                { key: "deployedAt", label: "Time", render: (row) => formatWhen(row.deployedAt) },
                { key: "component", label: "Component" },
                { key: "version", label: "Version" },
                {
                  key: "environment",
                  label: "Environment",
                  render: (row) => (
                    <span className={row.environment === "Production" ? "font-bold text-[#F5C451]" : ""}>
                      {row.environment}
                    </span>
                  ),
                },
                { key: "status", label: "Status" },
                { key: "deployedBy", label: "By" },
                {
                  key: "rollback",
                  label: "Rollback",
                  render: (row) => (
                    <button type="button" onClick={() => rollback(row)} className="text-[#F5C451]">
                      Rollback
                    </button>
                  ),
                },
              ]}
            />
          </Panel>
        </div>
      </SystemState>
    </SystemPage>
  );
}

export default Deployment;
