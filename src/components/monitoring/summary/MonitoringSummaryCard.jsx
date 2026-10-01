function MonitoringSummaryCard({
    label,
    value,
    tone = 'default',
  }) {
    return (
      <article
        className={`monitoring-summary-card ${tone}`}
      >
        <span>{label}</span>
  
        <strong>
          {value ?? 0}
        </strong>
      </article>
    )
  }
  
  export default MonitoringSummaryCard