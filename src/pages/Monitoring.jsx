import useMonitoring
  from '../hooks/useMonitoring'

import useSelectedArea
  from '../hooks/useSelectedArea'

import MonitoringHeader
  from '../components/monitoring/MonitoringHeader'

import MonitoringLoading
  from '../components/monitoring/MonitoringLoading'

import MonitoringError
  from '../components/monitoring/MonitoringError'

import EnvironmentGrid
  from '../components/monitoring/environment/EnvironmentGrid'

import MonitoringSummaryGrid
  from '../components/monitoring/summary/MonitoringSummaryGrid'

import BoxMonitoringSection
  from '../components/monitoring/boxes/BoxMonitoringSection'

import '../styles/monitoring/Monitoring.css'

function Monitoring() {
  const {
    selectedAreaId,
  } = useSelectedArea()

  const {
    data,
    loading,
    refreshing,
    error,
    reload,
  } = useMonitoring(
    selectedAreaId
  )

  if (loading) {
    return <MonitoringLoading />
  }

  if (error) {
    return (
      <MonitoringError
        message={error}
        onRetry={reload}
      />
    )
  }

  return (
    <div className="monitoring-page">
      <MonitoringHeader
        syncedAt={data?.syncedAt}
        refreshing={refreshing}
        onRefresh={reload}
      />

      <EnvironmentGrid
        water={data?.areaWater}
        devices={data?.areaDevices}
      />

      <MonitoringSummaryGrid
        summary={data?.summary}
      />

      <BoxMonitoringSection
        boxes={data?.items ?? []}
      />
    </div>
  )
}

export default Monitoring