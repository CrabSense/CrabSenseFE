import {
    AlertTriangle,
    CheckCircle2,
    Shell,
  } from 'lucide-react'
  
  function BoxRow({
    box,
  }) {
    const occupied =
      box.isOccupied === true
  
    return (
      <div className="farm-box-row">
        <div className="farm-box-main">
          <strong>
            {box.code}
          </strong>
  
          <span>
            {box.displayName ||
              box.areaName ||
              '--'}
          </span>
        </div>
  
        <span>
          {box.rowCode ||
            box.rowName ||
            '--'}
        </span>
  
        <div
          className={`farm-box-status ${
            occupied
              ? 'occupied'
              : 'empty'
          }`}
        >
          {occupied ? (
            <Shell size={13} />
          ) : (
            <CheckCircle2 size={13} />
          )}
  
          {occupied
            ? 'Occupied'
            : 'Empty'}
        </div>
  
        <span>
          {box.crabCount ?? 0}
        </span>
  
        <span>
          {box.crabCondition ||
            '--'}
        </span>
  
        <div className="farm-box-alert">
          {box.alertCount > 0 && (
            <AlertTriangle size={13} />
          )}
  
          {box.alertCount ?? 0}
        </div>
      </div>
    )
  }
  
  export default BoxRow