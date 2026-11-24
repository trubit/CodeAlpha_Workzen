import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { LogOut } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({ isOpen, onClose }) => {
  const { logout } = useWorkzenStore();

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err) {
      // Non-blocking logout
    }
    logout();
    onClose();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 1060,
        backdropFilter: 'blur(4px)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        className="bg-white rounded-4 border shadow-2xl p-4 p-md-5 text-center"
        style={{ maxWidth: '420px', width: '100%' }}
      >
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center text-danger mb-3"
          style={{ width: 60, height: 60, backgroundColor: '#FEF2F2' }}
        >
          <LogOut size={28} />
        </div>

        <h4 className="fw-bold text-dark mb-2">Sign Out of WORKZEN?</h4>
        <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
          Signing out will securely invalidate your active refresh session and clear local credentials from this browser.
        </p>

        <div className="d-flex flex-column gap-2">
          <button
            type="button"
            className="btn btn-danger w-100 py-2.5 rounded-3 fw-bold"
            onClick={handleConfirmLogout}
          >
            Yes, Sign Out
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-semibold"
            onClick={onClose}
          >
            Cancel & Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

