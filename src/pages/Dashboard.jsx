import useDashboard from '../hooks/useDashboard'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardLoading from '../components/dashboard/DashboardLoading'
import DashboardError from '../components/dashboard/DashboardError'

import StatsGrid from '../components/dashboard/stats/StatsGrid'
import FarmHealthCard from '../components/dashboard/health/FarmHealthCard'
import HealthBreakdown from '../components/dashboard/health/HealthBreakdown'

import TodayTasks from '../components/dashboard/operations/TodayTasks'
import RecentActivity from '../components/dashboard/operations/RecentActivity'

import '../styles/dashboard/Dashboard.css'

function Dashboard() {
  const {
    overview,
    metrics,
    todayTasks,
    recentActivity,
    loading,
    refreshing,
    error,
    reload,
  } = useDashboard()

  if (loading) {
    return <DashboardLoading />
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={reload}
      />
    )
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader
        lastUpdated={overview?.lastUpdated}
        onRefresh={reload}
        refreshing={refreshing}
      />

      <StatsGrid overview={overview} />

      <section className="dashboard-health-grid">
        <FarmHealthCard metrics={metrics} />

        <HealthBreakdown
          metrics={metrics}
          iotOnlinePercentage={
            overview?.iotOnlinePercentage
          }
        />
      </section>

      <section className="dashboard-operations-grid">
        <TodayTasks tasks={todayTasks} />

        <RecentActivity
          activities={recentActivity}
        />
      </section>
    </div>
  )
}

export default Dashboard