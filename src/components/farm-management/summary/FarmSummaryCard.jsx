function FarmSummaryCard({
    label,
    value,
    icon: Icon,
    tone = 'default',
  }) {
    return (
      <article
        className={`farm-summary-card ${tone}`}
      >
        <div className="farm-summary-icon">
          <Icon size={18} />
        </div>
  
        <div>
          <span>
            {label}
          </span>
  
          <strong>
            {value ?? 0}
          </strong>
        </div>
      </article>
    )
  }
  
  export default FarmSummaryCard