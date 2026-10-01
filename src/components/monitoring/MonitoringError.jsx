function MonitoringError({
    message,
    onRetry,
  }) {
    return (
      <div className="monitoring-error">
        <div>
          <strong>
            Unable to load monitoring
          </strong>
  
          <p>{message}</p>
        </div>
  
        <button
          type="button"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
    )
  }
  
  export default MonitoringError