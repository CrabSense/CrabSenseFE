function EfficiencyPanel({
    data,
  }) {
    if (!data) return null
  
    const rows = [
      {
        label: 'Alive Rate',
        value: data.aliveRate,
        tone: 'good',
      },
      {
        label: 'Molting Rate',
        value: data.moltingRate,
        tone: 'bio',
      },
      {
        label: 'Harvest Rate',
        value: data.harvestRate,
        tone: 'bio',
      },
      {
        label: 'Mortality Rate',
        value: data.mortalityRate,
        tone: 'danger',
      },
    ]
  
    return (
      <article className="analytics-panel">
        <div className="analytics-panel-heading">
          <div>
            <span>OPERATIONS</span>
  
            <h2>
              Operational Efficiency
            </h2>
  
            <p>
              Performance within the selected
              date range.
            </p>
          </div>
        </div>
  
        <div className="analytics-rate-list">
          {rows.map((row) => (
            <div
              className="analytics-rate-row"
              key={row.label}
            >
              <div>
                <span>{row.label}</span>
  
                <strong>
                  {Number(
                    row.value ?? 0
                  ).toFixed(1)}
                  %
                </strong>
              </div>
  
              <div className="analytics-rate-track">
                <div
                  className={`analytics-rate-fill ${row.tone}`}
                  style={{
                    width: `${Math.min(
                      Number(row.value ?? 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    )
  }
  
  export default EfficiencyPanel