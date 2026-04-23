// Modal component — reusable confirmation/cancel dialog
// Used for delete confirmations and other dangerous actions
'use client' // Client component because it handles click events

// Props: title, message, callbacks, button label, and danger styling flag
export default function Modal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    // Full-screen overlay — clicking it cancels the action
    <div className="modal-overlay" onClick={onCancel}>
      {/* Modal card — stop click propagation so clicking inside doesn't close it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal heading */}
        <h3 className="modal-title">{title}</h3>
        {/* Description text */}
        <p className="modal-text">{message}</p>
        {/* Action buttons — cancel and confirm */}
        <div className="modal-actions">
          {/* Cancel button — always secondary style */}
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          {/* Confirm button — red (danger) or gold (primary) based on prop */}
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
