import {
    Grid3X3,
    Save,
    X,
  } from 'lucide-react'
  
  import {
    useEffect,
    useState,
  } from 'react'
  
  import farmManagementService
    from '../../../services/farmManagementService'
  
  import RowForm
    from './RowForm'
  
  import '../../../styles/farm-management/RowFormModal.css'
  
  
  const emptyForm = {
    name: '',
    location: '',
    capacity: '0',
    sortOrder: '0',
    description: '',
  }
  
  
  function buildInitialForm(row) {
    if (!row) {
      return {
        ...emptyForm,
      }
    }
  
    return {
      name:
        row.name ?? '',
  
      location:
        row.location ?? '',
  
      capacity:
        String(
          row.capacity ?? 0
        ),
  
      sortOrder:
        String(
          row.sortOrder ?? 0
        ),
  
      description:
        row.description ?? '',
    }
  }
  
  
  function normalizeOptional(
    value
  ) {
    const trimmed =
      String(value ?? '').trim()
  
    return trimmed || null
  }
  
  
  function RowFormModal({
    open,
    row,
    farmingAreaId,
    areaName,
    onClose,
    onSuccess,
  }) {
    const isEdit =
      Boolean(row)
  
    const [form, setForm] =
      useState(emptyForm)
  
    const [saving, setSaving] =
      useState(false)
  
    const [error, setError] =
      useState(null)
  
  
    useEffect(() => {
      if (!open) return
  
      setForm(
        buildInitialForm(row)
      )
  
      setError(null)
    }, [
      open,
      row,
    ])
  
  
    useEffect(() => {
      if (!open) return
  
      const handleEscape = (
        event
      ) => {
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
  
  
    const buildCreatePayload =
      () => ({
        farmingAreaId,
  
        name:
          form.name.trim(),
  
        location:
          normalizeOptional(
            form.location
          ),
  
        capacity:
          Number(
            form.capacity
          ),
  
        description:
          normalizeOptional(
            form.description
          ),
  
        status: null,
  
        sortOrder:
          Number(
            form.sortOrder
          ),
      })
  
  
    const buildUpdatePayload =
      () => ({
        name:
          form.name.trim(),
  
        location:
          normalizeOptional(
            form.location
          ),
  
        capacity:
          Number(
            form.capacity
          ),
  
        description:
          normalizeOptional(
            form.description
          ),
  
        /*
         * Preserve BE state.
         * User does not edit these
         * fields in this modal.
         */
        status:
          row?.status ?? null,
  
        isActive:
          row?.isActive ?? true,
  
        sortOrder:
          Number(
            form.sortOrder
          ),
      })
  
  
    const handleSubmit =
      async (event) => {
        event.preventDefault()
  
        const name =
          form.name.trim()
  
        if (!name) {
          setError(
            'Row name is required.'
          )
  
          return
        }
  
        if (!farmingAreaId) {
          setError(
            'A farming area must be selected.'
          )
  
          return
        }
  
        const capacity =
          Number(form.capacity)
  
        if (
          !Number.isInteger(
            capacity
          ) ||
          capacity < 0 ||
          capacity > 500
        ) {
          setError(
            'Capacity must be a whole number between 0 and 500.'
          )
  
          return
        }
  
        const sortOrder =
          Number(form.sortOrder)
  
        if (
          !Number.isInteger(
            sortOrder
          ) ||
          sortOrder < 0
        ) {
          setError(
            'Sort order must be a whole number greater than or equal to 0.'
          )
  
          return
        }
  
        /*
         * Extra client validation
         * matching BE rule.
         *
         * Existing row cannot be
         * changed to a capacity below
         * current box count, unless
         * capacity is 0 = unlimited.
         */
        if (
          isEdit &&
          capacity > 0 &&
          capacity <
            (row?.boxCount ?? 0)
        ) {
          setError(
            `Capacity cannot be less than the current box count (${row?.boxCount ?? 0}).`
          )
  
          return
        }
  
        try {
          setSaving(true)
          setError(null)
  
          let savedRow
  
          if (isEdit) {
            savedRow =
              await farmManagementService
                .updateRow(
                  row.id,
                  buildUpdatePayload()
                )
          } else {
            savedRow =
              await farmManagementService
                .createRow(
                  buildCreatePayload()
                )
          }
  
          await onSuccess?.(
            savedRow,
            isEdit
              ? 'update'
              : 'create'
          )
  
          onClose()
        } catch (err) {
          console.error(
            'Row save failed:',
            err
          )
  
          setError(
            err.message ||
            `Unable to ${
              isEdit
                ? 'update'
                : 'create'
            } farming row.`
          )
        } finally {
          setSaving(false)
        }
      }
  
  
    return (
      <div
        className="row-modal-backdrop"
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
          className="row-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="row-modal-title"
        >
          <div className="row-modal-header">
            <div className="row-modal-title-wrap">
              <div className="row-modal-icon">
                <Grid3X3 size={18} />
              </div>
  
              <div>
                <span>
                  FARMING ROW
                </span>
  
                <h2 id="row-modal-title">
                  {isEdit
                    ? 'Edit Row'
                    : 'Create Row'}
                </h2>
              </div>
            </div>
  
            <button
              type="button"
              className="row-modal-close"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
  
  
          <form
            onSubmit={
              handleSubmit
            }
          >
            <div className="row-modal-body">
  
              <div className="row-parent-area">
                <div>
                  <span>
                    FARMING AREA
                  </span>
  
                  <strong>
                    {areaName ||
                      'Selected Area'}
                  </strong>
                </div>
  
                <small>
                  Parent area
                </small>
              </div>
  
  
              {isEdit && (
                <div className="row-modal-code">
                  <span>
                    ROW CODE
                  </span>
  
                  <strong>
                    {row.code}
                  </strong>
  
                  <small>
                    System generated
                  </small>
                </div>
              )}
  
  
              <RowForm
                form={form}
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
              />
  
  
              {error && (
                <div className="row-form-error">
                  {error}
                </div>
              )}
            </div>
  
  
            <div className="row-modal-footer">
              <button
                type="button"
                className="row-btn-secondary"
                onClick={
                  onClose
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>
  
              <button
                type="submit"
                className="row-btn-primary"
                disabled={
                  saving
                }
              >
                <Save size={14} />
  
                {saving
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Row'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  export default RowFormModal