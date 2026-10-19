import PropTypes from "prop-types";

function DeviceStats({ rows, activeType, onSelect }) {
  const cards = [
    { id: "all", label: "Tổng thiết bị" },
    { id: "camera", label: "Camera" },
    { id: "sensor", label: "Cảm biến" },
    { id: "controller", label: "Bộ điều khiển" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const scoped = card.id === "all" ? rows : rows.filter((row) => row.type === card.id);
        const online = scoped.filter((row) => row.statusKey === "online").length;
        const offline = scoped.filter((row) => row.statusKey === "offline").length;
        const warning = scoped.filter((row) => row.statusKey === "warning").length;
        const active = activeType === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={[
              "rounded-2xl border px-4 py-4 text-left",
              active ? "border-[#77FF00]/50 bg-[#77FF00]/10" : "border-white/10 bg-[#101810]",
            ].join(" ")}
          >
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8EA292] uppercase">{card.label}</p>
            <p className="mt-2 text-[26px] font-bold">{online} / {scoped.length}</p>
            <p className="mt-1 text-xs text-[#8EA292]">{offline} offline · {warning} cảnh báo</p>
          </button>
        );
      })}
    </div>
  );
}

DeviceStats.propTypes = {
  rows: PropTypes.array.isRequired,
  activeType: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default DeviceStats;
