import { useCallback, useEffect, useState } from "react";

import systemAdminService from "../../services/systemAdminService";
import { DataTable, Panel, SystemPage, SystemState } from "../../components/system/SystemChrome";
import { formatWhen, statusClass } from "./deviceModel";

const EMPTY_FORM = {
  name: "",
  modelName: "",
  version: "",
  deviceLabel: "",
  confidenceThreshold: "0.75",
  frameSamplingFps: "2",
  batchSize: "4",
  detectionClassesJson: "[]",
};

function AiServices() {
  const [services, setServices] = useState([]);
  const [detections, setDetections] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deployVersion, setDeployVersion] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [serviceRows, detectionRows] = await Promise.all([
        systemAdminService.getAiServices(),
        systemAdminService.getDetections(),
      ]);
      setServices(serviceRows);
      setDetections(detectionRows);
    } catch (loadError) {
      setError(loadError?.message || "Không tải được dịch vụ AI.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createService = async (event) => {
    event.preventDefault();
    setActionError("");
    try {
      await systemAdminService.createAiService({
        name: form.name.trim(),
        modelName: form.modelName.trim(),
        version: form.version.trim(),
        deviceLabel: form.deviceLabel.trim() || null,
        confidenceThreshold: Number(form.confidenceThreshold),
        frameSamplingFps: Number(form.frameSamplingFps),
        batchSize: Number(form.batchSize),
        detectionClassesJson: form.detectionClassesJson.trim() || "[]",
      });
      setForm(EMPTY_FORM);
      await load();
    } catch (saveError) {
      setActionError(saveError?.message || "Không tạo được dịch vụ AI.");
    }
  };

  const act = async (id, action) => {
    setActionError("");
    try {
      if (action === "restart") await systemAdminService.restartAi(id);
      if (action === "stop") await systemAdminService.stopAi(id);
      if (action === "rollback") await systemAdminService.rollbackAi(id);
      if (action === "deploy") {
        if (!deployVersion.trim() || selectedId !== id) {
          setSelectedId(id);
          return;
        }
        await systemAdminService.deployAi(id, deployVersion.trim());
        setDeployVersion("");
      }
      await load();
    } catch (actionFailure) {
      setActionError(actionFailure?.message || "Thao tác AI thất bại.");
    }
  };

  return (
    <SystemPage
      title="AI Services"
      description="Dịch vụ AI chỉ hiện khi đã được đăng ký. Không có số GPU, độ chính xác hay thời gian suy luận vì backend không lưu các trường đó."
    >
      <SystemState loading={loading} error={error} onRetry={load}>
        <div className="space-y-4">
          {actionError ? <p className="text-sm text-[#FFB4B4]">{actionError}</p> : null}
          <Panel title="Register service">
            <form onSubmit={createService} className="grid gap-3 md:grid-cols-4">
              {["name", "modelName", "version", "deviceLabel"].map((key) => (
                <label key={key} className="text-xs text-[#9AAB9E]">
                  {key}
                  <input
                    required={key !== "deviceLabel"}
                    value={form[key]}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]"
                  />
                </label>
              ))}
              <button type="submit" className="h-10 self-end rounded-xl bg-[#77FF00] text-sm font-bold text-[#071007]">
                Thêm dịch vụ
              </button>
            </form>
          </Panel>
          <Panel title="Managed services">
            <DataTable
              empty="Chưa đăng ký dịch vụ AI."
              rows={services}
              columns={[
                { key: "name", label: "Service" },
                { key: "modelName", label: "Model" },
                { key: "version", label: "Version" },
                { key: "previousVersion", label: "Previous" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => <span className={statusClass(row.status)}>{row.status}</span>,
                },
                { key: "deviceLabel", label: "Device" },
                { key: "detectionCount", label: "Detections" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => act(row.id, "restart")}>Restart</button>
                      <button type="button" onClick={() => act(row.id, "stop")}>Stop</button>
                      <button type="button" onClick={() => act(row.id, "rollback")}>Rollback</button>
                      <button type="button" onClick={() => act(row.id, "deploy")}>
                        {selectedId === row.id ? "Confirm deploy" : "Deploy"}
                      </button>
                    </div>
                  ),
                },
              ]}
            />
            {selectedId ? (
              <label className="mt-3 block text-xs text-[#9AAB9E]">
                Version to deploy
                <input
                  value={deployVersion}
                  onChange={(event) => setDeployVersion(event.target.value)}
                  className="mt-1 h-10 max-w-xs rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]"
                />
              </label>
            ) : null}
          </Panel>
          <Panel title="Recent detections">
            <DataTable
              empty="Chưa có detection."
              rows={detections}
              columns={[
                { key: "detectedAt", label: "Time", render: (row) => formatWhen(row.detectedAt) },
                { key: "detectionType", label: "Type" },
                { key: "modelVersion", label: "Model" },
                {
                  key: "confidence",
                  label: "Confidence",
                  render: (row) => (row.confidence == null ? "—" : Number(row.confidence).toFixed(2)),
                },
                { key: "status", label: "Status" },
                { key: "deviceCode", label: "Device", render: (row) => row.deviceCode || "—" },
              ]}
            />
          </Panel>
        </div>
      </SystemState>
    </SystemPage>
  );
}

export default AiServices;
