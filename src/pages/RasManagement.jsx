
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Waves,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Cable,
  Unplug,
  Save,
  X,
  Power,
  AlertTriangle,
} from "lucide-react";

import rasService from "../services/rasService";
import useSelectedArea from "../hooks/useSelectedArea";

const panel =
  "rounded-xl border border-[#24382A] bg-[#0D1510] p-5";

const field =
  "w-full rounded-lg border border-[#38513B] bg-[#050806] " +
  "px-3 py-2 text-sm text-[#F4F7F4] outline-none " +
  "focus:border-[#77FF00] disabled:opacity-50";

const button =
  "inline-flex items-center justify-center gap-2 rounded-lg " +
  "border border-[#38513B] px-3 py-2 text-sm text-[#E3ECE4] " +
  "hover:border-[#77FF00] disabled:cursor-not-allowed disabled:opacity-40";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg " +
  "bg-[#77FF00] px-4 py-2 text-sm font-semibold text-[#050806] " +
  "hover:bg-[#63E600] disabled:cursor-not-allowed disabled:opacity-40";

const emptyRelay = {
  relayDeviceId: "",
  relayDeviceCode: "",
  relayChannel: "",
  paramDefaultsJson: "",
};

const emptyNode = {
  nodeCode: "",
  displayLabel: "",
  type: "",
  sortOrder: 0,
};

const emptyFlow = {
  fromComponentId: "",
  toComponentId: "",
};

const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function nodeName(node) {
  return node?.name || node?.displayLabel || node?.code || "Unknown node";
}

function displayValue(value) {
  return value === null || value === undefined || value === ""
    ? "—"
    : String(value);
}

