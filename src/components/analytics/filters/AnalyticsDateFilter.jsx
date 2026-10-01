import {
    CalendarDays,
  } from 'lucide-react'
  
  function AnalyticsDateFilter({
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
  }) {
    return (
      <div className="analytics-date-filter">
        <CalendarDays size={16} />
  
        <div className="analytics-date-field">
          <span>FROM</span>
  
          <input
            type="date"
            value={fromDate}
            onChange={(event) =>
              onFromDateChange(
                event.target.value
              )
            }
          />
        </div>
  
        <div className="analytics-date-divider" />
  
        <div className="analytics-date-field">
          <span>TO</span>
  
          <input
            type="date"
            value={toDate}
            onChange={(event) =>
              onToDateChange(
                event.target.value
              )
            }
          />
        </div>
      </div>
    )
  }
  
  export default AnalyticsDateFilter