import {
  Plus,
} from 'lucide-react'

import {
  useCallback,
  useState,
} from 'react'

import useSelectedArea
  from '../../../hooks/useSelectedArea'

import farmManagementService
  from '../../../services/farmManagementService'

import '../../../styles/farm-management/AreaList.css'

import AreaCard
  from './AreaCard'

import AreaFormModal
  from './AreaFormModal'

import ConfirmActionModal
  from '../common/ConfirmActionModal'


function AreaList({
  areas,
  onAreasChanged,
  onAreaDeactivated,
}) {
  const {
    selectedAreaId,
    setSelectedAreaId,
    reloadAreas,
  } = useSelectedArea()


  /*
   * CREATE / EDIT MODAL
   */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const [
    editingArea,
    setEditingArea,
  ] = useState(null)


  /*
   * DEACTIVATE MODAL
   */

  const [
    deactivatingArea,
    setDeactivatingArea,
  ] = useState(null)

  const [
    deactivating,
    setDeactivating,
  ] = useState(false)

  const [
    deactivateError,
    setDeactivateError,
  ] = useState(null)


  /*
   * SELECT AREA
   */

  const handleSelectArea =
    (areaId) => {
      setSelectedAreaId(areaId)
    }


  /*
   * CREATE
   */

  const handleCreate =
    () => {
      setEditingArea(null)
      setModalOpen(true)
    }


  /*
   * EDIT
   */

  const handleEdit =
    (area) => {
      setEditingArea(area)
      setModalOpen(true)
    }


  /*
   * CLOSE CREATE / EDIT
   */

  const handleClose =
    useCallback(() => {
      setModalOpen(false)
      setEditingArea(null)
    }, [])


  /*
   * REQUEST DEACTIVATE AREA
   */

  const handleDeactivateRequest =
    async (area) => {
      setDeactivatingArea(area)
      setDeactivateError(null)


      /*
       * Protection 1:
       * Area still contains live crabs.
       */
      if (
        (area.crabCount ?? 0) > 0 ||
        (area.occupiedBoxCount ?? 0) > 0
      ) {
        setDeactivateError(
          'This farming area still contains active crabs. Move or harvest all crabs before deactivating the area.'
        )

        return
      }


      /*
       * Protection 2:
       * Query ACTIVE rows directly
       * for the area being deactivated.
       *
       * This is safer than using the
       * currently displayed rows array.
       */
      try {
        const activeRows =
          await farmManagementService
            .getRows(area.id)

        if (
          Array.isArray(activeRows) &&
          activeRows.length > 0
        ) {
          setDeactivateError(
            `Deactivate all active rows first. ${activeRows.length} active row(s) remain.`
          )

          return
        }
      } catch (error) {
        console.error(
          'Unable to check active rows:',
          error
        )

        setDeactivateError(
          error.message ||
          'Unable to verify active rows for this farming area.'
        )
      }
    }


  /*
   * CLOSE DEACTIVATE MODAL
   */

  const handleDeactivateClose =
    useCallback(() => {
      if (deactivating) {
        return
      }

      setDeactivatingArea(null)
      setDeactivateError(null)
    }, [deactivating])


  /*
   * CONFIRM SOFT DELETE AREA
   */

  const handleDeactivateConfirm =
    async () => {
      if (!deactivatingArea?.id) {
        return
      }

      if (deactivateError) {
        return
      }


      const areaId =
        deactivatingArea.id


      try {
        setDeactivating(true)
        setDeactivateError(null)


        /*
         * PUT Area:
         * status = Closed
         * isActive = false
         */
        await farmManagementService
          .deactivateArea(
            deactivatingArea
          )


        /*
         * Remove immediately from
         * local active Area list.
         */
        onAreaDeactivated?.(
          areaId
        )


        /*
         * If this Area is currently
         * selected globally,
         * clear the selection.
         */
        if (
          selectedAreaId ===
          areaId
        ) {
          setSelectedAreaId(null)
        }


        /*
         * Close modal.
         */
        setDeactivatingArea(null)


        /*
         * Refresh global AreaContext.
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
         * Refresh Farm Management data.
         */
        try {
          await onAreasChanged?.()
        } catch (error) {
          console.error(
            'Area refresh failed:',
            error
          )
        }

      } catch (error) {
        console.error(
          'Deactivate area failed:',
          error
        )

        setDeactivateError(
          error.message ||
          'Unable to deactivate farming area.'
        )

      } finally {
        setDeactivating(false)
      }
    }


  /*
   * CREATE / EDIT SUCCESS
   */

  const handleSuccess =
    async (
      savedArea,
      mode
    ) => {
      /*
       * Refresh global selector.
       */
      await reloadAreas?.()


      /*
       * Refresh Farm Management data.
       *
       * IMPORTANT:
       * onAreasChanged, not onAreaChanged.
       */
      await onAreasChanged?.()


      /*
       * Auto-select newly created Area.
       */
      if (
        mode === 'create' &&
        savedArea?.id
      ) {
        setSelectedAreaId(
          savedArea.id
        )
      }
    }


  return (
    <>
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
              Select an area to view
              its rows and boxes.
            </p>
          </div>


          <div className="farm-area-heading-actions">

            {selectedAreaId && (
              <button
                type="button"
                className="farm-clear-filter"
                onClick={() =>
                  setSelectedAreaId(
                    null
                  )
                }
              >
                View all areas
              </button>
            )}


            <button
              type="button"
              className="farm-create-btn"
              onClick={
                handleCreate
              }
            >
              <Plus size={14} />
              New Area
            </button>

          </div>
        </div>


        {areas.length === 0 ? (
          <div className="farm-empty">

            <p>
              No farming areas
              available.
            </p>

            <button
              type="button"
              className="farm-create-btn"
              onClick={
                handleCreate
              }
            >
              <Plus size={14} />

              Create First Area
            </button>

          </div>
        ) : (
          <div className="farm-area-grid">

            {areas.map(
              (area) => (
                <AreaCard
                  key={area.id}
                  area={area}
                  selected={
                    area.id ===
                    selectedAreaId
                  }
                  onSelect={
                    handleSelectArea
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


      <AreaFormModal
        open={modalOpen}
        area={editingArea}
        onClose={
          handleClose
        }
        onSuccess={
          handleSuccess
        }
      />


      <ConfirmActionModal
        open={
          Boolean(
            deactivatingArea
          )
        }
        title="Deactivate Area"
        itemName={
          deactivatingArea?.code
        }
        itemLabel="SELECTED AREA"
        description={
          'This farming area will remain in the system but will no longer appear in the active area list.'
        }
        warning={
          'Rows, boxes, and historical data are not deleted.'
        }
        processing={
          deactivating
        }
        error={
          deactivateError
        }
        confirmDisabled={
          Boolean(
            deactivateError
          )
        }
        confirmLabel="Deactivate Area"
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

export default AreaList