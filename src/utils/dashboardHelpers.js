export const formatNumber = (value) => {
    return Number(value ?? 0).toLocaleString()
  }
  
  export const formatPercentage = (value) => {
    return `${Number(value ?? 0).toFixed(1)}%`
  }
  
  export const formatDashboardTime = (value) => {
    if (!value) return '--'
  
    const date = new Date(value)
  
    if (Number.isNaN(date.getTime())) {
      return '--'
    }
  
    return date.toLocaleString()
  }
  
  export const getHealthClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'excellent':
        return 'health-excellent'
  
      case 'good':
        return 'health-good'
  
      case 'warning':
        return 'health-warning'
  
      case 'danger':
        return 'health-danger'
  
      default:
        return 'health-neutral'
    }
  }