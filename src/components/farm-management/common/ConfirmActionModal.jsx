import {
    AlertTriangle,
    Eraser,
    X,
  } from 'lucide-react'
  
  import { useEffect } from 'react'
  
  import '../../../styles/farm-management/ConfirmActionModal.css'
  
  
  function ConfirmActionModal({
    open,
    title = 'Confirm Action',
    itemName,
    itemLabel = 'SELECTED ITEM',
    description,
    warning,
    processing = false,
    error = null,

    confirmDisabled = false,

    confirmLabel = 'Confirm',
    processingLabel = 'Processing...',

    onClose,
    onConfirm,
  }) {
    useEffect(() => {
      if (!open) return
  
      const handleEscape = (event) => {
        if (
          event.key === 'Escape' &&
          !processing
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
      processing,
      onClose,
    ])
  
  
    if (!open) {
      return null
    }
  
  
    return (
      <div
        className="confirm-modal-backdrop"
        onMouseDown={(event) => {
          if (
            event.target ===
              event.currentTarget &&
            !processing
          ) {
            onClose()
          }
        }}
      >
        <div
          className="confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="confirm-modal-header">
  
            <div className="confirm-modal-title-wrap">
  
              <div className="confirm-modal-icon">
                <Eraser size={18} />
              </div>
  
              <div>
                <span>
                  FARM BOX ACTION
                </span>
  
                <h2 id="confirm-modal-title">
                  {title}
                </h2>
              </div>
  
            </div>
  
  
            <button
              type="button"
              className="confirm-modal-close"
              onClick={onClose}
              disabled={processing}
              aria-label="Close"
            >
              <X size={18} />
            </button>
  
          </div>
  
  
          <div className="confirm-modal-body">
  
            {description && (
              <p className="confirm-modal-description">
                {description}
              </p>
            )}
  
  
            {itemName && (
              <div className="confirm-modal-target">
  
                <span>
                  SELECTED BOX
                </span>
  
                <strong>
                  {itemName}
                </strong>
  
              </div>
            )}
  
  
            {warning && (
              <div className="confirm-modal-warning">
  
                <AlertTriangle size={15} />
  
                <span>
                  {warning}
                </span>
  
              </div>
            )}
  
  
            {error && (
              <div className="confirm-modal-error">
                {error}
              </div>
            )}
  
          </div>
  
  
          <div className="confirm-modal-footer">
  
            <button
              type="button"
              className="confirm-modal-cancel"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
  
  
            <button
              type="button"
              className="confirm-modal-submit"
              onClick={onConfirm}
              disabled={
                processing ||
                confirmDisabled
              }
            >
              <Eraser size={14} />
  
              {processing
                ? processingLabel
                : confirmLabel}
            </button>
  
          </div>
        </div>
      </div>
    )
  }
  
  export default ConfirmActionModal