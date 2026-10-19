import PropTypes from "prop-types";
import { connectionLabel, formatAgo, STATUS_LABEL } from "./rows";
import { statusClass } from "../deviceModel";
import DeviceActions from "./DeviceActions";

function DeviceTable({ rows, page, pageSize, onPage, onPageSize, selectedId, onOpen, onAction }) {
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] tracking-[0.08em] text-[#8EA292] uppercase">
              {["Mã / tên", "Loại", "Khu vực", "Kết nối", "Trạng thái", "Last seen", "Thao tác"].map((label) => (
                <th key={label} className="px-2 py-2 font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-6 text-[#9AAB9E]">Không có thiết bị khớp bộ lọc.</td>
              </tr>
            ) : visible.map((row) => (
              <tr
                key={`${row.source}-${row.id}`}
                className={[
                  "border-b border-white/[0.06]",
                  selectedId === row.id ? "bg-[#77FF00]/10" : "",
                ].join(" ")}
              >
                <td className="px-2 py-3">
                  <button type="button" onClick={() => onOpen(row)} className="font-semibold text-[#77FF00]">{row.code}</button>
                  <div className="text-xs text-[#9AAB9E]">{row.name}</div>
                </td>
                <td className="px-2 py-3">
                  <div>{row.typeLabel}</div>
                  {row.hardware ? <div className="text-xs text-[#8EA292]">{row.hardware}</div> : null}
                </td>
                <td className="px-2 py-3">{row.area || "—"}</td>
                <td className="px-2 py-3">{connectionLabel(row)}</td>
                <td className="px-2 py-3">
                  <div className={statusClass(row.statusKey)}>{STATUS_LABEL[row.statusKey] || row.statusKey}</div>
                  {row.issues?.map((issue) => (
                    <div key={issue} className="text-xs text-[#F5C451]">{issue}</div>
                  ))}
                </td>
                <td className="px-2 py-3">{formatAgo(row.lastSeen)}</td>
                <td className="px-2 py-3">
                  <DeviceActions row={row} onAction={onAction || ((item, action) => onOpen(item, action))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#9AAB9E]">
        <label>
          Hiển thị
          <select
            value={pageSize}
            onChange={(event) => onPageSize(Number(event.target.value))}
            className="mx-2 h-8 rounded-lg border border-white/10 bg-[#0B120C] px-2"
          >
            {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          / trang
        </label>
        <span>
          {rows.length === 0 ? "0" : `${start + 1}–${Math.min(start + pageSize, rows.length)}`} / {rows.length}
        </span>
        <div className="flex gap-1">
          <button type="button" disabled={safePage <= 1} onClick={() => onPage(safePage - 1)} className="rounded-lg border border-white/10 px-2 py-1 disabled:opacity-40">Trước</button>
          <span className="px-2 py-1">{safePage} / {pages}</span>
          <button type="button" disabled={safePage >= pages} onClick={() => onPage(safePage + 1)} className="rounded-lg border border-white/10 px-2 py-1 disabled:opacity-40">Sau</button>
        </div>
      </div>
    </div>
  );
}

DeviceTable.propTypes = {
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
  onPageSize: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  onOpen: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};

export default DeviceTable;
