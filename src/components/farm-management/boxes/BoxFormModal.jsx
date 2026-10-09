import {
    Box,
    Save,
    X,
  } from 'lucide-react'
  
  import {
    useEffect,
    useState,
  } from 'react'
  
  import farmManagementService
    from '../../../services/farmManagementService'
  
  import BoxForm
    from './BoxForm'
  
  import '../../../styles/farm-management/BoxFormModal.css'

  import {
    BOX_STATUS,
  } from '../../../constants/boxStatuses'
  
  
  const emptyForm = {
    code: '',
    status: BOX_STATUS.EMPTY,
    isOccupied: false,
  }
  
  
  function buildInitialForm(box) {
    if (!box) {
      return {
        ...emptyForm,
      }
    }
  
    return {
      code:
        box.code ?? '',
  
      status:
        box.status ??
        BOX_STATUS.EMPTY,
  
      isOccupied:
        Boolean(
          box.isOccupied
        ),
    }
  }
  
  
  function BoxFormModal({
    open,
    box,
    farmingRowId,
    rowName,
    areaName,
    onClose,
    onSuccess,
  }) {
    const isEdit =
      Boolean(box)
  
    const [form, setForm] =
      useState(emptyForm)
  
    const [saving, setSaving] =
      useState(false)
  
    const [error, setError] =
      useState(null)
  
  
    useEffect(() => {
      if (!open) return
  
      setForm(
        buildInitialForm(box)
      )
  
      setError(null)
    }, [
      open,
      box,
    ])
  
  
    useEffect(() => {
      if (!open) return
  
      const handleEscape =
        (event) => {
          if (
            event.key === 'Escape' &&
            !saving
          ) {
            onClose()
          }
        }
  
      document.addEventListener(
        'keydown',
        handleEscape
      )
  
      document.body.style.overflow =
        'hidden'
  
      return () => {
        document.removeEventListener(
          'keydown',
          handleEscape
        )
  
        document.body.style.overflow =
          ''
      }
    }, [
      open,
      saving,
      onClose,
    ])
  
  
    if (!open) {
      return null
    }
  
  
    const handleChange = (
        field,
        value
      ) => {
        setForm(
          (current) => ({
            ...current,
            [field]: value,
          })
        )
      
        if (error) {
          setError(null)
        }
      }
  
  
      const handleSubmit =
      async (event) => {
        event.preventDefault()
    
        /*
         * Row is required only
         * when creating a box.
         */
        if (
          !isEdit &&
          !farmingRowId
        ) {
          setError(
            'A farming row must be selected.'
          )
    
          return
        }
    
    
        /*
         * Code is required
         * when editing.
         */
        if (
          isEdit &&
          !form.code.trim()
        ) {
          setError(
            'Box code is required.'
          )
    
          return
        }
    
    
        try {
          setSaving(true)
          setError(null)
    
          let savedBox
    
    
          /*
           * EDIT BOX
           */
          if (isEdit) {
            const nextCode =
              form.code.trim()
          
            const codeChanged =
              nextCode !== box.code
          
            const statusChanged =
              form.status !== box.status
          
            const isOccupied =
              Boolean(
                box.isOccupied
              )
          
          
            savedBox = box
          
          
            /*
             * CODE
             */
            if (codeChanged) {
              savedBox =
                await farmManagementService
                  .updateBox(
                    box.id,
                    {
                      code:
                        nextCode,
          
                      status:
                        box.status,
          
                      isOccupied,
                    }
                  )
            }
          
          
            /*
             * STATUS
             *
             * Admin may change status
             * only when box is empty.
             */
            if (
              !isOccupied &&
              statusChanged
            ) {
              savedBox =
                await farmManagementService
                  .updateBoxStatus(
                    box.id,
                    {
                      status:
                        form.status,
          
                      isOccupied:
                        false,
                    }
                  )
            }
          }
    
          /*
           * CREATE BOX
           */
          else {
            savedBox =
              await farmManagementService
                .createBox(
                  farmingRowId
                )
          }
    
    
          await onSuccess?.(
            savedBox,
            isEdit
              ? 'update'
              : 'create'
          )
    
          onClose()
    
        } catch (err) {
          console.error(
            'Box save failed:',
            err
          )
    
          setError(
            err.message ||
            `Unable to ${
              isEdit
                ? 'update'
                : 'create'
            } box.`
          )
    
        } finally {
          setSaving(false)
        }
      }
  
  
    return (
      <div
        className="box-modal-backdrop"
        onMouseDown={(event) => {
          if (
            event.target ===
              event.currentTarget &&
            !saving
          ) {
            onClose()
          }
        }}
      >
        <div
          className="box-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="box-modal-title"
        >
          <div className="box-modal-header">
            <div className="box-modal-title-wrap">
              <div className="box-modal-icon">
                <Box size={18} />
              </div>
  
              <div>
                <span>
                  FARM BOX
                </span>
  
                <h2 id="box-modal-title">
                  {isEdit
                    ? 'Edit Box'
                    : 'Create Box'}
                </h2>
              </div>
            </div>
  
            <button
              type="button"
              className="box-modal-close"
              onClick={onClose}
              disabled={saving}
            >
              <X size={18} />
            </button>
          </div>
  
  
          <form onSubmit={handleSubmit}>
            <div className="box-modal-body">
  
              <div className="box-parent-info">
                <div>
                  <span>
                    FARMING AREA
                  </span>
  
                  <strong>
                    {areaName ||
                      'Selected Area'}
                  </strong>
                </div>
  
                <div>
                  <span>
                    FARMING ROW
                  </span>
  
                  <strong>
                    {rowName ||
                      'Selected Row'}
                  </strong>
                </div>
              </div>
  
  
              {!isEdit && (
                <div className="box-auto-code">
                  <span>
                    BOX CODE
                  </span>
  
                  <strong>
                    Auto generated
                  </strong>
  
                  <small>
                    BOX-0001, BOX-0002, ...
                  </small>
                </div>
              )}
  
  
              {isEdit ? (
                <BoxForm
                form={form}
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
                isOccupied={
                  Boolean(
                    box?.isOccupied
                  )
                }
              />
              ) : (
                <div className="box-create-message">
                  A new empty box will be
                  created in the selected
                  farming row.
                </div>
              )}
  
  
              {error && (
                <div className="box-form-error">
                  {error}
                </div>
              )}
            </div>
  
  
            <div className="box-modal-footer">
              <button
                type="button"
                className="box-btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
  
              <button
                type="submit"
                className="box-btn-primary"
                disabled={saving}
              >
                <Save size={14} />
  
                {saving
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Box'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  export default BoxFormModal