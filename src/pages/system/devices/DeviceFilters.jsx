import PropTypes from "prop-types";

function DeviceFilters({
  query,
  onQuery,
  typeFilter,
  onType,
  statusFilter,
  onStatus,
  areaFilter,
  onArea,
  firmwareFilter,
  onFirmware,
  areas,
  firmwares,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Tên, mã, IP, MAC"
        className="h-10 min-w-[180px] flex-1 rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
      />
      <Select value={typeFilter} onChange={onType} options={[["all", "Mọi loại"], ["camera", "Camera"], ["sensor", "Cảm biến"], ["controller", "Bộ điều khiển"]]} />
      <Select value={statusFilter} onChange={onStatus} options={[["all", "Mọi trạng thái"], ["online", "Online"], ["offline", "Offline"], ["warning", "Cảnh báo"], ["maintenance", "Bảo trì"]]} />
      <Select value={areaFilter} onChange={onArea} options={[["all", "Mọi khu vực"], ...areas.map((area) => [area, area])]} />
      <Select value={firmwareFilter} onChange={onFirmware} options={[["all", "Mọi firmware"], ...firmwares.map((item) => [item, item])]} />
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-xl border border-white/10 bg-[#0B120C] px-3 text-sm"
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>{label}</option>
      ))}
    </select>
  );
}

Select.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
};

DeviceFilters.propTypes = {
  query: PropTypes.string.isRequired,
  onQuery: PropTypes.func.isRequired,
  typeFilter: PropTypes.string.isRequired,
  onType: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatus: PropTypes.func.isRequired,
  areaFilter: PropTypes.string.isRequired,
  onArea: PropTypes.func.isRequired,
  firmwareFilter: PropTypes.string.isRequired,
  onFirmware: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
  firmwares: PropTypes.array.isRequired,
};

export default DeviceFilters;
