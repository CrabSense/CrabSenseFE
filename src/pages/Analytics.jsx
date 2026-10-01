import {
  useState,
} from 'react'

import useAnalytics
  from '../hooks/useAnalytics'

import useSelectedArea
  from '../hooks/useSelectedArea'

import AnalyticsHeader
  from '../components/analytics/AnalyticsHeader'

import AnalyticsDateFilter
  from '../components/analytics/filters/AnalyticsDateFilter'

import AnalyticsKpiGrid
  from '../components/analytics/kpi/AnalyticsKpiGrid'

import HarvestTrendChart
  from '../components/analytics/harvest/HarvestTrendChart'

import SurvivalPanel
  from '../components/analytics/survival/SurvivalPanel'

import MoltingPanel
  from '../components/analytics/molting/MoltingPanel'

import EfficiencyPanel
  from '../components/analytics/operations/EfficiencyPanel'

import AnalyticsLoading
  from '../components/analytics/AnalyticsLoading'

import AnalyticsError
  from '../components/analytics/AnalyticsError'

import '../styles/analytics/Analytics.css'

function getDefaultFromDate() {
  const date = new Date()

  date.setDate(
    date.getDate() - 30
  )

  return date
    .toISOString()
    .slice(0, 10)
}

function getToday() {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

function Analytics() {
  const {
    selectedAreaId,
  } = useSelectedArea()

  const [fromDate, setFromDate] =
    useState(getDefaultFromDate)

  const [toDate, setToDate] =
    useState(getToday)

  const {
    harvest,
    survival,
    molting,
    efficiency,

    loading,
    refreshing,
    error,
    reload,
  } = useAnalytics({
    farmingAreaId: selectedAreaId,
    fromDate,
    toDate,
  })

  if (loading) {
    return <AnalyticsLoading />
  }

  if (error) {
    return (
      <AnalyticsError
        message={error}
        onRetry={reload}
      />
    )
  }

  return (
    <div className="analytics-page">
      <AnalyticsHeader
        refreshing={refreshing}
        onRefresh={reload}
      />

      <div className="analytics-toolbar">
        <AnalyticsDateFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />

        <span className="analytics-filter-note">
          Date range applies to Survival and
          Operational Efficiency reports.
        </span>
      </div>

      <AnalyticsKpiGrid
        survival={survival}
        harvest={harvest}
        molting={molting}
        efficiency={efficiency}
      />

      <section className="analytics-chart-grid">
        <HarvestTrendChart
          data={harvest?.byDate ?? []}
        />

        <SurvivalPanel
          report={survival}
        />

        <MoltingPanel
          report={molting}
        />

        <EfficiencyPanel
          data={efficiency}
        />
      </section>
    </div>
  )
}

export default Analytics