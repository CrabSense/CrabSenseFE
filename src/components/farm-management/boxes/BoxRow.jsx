import {
  AlertTriangle,
  Circle,
  Eraser,
  Pencil,
} from 'lucide-react'


function BoxRow({
  box,
  onEdit,
  onClear,
}) {
  const status =
    (box.status || 'empty')
      .trim()
      .toLowerCase()

  const statusClass =
    `status-${status}`

  const isOccupied =
    Boolean(
      box.isOccupied
    )

  const cannotClear =
    isOccupied ||
    status === 'empty'


  return (
    <div className="farm-box-row">

      <div className="farm-box-main">
        <strong>
          {box.code}
        </strong>

        <span>
          {box.displayName ||
            box.rowName ||
            'Farm box'}
        </span>
      </div>


      <span>
        {box.rowCode ||
          box.rowName ||
          '—'}
      </span>


      <div
        className={`farm-box-status ${statusClass}`}
      >
        <Circle size={7} />

        {status}
      </div>


      <span>
        {box.crabCount ?? 0}
      </span>


      <span>
        {box.crabTag || '—'}
      </span>


      <div className="farm-box-actions">

        {(box.alertCount ?? 0) > 0 && (
          <span className="farm-box-alert">
            <AlertTriangle size={12} />

            {box.alertCount}
          </span>
        )}


        <button
          type="button"
          className="farm-box-edit"
          onClick={() =>
            onEdit?.(box)
          }
        >
          <Pencil size={12} />

          Edit
        </button>


        <button
          type="button"
          className="farm-box-clear"
          onClick={() =>
            onClear?.(box)
          }
          disabled={cannotClear}
          title={
            isOccupied
              ? 'Move or harvest the crab before clearing this box'
              : status === 'empty'
                ? 'Box is already empty'
                : 'Clear box'
          }
        >
          <Eraser size={12} />

          Clear
        </button>

      </div>
    </div>
  )
}

export default BoxRow