import MonitoringSummaryCard
  from './MonitoringSummaryCard'

function MonitoringSummaryGrid({
  summary,
}) {
  if (!summary) return null

  return (
    <section className="monitoring-summary-grid">
      <MonitoringSummaryCard
        label="Total Boxes"
        value={summary.total}
      />

      <MonitoringSummaryCard
        label="Healthy"
        value={summary.healthy}
        tone="healthy"
      />

      <MonitoringSummaryCard
        label="Warning"
        value={summary.warning}
        tone="warning"
      />

      <MonitoringSummaryCard
        label="Critical"
        value={summary.critical}
        tone="critical"
      />

      <MonitoringSummaryCard
        label="Offline"
        value={summary.offline}
        tone="offline"
      />
    </section>
  )
}

export default MonitoringSummaryGrid