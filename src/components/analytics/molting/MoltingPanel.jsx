import useSelectedArea
  from '../../../hooks/useSelectedArea'

function MoltingPanel({
  report,
}) {
  const {
    selectedAreaId,
    selectedArea,
  } = useSelectedArea()

  if (!report) return null

  const scopedArea =
    selectedAreaId
      ? report.byAreas?.find(
          (area) =>
            area.areaId === selectedAreaId
        )
      : null

  const data =
    scopedArea || report

  return (
    <article className="analytics-panel">
      <div className="analytics-panel-heading">
        <div>
          <span>MOLTING</span>

          <h2>
            Molting Performance
          </h2>

          <p>
            {selectedArea
              ? `Area breakdown for ${selectedArea.name}`
              : 'Overall farm molting performance'}
          </p>
        </div>
      </div>

      <div className="analytics-main-rate">
        <strong>
          {Number(
            data.moltingRate ?? 0
          ).toFixed(1)}
          %
        </strong>

        <span>Molting rate</span>
      </div>

      <div className="analytics-mini-stats">
        <div>
          <span>Total Crabs</span>
          <strong>
            {data.totalCrabs ?? 0}
          </strong>
        </div>

        <div>
          <span>Molting</span>
          <strong>
            {data.moltingCrabs ?? 0}
          </strong>
        </div>

        <div>
          <span>Molted</span>
          <strong>
            {data.moltedCrabs ?? 0}
          </strong>
        </div>
      </div>
    </article>
  )
}

export default MoltingPanel