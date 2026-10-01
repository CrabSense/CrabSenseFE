import {
    Search,
  } from 'lucide-react'
  
  import {
    useMemo,
    useState,
  } from 'react'
  
  import BoxRow
    from './BoxRow'
  
  function BoxTable({
    boxes = [],
    selectedRowId,
  }) {
    const [search, setSearch] =
      useState('')
  
    const filteredBoxes =
      useMemo(() => {
        const keyword =
          search
            .trim()
            .toLowerCase()
  
        return boxes.filter(
          (box) => {
            if (
              selectedRowId &&
              box.farmingRowId !==
                selectedRowId
            ) {
              return false
            }
  
            if (!keyword) {
              return true
            }
  
            return [
              box.code,
              box.displayName,
              box.rowName,
              box.rowCode,
              box.areaName,
              box.crabTag,
            ]
              .filter(Boolean)
              .some((value) =>
                value
                  .toLowerCase()
                  .includes(keyword)
              )
          }
        )
      }, [
        boxes,
        selectedRowId,
        search,
      ])
  
    return (
      <section className="farm-section">
        <div className="farm-section-heading">
          <div>
            <span>
              CRAB BOXES
            </span>
  
            <h2>
              Box Inventory
            </h2>
  
            <p>
              Current box occupation and
              crab condition.
            </p>
          </div>
  
          <div className="farm-box-search">
            <Search size={14} />
  
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search boxes..."
            />
          </div>
        </div>
  
        <div className="farm-box-table">
          <div className="farm-box-table-header">
            <span>Box</span>
            <span>Row</span>
            <span>Status</span>
            <span>Crabs</span>
            <span>Condition</span>
            <span>Alerts</span>
          </div>
  
          {filteredBoxes.length === 0 ? (
            <div className="farm-empty">
              No boxes match the current filters.
            </div>
          ) : (
            filteredBoxes.map((box) => (
              <BoxRow
                key={box.id}
                box={box}
              />
            ))
          )}
        </div>
      </section>
    )
  }
  
  export default BoxTable