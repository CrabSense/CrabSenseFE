import {
    AlertTriangle,
    Wifi,
    WifiOff,
  } from 'lucide-react'
  
  function BoxMonitoringRow({
    box,
  }) {
    const healthLevel =
      box.health?.statusLevel
        ?.toLowerCase() ||
      box.healthStatus
        ?.toLowerCase() ||
      'unknown'
  
    const deviceOnline =
      box.devices?.isOnline === true
  
    return (
      <div className="monitoring-box-row">
        <div className="monitoring-box-main">
          <strong>{box.code}</strong>
  
          <span>
            {box.areaName || box.farmName || '--'}
            {' / '}
            {box.rowName || '--'}
          </span>
        </div>
  
        <div>
          <span
            className={`box-health-badge ${healthLevel}`}
          >
            {box.health?.statusLabel ||
              box.healthStatus ||
              'Unknown'}
          </span>
        </div>
  
        <div className="monitoring-box-health-score">
          <strong>
            {box.health?.score ?? '--'}
          </strong>
  
          <span>/100</span>
        </div>
  
        <div className="monitoring-box-water">
          <span>
            {box.water?.temperature ?? '--'}
            °C
          </span>
  
          <span>
            pH {box.water?.ph ?? '--'}
          </span>
        </div>
  
        <div
          className={`monitoring-device-status ${
            deviceOnline
              ? 'online'
              : 'offline'
          }`}
        >
          {deviceOnline ? (
            <Wifi size={14} />
          ) : (
            <WifiOff size={14} />
          )}
  
          {deviceOnline
            ? 'Online'
            : 'Offline'}
        </div>
  
        <div className="monitoring-alert-cell">
          {box.alertCount > 0 && (
            <AlertTriangle size={14} />
          )}
  
          <span>
            {box.alertCount ?? 0}
          </span>
        </div>
      </div>
    )
  }
  
  export default BoxMonitoringRow