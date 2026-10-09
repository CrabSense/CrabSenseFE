import {
    MapPin,
    Save,
    X,
  } from 'lucide-react'
  
  import {
    useEffect,
    useState,
  } from 'react'
  
  import farmManagementService
    from '../../../services/farmManagementService'

import '../../../styles/farm-management/AreaFormModal.css'
  
  import AreaForm
    from './AreaForm'
  
    const emptyForm = {
        name: '',
        location: '',
        address: '',
        region: '',
        areaSquareMeters: '',
        establishedAt: getTodayLocalDate(),
        description: '',
      }

  function getTodayLocalDate() {
    const now = new Date()
  
    const year = now.getFullYear()
    const month = String(
      now.getMonth() + 1
    ).padStart(2, '0')
  
    const day = String(
      now.getDate()
    ).padStart(2, '0')
  
    return `${year}-${month}-${day}`
  }
  
  function toDateInputValue(
    value
  ) {
    if (!value) return ''
  
    const date =
      new Date(value)
  
    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return ''
    }
  
    return date
      .toISOString()
      .slice(0, 10)
  }
  
  function buildInitialForm(area) {
    if (!area) {
      return {
        ...emptyForm,
        establishedAt:
          getTodayLocalDate(),
      }
    }
  
    return {
      name:
        area.name ?? '',
  
      location:
        area.location ?? '',
  
      address:
        area.address ?? '',
  
      region:
        area.region ?? '',
  
      areaSquareMeters:
        area.areaSquareMeters ?? '',
  
      establishedAt:
        toDateInputValue(
          area.establishedAt
        ),
  
      description:
        area.description ?? '',
    }
  }
  
  function normalizeOptional(
    value
  ) {
    const trimmed =
      String(value ?? '').trim()
  
    return trimmed || null
  }
  
  function AreaFormModal({
    open,
    area,
    onClose,
    onSuccess,
  }) {
    const isEdit =
      Boolean(area)
  
    const [form, setForm] =
      useState(emptyForm)
  
    const [saving, setSaving] =
      useState(false)
  
    const [error, setError] =
      useState(null)
  
    useEffect(() => {
      if (!open) return
  
      setForm(
        buildInitialForm(area)
      )
  
      setError(null)
    }, [
      open,
      area,
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
        name:
          form.name.trim(),
  
        location:
          normalizeOptional(
            form.location
          ),
  
        areaSquareMeters:
          form.areaSquareMeters === ''
            ? null
            : Number(
                form.areaSquareMeters
              ),
  
        description:
          normalizeOptional(
            form.description
          ),
  
        status: null,
  
        address:
          normalizeOptional(
            form.address
          ),
  
        region:
          normalizeOptional(
            form.region
          ),
  
        establishedAt:
          form.establishedAt ||
          null,
  
        avatarUrl: null,
  
        latitude: null,
  
        longitude: null,
      })
  
    const buildUpdatePayload =
      () => ({
        name:
          form.name.trim(),
  
        location:
          normalizeOptional(
            form.location
          ),
  
        areaSquareMeters:
          form.areaSquareMeters === ''
            ? null
            : Number(
                form.areaSquareMeters
              ),
  
        description:
          normalizeOptional(
            form.description
          ),
  
        /*
         * Những field chưa expose
         * trong modal phải preserve.
         */
        status:
          area?.status ?? null,
  
        isActive:
          area?.isActive ?? true,
  
        address:
          normalizeOptional(
            form.address
          ),
  
        region:
          normalizeOptional(
            form.region
          ),
  
        establishedAt:
          form.establishedAt ||
          null,
  
        avatarUrl:
          area?.avatarUrl ??
          null,
  
        latitude:
          area?.latitude ??
          null,
  
        longitude:
          area?.longitude ??
          null,
      })
  
    const handleSubmit =
      async (event) => {
        event.preventDefault()
  
        const name =
          form.name.trim()
  
        if (!name) {
          setError(
            'Area name is required.'
          )
  
          return
        }
  
        if (
          form.areaSquareMeters !== '' &&
          (
            Number.isNaN(
              Number(
                form.areaSquareMeters
              )
            ) ||
            Number(
              form.areaSquareMeters
            ) < 0
          )
        ) {
          setError(
            'Area size must be a valid positive number.'
          )
  
          return
        }
  
        try {
          setSaving(true)
          setError(null)
  
          let result
  
          if (isEdit) {
            result =
              await farmManagementService
                .updateArea(
                  area.id,
                  buildUpdatePayload()
                )
          } else {
            result =
              await farmManagementService
                .createArea(
                  buildCreatePayload()
                )
          }
  
          await onSuccess?.(
            result,
            isEdit
              ? 'update'
              : 'create'
          )
  
          onClose()
        } catch (err) {
          console.error(
            'Area save failed:',
            err
          )
  
          setError(
            err.message ||
            `Unable to ${
              isEdit
                ? 'update'
                : 'create'
            } farming area.`
          )
        } finally {
          setSaving(false)
        }
      }
  
    return (
      <div
        className="area-modal-backdrop"
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
          className="area-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="area-modal-title"
        >
          <div className="area-modal-header">
            <div className="area-modal-title-wrap">
              <div className="area-modal-icon">
                <MapPin size={18} />
              </div>
  
              <div>
                <span>
                  FARMING AREA
                </span>
  
                <h2
                  id="area-modal-title"
                >
                  {isEdit
                    ? 'Edit Area'
                    : 'Create Area'}
                </h2>
              </div>
            </div>
  
            <button
              type="button"
              className="area-modal-close"
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
            <div className="area-modal-body">
              {isEdit && (
                <div className="area-modal-code">
                  <span>
                    AREA CODE
                  </span>
  
                  <strong>
                    {area.code}
                  </strong>
  
                  <small>
                    System generated
                  </small>
                </div>
              )}
  
              <AreaForm
                form={form}
                onChange={
                  handleChange
                }
                disabled={saving}
              />
  
              {error && (
                <div className="area-form-error">
                  {error}
                </div>
              )}
            </div>
  
            <div className="area-modal-footer">
              <button
                type="button"
                className="area-btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
  
              <button
                type="submit"
                className="area-btn-primary"
                disabled={saving}
              >
                <Save size={14} />
  
                {saving
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Area'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  export default AreaFormModal