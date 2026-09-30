import {
    RefreshCw,
    Activity,
  } from 'lucide-react'
  
  import { formatDashboardTime } from '../../utils/dashboardHelpers'
  
  function DashboardHeader({
    lastUpdated,
    onRefresh,
    refreshing = false,
  }) {
    return (
      <section className="dashboard-hero">
        <div className="dashboard-hero-left">
          <div className="dashboard-hero-badge">
            <Activity size={14} />
            <span>LIVE FARM OVERVIEW</span>
          </div>
  
          <h1>Dashboard</h1>
  
          <p>
            Monitor farm operations, system health and real-time activity
            across CrabSense.
          </p>
        </div>
  
        <div className="dashboard-hero-actions">
          <div className="dashboard-update-info">
            <span className="update-dot" />
  
            <div>
              <span>Last updated</span>
  
              <strong>
                {formatDashboardTime(lastUpdated)}
              </strong>
            </div>
          </div>
  
          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'spinning' : ''}
            />
  
            <span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      </section>
    )
  }
  
  export default DashboardHeader