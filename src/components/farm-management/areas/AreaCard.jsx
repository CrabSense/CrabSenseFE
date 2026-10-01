import {
    Boxes,
    Grid3X3,
    Shell,
  } from 'lucide-react'
  
  function AreaCard({
    area,
    selected,
    onSelect,
  }) {
    return (
      <button
        type="button"
        className={`farm-area-card ${
          selected ? 'selected' : ''
        }`}
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
            {area.rowCount ?? 0} rows
          </span>
  
          <span>
            <Boxes size={13} />
            {area.boxCount ?? 0} boxes
          </span>
  
          <span>
            <Shell size={13} />
            {area.crabCount ?? 0} crabs
          </span>
        </div>
      </button>
    )
  }
  
  export default AreaCard