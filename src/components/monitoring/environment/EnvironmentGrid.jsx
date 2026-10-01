import {
    Droplets,
    Gauge,
    Thermometer,
    Wifi,
  } from 'lucide-react'
  
  import EnvironmentCard from './EnvironmentCard'
  
  function EnvironmentGrid({
    water,
    devices,
  }) {
    const totalDevices =
      devices?.totalCount ?? 0
  
    const onlineDevices =
      devices?.onlineCount ?? 0
  
    const devicePercentage =
      totalDevices > 0
        ? Math.round(
            (onlineDevices / totalDevices) *
              100
          )
        : 0
  
    return (
      <section className="environment-grid">
        <EnvironmentCard
          icon={Thermometer}
          label="Water Temperature"
          value={water?.temperature}
          unit="°C"
          description="Area water temperature"
        />
  
        <EnvironmentCard
          icon={Gauge}
          label="pH Level"
          value={water?.ph}
          description="Current pH measurement"
        />
  
        <EnvironmentCard
          icon={Droplets}
          label="Dissolved Oxygen"
          value={water?.dissolvedOxygen}
          unit="mg/L"
          description="Current oxygen level"
        />
  
        <EnvironmentCard
          icon={Wifi}
          label="Devices Online"
          value={`${devicePercentage}%`}
          description={`${onlineDevices} of ${totalDevices} devices online`}
          status={
            totalDevices > 0 &&
            onlineDevices < totalDevices
              ? 'warning'
              : 'normal'
          }
        />
      </section>
    )
  }
  
  export default EnvironmentGrid