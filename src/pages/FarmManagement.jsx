import {
  useEffect,
  useState,
} from 'react'

import useSelectedArea
  from '../hooks/useSelectedArea'

import useFarmManagement
  from '../hooks/useFarmManagement'

import FarmManagementHeader
  from '../components/farm-management/FarmManagementHeader'

import FarmManagementLoading
  from '../components/farm-management/FarmManagementLoading'

import FarmManagementError
  from '../components/farm-management/FarmManagementError'

import FarmSummaryGrid
  from '../components/farm-management/summary/FarmSummaryGrid'

import AreaList
  from '../components/farm-management/areas/AreaList'

import RowList
  from '../components/farm-management/rows/RowList'

import BoxTable
  from '../components/farm-management/boxes/BoxTable'

import '../styles/farm-management/FarmManagement.css'

function FarmManagement() {
  const {
    selectedAreaId,
  } = useSelectedArea()

  const [
    selectedRowId,
    setSelectedRowId,
  ] = useState(null)

  const {
    areas,
    rows,
    boxes,

    loading,
    refreshing,
    error,

    reload,
  } = useFarmManagement(
    selectedAreaId
  )

  useEffect(() => {
    setSelectedRowId(null)
  }, [selectedAreaId])

  if (loading) {
    return (
      <FarmManagementLoading />
    )
  }

  if (error) {
    return (
      <FarmManagementError
        message={error}
        onRetry={reload}
      />
    )
  }

  return (
    <div className="farm-management-page">
      <FarmManagementHeader
        refreshing={refreshing}
        onRefresh={reload}
      />

      <FarmSummaryGrid
        areas={areas}
        rows={rows}
        boxes={boxes}
      />

      <AreaList
        areas={areas}
      />

      <RowList
        rows={rows}
        selectedRowId={
          selectedRowId
        }
        onSelectRow={
          setSelectedRowId
        }
      />

      <BoxTable
        boxes={boxes}
        selectedRowId={
          selectedRowId
        }
      />
    </div>
  )
}

export default FarmManagement