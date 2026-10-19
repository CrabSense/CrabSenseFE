import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Eye, MoreHorizontal, Settings } from "lucide-react";

import { menuGroups } from "./actionModel";

function DeviceActions({ row, onAction }) {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    if (!menu) return undefined;
    const close = () => setMenu(null);
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const openMenu = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 280;
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    const below = rect.bottom + 6;
    const top = below + 320 > window.innerHeight ? Math.max(8, rect.top - 320) : below;
    setMenu({ top, left });
  };

  return (
    <div className="flex items-center gap-1">
      <IconButton label="Xem chi tiết" onClick={() => onAction(row, "view")}>
        <Eye size={15} />
      </IconButton>
      <IconButton label="Cấu hình" onClick={() => onAction(row, "config")}>
        <Settings size={15} />
      </IconButton>
      <IconButton label="Thêm thao tác" onClick={openMenu}>
        <MoreHorizontal size={15} />
      </IconButton>
      {menu ? (
        <>
          <button type="button" aria-label="Đóng menu" className="fixed inset-0 z-[140] cursor-default" onClick={() => setMenu(null)} />
          <div className="fixed z-[150] w-[280px] overflow-y-auto rounded-xl border border-white/10 bg-[#101810] p-2 shadow-2xl" style={{ top: menu.top, left: menu.left, maxHeight: 320 }}>
            {menuGroups(row).map(([group, items]) => (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#8EA292] uppercase">{group}</p>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.enabled}
                    title={item.reason || item.label}
                    onClick={() => {
                      setMenu(null);
                      onAction(row, item.id);
                    }}
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-xs enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:text-[#6E7C72]"
                  >
                    {item.label}
                    {item.reason ? <span className="mt-0.5 block text-[10px] text-[#8EA292]">{item.reason}</span> : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function IconButton({ label, onClick, children }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-[#D5E4D8]">
      {children}
    </button>
  );
}

IconButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
DeviceActions.propTypes = {
  row: PropTypes.object.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default DeviceActions;
