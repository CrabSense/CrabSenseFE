import {
    Search,
  } from 'lucide-react'
  
  function MonitoringFilters({
    search,
    status,
    onSearchChange,
    onStatusChange,
  }) {
    return (
      <div className="monitoring-filters">
        <div className="monitoring-search">
          <Search size={15} />
  
          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search box, row or area..."
          />
        </div>
  
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value
            )
          }
        >
          <option value="all">
            All Status
          </option>
  
          <option value="healthy">
            Healthy
          </option>
  
          <option value="warning">
            Warning
          </option>
  
          <option value="critical">
            Critical
          </option>
  
          <option value="offline">
            Offline
          </option>
        </select>
      </div>
    )
  }
  
  export default MonitoringFilters