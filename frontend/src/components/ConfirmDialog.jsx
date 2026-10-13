import Modal from './Modal';
import Button from './Button';

/** "Are you sure?" step used before deleting or changing a status. */
export default function ConfirmDialog({ open, title = 'Please confirm', message, confirmText = 'Confirm', danger, loading, onConfirm, onCancel }) {
  return (
    <Modal title={title} open={open} onClose={onCancel}>
      <p>{message}</p>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
