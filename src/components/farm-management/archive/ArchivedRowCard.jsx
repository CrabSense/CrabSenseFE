import {
    RotateCcw,
  } from 'lucide-react'
  
  
  function ArchivedRowCard({
    row,
    parentAreaActive,
    processing,
    onReactivate,
  }) {
    const disabled =
      !parentAreaActive ||
      processing
  
    return (
      <article className="farm-archived-row-card">
  
        <div className="farm-archived-row-main">
  
          <div>
            <span className="farm-archived-row-code">
              {row.code}
            </span>
  
            <h3>
              {row.name}
            </h3>
  
            <p>
              {row.areaName ||
                row.location ||
                'No area information'}
            </p>
          </div>
  
  
          <span className="farm-archived-row-status">
            Closed
          </span>
  
        </div>
  
  
        <div className="farm-archived-row-stats">
  
          <div>
            <span>Boxes</span>
  
            <strong>
              {row.boxCount ?? 0}
            </strong>
          </div>
  
          <div>
            <span>Crabs</span>
  
            <strong>
              {row.crabCount ?? 0}
            </strong>
          </div>
  
          <div>
            <span>Capacity</span>
  
            <strong>
              {row.capacity === 0
                ? '∞'
                : row.capacity}
            </strong>
          </div>
  
        </div>
  
  
        {!parentAreaActive && (
          <p className="farm-row-reactivate-note">
            Reactivate the parent area first.
          </p>
        )}
  
  
        <button
          type="button"
          className="farm-reactivate-btn"
          disabled={disabled}
          onClick={() =>
            onReactivate?.(row)
          }
        >
          <RotateCcw size={12} />
  
          Reactivate
        </button>
  
      </article>
    )
  }
  
  export default ArchivedRowCard