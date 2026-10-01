function SurvivalPanel({
    report,
  }) {
    if (!report) return null
  
    const metrics = [
      {
        label: 'Survival',
        value: report.survivalRate,
        tone: 'good',
      },
      {
        label: 'Mortality',
        value: report.mortalityRate,
        tone: 'danger',
      },
      {
        label: 'Harvested',
        value: report.harvestRate,
        tone: 'bio',
      },
    ]
  
    return (
      <article className="analytics-panel">
        <div className="analytics-panel-heading">
          <div>
            <span>SURVIVAL</span>
            <h2>Population Outcome</h2>
            <p>
              Current survival and mortality
              performance.
            </p>
          </div>
        </div>
  
        <div className="analytics-rate-list">
          {metrics.map((item) => (
            <div
              className="analytics-rate-row"
              key={item.label}
            >
              <div>
                <span>{item.label}</span>
  
                <strong>
                  {Number(
                    item.value ?? 0
                  ).toFixed(1)}
                  %
                </strong>
              </div>
  
              <div className="analytics-rate-track">
                <div
                  className={`analytics-rate-fill ${item.tone}`}
                  style={{
                    width: `${Math.min(
                      Number(item.value ?? 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
  
        <div className="analytics-population">
          <span>
            Total
            <strong>{report.totalCrabs}</strong>
          </span>
  
          <span>
            Alive
            <strong>{report.aliveCrabs}</strong>
          </span>
  
          <span>
            Dead
            <strong>{report.deadCrabs}</strong>
          </span>
  
          <span>
            Harvested
            <strong>{report.harvestedCrabs}</strong>
          </span>
        </div>
      </article>
    )
  }
  
  export default SurvivalPanel