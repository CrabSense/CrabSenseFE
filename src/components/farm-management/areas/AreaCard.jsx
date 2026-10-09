import {
  Boxes,
  Grid3X3,
  Pencil,
  Shell,
  PowerOff,
} from 'lucide-react'

function AreaCard({
  area,
  selected,
  onSelect,
  onEdit,
  onDeactivate,
}) {
  return (
    <article
      className={`farm-area-card ${
        selected
          ? 'selected'
          : ''
      }`}
    >
      <button
        type="button"
        className="farm-area-select"
        onClick={() =>
          onSelect(area.id)
        }
      >
        <div className="farm-area-card-top">
          <div>
            <span>
              {area.code}
            </span>

            <strong>
              {area.name}
            </strong>
          </div>

          <span
            className={`farm-status ${
              area.isActive
                ? 'active'
                : ''
            }`}
          >
            {area.status}
          </span>
        </div>

        <div className="farm-area-stats">
          <span>
            <Grid3X3 size={13} />
            {area.rowCount ?? 0}
            {' '}rows
          </span>

          <span>
            <Boxes size={13} />
            {area.boxCount ?? 0}
            {' '}boxes
          </span>

          <span>
            <Shell size={13} />
            {area.crabCount ?? 0}
            {' '}crabs
          </span>
        </div>
      </button>

      <div className="farm-area-card-actions">
        <button
          type="button"
          className="farm-area-action"
          onClick={() =>
            onEdit(area)
          }
          title="Edit area"
        >
          <Pencil size={13} />
          Edit
        </button>

        <button
          type="button"
          className="farm-area-deactivate"
          onClick={(event) => {
            event.stopPropagation()

            onDeactivate?.(area)
          }}
        >
          <PowerOff size={12} />

          Deactivate
        </button>
      </div>
    </article>
  )
}

export default AreaCard