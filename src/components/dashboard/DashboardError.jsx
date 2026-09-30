function DashboardError({
    message,
    onRetry,
  }) {
    return (
      <div className="dashboard-error">
        <div>
          <strong>Unable to load dashboard</strong>
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
  
  export default DashboardError