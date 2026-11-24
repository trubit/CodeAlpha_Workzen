import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const AccountVerificationSuccessPage: React.FC = () => {
  const { setActiveView } = useWorkzenStore();

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-between"
      style={{ backgroundColor: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}
    >
      <header className="bg-white border-bottom py-3 px-4">
        <div className="container d-flex justify-content-between align-items-center max-w-1000 mx-auto">
          <div
            className="d-flex align-items-center gap-2"
            role="button"
            onClick={() => setActiveView('landing')}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white"
              style={{ width: 34, height: 34, backgroundColor: '#4F46E5' }}
            >
              <Sparkles size={18} />
            </div>
            <span className="fw-bolder fs-5 text-dark">WORKZEN</span>
          </div>
        </div>
      </header>

      <div className="container py-5 my-auto">
        <div
          className="bg-white rounded-4 border shadow-sm p-4 p-md-5 mx-auto text-center"
          style={{ maxWidth: '500px' }}
        >
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center text-success mb-3 shadow-xs"
            style={{ width: 68, height: 68, backgroundColor: '#ECFDF5' }}
          >
            <CheckCircle2 size={38} />
          </div>

          <h3 className="fw-bold text-dark mb-2">Account Verified Successfully</h3>
          <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
            Welcome to WORKZEN! Your email has been validated and your organization workspace is now active.
            You can now access your project boards, sprint calendars, and team settings.
          </p>

          <button
            type="button"
            className="btn text-white w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
            style={{ backgroundColor: '#4F46E5' }}
            onClick={() => setActiveView('enterprise_dashboard')}
          >
            <span>Open Executive Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <footer className="text-center py-3 text-muted small border-top bg-white">
        &copy; 2026 WORKZEN Enterprise SaaS &bull; Account Verified
      </footer>
    </div>
  );
};

