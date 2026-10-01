import {
    RefreshCw,
    Radio,
  } from 'lucide-react'
  
  import useSelectedArea
    from '../../hooks/useSelectedArea'
  
  function MonitoringHeader({
    syncedAt,
    refreshing,
    onRefresh,
  }) {
    const {
      selectedArea,
    } = useSelectedArea()
  
    const formatTime = (value) => {
      if (!value) return '--'
  
      return new Date(value).toLocaleString()
    }
  
    return (
      <section className="monitoring-header">
        <div>
          <div className="monitoring-live-label">
            <Radio size={13} />
  
            LIVE MONITORING
          </div>
  
          <h1>
            Environment & Box Monitoring
          </h1>
  
          <p>
            Real-time environment, device and box
            health status for{' '}
            <strong>
              {selectedArea
                ? selectedArea.name
                : 'all farming areas'}
            </strong>.
          </p>
        </div>
  
        <div className="monitoring-header-actions">
          <div className="monitoring-sync">
            <span className="monitoring-live-dot" />
  
            <div>
              <span>Last synced</span>
  
              <strong>
                {formatTime(syncedAt)}
              </strong>
            </div>
          </div>
  
          <button
            type="button"
            className="monitoring-refresh"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? 'monitoring-spin'
                  : ''
              }
            />
  
            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>
        </div>
      </section>
    )
  }
  
  export default MonitoringHeader