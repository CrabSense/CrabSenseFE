import {
    BarChart3,
    RefreshCw,
  } from 'lucide-react'
  
  import useSelectedArea
    from '../../hooks/useSelectedArea'
  
  function AnalyticsHeader({
    refreshing,
    onRefresh,
  }) {
    const {
      selectedArea,
    } = useSelectedArea()
  
    return (
      <section className="analytics-header">
        <div>
          <div className="analytics-header-label">
            <BarChart3 size={13} />
            FARM ANALYTICS
          </div>
  
          <h1>
            Performance Analytics
          </h1>
  
          <p>
            Analyze survival, harvest, molting
            and operational performance for{' '}
            <strong>
              {selectedArea
                ? selectedArea.name
                : 'all farming areas'}
            </strong>.
          </p>
        </div>
  
        <button
          type="button"
          className="analytics-refresh"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? 'analytics-spin'
                : ''
            }
          />
  
          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>
      </section>
    )
  }
  
  export default AnalyticsHeader