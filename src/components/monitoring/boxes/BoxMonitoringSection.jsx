import {
    useMemo,
    useState,
  } from 'react'
  
  import MonitoringFilters
    from './MonitoringFilters'
  
  import BoxMonitoringRow
    from './BoxMonitoringRow'
  
  function BoxMonitoringSection({
    boxes = [],
  }) {
    const [search, setSearch] =
      useState('')
  
    const [status, setStatus] =
      useState('all')
  
    const filteredBoxes = useMemo(() => {
      const keyword =
        search.trim().toLowerCase()
  
      return boxes.filter((box) => {
        const health =
          box.health?.statusLevel
            ?.toLowerCase() ||
          box.healthStatus
            ?.toLowerCase() ||
          ''
  
        const matchesStatus =
          status === 'all' ||
          health === status ||
          (
            status === 'offline' &&
            box.devices?.isOnline === false
          )
  
        const matchesSearch =
          !keyword ||
          [
            box.code,
            box.name,
            box.rowName,
            box.areaName,
            box.farmName,
          ]
            .filter(Boolean)
            .some((value) =>
              value
                .toLowerCase()
                .includes(keyword)
            )
  
        return (
          matchesStatus &&
          matchesSearch
        )
      })
    }, [
      boxes,
      search,
      status,
    ])
  
    return (
      <section className="monitoring-box-section">
        <div className="monitoring-section-header">
          <div>
            <span className="monitoring-eyebrow">
              BOX STATUS
            </span>
  
            <h2>Box Monitoring</h2>
  
            <p>
              Real-time health, water,
              device and alert status.
            </p>
          </div>
  
          <MonitoringFilters
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
          />
        </div>
  
        <div className="monitoring-box-table">
          <div className="monitoring-table-header">
            <span>Box</span>
            <span>Health</span>
            <span>Score</span>
            <span>Water</span>
            <span>Device</span>
            <span>Alerts</span>
          </div>
  
          {filteredBoxes.length === 0 ? (
            <div className="monitoring-empty">
              No boxes match the current filters.
            </div>
          ) : (
            filteredBoxes.map((box) => (
              <BoxMonitoringRow
                key={box.id}
                box={box}
              />
            ))
          )}
        </div>
      </section>
    )
  }
  
  export default BoxMonitoringSection