import React, { useState, useEffect } from 'react'
import WaterQualityCard from '../components/WaterQualityCard'
import { waterQualityAPI } from '../services/api'
import { WATER_QUALITY_PARAMETERS, REFRESH_INTERVALS } from '../utils/constants'

const Monitoring = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await waterQualityAPI.getLatestData()
      setData(result)
      setError(null)
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVALS.NORMAL)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchData}>Thử lại</button>
      </div>
    )
  }

  return (
    <div className="monitoring">
      <h2>Giám sát chất lượng nước</h2>
      <div className="monitoring-grid">
        {data && Object.entries(WATER_QUALITY_PARAMETERS).map(([key, parameter]) => (
          <WaterQualityCard
            key={parameter}
            parameter={parameter}
            value={data[parameter] || 0}
            timestamp={data.timestamp}
          />
        ))}
      </div>
    </div>
  )
}

export default Monitoring
