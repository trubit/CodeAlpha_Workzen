import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import {
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Star
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setActiveView, setAuthToken, setCurrentUser, setPendingAuthEmail } = useWorkzenStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both corporate email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post<any>('/auth/login', {
        email: email.trim(),
        password
      });

      if (response.data?.accessToken) {
        setAuthToken(response.data.accessToken);
        apiClient.setAuthToken(response.data.accessToken);
      }

      if (response.data?.user) {
        setCurrentUser(response.data.user);
      }

      setActiveView('enterprise_dashboard');
    } catch (err: any) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setPendingAuthEmail(email.trim());
        setActiveView('verify_email');
      } else {
        setErrorMessage(err.message || 'Invalid corporate email or password. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Left Brand & Social Proof Panel (NovaDesk Benchmark) */}
      <div
        className="col-lg-5 p-5 text-white d-flex flex-column justify-content-between position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #0F172A 50%, #1E1B4B 100%)',
          minHeight: '400px'
        }}
      >
        {/* Ambient Glow */}
        <div
          className="position-absolute"
          style={{
            top: '-80px',
            right: '-80px',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        {/* Top Brand Logo */}
        <div
          className="d-flex align-items-center gap-2 mb-5"
          role="button"
          onClick={() => setActiveView('landing')}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{ width: 40, height: 40, backgroundColor: '#6366F1' }}
          >
            <Sparkles size={20} />
          </div>
          <span className="fw-bolder fs-4 tracking-tight text-white">WORKZEN</span>
        </div>

        {/* Central Value Proposition */}
        <div className="my-auto py-4">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 border border-white border-opacity-20 bg-white bg-opacity-10">
            <span className="rounded-circle bg-success d-inline-block" style={{ width: 7, height: 7 }} />
            <span className="small fw-semibold text-uppercase tracking-wide" style={{ fontSize: '0.72rem' }}>
              Enterprise Project Management SaaS
            </span>
          </div>

          <h2 className="display-6 fw-extrabold mb-3 text-white" style={{ lineHeight: 1.2 }}>
            Welcome back to your workspace.
          </h2>
          <p className="lead text-light text-opacity-80 mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
            Streamline projects, track deliverables, and maintain continuous team alignment with enterprise security.
          </p>

          {/* Capabilities Checklist */}
          <div className="d-flex flex-column gap-3 mb-4">
            {[
              'Dedicated organization data boundaries and role permissions',
              'Real-time synchronization across distributed teams',
              'Sprint velocity tracking and interactive Kanban boards',
              'Resilient cloud infrastructure with reliable availability'
            ].map((text, idx) => (
              <div key={idx} className="d-flex align-items-center gap-2.5 small text-light text-opacity-90">
                <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust & Security Banner */}
        <div className="pt-4 border-top border-white border-opacity-10">
          <div className="d-flex align-items-center gap-2 text-light text-opacity-80 small">
            <ShieldCheck size={18} className="text-success flex-shrink-0" />
            <span>Authenticated session encryption &bull; Enterprise role-based access</span>
          </div>
        </div>
      </div>

      {/* 2. Right Form Panel */}
      <div className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5 bg-white">
        <div className="w-100" style={{ maxWidth: '480px' }}>
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Sign In to Workzen</h3>
            <p className="text-muted small">
              New to Workzen?{' '}
              <span
                className="text-primary fw-semibold"
                role="button"
                onClick={() => setActiveView('register')}
                style={{ cursor: 'pointer' }}
              >
                Create an account
              </span>
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-4">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Corporate Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 py-2.5"
                  placeholder="alex.morgan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-semibold text-secondary small m-0">Password</label>
                <span
                  className="text-decoration-none small text-primary fw-semibold"
                  role="button"
                  onClick={() => setActiveView('forgot_password')}
                  style={{ cursor: 'pointer', fontSize: '0.82rem' }}
                >
                  Forgot password?
                </span>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 py-2.5"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-white border-start-0 text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ backgroundColor: '#6366F1', borderColor: '#6366F1' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner-border spinner-border-sm" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0" style={{ fontSize: '0.78rem' }}>
            Encrypted connection &bull; Enterprise access management
          </p>
        </div>
      </div>
    </div>
  );
};
