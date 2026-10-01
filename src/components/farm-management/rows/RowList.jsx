import RowCard
  from './RowCard'

function RowList({
  rows = [],
  selectedRowId,
  onSelectRow,
}) {
  return (
    <section className="farm-section">
      <div className="farm-section-heading">
        <div>
          <span>
            FARMING ROWS
          </span>

          <h2>
            Row Structure
          </h2>

          <p>
            Select a row to filter
            the box list.
          </p>
        </div>

        {selectedRowId && (
          <button
            type="button"
            className="farm-clear-filter"
            onClick={() =>
              onSelectRow(null)
            }
          >
            Clear row
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="farm-empty">
          No farming rows available.
        </div>
      ) : (
        <div className="farm-row-grid">
          {rows.map((row) => (
            <RowCard
              key={row.id}
              row={row}
              selected={
                row.id ===
                selectedRowId
              }
              onSelect={
                onSelectRow
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default RowList