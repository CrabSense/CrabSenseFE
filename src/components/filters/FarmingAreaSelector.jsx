import {
    Check,
    ChevronDown,
    MapPin,
  } from 'lucide-react'
  
  import {
    useCallback,
    useRef,
    useState,
  } from 'react'
  
  import useSelectedArea from '../../hooks/useSelectedArea'
  import useClickOutside from '../../hooks/useClickOutside'
  
  import '../../styles/layout/FarmingAreaSelector.css'
  
  function FarmingAreaSelector() {
    const {
      areas,
      selectedAreaId,
      selectedArea,
      setSelectedAreaId,
      areasLoading,
      areasError,
    } = useSelectedArea()
  
    const [open, setOpen] = useState(false)
  
    const dropdownRef = useRef(null)
  
    const closeDropdown = useCallback(() => {
      setOpen(false)
    }, [])
  
    useClickOutside(
      dropdownRef,
      closeDropdown,
      open
    )
  
    const handleSelect = (areaId) => {
      setSelectedAreaId(areaId)
      setOpen(false)
    }
  
    if (areasError) {
      return (
        <div className="global-area-error">
          Unable to load farming areas
        </div>
      )
    }
  
    return (
      <div
        className="global-area-selector"
        ref={dropdownRef}
      >
        <div className="global-area-icon">
          <MapPin size={16} />
        </div>
  
        <div className="global-area-content">
          <span className="global-area-label">
            FARMING AREA
          </span>
  
          <button
            type="button"
            className={`global-area-trigger ${
              open ? 'open' : ''
            }`}
            onClick={() =>
              setOpen((value) => !value)
            }
            disabled={areasLoading}
            aria-expanded={open}
          >
            <span className="global-area-trigger-text">
              {areasLoading
                ? 'Loading areas...'
                : selectedArea
                  ? `${selectedArea.code} — ${selectedArea.name}`
                  : 'All Farming Areas'}
            </span>
  
            <ChevronDown
              size={14}
              className={`global-area-chevron ${
                open ? 'open' : ''
              }`}
            />
          </button>
  
          {open && !areasLoading && (
            <div className="global-area-menu">
              <button
                type="button"
                className={`global-area-option ${
                  !selectedAreaId ? 'selected' : ''
                }`}
                onClick={() =>
                  handleSelect(null)
                }
              >
                <div>
                  <strong>
                    All Farming Areas
                  </strong>
  
                  <span>
                    View complete system
                  </span>
                </div>
  
                {!selectedAreaId && (
                  <Check size={15} />
                )}
              </button>
  
              <div className="global-area-divider" />
  
              {areas.map((area) => {
                const isSelected =
                  area.id === selectedAreaId
  
                return (
                  <button
                    key={area.id}
                    type="button"
                    className={`global-area-option ${
                      isSelected
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      handleSelect(area.id)
                    }
                  >
                    <div>
                      <strong>
                        {area.code} — {area.name}
                      </strong>
  
                      <span>
                        {area.boxCount ?? 0} boxes
                        {' · '}
                        {area.crabCount ?? 0} crabs
                      </span>
                    </div>
  
                    {isSelected && (
                      <Check size={15} />
                    )}
                  </button>
                )
              })}
  
              {areas.length === 0 && (
                <div className="global-area-empty">
                  No active farming areas
                </div>
              )}
            </div>
          )}
        </div>
  
        {selectedArea && (
          <div className="global-area-stats">
            <strong>
              {selectedArea.boxCount ?? 0}
            </strong>
  
            <span>boxes</span>
          </div>
        )}
      </div>
    )
  }
  
  export default FarmingAreaSelector