import {
  Plus,
  Search,
} from 'lucide-react'

import {
  useCallback,
  useMemo,
  useState,
} from 'react'

import useSelectedArea
  from '../../../hooks/useSelectedArea'

import farmManagementService
  from '../../../services/farmManagementService'

import {
  BOX_STATUS,
} from '../../../constants/boxStatuses'

import BoxRow
  from './BoxRow'

import BoxFormModal
  from './BoxFormModal'

import '../../../styles/farm-management/BoxTable.css'

import ConfirmActionModal
  from '../common/ConfirmActionModal'


function BoxTable({
  boxes = [],
  rows = [],
  selectedRowId,
  onBoxesChanged,
  onBoxSaved,
}) {
  const {
    selectedArea,
  } = useSelectedArea()

  const [search, setSearch] =
    useState('')

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const [
    editingBox,
    setEditingBox,
  ] = useState(null)


  const selectedRow =
    rows.find(
      (row) =>
        row.id === selectedRowId
    ) ?? null

  const [
    clearingBox,
    setClearingBox,
  ] = useState(null)

  const [
    clearing,
    setClearing,
  ] = useState(false)

  const [
    clearError,
    setClearError,
  ] = useState(null)

  const handleClearRequest =
  (box) => {
    setClearingBox(box)
    setClearError(null)
  }

  const handleClearClose =
  useCallback(() => {
    if (clearing) {
      return
    }

    setClearingBox(null)
    setClearError(null)
  }, [clearing])

  const handleClearConfirm =
  async () => {
    if (!clearingBox?.id) {
      return
    }


    /*
     * FE safety check.
     */
    if (
      (clearingBox.crabCount ?? 0) > 0 ||
      clearingBox.crabId
    ) {
      setClearError(
        'This box still contains a crab. Move or harvest the crab before clearing the box.'
      )

      return
    }


    try {
      setClearing(true)
      setClearError(null)

      const savedBox =
        await farmManagementService
          .updateBoxStatus(
            clearingBox.id,
            {
              status:
                BOX_STATUS.EMPTY,

              isOccupied:
                false,
            }
          )


      /*
       * Box remains in system.
       */
      if (savedBox?.id) {
        onBoxSaved?.(
          savedBox
        )
      }


      setClearingBox(null)


      /*
       * Sync counters / rows / areas.
       */
      try {
        await onBoxesChanged?.()
      } catch (refreshError) {
        console.error(
          'Refresh after clearing box failed:',
          refreshError
        )
      }

    } catch (error) {
      console.error(
        'Clear box failed:',
        error
      )

      setClearError(
        error.message ||
        'Unable to clear box.'
      )

    } finally {
      setClearing(false)
    }
  }
  
  const filteredBoxes =
    useMemo(() => {
      let result =
        selectedRowId
          ? boxes.filter(
              (box) =>
                box.farmingRowId ===
                selectedRowId
            )
          : boxes

      const term =
        search
          .trim()
          .toLowerCase()

      if (!term) {
        return result
      }

      return result.filter(
        (box) =>
          box.code
            ?.toLowerCase()
            .includes(term) ||
          box.crabTag
            ?.toLowerCase()
            .includes(term) ||
          box.status
            ?.toLowerCase()
            .includes(term)
      )
    }, [
      boxes,
      selectedRowId,
      search,
    ])


  const handleCreate =
    () => {
      if (!selectedRowId) {
        return
      }

      setEditingBox(null)
      setModalOpen(true)
    }


  const handleEdit =
    (box) => {
      setEditingBox(box)
      setModalOpen(true)
    }


  const handleClose =
    useCallback(() => {
      setModalOpen(false)
      setEditingBox(null)
    }, [])


  const handleSuccess =
    async (
      savedBox
    ) => {
      /*
       * Update UI immediately.
       */
      if (savedBox?.id) {
        onBoxSaved?.(
          savedBox
        )
      }

      /*
       * Then sync server state.
       */
      try {
        await onBoxesChanged?.()
      } catch (error) {
        console.error(
          'Box refresh failed:',
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
              FARM BOXES
            </span>

            <h2>
              Box Inventory
            </h2>

            <p>
              {selectedRow
                ? `Boxes inside ${selectedRow.name}.`
                : 'Select a farming row to create a box.'}
            </p>
          </div>


          <div className="farm-box-heading-actions">
            <div className="farm-box-search">
              <Search size={13} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search boxes..."
              />
            </div>

            <button
              type="button"
              className="farm-box-create-btn"
              onClick={handleCreate}
              disabled={!selectedRowId}
              title={
                selectedRowId
                  ? 'Create box'
                  : 'Select a row first'
              }
            >
              <Plus size={14} />
              New Box
            </button>
          </div>
        </div>


        {!selectedRowId ? (
          <div className="farm-box-row-required">
            <strong>
              Select a farming row
            </strong>

            <p>
              A box must belong to a
              farming row. Choose a row
              above before creating a box.
            </p>
          </div>
        ) : filteredBoxes.length === 0 ? (
          <div className="farm-empty">
            <p>
              {search
                ? 'No boxes match your search.'
                : 'No boxes are available in this row.'}
            </p>

            {!search && (
              <button
                type="button"
                className="farm-box-create-btn"
                onClick={
                  handleCreate
                }
              >
                <Plus size={14} />

                Create First Box
              </button>
            )}
          </div>
        ) : (
          <div className="farm-box-table">
            <div className="farm-box-table-header">
              <span>Box</span>
              <span>Row</span>
              <span>Status</span>
              <span>Crabs</span>
              <span>Crab Tag</span>
              <span>Actions</span>
            </div>

            {filteredBoxes.map(
              (box) => (
                <BoxRow
                  key={box.id}
                  box={box}
                  onEdit={
                    handleEdit
                  }
                  onClear={handleClearRequest}
                />
              )
            )}
          </div>
        )}
      </section>


      <BoxFormModal
        open={modalOpen}
        box={editingBox}
        farmingRowId={
          selectedRowId
        }
        rowName={
          selectedRow?.name
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
        open={Boolean(clearingBox)}
        title="Clear Box"
        itemName={
          clearingBox?.code
        }
        description={
          'The box will remain in the system and will be reset to the empty state.'
        }
        warning={
          'Only clear this box after its crab has been moved or harvested.'
        }
        processing={clearing}
        error={clearError}
        confirmLabel="Clear Box"
        processingLabel="Clearing..."
        onClose={
          handleClearClose
        }
        onConfirm={
          handleClearConfirm
        }
      />
    </>


  )


}

export default BoxTable