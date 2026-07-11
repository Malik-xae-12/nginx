import { HiExclamation } from 'react-icons/hi';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay confirm-modal" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div className="confirm-icon">
            <HiExclamation />
          </div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Are you sure?</h3>
          <p className="confirm-text">{message}</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
