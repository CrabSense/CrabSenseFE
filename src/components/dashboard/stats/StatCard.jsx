function StatCard({
    label,
    value,
    description,
    icon: Icon,
    tone = 'default',
    accentText,
  }) {
    return (
      <article className={`dashboard-stat-card stat-${tone}`}>
        <div className="stat-card-top">
          <div className="stat-card-icon">
            {Icon && (
              <Icon
                size={19}
                strokeWidth={1.9}
              />
            )}
          </div>
  
          {accentText && (
            <span className="stat-card-accent">
              {accentText}
            </span>
          )}
        </div>
  
        <div className="stat-card-content">
          <p className="dashboard-stat-label">
            {label}
          </p>
  
          <strong className="dashboard-stat-value">
            {value}
          </strong>
  
          {description && (
            <span className="dashboard-stat-description">
              {description}
            </span>
          )}
        </div>
      </article>
    )
  }
  
  export default StatCard