import React, { useState } from 'react'
import { calculateAverage, formatDate } from '../utils/helpers'

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="analytics">
      <h2>Phân tích dữ liệu</h2>
      
      <div className="date-range-selector">
        <div className="input-group">
          <label>Từ ngày:</label>
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Đến ngày:</label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
          />
        </div>
        <button className="btn-primary">Xem báo cáo</button>
      </div>

      <div className="analytics-content">
        <div className="chart-placeholder">
          <p>Biểu đồ phân tích sẽ được hiển thị ở đây</p>
          <small>Khoảng thời gian: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}</small>
        </div>

        <div className="statistics">
          <h3>Thống kê tổng quan</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Tổng số mẫu</span>
              <span className="stat-value">--</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cảnh báo</span>
              <span className="stat-value">--</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trung bình nhiệt độ</span>
              <span className="stat-value">-- °C</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trung bình pH</span>
              <span className="stat-value">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
