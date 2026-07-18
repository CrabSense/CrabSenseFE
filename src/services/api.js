// API service configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Generic fetch wrapper
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const config = { ...defaultOptions, ...options }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Water quality data endpoints
export const waterQualityAPI = {
  // Get latest sensor data
  getLatestData: () => fetchAPI('/water-quality/latest'),
  
  // Get historical data
  getHistoricalData: (startDate, endDate) => 
    fetchAPI(`/water-quality/history?start=${startDate}&end=${endDate}`),
  
  // Get specific parameter data
  getParameterData: (parameter) => 
    fetchAPI(`/water-quality/parameter/${parameter}`),
}

export default fetchAPI
