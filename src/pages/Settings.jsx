import React, { useState } from 'react'

const Settings = () => {
  const [settings, setSettings] = useState({
    refreshInterval: 30,
    alertsEnabled: true,
    darkMode: false,
    language: 'vi'
  })

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('crabsense-settings', JSON.stringify(settings))
    alert('Cài đặt đã được lưu!')
  }

  return (
    <div className="settings">
      <h2>Cài đặt</h2>
      
      <div className="settings-section">
        <h3>Hiển thị</h3>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => handleChange('darkMode', e.target.checked)}
            />
            Chế độ tối
          </label>
        </div>
        <div className="setting-item">
          <label>
            Ngôn ngữ:
            <select 
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Giám sát</h3>
        <div className="setting-item">
          <label>
            Tần suất cập nhật (giây):
            <input 
              type="number"
              min="5"
              max="300"
              value={settings.refreshInterval}
              onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
            />
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox"
              checked={settings.alertsEnabled}
              onChange={(e) => handleChange('alertsEnabled', e.target.checked)}
            />
            Bật cảnh báo
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSave}>
          Lưu cài đặt
        </button>
        <button className="btn-secondary" onClick={() => window.location.reload()}>
          Hủy
        </button>
      </div>
    </div>
  )
}

export default Settings
