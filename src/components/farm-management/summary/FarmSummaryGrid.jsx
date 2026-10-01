import {
    Boxes,
    Grid3X3,
    Map,
    Shell,
  } from 'lucide-react'
  
  import FarmSummaryCard
    from './FarmSummaryCard'
  
  function FarmSummaryGrid({
    areas,
    rows,
    boxes,
  }) {
    const crabCount =
      boxes.reduce(
        (sum, box) =>
          sum + (box.crabCount ?? 0),
        0
      )
  
    return (
      <section className="farm-summary-grid">
        <FarmSummaryCard
          icon={Map}
          label="Areas"
          value={areas.length}
        />
  
        <FarmSummaryCard
          icon={Grid3X3}
          label="Rows"
          value={rows.length}
        />
  
        <FarmSummaryCard
          icon={Boxes}
          label="Boxes"
          value={boxes.length}
        />
  
        <FarmSummaryCard
          icon={Shell}
          label="Crabs"
          value={crabCount}
          tone="bio"
        />
      </section>
    )
  }
  
  export default FarmSummaryGrid