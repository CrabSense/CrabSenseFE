import { getHealthClass } from '../../../utils/dashboardHelpers'

function FarmHealthCard({ metrics }) {
  if (!metrics) return null

  const healthClass = getHealthClass(
    metrics.statusLevel
  )

  return (
    <article className="dashboard-card farm-health-card">
      <div className="dashboard-card-heading">
        <div>
          <p className="dashboard-eyebrow">
            FARM HEALTH
          </p>

          <h3>Overall Health</h3>
        </div>

        <span className={`health-status ${healthClass}`}>
          {metrics.statusLabel}
        </span>
      </div>

      <div className="farm-health-score">
        <strong>{metrics.score}</strong>
        <span>/ 100</span>
      </div>

      <div className="farm-health-bar">
        <div
          className={`farm-health-fill ${healthClass}`}
          style={{
            width: `${Math.min(
              Math.max(metrics.score, 0),
              100
            )}%`,
          }}
        />
      </div>

      <p className="farm-health-explanation">
        {metrics.explanation}
      </p>
    </article>
  )
}

export default FarmHealthCard