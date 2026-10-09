import {
    RotateCcw,
  } from 'lucide-react'
  
  
  function ArchivedAreaCard({
    area,
    onReactivate,
    processing,
  }) {
    return (
      <article className="farm-archived-area-card">
  
        <div className="farm-archived-area-main">
  
          <div>
            <span className="farm-archived-area-code">
              {area.code}
            </span>
  
            <h3>
              {area.name}
            </h3>
  
            <p>
              {area.location ||
                area.region ||
                'No location'}
            </p>
          </div>
  
  
          <span className="farm-archived-status">
            Closed
          </span>
  
        </div>
  
  
        <div className="farm-archived-area-stats">
  
          <div>
            <span>Rows</span>
  
            <strong>
              {area.rowCount ?? 0}
            </strong>
          </div>
  
          <div>
            <span>Boxes</span>
  
            <strong>
              {area.boxCount ?? 0}
            </strong>
          </div>
  
          <div>
            <span>Crabs</span>
  
            <strong>
              {area.crabCount ?? 0}
            </strong>
          </div>
  
        </div>
  
  
        <button
          type="button"
          className="farm-reactivate-btn"
          disabled={processing}
          onClick={() =>
            onReactivate?.(area)
          }
        >
          <RotateCcw size={12} />
  
          Reactivate
        </button>
  
      </article>
    )
  }
  
  export default ArchivedAreaCard