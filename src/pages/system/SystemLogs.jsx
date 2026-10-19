import { useCallback, useEffect, useState } from "react";

import systemAdminService from "../../services/systemAdminService";
import { DataTable, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatWhen, statusClass } from "./deviceModel";

const SOURCES = ["", "system", "alert", "ai", "security"];

function SystemLogs() {
  const [tab, setTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [audit, setAudit] = useState([]);
  const [source, setSource] = useState("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [logRows, auditRows] = await Promise.all([
        systemAdminService.getLogs({ source, severity, search }),
        systemAdminService.getAuditLogs(),
      ]);
      setLogs(logRows);
      setAudit(auditRows);
    } catch (loadError) {
      setError(loadError?.message || "Không tải được nhật ký.");
    } finally {
      setLoading(false);
    }
  }, [search, severity, source]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SystemPage
      title="System Logs"
      description="Nhật ký đọc từ operation log, cảnh báo, detection và đăng nhập. Audit chỉ xem, không sửa và không xóa."
    >
      <SystemState loading={loading} error={error} onRetry={load}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("logs")}
              className={tab === "logs" ? "rounded-full bg-[#77FF00] px-3 py-1 text-xs font-bold text-[#071007]" : "rounded-full bg-white/5 px-3 py-1 text-xs"}
            >
              Logs
            </button>
            <button
              type="button"
              onClick={() => setTab("audit")}
              className={tab === "audit" ? "rounded-full bg-[#77FF00] px-3 py-1 text-xs font-bold text-[#071007]" : "rounded-full bg-white/5 px-3 py-1 text-xs"}
            >
              Audit
            </button>
          </div>
          {tab === "logs" ? (
            <Panel title="Logs">
              <div className="mb-3 flex flex-wrap gap-2">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm nội dung"
                  className="h-10 rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                />
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                >
                  {SOURCES.map((item) => (
                    <option key={item || "all"} value={item}>{item || "all sources"}</option>
                  ))}
                </select>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
                >
                  <option value="">all severity</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
              <DataTable
                empty="Không có log khớp bộ lọc."
                rows={logs}
                columns={[
                  { key: "at", label: "Time", render: (row) => formatWhen(row.at) },
                  {
                    key: "severity",
                    label: "Severity",
                    render: (row) => <span className={statusClass(row.severity)}>{row.severity}</span>,
                  },
                  { key: "source", label: "Source" },
                  { key: "message", label: "Message" },
                  { key: "actor", label: "Actor" },
                  { key: "ipAddress", label: "IP" },
                ]}
              />
            </Panel>
          ) : (
            <Panel title="Audit log">
              <DataTable
                empty="Chưa có audit log."
                rows={audit}
                columns={[
                  { key: "at", label: "Time", render: (row) => formatWhen(row.at) },
                  { key: "actor", label: "Actor" },
                  { key: "message", label: "Action" },
                  { key: "target", label: "Target" },
                  { key: "ipAddress", label: "IP" },
                ]}
              />
            </Panel>
          )}
        </div>
      </SystemState>
    </SystemPage>
  );
}

export default SystemLogs;
