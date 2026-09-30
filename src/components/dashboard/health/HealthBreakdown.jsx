import HealthProgress from './HealthProgress'

function HealthBreakdown({
  metrics,
  iotOnlinePercentage,
}) {
  if (!metrics) return null

  return (
    <article className="dashboard-card">
      <div className="dashboard-card-heading">
        <div>
          <p className="dashboard-eyebrow">
            SYSTEM HEALTH
          </p>

          <h3>Health Breakdown</h3>
        </div>
      </div>

      <div className="health-breakdown-list">
        <HealthProgress
          label="Water Quality"
          value={metrics.waterQualityScore}
        />

        <HealthProgress
          label="Crab Health"
          value={metrics.crabHealthScore}
        />

        <HealthProgress
          label="Device Status"
          value={metrics.deviceStatusScore}
        />

        <HealthProgress
          label="IoT Online"
          value={iotOnlinePercentage}
        />
      </div>
    </article>
  )
}

export default HealthBreakdown