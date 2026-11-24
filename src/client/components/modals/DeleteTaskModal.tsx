import React, { useState } from 'react';
import { apiClient } from '../../api/client.js';
import { AlertTriangle, Archive, Trash2, X } from 'lucide-react';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onDeleted: () => void;
  mode?: 'archive' | 'permanent';
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onDeleted,
  mode = 'archive'
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const isPermanent = mode === 'permanent';

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = isPermanent
        ? await apiClient.deleteTask(task.id || task._id)
        : await apiClient.archiveTask(task.id || task._id);

      if (res.success) {
        onDeleted();
        onClose();
      } else {
        setError(res.error?.message || `Failed to ${isPermanent ? 'delete' : 'archive'} task.`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1070
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg border border-slate-200 w-100"
        style={{ maxWidth: 480 }}
      >
        <div className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div
              className={`rounded-circle p-2.5 d-flex align-items-center justify-content-center ${
                isPermanent ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'
              }`}
            >
              {isPermanent ? <Trash2 size={24} /> : <Archive size={24} />}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-1"
              onClick={onClose}
              disabled={isDeleting}
            >
              <X size={20} />
            </button>
          </div>

          <h5 className="fw-bold text-dark mb-1.5">
            {isPermanent ? 'Permanently Delete Task?' : 'Archive Task?'}
          </h5>

          <p className="text-secondary small mb-3">
            {isPermanent ? (
              <>
                This will permanently delete{' '}
                <strong className="text-dark font-monospace">{task.taskKey}</strong>:{' '}
                <span className="text-dark">"{task.title}"</span>. This action is irreversible.
              </>
            ) : (
              <>
                Archiving <strong className="text-dark font-monospace">{task.taskKey}</strong> will
                remove it from active sprint boards and task lists. You can view and restore it from
                the archived tasks view at any time.
              </>
            )}
          </p>

          {error && (
            <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3">
              {error}
            </div>
          )}

          <div className="d-flex align-items-center justify-content-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3 py-2 fw-medium rounded-3"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-sm px-4 py-2 fw-semibold rounded-3 text-white shadow-sm ${
                isPermanent ? 'btn-danger' : 'btn-warning'
              }`}
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting
                ? isPermanent
                  ? 'Deleting...'
                  : 'Archiving...'
                : isPermanent
                ? 'Delete Permanently'
                : 'Archive Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

