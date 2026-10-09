import {
  Plus,
} from 'lucide-react'

import {
  useCallback,
  useState,
} from 'react'

import useSelectedArea
  from '../../../hooks/useSelectedArea'

import RowCard
  from './RowCard'

import RowFormModal
  from './RowFormModal'

import '../../../styles/farm-management/RowList.css'

import ConfirmActionModal
  from '../common/ConfirmActionModal'

import farmManagementService
  from '../../../services/farmManagementService'

function RowList({
  rows = [],
  selectedRowId,
  onSelectRow,
  onRowsChanged,
  onRowSaved,
}) {
  const {
    selectedAreaId,
    selectedArea,
  } = useSelectedArea()

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const [
    editingRow,
    setEditingRow,
  ] = useState(null)


  const canCreate =
    Boolean(selectedAreaId)

  const [
    deactivatingRow,
    setDeactivatingRow,
  ] = useState(null)

  const [
    deactivating,
    setDeactivating,
  ] = useState(false)

  const [
    deactivateError,
    setDeactivateError,
  ] = useState(null)

  const handleDeactivateRequest =
  (row) => {
    if (
      (row.crabCount ?? 0) > 0 ||
      (row.occupiedBoxCount ?? 0) > 0
    ) {
      // show error / don't deactivate
      return
    }

    setDeactivatingRow(row)
    setDeactivateError(null)
  }

  const handleDeactivateClose =
  useCallback(() => {
    if (deactivating) {
      return
    }

    setDeactivatingRow(null)
    setDeactivateError(null)
  }, [deactivating])

  const handleDeactivateConfirm =
  async () => {
    if (!deactivatingRow?.id) {
      return
    }

    try {
      setDeactivating(true)
      setDeactivateError(null)

      const savedRow =
        await farmManagementService
          .deactivateRow(
            deactivatingRow
          )

      /*
       * Remove immediately from
       * active row list.
       */
      onRowDeactivated?.(
        deactivatingRow.id
      )

      /*
       * If currently selected row
       * is being deactivated,
       * clear selection.
       */
      if (
        selectedRowId ===
        deactivatingRow.id
      ) {
        onSelectRow(null)
      }

      setDeactivatingRow(null)

      try {
        await onRowsChanged?.()
      } catch (error) {
        console.error(
          'Row refresh failed:',
          error
        )
      }

      return savedRow
    } catch (error) {
      console.error(
        'Deactivate row failed:',
        error
      )

      setDeactivateError(
        error.message ||
        'Unable to deactivate farming row.'
      )
    } finally {
      setDeactivating(false)
    }
  }


  const handleCreate =
    () => {
      if (!selectedAreaId) {
        return
      }

      setEditingRow(null)
      setModalOpen(true)
    }


  const handleEdit =
    (row) => {
      setEditingRow(row)
      setModalOpen(true)
    }


  const handleClose =
    useCallback(() => {
      setModalOpen(false)
      setEditingRow(null)
    }, [])


    const handleSuccess =
    async (
      savedRow,
      mode
    ) => {
      /*
       * Update UI immediately.
       */
      if (savedRow?.id) {
        onRowSaved?.(
          savedRow
        )
      }
  
      /*
       * Select newly created row.
       */
      if (
        mode === 'create' &&
        savedRow?.id
      ) {
        onSelectRow(
          savedRow.id
        )
      }
  
      /*
       * Sync again with BE.
       */
      try {
        await onRowsChanged?.()
      } catch (error) {
        console.error(
          'Row refresh failed:',
          error
        )
      }
    }

  return (
    <>
      <section className="farm-section">
        <div className="farm-section-heading">
          <div>
            <span>
              FARMING ROWS
            </span>

            <h2>
              Row Structure
            </h2>

            <p>
              {selectedArea
                ? `Manage rows in ${selectedArea.name}.`
                : 'Select a farming area before creating a row.'}
            </p>
          </div>


          <div className="farm-row-heading-actions">
            {selectedRowId && (
              <button
                type="button"
                className="farm-clear-filter"
                onClick={() =>
                  onSelectRow(
                    null
                  )
                }
              >
                Clear row
              </button>
            )}


            <button
              type="button"
              className="farm-row-create-btn"
              onClick={
                handleCreate
              }
              disabled={
                !canCreate
              }
              title={
                canCreate
                  ? 'Create farming row'
                  : 'Select a farming area first'
              }
            >
              <Plus size={14} />

              New Row
            </button>
          </div>
        </div>


        {!selectedAreaId ? (
          <div className="farm-row-area-required">
            <strong>
              Select a farming area
            </strong>

            <p>
              A row must belong to one
              farming area. Choose an
              area above or from the
              global area selector first.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="farm-empty">
            <p>
              No farming rows are
              available in this area.
            </p>

            <button
              type="button"
              className="farm-row-create-btn"
              onClick={
                handleCreate
              }
            >
              <Plus size={14} />

              Create First Row
            </button>
          </div>
        ) : (
          <div className="farm-row-grid">
            {rows.map(
              (row) => (
                <RowCard
                  key={row.id}
                  row={row}
                  selected={
                    row.id ===
                    selectedRowId
                  }
                  onSelect={
                    onSelectRow
                  }
                  onEdit={
                    handleEdit
                  }
                  onDeactivate={
                    handleDeactivateRequest
                  }
                />
              )
            )}
          </div>
        )}
      </section>


      <RowFormModal
        open={modalOpen}
        row={editingRow}
        farmingAreaId={
          selectedAreaId
        }
        areaName={
          selectedArea?.name
        }
        onClose={
          handleClose
        }
        onSuccess={
          handleSuccess
        }
      />

      <ConfirmActionModal
        open={Boolean(deactivatingRow)}
        title="Deactivate Row"
        itemName={
          deactivatingRow?.code
        }
        description={
          'This farming row will remain in the system but will no longer appear in the active row list.'
        }
        warning={
          'Existing boxes are not deleted. Reactivate the row later if it needs to be used again.'
        }
        processing={deactivating}
        error={deactivateError}
        confirmLabel="Deactivate Row"
        processingLabel="Deactivating..."
        onClose={
          handleDeactivateClose
        }
        onConfirm={
          handleDeactivateConfirm
        }
      />
    </>
  )
}

export default RowList