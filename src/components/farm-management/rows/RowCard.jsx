import {
  Boxes,
  Pencil,
  Shell,
  PowerOff,
} from 'lucide-react'

function RowCard({
  row,
  selected,
  onSelect,
  onEdit,
  onDeactivate,
}) {
  return (
    <article
      className={`farm-row-card ${
        selected
          ? 'selected'
          : ''
      }`}
    >
      <button
        type="button"
        className="farm-row-select"
        onClick={() =>
          onSelect(row.id)
        }
      >
        <div className="farm-row-title">
          <span>
            {row.code}
          </span>

          <strong>
            {row.name}
          </strong>

          {row.location && (
            <small>
              {row.location}
            </small>
          )}
        </div>

        <div className="farm-row-meta">
          <span>
            <Boxes size={12} />
            {row.boxCount ?? 0}
          </span>

          <span>
            <Shell size={12} />
            {row.crabCount ?? 0}
          </span>
        </div>
      </button>

      <div className="farm-row-footer">
        <div className="farm-row-capacity">
          <span>
            Capacity
          </span>

          <strong>
            {row.capacity === 0
              ? 'Unlimited'
              : `${row.boxCount ?? 0}/${row.capacity}`}
          </strong>
        </div>

        <button
          type="button"
          className="farm-row-action"
          onClick={() =>
            onEdit(row)
          }
        >
          <Pencil size={12} />
          Edit
        </button>

        <button
          type="button"
          className="farm-row-deactivate"
          onClick={(event) => {
            event.stopPropagation()

            onDeactivate?.(row)
          }}
        >
          <PowerOff size={12} />
          Deactivate
        </button>
      </div>
    </article>
  )
}

export default RowCard