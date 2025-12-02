interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  cancelText: string
  confirmText: string
  isDangerous?: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmationDialog({
  isOpen,
  title,
  message,
  cancelText,
  confirmText,
  isDangerous = false,
  onCancel,
  onConfirm
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
          {title}
        </h2>
        <p style={{ marginBottom: '24px', fontSize: '16px', color: 'var(--color-text-light)' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-primary ${isDangerous ? 'btn-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
