import React from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

interface AccessDeniedPageProps {
  requiredPermission?: string;
  scope?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  requiredPermission = 'org:manage_roles',
  scope = 'organization'
}) => {
  const { setActiveView, currentOrg, currentWorkspace, currentUser } = useWorkzenStore();

  const incidentId = `sec_403_${Date.now().toString(36)}`;

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-4 bg-light"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ maxWidth: '640px', width: '100%' }}>
        <div className="card-body p-5 text-center">
          {/* Lock Icon */}
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm"
            style={{ width: 84, height: 84, backgroundColor: '#FEE2E2', color: '#EF4444' }}
          >
            <ShieldAlert size={42} />
          </div>

          <h3 className="fw-bolder text-dark mb-2">Access Denied</h3>
          <p className="text-secondary small mb-4">
            Your current account role does not have permission to access this area or action.
          </p>

          {/* Security Diagnostic Box */}
          <div className="p-3.5 rounded-3 bg-light border text-start mb-4 small font-monospace">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">REQUIRED PERMISSION:</span>
              <span className="text-danger fw-bold">{requiredPermission}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">ORGANIZATION:</span>
              <span className="text-dark">{currentOrg?.name || 'Organization'}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">SCOPE:</span>
              <span className="text-dark">{scope.toUpperCase()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">USER IDENTITY:</span>
              <span className="text-dark">{currentUser?.email}</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2">
              <span className="text-muted">INCIDENT REFERENCE:</span>
              <span className="text-primary">{incidentId}</span>
            </div>
          </div>

          <div className="d-flex gap-3 justify-content-center">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-semibold d-flex align-items-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
            <button
              type="button"
              className="btn btn-primary px-4 py-2.5 rounded-3 fw-semibold d-flex align-items-center gap-2"
              style={{ backgroundColor: '#6366F1', borderColor: '#6366F1' }}
              onClick={() => setActiveView('enterprise_dashboard')}
            >
              <Home size={16} />
              <span>Executive Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

