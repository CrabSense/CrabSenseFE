function FarmManagementError({
    message,
    onRetry,
  }) {
    return (
      <div className="farm-error">
        <div>
          <strong>
            Unable to load farm management
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
  
  export default FarmManagementError