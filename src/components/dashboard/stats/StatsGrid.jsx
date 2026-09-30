import {
    Box,
    Activity,
    Boxes,
    TriangleAlert,
    Wifi,
  } from 'lucide-react'
  
  import StatCard from './StatCard'
  
  import {
    formatNumber,
    formatPercentage,
  } from '../../../utils/dashboardHelpers'
  
  function StatsGrid({ overview }) {
    if (!overview) return null
  
    const alertTone =
      overview.openAlerts > 0
        ? 'danger'
        : 'success'
  
    return (
      <section className="dashboard-stats-grid">
        <StatCard
          label="Total Boxes"
          value={formatNumber(overview.totalBoxes)}
          description="Registered farming boxes"
          icon={Box}
          tone="default"
        />
  
        <StatCard
          label="Live Crabs"
          value={formatNumber(overview.totalCrabs)}
          description="Currently alive"
          icon={Activity}
          tone="bio"
        />
  
        <StatCard
          label="Active Boxes"
          value={formatNumber(overview.activeBoxes)}
          description="Active, molting or occupied"
          icon={Boxes}
          tone="success"
        />
  
        <StatCard
          label="Open Alerts"
          value={formatNumber(overview.openAlerts)}
          description={
            overview.openAlerts > 0
              ? 'Requires attention'
              : 'No active alerts'
          }
          icon={TriangleAlert}
          tone={alertTone}
          accentText={
            overview.openAlerts > 0
              ? 'ACTION'
              : 'CLEAR'
          }
        />
  
        <StatCard
          label="IoT Online"
          value={formatPercentage(
            overview.iotOnlinePercentage
          )}
          description="Connected devices"
          icon={Wifi}
          tone="bio"
          accentText="LIVE"
        />
      </section>
    )
  }
  
  export default StatsGrid