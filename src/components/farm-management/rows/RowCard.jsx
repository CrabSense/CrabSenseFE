import {
    Boxes,
    Shell,
  } from 'lucide-react'
  
  function RowCard({
    row,
    selected,
    onSelect,
  }) {
    return (
      <button
        type="button"
        className={`farm-row-card ${
          selected ? 'selected' : ''
        }`}
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
    )
  }
  
  export default RowCard