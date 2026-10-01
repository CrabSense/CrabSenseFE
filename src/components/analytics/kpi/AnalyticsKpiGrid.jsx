import {
    Activity,
    PackageCheck,
    Shell,
    TrendingUp,
  } from 'lucide-react'
  
  import AnalyticsKpiCard
    from './AnalyticsKpiCard'
  
  function AnalyticsKpiGrid({
    survival,
    harvest,
    molting,
    efficiency,
  }) {
    return (
      <section className="analytics-kpi-grid">
        <AnalyticsKpiCard
          icon={Activity}
          label="Survival Rate"
          value={
            Number(
              survival?.survivalRate ?? 0
            ).toFixed(1)
          }
          suffix="%"
          description={`${survival?.aliveCrabs ?? 0} alive crabs`}
          tone="bio"
        />
  
        <AnalyticsKpiCard
          icon={PackageCheck}
          label="Harvest Weight"
          value={
            Number(
              harvest?.totalWeightKg ?? 0
            ).toFixed(1)
          }
          suffix="kg"
          description={`${harvest?.totalQuantity ?? 0} harvested crabs`}
        />
  
        <AnalyticsKpiCard
          icon={Shell}
          label="Molting Rate"
          value={
            Number(
              molting?.moltingRate ?? 0
            ).toFixed(1)
          }
          suffix="%"
          description={`${molting?.moltedCrabs ?? 0} molted crabs`}
        />
  
        <AnalyticsKpiCard
          icon={TrendingUp}
          label="Harvest Rate"
          value={
            Number(
              efficiency?.harvestRate ?? 0
            ).toFixed(1)
          }
          suffix="%"
          description="Operational efficiency"
        />
      </section>
    )
  }
  
  export default AnalyticsKpiGrid