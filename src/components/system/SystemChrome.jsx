import PropTypes from "prop-types";

export function SystemPage({ title, description, actions, children }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] text-[#F4F7F4]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.6px]">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-[720px] text-sm leading-6 text-[#9AAB9E]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

SystemPage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export function KpiGrid({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-2xl border border-white/10 bg-[#101810] px-4 py-4"
        >
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8EA292] uppercase">
            {item.label}
          </p>
          <p className="mt-2 text-[26px] font-bold tracking-[-0.5px]">
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-1 text-xs text-[#8EA292]">{item.hint}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

KpiGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.node.isRequired,
      hint: PropTypes.string,
    }),
  ).isRequired,
};

export function Panel({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101810] p-4">
      <h2 className="mb-3 text-sm font-bold tracking-[0.04em] text-[#D7E6DA] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

Panel.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export function MissingApi({ title, endpoints }) {
  return (
    <section className="rounded-2xl border border-dashed border-[#77FF00]/25 bg-[#77FF00]/[0.03] p-4">
      <h2 className="text-sm font-bold text-[#D7E6DA]">{title}</h2>
      <p className="mt-1 text-sm text-[#9AAB9E]">
        API này chưa có trên backend. Không hiển thị số liệu giả.
      </p>
      <ul className="mt-3 space-y-1 font-mono text-[12px] text-[#C6D7C9]">
        {endpoints.map((endpoint) => (
          <li key={endpoint}>{endpoint}</li>
        ))}
      </ul>
    </section>
  );
}

MissingApi.propTypes = {
  title: PropTypes.string.isRequired,
  endpoints: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export function DataTable({ columns, rows, empty }) {
  if (!rows.length) {
    return <p className="text-sm text-[#9AAB9E]">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[11px] tracking-[0.08em] text-[#8EA292] uppercase">
            {columns.map((column) => (
              <th key={column.key} className="px-2 py-2 font-semibold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/[0.06]">
              {columns.map((column) => (
                <td key={column.key} className="px-2 py-3 align-middle">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  empty: PropTypes.string,
};

export function SystemState({ loading, error, onRetry, children }) {
  if (loading) {
    return <p className="text-sm text-[#9AAB9E]">Đang tải dữ liệu từ API...</p>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-[#FFD0D0]">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-[#FF8D8D] px-3 py-2 text-sm font-semibold text-[#1A0909]"
          >
            Thử lại
          </button>
        ) : null}
      </div>
    );
  }
  return children;
}

SystemState.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  children: PropTypes.node,
};
