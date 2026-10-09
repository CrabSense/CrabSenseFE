import {
    Archive,
  } from 'lucide-react'
  
  import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from 'react'
  
  import farmManagementService
    from '../../../services/farmManagementService'
  
  import useSelectedArea
    from '../../../hooks/useSelectedArea'
  
  import ConfirmActionModal
    from '../common/ConfirmActionModal'
  
  import ArchivedRowCard
    from './ArchivedRowCard'
  
  import '../../../styles/farm-management/ArchivedRowList.css'
  
  
  function ArchivedRowList({
    activeAreas = [],
    onRowsChanged,
  }) {
    const {
      selectedAreaId,
    } = useSelectedArea()
  
  
    const [
      rows,
      setRows,
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
      reactivatingRow,
      setReactivatingRow,
    ] = useState(null)
  
    const [
      reactivating,
      setReactivating,
    ] = useState(false)
  
    const [
      reactivateError,
      setReactivateError,
    ] = useState(null)
  
  
    const activeAreaIds =
      useMemo(
        () =>
          new Set(
            activeAreas.map(
              (area) =>
                area.id
            )
          ),
        [activeAreas]
      )
  
  
    const loadArchivedRows =
      useCallback(
        async () => {
          try {
            setLoading(true)
            setError(null)
  
            const result =
              await farmManagementService
                .getInactiveRows(
                  selectedAreaId || null
                )
  
            setRows(
              Array.isArray(result)
                ? result
                : []
            )
  
          } catch (error) {
            console.error(
              'Load archived rows failed:',
              error
            )
  
            setError(
              error.message ||
              'Unable to load archived farming rows.'
            )
  
          } finally {
            setLoading(false)
          }
        },
        [selectedAreaId]
      )
  
  
    useEffect(() => {
      loadArchivedRows()
    }, [loadArchivedRows])
  
  
    const handleReactivateRequest =
      (row) => {
        const parentAreaActive =
          activeAreaIds.has(
            row.farmingAreaId
          )
  
        setReactivatingRow(row)
        setReactivateError(null)
  
  
        if (!parentAreaActive) {
          setReactivateError(
            'Reactivate the parent farming area before reactivating this row.'
          )
        }
      }
  
  
    const handleReactivateClose =
      useCallback(() => {
        if (reactivating) {
          return
        }
  
        setReactivatingRow(null)
        setReactivateError(null)
      }, [reactivating])
  
  
    const handleReactivateConfirm =
      async () => {
        if (!reactivatingRow?.id) {
          return
        }
  
        if (reactivateError) {
          return
        }
  
  
        const rowId =
          reactivatingRow.id
  
  
        try {
          setReactivating(true)
          setReactivateError(null)
  
  
          await farmManagementService
            .reactivateRow(
              reactivatingRow
            )
  
  
          /*
           * Remove immediately from archive.
           */
          setRows(
            (current) =>
              current.filter(
                (row) =>
                  row.id !== rowId
              )
          )
  
  
          setReactivatingRow(null)
  
  
          /*
           * Refresh active Farm Management.
           */
          try {
            await onRowsChanged?.()
          } catch (error) {
            console.error(
              'Active row refresh failed:',
              error
            )
          }
  
        } catch (error) {
          console.error(
            'Reactivate row failed:',
            error
          )
  
          setReactivateError(
            error.message ||
            'Unable to reactivate farming row.'
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
                ARCHIVED ROWS
              </span>
  
              <h2>
                Inactive Farming Rows
              </h2>
  
              <p>
                Reactivate previously
                closed farming rows.
              </p>
            </div>
  
            <Archive size={18} />
  
          </div>
  
  
          {loading ? (
            <div className="farm-archive-state">
              Loading archived rows...
            </div>
          ) : error ? (
            <div className="farm-archive-error">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <div className="farm-archive-state">
              No archived farming rows.
            </div>
          ) : (
            <div className="farm-archived-row-grid">
  
              {rows.map(
                (row) => (
                  <ArchivedRowCard
                    key={row.id}
                    row={row}
                    parentAreaActive={
                      activeAreaIds.has(
                        row.farmingAreaId
                      )
                    }
                    processing={
                      reactivating &&
                      reactivatingRow?.id ===
                        row.id
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
              reactivatingRow
            )
          }
          title="Reactivate Row"
          itemName={
            reactivatingRow?.code
          }
          itemLabel="SELECTED ROW"
          description={
            'This farming row will become active and will appear again in the active row list.'
          }
          warning={
            'Existing boxes remain unchanged.'
          }
          processing={
            reactivating
          }
          error={
            reactivateError
          }
          confirmDisabled={
            Boolean(
              reactivateError
            )
          }
          confirmLabel="Reactivate Row"
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
  
  export default ArchivedRowList