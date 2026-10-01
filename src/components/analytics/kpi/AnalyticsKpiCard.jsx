function AnalyticsKpiCard({
    label,
    value,
    suffix,
    description,
    icon: Icon,
    tone = 'default',
  }) {
    return (
      <article
        className={`analytics-kpi-card ${tone}`}
      >
        <div className="analytics-kpi-icon">
          <Icon size={18} />
        </div>
  
        <div>
          <span className="analytics-kpi-label">
            {label}
          </span>
  
          <div className="analytics-kpi-value">
            <strong>
              {value ?? '--'}
            </strong>
  
            {suffix && (
              <span>{suffix}</span>
            )}
          </div>
  
          <p>{description}</p>
        </div>
      </article>
    )
  }
  
  export default AnalyticsKpiCard