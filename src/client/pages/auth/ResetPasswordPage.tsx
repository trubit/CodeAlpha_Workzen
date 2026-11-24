import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { setActiveView, pendingAuthEmail } = useWorkzenStore();

  const [email, setEmail] = useState(pendingAuthEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract from query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const paramEmail = params.get('email');
    if (token) setCode(token);
    if (paramEmail) setEmail(paramEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !code.trim() || !newPassword) {
      setErrorMessage('Please provide your email, reset code, and new password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email.trim(),
        otp: code.trim(),
        newPassword
      });

      setActiveView('password_reset_success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. The code may be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-2"
            onClick={() => setActiveView('login')}
          >
            Cancel
          </button>
        </div>
      </header>

      <div className="container py-5 my-auto">
        <div
          className="bg-white rounded-4 border shadow-sm p-4 p-md-5 mx-auto"
          style={{ maxWidth: '480px' }}
        >
          <div className="text-center mb-4">
            <div
              className="rounded-3 d-inline-flex align-items-center justify-content-center text-primary mb-3"
              style={{ width: 44, height: 44, backgroundColor: '#EEF2FF' }}
            >
              <Lock size={22} />
            </div>
            <h3 className="fw-bold text-dark mb-1">Choose a New Password</h3>
            <p className="text-secondary small mb-0">
              Enter your reset code and set a new secure password.
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Work Email</label>
              <input
                type="email"
                className="form-control rounded-3"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Reset Token or 6-Digit Code</label>
              <input
                type="text"
                className="form-control rounded-3 fw-bold"
                placeholder="Enter 6-digit OTP or paste token"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">New Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control rounded-3 pe-5"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary p-2 border-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-dark">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control rounded-3"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn text-white w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner-border spinner-border-sm" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Update Password & Invalidate Sessions</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <footer className="text-center py-3 text-muted small border-top bg-white">
        &copy; 2026 WORKZEN Enterprise SaaS &bull; Cryptographic Password Reset
      </footer>
    </div>
  );
};

