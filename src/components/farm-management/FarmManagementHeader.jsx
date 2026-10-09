import {
    Boxes,
    RefreshCw,
  } from 'lucide-react'
  
  import useSelectedArea
    from '../../hooks/useSelectedArea'
  
  import '../../styles/farm-management/FarmManagementHeader.css'

  function FarmManagementHeader({
    refreshing,
    onRefresh,
  }) {
    const {
      selectedArea,
    } = useSelectedArea()
  
    return (
      <section className="farm-management-header">
        <div>
          <div className="farm-management-label">
            <Boxes size={13} />
  
            FARM STRUCTURE
          </div>
  
          <h1>
            Farm Management
          </h1>
  
          <p>
            Manage farming areas,
            rows and crab boxes for{' '}
            <strong>
              {selectedArea
                ? selectedArea.name
                : 'all farming areas'}
            </strong>.
          </p>
        </div>
  
        <button
          type="button"
          className="farm-management-refresh"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? 'farm-spin'
                : ''
            }
          />
  
          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>
      </section>
    )
  }
  
  export default FarmManagementHeader