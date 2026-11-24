import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { AlertTriangle, LogIn } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  const { setActiveView } = useWorkzenStore();

  if (!isOpen) return null;

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
          className="rounded-circle d-inline-flex align-items-center justify-content-center text-warning mb-3"
          style={{ width: 60, height: 60, backgroundColor: '#FFFBEB' }}
        >
          <AlertTriangle size={30} />
        </div>

        <h4 className="fw-bold text-dark mb-2">Session Expired</h4>
        <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
          Your authentication session has timed out due to token expiration or inactivity. Please sign in again to continue.
        </p>

        <button
          type="button"
          className="btn text-white w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
          style={{ backgroundColor: '#4F46E5' }}
          onClick={() => {
            onClose();
            setActiveView('login');
          }}
        >
          <LogIn size={18} />
          <span>Re-Authenticate Now</span>
        </button>
      </div>
    </div>
  );
};

