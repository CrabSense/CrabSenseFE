import { useState } from "react";
import PropTypes from "prop-types";

import systemAdminService from "../../../services/systemAdminService";

const TYPES = [
  ["camera", "Camera IP"],
  ["sensor", "Sensor"],
  ["controller", "Controller / ESP32"],
];

function AddDeviceWizard({ areas, devices, sensors, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    kind: "controller",
    deviceCode: "",
    name: "",
    deviceType: "esp32",
    ipAddress: "",
    macAddress: "",
    streamUrl: "",
    sensorCode: "",
    sensorType: "ph",
    unit: "",
    deviceId: "",
    farmingAreaId: "",
    installationLocation: "",
    firmwareVersion: "",
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError("");
    const code = (form.kind === "sensor" ? form.sensorCode : form.deviceCode).trim().toLowerCase();
    const ip = form.ipAddress.trim().toLowerCase();
    const mac = form.macAddress.trim().toLowerCase();
    const duplicateCode = devices.some((item) => item.deviceCode?.toLowerCase() === code)
      || sensors.some((item) => item.sensorCode?.toLowerCase() === code);
    const duplicateIp = ip && devices.some((item) => item.ipAddress?.toLowerCase() === ip);
    const duplicateMac = mac && devices.some((item) => item.macAddress?.toLowerCase() === mac);
    if (!code || duplicateCode || duplicateIp || duplicateMac) {
      setError(!code ? "Cần mã thiết bị." : "Mã, IP hoặc MAC đã có trong danh sách.");
      return;
    }
    try {
      if (form.kind === "sensor") {
        await systemAdminService.createSensor({
          sensorCode: form.sensorCode.trim(),
          sensorType: form.sensorType.trim() || "sensor",
          unit: form.unit.trim() || null,
          deviceId: form.deviceId || null,
          waterSystemId: null,
        });
      } else {
        await systemAdminService.createDevice({
          deviceCode: form.deviceCode.trim(),
          deviceType: form.kind === "camera" ? (form.deviceType.trim() || "camera") : (form.deviceType.trim() || "esp32"),
          name: form.name.trim() || null,
          ipAddress: form.ipAddress.trim() || null,
          macAddress: form.macAddress.trim() || null,
          firmwareVersion: form.firmwareVersion.trim() || null,
          farmingAreaId: form.farmingAreaId || null,
          installationLocation: form.installationLocation.trim() || null,
          streamUrl: form.kind === "camera" ? form.streamUrl.trim() || null : null,
        });
      }
      onCreated();
      onClose();
    } catch (saveError) {
      setError(saveError?.message || "Không tạo được thiết bị. Mã hoặc IP có thể đã tồn tại.");
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#101810] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Thêm thiết bị</h2>
          <button type="button" onClick={onClose} className="text-sm text-[#9AAB9E]">Đóng</button>
        </div>
        <p className="mt-1 text-xs text-[#8EA292]">Bước {step}/4 · API chưa có lệnh test connection trước khi lưu.</p>
        {error ? <p className="mt-3 text-sm text-[#FFB4B4]">{error}</p> : null}
        {step === 1 ? (
          <div className="mt-4 grid gap-2">
            {TYPES.map(([id, label]) => (
              <button key={id} type="button" onClick={() => set("kind", id)} className={form.kind === id ? "rounded-xl bg-[#77FF00] px-3 py-3 text-left font-bold text-[#071007]" : "rounded-xl border border-white/10 px-3 py-3 text-left"}>
                {label}
              </button>
            ))}
          </div>
        ) : null}
        {step === 2 ? (
          <div className="mt-4 grid gap-2">
            {form.kind === "sensor" ? (
              <>
                <Text label="Mã sensor" value={form.sensorCode} onChange={(value) => set("sensorCode", value)} />
                <Text label="Loại đo" value={form.sensorType} onChange={(value) => set("sensorType", value)} />
                <Text label="Đơn vị" value={form.unit} onChange={(value) => set("unit", value)} />
                <label className="text-xs text-[#9AAB9E]">
                  Gắn controller
                  <select value={form.deviceId} onChange={(event) => set("deviceId", event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm">
                    <option value="">Không gắn</option>
                    {devices.filter((device) => !String(device.deviceType || "").toLowerCase().includes("camera") && !device.streamUrl).map((device) => <option key={device.id} value={device.id}>{device.deviceCode}</option>)}
                  </select>
                </label>
              </>
            ) : (
              <>
                <Text label="Mã thiết bị" value={form.deviceCode} onChange={(value) => set("deviceCode", value)} />
                <Text label="Tên" value={form.name} onChange={(value) => set("name", value)} />
                <Text label="IP" value={form.ipAddress} onChange={(value) => set("ipAddress", value)} />
                <Text label="MAC" value={form.macAddress} onChange={(value) => set("macAddress", value)} />
                <Text label="Firmware" value={form.firmwareVersion} onChange={(value) => set("firmwareVersion", value)} />
                {form.kind === "camera" ? <Text label="Stream URL" value={form.streamUrl} onChange={(value) => set("streamUrl", value)} /> : null}
              </>
            )}
          </div>
        ) : null}
        {step === 3 ? (
          <div className="mt-4 grid gap-2">
            <label className="text-xs text-[#9AAB9E]">
              Khu vực
              <select value={form.farmingAreaId} onChange={(event) => set("farmingAreaId", event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm">
                <option value="">Chưa gán</option>
                {areas.map((area) => <option key={area.id} value={area.id}>{area.name || area.code}</option>)}
              </select>
            </label>
            {form.kind !== "sensor" ? <Text label="Vị trí lắp đặt" value={form.installationLocation} onChange={(value) => set("installationLocation", value)} /> : null}
          </div>
        ) : null}
        {step === 4 ? (
          <div className="mt-4 space-y-1 text-sm">
            <p>Loại: {form.kind}</p>
            <p>Mã: {form.kind === "sensor" ? form.sensorCode : form.deviceCode}</p>
            <p>IP: {form.ipAddress || "—"}</p>
            <p>MAC: {form.macAddress || "—"}</p>
            <p className="text-xs text-[#8EA292]">Server từ chối nếu mã thiết bị đã tồn tại.</p>
          </div>
        ) : null}
        <div className="mt-5 flex justify-between">
          <button type="button" disabled={step === 1} onClick={() => setStep((value) => value - 1)} className="rounded-xl border border-white/15 px-3 py-2 text-sm disabled:opacity-40">Trước</button>
          {step < 4 ? (
            <button type="button" onClick={() => setStep((value) => value + 1)} className="rounded-xl bg-[#77FF00] px-3 py-2 text-sm font-bold text-[#071007]">Tiếp</button>
          ) : (
            <button type="button" onClick={submit} className="rounded-xl bg-[#77FF00] px-3 py-2 text-sm font-bold text-[#071007]">Lưu thiết bị</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Text({ label, value, onChange }) {
  return (
    <label className="text-xs text-[#9AAB9E]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm text-[#F4F7F4]" />
    </label>
  );
}

Text.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string, onChange: PropTypes.func.isRequired };
AddDeviceWizard.propTypes = {
  areas: PropTypes.array.isRequired,
  devices: PropTypes.array.isRequired,
  sensors: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default AddDeviceWizard;
