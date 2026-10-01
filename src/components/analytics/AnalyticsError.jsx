function AnalyticsError({
    message,
    onRetry,
  }) {
    return (
      <div className="analytics-error">
        <div>
          <strong>
            Unable to load analytics
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
  
  export default AnalyticsError