export default function RasManagement() {
  const { areas = [], selectedAreaId } = useSelectedArea();

  const [areaId, setAreaId] = useState(selectedAreaId || "");
  const [diagram, setDiagram] = useState(null);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [nodeForm, setNodeForm] = useState({ ...emptyNode });
  const [flowForm, setFlowForm] = useState({ ...emptyFlow });

  const [editingRelayNode, setEditingRelayNode] = useState(null);
  const [relayForm, setRelayForm] = useState({ ...emptyRelay });

  // Prevent an old request from overwriting a newer area's diagram.
  const requestIdRef = useRef(0);
  const areaIdRef = useRef(areaId);
  areaIdRef.current = areaId;

  useEffect(() => {
    setAreaId(selectedAreaId || "");
  }, [selectedAreaId]);

  const load = useCallback(async () => {
    const requestedAreaId = areaId;
    const requestId = ++requestIdRef.current;

    if (!requestedAreaId) {
      setDiagram(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await rasService.getDiagram(requestedAreaId);

      if (
        requestId !== requestIdRef.current ||
        areaIdRef.current !== requestedAreaId
      ) {
        return;
      }

      setDiagram(response);
    } catch (err) {
      if (
        requestId !== requestIdRef.current ||
        areaIdRef.current !== requestedAreaId
      ) {
        return;
      }

      setDiagram(null);
      setError(err.message || "Không tải được sơ đồ RAS.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [areaId]);

  useEffect(() => {
    setDiagram(null);
    setEditingRelayNode(null);
    setFlowForm({ ...emptyFlow });
    load();
  }, [load]);

  const nodes = useMemo(
    () => (Array.isArray(diagram?.nodes) ? diagram.nodes : []),
    [diagram]
  );

  const flows = useMemo(
    () => (Array.isArray(diagram?.flows) ? diagram.flows : []),
    [diagram]
  );

  const orderedNodes = useMemo(
    () =>
      [...nodes].sort(
        (a, b) =>
          (a.position ?? 0) - (b.position ?? 0) ||
          String(a.code || "").localeCompare(String(b.code || ""))
      ),
    [nodes]
  );

  // All mutations go through one handler.
  const execute = async (operation, successMessage) => {
    if (!areaId || busy || loading) return false;

    const operationAreaId = areaId;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await operation(operationAreaId);

      if (areaIdRef.current === operationAreaId) {
        await load();
        setNotice(successMessage);
      }

      return true;
    } catch (err) {
      if (areaIdRef.current === operationAreaId) {
        setError(err.message || "Thao tác thất bại.");
      }
      return false;
    } finally {
      setBusy(false);
    }
  };

  // --------------------------------------
  // CREATE NODE
  // --------------------------------------

  const addNode = async (event) => {
    event.preventDefault();

    const nodeCode = nodeForm.nodeCode.trim();
    const displayLabel = nodeForm.displayLabel.trim();

    if (!nodeCode || !displayLabel) {
      setError("Node Code và Display Label bắt buộc.");
      return;
    }

    const payload = {
      nodeCode,
      displayLabel,
      type: nodeForm.type.trim() || null,
      sortOrder: Number(nodeForm.sortOrder) || 0,
    };

    const success = await execute(
      (id) => rasService.addNode(id, payload),
      "Đã thêm node RAS."
    );

    if (success) {
      setNodeForm({ ...emptyNode });
    }
  };

  // --------------------------------------
  // DELETE NODE
  // --------------------------------------

  const deleteNode = async (node) => {
    if (busy || loading) return;

    const confirmed = window.confirm(
      `Xóa node "${nodeName(node)}" và các Water Flow liên quan?\n\n` +
      "Thao tác này có thể ảnh hưởng cấu hình hệ thống RAS."
    );

    if (!confirmed) return;

    await execute(
      (id) => rasService.deleteNode(id, node.id),
      "Đã xóa node RAS."
    );
  };

  // --------------------------------------
  // CREATE FLOW
  // --------------------------------------

  const addFlow = async (event) => {
    event.preventDefault();

    const { fromComponentId, toComponentId } = flowForm;

    if (
      !fromComponentId ||
      !toComponentId ||
      fromComponentId === toComponentId
    ) {
      setError("Vui lòng chọn hai node khác nhau.");
      return;
    }

    const success = await execute(
      (id) =>
        rasService.addFlow(id, {
          fromComponentId,
          toComponentId,
        }),
      "Đã thêm Water Flow."
    );

    if (success) {
      setFlowForm({ ...emptyFlow });
    }
  };

  // --------------------------------------
  // DELETE FLOW
  // --------------------------------------

  const deleteFlow = async (flow) => {
    if (busy || loading) return;

    if (!window.confirm("Bạn có chắc muốn xóa đường kết nối này?")) {
      return;
    }

    await execute(
      (id) => rasService.deleteFlow(id, flow.id),
      "Đã xóa Water Flow."
    );
  };

  // --------------------------------------
  // RELAY ASSIGNMENT
  // --------------------------------------

  const openRelayEditor = (node) => {
    setEditingRelayNode(node);

    setRelayForm({
      relayDeviceId: node.relayDeviceId || "",
      relayDeviceCode: "",
      relayChannel: node.relayChannel || "",
      paramDefaultsJson: node.paramDefaultsJson || "",
    });

    setError("");
    setNotice("");
  };

  const changeRelay = (name, value) => {
    setRelayForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveRelayAssignment = async (event) => {
    event.preventDefault();

    if (!editingRelayNode || busy || loading) return;

    const relayDeviceId = relayForm.relayDeviceId.trim();
    const relayDeviceCode = relayForm.relayDeviceCode.trim();
    const relayChannel = relayForm.relayChannel.trim();
    const paramDefaultsJson = relayForm.paramDefaultsJson.trim();

    if (!relayDeviceId && !relayDeviceCode) {
      setError("Vui lòng nhập Controller Device ID hoặc Device Code.");
      return;
    }

    if (relayDeviceId && !GUID_REGEX.test(relayDeviceId)) {
      setError("Controller Device ID phải là GUID hợp lệ.");
      return;
    }

    if (!/^[1-9]\d*$/.test(relayChannel)) {
      setError("SSR Relay Channel phải là số nguyên dương.");
      return;
    }

    if (paramDefaultsJson) {
      try {
        const parsed = JSON.parse(paramDefaultsJson);

        if (
          parsed === null ||
          Array.isArray(parsed) ||
          typeof parsed !== "object"
        ) {
          throw new Error("Expected JSON object");
        }
      } catch {
        setError("Param Defaults JSON phải là JSON object hợp lệ.");
        return;
      }
    }

    const confirmed = window.confirm(
      `Cập nhật Relay Assignment cho "${nodeName(editingRelayNode)}"?\n\n` +
      "Backend sẽ cập nhật cấu hình và đặt lại trạng thái IsOn. " +
      "Điều này không xác nhận trạng thái phần cứng thực tế."
    );

    if (!confirmed) return;

    const nodeId = editingRelayNode.id;

    const payload = {
      relayDeviceId: relayDeviceId || null,
      relayDeviceCode: relayDeviceId
        ? null
        : relayDeviceCode || null,
      relayChannel,
      paramDefaultsJson: paramDefaultsJson || null,
    };

    const success = await execute(
      (id) => rasService.updateRelay(id, nodeId, payload),
      "Đã cập nhật Relay Assignment trên Backend."
    );

    if (success) {
      setEditingRelayNode(null);
      setRelayForm({ ...emptyRelay });
    }
  };

  const removeRelayAssignment = async (node) => {
    if (busy || loading) return;

    const confirmed = window.confirm(
      `Bỏ gán relay của "${nodeName(node)}"?\n\n` +
      "Cấu hình sẽ bị hủy trên Backend. " +
      "Thiết bị vật lý không nhất thiết đã tắt."
    );

    if (!confirmed) return;

    const success = await execute(
      (id) =>
        rasService.updateRelay(id, node.id, {
          relayDeviceId: null,
          relayDeviceCode: null,
          relayChannel: null,
          paramDefaultsJson: null,
        }),
      "Đã bỏ gán relay trên Backend."
    );

    if (success) {
      setEditingRelayNode(null);
      setRelayForm({ ...emptyRelay });
    }
  };

  // --------------------------------------
  // NODE REORDER
  // --------------------------------------

  const moveNode = async (nodeId, direction) => {
    if (busy || loading || !areaId) return;

    const currentIndex = orderedNodes.findIndex(
      (node) => node.id === nodeId
    );

    if (currentIndex < 0) return;

    const targetIndex = currentIndex + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= orderedNodes.length
    ) {
      return;
    }

    const reordered = [...orderedNodes];

    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];

    const nodeIds = reordered.map((node) => node.id);

    await execute(
      (id) => rasService.reorder(id, nodeIds),
      "Đã cập nhật thứ tự hiển thị node."
    );
  };

  // --------------------------------------
  // SEND CONTROL COMMAND
  // --------------------------------------

  const sendCommand = async (node, command) => {
    if (busy || loading || !node.hasRelay) return;

    const confirmed = window.confirm(
      `Gửi lệnh ${command.toUpperCase()} đến "${nodeName(node)}"?\n\n` +
      "Lệnh này có thể điều khiển thiết bị vật lý. " +
      "Chỉ tiếp tục khi hệ thống đã được kiểm tra an toàn."
    );

    if (!confirmed) return;

    await execute(
      (id) => rasService.command(id, node.id, command),
      "Backend đã tiếp nhận lệnh. Kiểm tra trạng thái thiết bị thực tế."
    );
  };

  return (
    <main className="mx-auto max-w-[1500px] space-y-5 text-[#F4F7F4]">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold">
            <Waves size={26} className="text-[#77FF00]" />
            RAS Management
          </h1>

          <p className="mt-2 text-sm text-[#91A394]">
            Quản lý hệ thống tuần hoàn nước theo Farming Area.
          </p>
        </div>

        <button
          type="button"
          className={button}
          disabled={!areaId || loading || busy}
          onClick={load}
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {/* AREA SELECTOR */}
      <section className={panel}>
        <label className="block space-y-2 text-sm">
          <span>Select Farming Area</span>

          <select
            className={field}
            value={areaId}
            disabled={busy}
            onChange={(event) => setAreaId(event.target.value)}
          >
            <option value="">Choose Farming Area</option>

            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.code} — {area.name}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-3 text-xs text-[#91A394]">
          Theo Backend hiện tại, lần đọc RAS đầu tiên có thể
          tự tạo WaterSystem và pipeline mặc định.
        </p>
      </section>

      {/* FEEDBACK */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-[#77FF00]/40 bg-[#77FF00]/5 p-4 text-sm text-[#77FF00]"
        >
          {notice}
        </div>
      )}

      {!areaId ? (
        <section className={panel}>
          Hãy chọn Farming Area để xem RAS.
        </section>
      ) : loading ? (
        <section className={panel}>
          Loading RAS diagram...
        </section>
      ) : !diagram ? (
        <section className={panel}>
          Không có dữ liệu RAS để hiển thị.
        </section>
      ) : (
        <>
          {/* RAS OVERVIEW */}
          <section className={panel}>
            <h2 className="text-lg font-semibold">
              {diagram.waterSystemName ||
                diagram.areaName ||
                "RAS Flow"}
            </h2>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#91A394]">
              <span>{nodes.length} nodes</span>
              <span>{flows.length} flows</span>
              <span>
                Flow Status: {diagram.flowStatus || "Unknown"}
              </span>
            </div>
          </section>

          {/* NODE CARDS */}
          <section className={panel}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                RAS Components
              </h2>
              <span className="text-sm text-[#91A394]">
                {nodes.length} nodes
              </span>
            </div>

            {orderedNodes.length === 0 ? (
              <p className="text-sm text-[#91A394]">
                No RAS nodes available.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {orderedNodes.map((node) => (
                  <article
                    key={node.id}
                    className="rounded-xl border border-[#38513B] bg-[#071009] p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {nodeName(node)}
                        </h3>
                        <p className="mt-1 text-xs text-[#91A394]">
                          {node.code} · {displayValue(node.type)}
                        </p>
                      </div>

                      <span className="text-xs text-[#91A394]">
                        {displayValue(node.status)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        {node.metricLabel ||
                          node.metric ||
                          "No metric"}
                      </p>

                      {node.tempC != null && (
                        <p className="text-[#91A394]">
                          Temperature: {node.tempC} °C
                        </p>
                      )}

                      {node.flowLph != null && (
                        <p className="text-[#91A394]">
                          Flow: {node.flowLph} L/h
                        </p>
                      )}
                    </div>

                    {/* RELAY STATUS */}
                    <div className="mt-4 border-t border-[#24382A] pt-4">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Cable size={15} />
                        Relay Configuration
                      </h4>

                      <div className="space-y-1 text-xs text-[#91A394]">
                        <p>
                          Controller:{" "}
                          {displayValue(node.relayDeviceId)}
                        </p>
                        <p>
                          Channel:{" "}
                          {displayValue(node.relayChannel)}
                        </p>
                        <p>
                          Assignment:{" "}
                          {node.hasRelay ? "Assigned" : "Not assigned"}
                        </p>
                        <p>
                          Mode:{" "}
                          {displayValue(node.controlMode)}
                        </p>
                        <p>
                          Reported IsOn:{" "}
                          {node.isOn == null
                            ? "Unknown"
                            : node.isOn
                              ? "ON"
                              : "OFF"}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={button}
                          disabled={busy}
                          onClick={() => openRelayEditor(node)}
                        >
                          <Cable size={15} />
                          Configure
                        </button>

                        {node.hasRelay && (
                          <button
                            type="button"
                            className={`${button} text-red-400`}
                            disabled={busy}
                            onClick={() =>
                              removeRelayAssignment(node)
                            }
                          >
                            <Unplug size={15} />
                            Unassign
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DEVICE COMMANDS */}
                    {node.hasRelay && (
                      <div className="mt-4 border-t border-[#24382A] pt-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                          <Power size={15} />
                          Device Control
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {["on", "off", "auto"].map((command) => (
                            <button
                              key={command}
                              type="button"
                              className={button}
                              disabled={busy}
                              onClick={() =>
                                sendCommand(node, command)
                              }
                            >
                              {command.toUpperCase()}
                            </button>
                          ))}
                        </div>

                        <p className="mt-2 text-xs text-amber-300">
                          Lệnh có thể tác động đến phần cứng thật.
                        </p>
                      </div>
                    )}

                    <div className="mt-4 border-t border-[#24382A] pt-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-xs text-red-400 disabled:opacity-40"
                        disabled={busy}
                        onClick={() => deleteNode(node)}
                      >
                        <Trash2 size={14} />
                        Delete Node
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* RELAY EDITOR */}
          {editingRelayNode && (
            <section className={`${panel} space-y-5`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#77FF00]">
                    <Cable size={20} />
                    Relay Assignment
                  </h2>

                  <p className="mt-1 text-sm text-[#91A394]">
                    {nodeName(editingRelayNode)}
                  </p>
                </div>

                <button
                  type="button"
                  className={button}
                  disabled={busy}
                  onClick={() => setEditingRelayNode(null)}
                >
                  <X size={17} />
                </button>
              </div>

              <form
                onSubmit={saveRelayAssignment}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2 text-sm">
                    <span>Controller Device ID (GUID)</span>
                    <input
                      className={field}
                      value={relayForm.relayDeviceId}
                      placeholder="Device GUID"
                      onChange={(event) =>
                        changeRelay(
                          "relayDeviceId",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="block space-y-2 text-sm">
                    <span>Controller Device Code</span>
                    <input
                      className={field}
                      value={relayForm.relayDeviceCode}
                      placeholder="Device Code from Backend"
                      disabled={Boolean(
                        relayForm.relayDeviceId.trim()
                      )}
                      onChange={(event) =>
                        changeRelay(
                          "relayDeviceCode",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <p className="text-xs text-[#91A394]">
                  Nhập Device ID hoặc Device Code.
                  Backend ưu tiên Device ID nếu có.
                </p>

                <label className="block space-y-2 text-sm">
                  <span>SSR Relay Channel</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    className={field}
                    value={relayForm.relayChannel}
                    onChange={(event) =>
                      changeRelay(
                        "relayChannel",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="block space-y-2 text-sm">
                  <span>Param Defaults JSON (Optional)</span>

                  <textarea
                    rows={5}
                    className={`${field} font-mono`}
                    value={relayForm.paramDefaultsJson}
                    placeholder="JSON object from backend configuration"
                    onChange={(event) =>
                      changeRelay(
                        "paramDefaultsJson",
                        event.target.value
                      )
                    }
                  />
                </label>

                <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-200">
                  <AlertTriangle size={17} className="shrink-0" />
                  <span>
                    Cập nhật relay có thể thay đổi trạng thái
                    lưu trong Backend. Không được xem đây là
                    xác nhận thiết bị vật lý đã bật hoặc tắt.
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className={primaryButton}
                    disabled={busy}
                  >
                    <Save size={16} />
                    Save Assignment
                  </button>

                  <button
                    type="button"
                    className={button}
                    disabled={busy}
                    onClick={() => setEditingRelayNode(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* NODE REORDER */}
          <section className={panel}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                RAS Node Display Order
              </h2>

              <p className="mt-2 text-sm text-[#91A394]">
                Di chuyển node lên hoặc xuống.
                Backend chỉ thay đổi Position,
                không thay đổi Water Flow.
              </p>
            </div>

            {orderedNodes.length === 0 ? (
              <p className="text-sm text-[#91A394]">
                No nodes available.
              </p>
            ) : (
              <div className="space-y-2">
                {orderedNodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#304736] bg-[#071009] p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#77FF00]/10 font-semibold text-[#77FF00]">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {nodeName(node)}
                        </p>

                        <p className="text-xs text-[#91A394]">
                          {node.code} · {displayValue(node.type)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className={button}
                        aria-label={`Move ${nodeName(node)} up`}
                        title="Move up"
                        disabled={
                          busy ||
                          loading ||
                          index === 0
                        }
                        onClick={() => moveNode(node.id, -1)}
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        className={button}
                        aria-label={`Move ${nodeName(node)} down`}
                        title="Move down"
                        disabled={
                          busy ||
                          loading ||
                          index === orderedNodes.length - 1
                        }
                        onClick={() => moveNode(node.id, 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* WATER FLOWS */}
          <section className={panel}>
            <h2 className="mb-4 text-lg font-semibold">
              Water Flow Connections
            </h2>

            {flows.length === 0 ? (
              <p className="text-sm text-[#91A394]">
                No connections found.
              </p>
            ) : (
              <div className="space-y-3">
                {flows.map((flow) => {
                  const from = nodes.find(
                    (node) =>
                      node.id === flow.fromComponentId
                  );

                  const to = nodes.find(
                    (node) =>
                      node.id === flow.toComponentId
                  );

                  return (
                    <div
                      key={flow.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#24382A] p-3 text-sm"
                    >
                      <div>
                        <span>
                          {nodeName(from) === "Unknown node"
                            ? flow.fromComponentId
                            : nodeName(from)}
                        </span>

                        <span className="mx-3 text-[#77FF00]">
                          →
                        </span>

                        <span>
                          {nodeName(to) === "Unknown node"
                            ? flow.toComponentId
                            : nodeName(to)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-red-400 disabled:opacity-40"
                        disabled={busy}
                        onClick={() => deleteFlow(flow)}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* CREATE FORMS */}
          <div className="grid gap-5 xl:grid-cols-2">
            {/* ADD NODE */}
            <form
              onSubmit={addNode}
              className={`${panel} space-y-4`}
            >
              <h2 className="text-lg font-semibold">
                Add RAS Node
              </h2>

              <label className="block space-y-2 text-sm">
                <span>Node Code</span>
                <input
                  className={field}
                  required
                  value={nodeForm.nodeCode}
                  onChange={(event) =>
                    setNodeForm((current) => ({
                      ...current,
                      nodeCode: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span>Display Label</span>
                <input
                  className={field}
                  required
                  value={nodeForm.displayLabel}
                  onChange={(event) =>
                    setNodeForm((current) => ({
                      ...current,
                      displayLabel: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span>Type (Optional)</span>
                <input
                  className={field}
                  value={nodeForm.type}
                  onChange={(event) =>
                    setNodeForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                />
              </label>

              <button
                type="submit"
                className={primaryButton}
                disabled={busy}
              >
                <Plus size={16} />
                Add Node
              </button>
            </form>

            {/* ADD FLOW */}
            <form
              onSubmit={addFlow}
              className={`${panel} space-y-4`}
            >
              <h2 className="text-lg font-semibold">
                Add Water Flow
              </h2>

              <label className="block space-y-2 text-sm">
                <span>From Node</span>

                <select
                  className={field}
                  required
                  value={flowForm.fromComponentId}
                  onChange={(event) =>
                    setFlowForm((current) => ({
                      ...current,
                      fromComponentId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select source node</option>

                  {orderedNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {nodeName(node)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm">
                <span>To Node</span>

                <select
                  className={field}
                  required
                  value={flowForm.toComponentId}
                  onChange={(event) =>
                    setFlowForm((current) => ({
                      ...current,
                      toComponentId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select target node</option>

                  {orderedNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {nodeName(node)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className={primaryButton}
                disabled={busy || nodes.length < 2}
              >
                <Plus size={16} />
                Add Connection
              </button>
            </form>
          </div>
        </>
      )}
    </main>
  );
}
