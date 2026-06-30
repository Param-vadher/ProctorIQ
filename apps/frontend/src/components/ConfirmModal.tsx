import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-primary-custom';

  return (
    <div
      className="modal d-block fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content premium-card">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
          </div>
          <div className="modal-body py-4">
            <p className="mb-0 text-secondary">{message}</p>
          </div>
          <div className="modal-footer border-top-0 pt-0">
            <button type="button" className="btn btn-outline-custom" onClick={onCancel}>
              {cancelText}
            </button>
            <button type="button" className={`btn ${btnClass}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
