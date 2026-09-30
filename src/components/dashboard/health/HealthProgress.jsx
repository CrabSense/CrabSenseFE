function HealthProgress({
    label,
    value,
  }) {
    const safeValue = Math.min(
      Math.max(Number(value ?? 0), 0),
      100
    )
  
    return (
      <div className="health-progress">
        <div className="health-progress-heading">
          <span>{label}</span>
          <strong>{safeValue}%</strong>
        </div>
  
        <div className="health-progress-track">
          <div
            className="health-progress-value"
            style={{
              width: `${safeValue}%`,
            }}
          />
        </div>
      </div>
    )
  }
  
  export default HealthProgress