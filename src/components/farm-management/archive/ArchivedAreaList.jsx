import {
    Archive,
  } from 'lucide-react'
  
  import {
    useCallback,
    useEffect,
    useState,
  } from 'react'
  
  import farmManagementService
    from '../../../services/farmManagementService'
  
  import useSelectedArea
    from '../../../hooks/useSelectedArea'
  
  import ConfirmActionModal
    from '../common/ConfirmActionModal'
  
  import ArchivedAreaCard
    from './ArchivedAreaCard'
  
  import '../../../styles/farm-management/ArchivedAreaList.css'
  
  
  function ArchivedAreaList({
    onAreasChanged,
  }) {
    const {
      reloadAreas,
    } = useSelectedArea()
  
  
    const [
      areas,
      setAreas,
    ] = useState([])
  
    const [
      loading,
      setLoading,
    ] = useState(true)
  
    const [
      error,
      setError,
    ] = useState(null)
  
  
    const [
      reactivatingArea,
      setReactivatingArea,
    ] = useState(null)
  
    const [
      reactivating,
      setReactivating,
    ] = useState(false)
  
    const [
      reactivateError,
      setReactivateError,
    ] = useState(null)
  
  
    const loadArchivedAreas =
      useCallback(
        async () => {
          try {
            setLoading(true)
            setError(null)
  
            const result =
              await farmManagementService
                .getInactiveAreas()
  
            setAreas(
              Array.isArray(result)
                ? result
                : []
            )
  
          } catch (error) {
            console.error(
              'Load archived areas failed:',
              error
            )
  
            setError(
              error.message ||
              'Unable to load archived farming areas.'
            )
  
          } finally {
            setLoading(false)
          }
        },
        []
      )
  
  
    useEffect(() => {
      loadArchivedAreas()
    }, [loadArchivedAreas])
  
  
    const handleReactivateRequest =
      (area) => {
        setReactivatingArea(area)
        setReactivateError(null)
      }
  
  
    const handleReactivateClose =
      useCallback(() => {
        if (reactivating) {
          return
        }
  
        setReactivatingArea(null)
        setReactivateError(null)
      }, [reactivating])
  
  
    const handleReactivateConfirm =
      async () => {
        if (!reactivatingArea?.id) {
          return
        }
  
  
        const areaId =
          reactivatingArea.id
  
  
        try {
          setReactivating(true)
          setReactivateError(null)
  
  
          await farmManagementService
            .reactivateArea(
              reactivatingArea
            )
  
  
          /*
           * Remove from archived list
           * immediately.
           */
          setAreas(
            (current) =>
              current.filter(
                (area) =>
                  area.id !== areaId
              )
          )
  
  
          setReactivatingArea(null)
  
  
          /*
           * Refresh global Area selector.
           */
          try {
            await reloadAreas?.()
          } catch (error) {
            console.error(
              'Global area refresh failed:',
              error
            )
          }
  
  
          /*
           * Refresh active Farm Management.
           */
          try {
            await onAreasChanged?.()
          } catch (error) {
            console.error(
              'Active area refresh failed:',
              error
            )
          }
  
        } catch (error) {
          console.error(
            'Reactivate area failed:',
            error
          )
  
          setReactivateError(
            error.message ||
            'Unable to reactivate farming area.'
          )
  
        } finally {
          setReactivating(false)
        }
      }
  
  
    return (
      <>
        <section className="farm-section farm-archived-section">
  
          <div className="farm-section-heading">
  
            <div>
              <span>
                ARCHIVED AREAS
              </span>
  
              <h2>
                Inactive Farming Areas
              </h2>
  
              <p>
                Reactivate a previously
                closed farming area.
              </p>
            </div>
  
            <Archive size={18} />
  
          </div>
  
  
          {loading ? (
            <div className="farm-archive-state">
              Loading archived areas...
            </div>
          ) : error ? (
            <div className="farm-archive-error">
              {error}
            </div>
          ) : areas.length === 0 ? (
            <div className="farm-archive-state">
              No archived farming areas.
            </div>
          ) : (
            <div className="farm-archived-area-grid">
  
              {areas.map(
                (area) => (
                  <ArchivedAreaCard
                    key={area.id}
                    area={area}
                    processing={
                      reactivating &&
                      reactivatingArea?.id ===
                        area.id
                    }
                    onReactivate={
                      handleReactivateRequest
                    }
                  />
                )
              )}
  
            </div>
          )}
  
        </section>
  
  
        <ConfirmActionModal
          open={
            Boolean(
              reactivatingArea
            )
          }
          title="Reactivate Area"
          itemName={
            reactivatingArea?.code
          }
          itemLabel="SELECTED AREA"
          description={
            'This farming area will become active and will appear again in the active farming area list.'
          }
          warning={
            'Closed rows inside this area will remain closed and must be reactivated separately.'
          }
          processing={
            reactivating
          }
          error={
            reactivateError
          }
          confirmLabel="Reactivate Area"
          processingLabel="Reactivating..."
          onClose={
            handleReactivateClose
          }
          onConfirm={
            handleReactivateConfirm
          }
        />
  
      </>
    )
  }
  
  export default ArchivedAreaList