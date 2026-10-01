import useSelectedArea
  from '../../../hooks/useSelectedArea'

import AreaCard
  from './AreaCard'

function AreaList({
  areas = [],
}) {
  const {
    selectedAreaId,
    setSelectedAreaId,
  } = useSelectedArea()

  return (
    <section className="farm-section">
      <div className="farm-section-heading">
        <div>
          <span>
            FARMING AREAS
          </span>

          <h2>
            Area Overview
          </h2>

          <p>
            Select an area to view its
            rows and boxes.
          </p>
        </div>

        {selectedAreaId && (
          <button
            type="button"
            className="farm-clear-filter"
            onClick={() =>
              setSelectedAreaId(null)
            }
          >
            View all areas
          </button>
        )}
      </div>

      <div className="farm-area-grid">
        {areas.map((area) => (
          <AreaCard
            key={area.id}
            area={area}
            selected={
              area.id ===
              selectedAreaId
            }
            onSelect={
              setSelectedAreaId
            }
          />
        ))}
      </div>
    </section>
  )
}

export default AreaList