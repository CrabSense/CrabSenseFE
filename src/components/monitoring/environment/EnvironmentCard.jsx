function EnvironmentCard({
    icon: Icon,
    label,
    value,
    unit,
    description,
    status = 'normal',
  }) {
    return (
      <article
        className={`environment-card ${status}`}
      >
        <div className="environment-card-icon">
          <Icon size={20} />
        </div>
  
        <div className="environment-card-body">
          <span className="environment-card-label">
            {label}
          </span>
  
          <div className="environment-card-value">
            <strong>
              {value ?? '--'}
            </strong>
  
            {unit && (
              <span>{unit}</span>
            )}
          </div>
  
          <p>{description}</p>
        </div>
      </article>
    )
  }
  
  export default EnvironmentCard