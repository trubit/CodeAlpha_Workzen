import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import {
  Sparkles,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { setActiveView, setPendingAuthEmail } = useWorkzenStore();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setPendingAuthEmail(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process password reset request.');
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
            className="btn btn-outline-secondary btn-sm rounded-2 fw-semibold"
            onClick={() => setActiveView('login')}
          >
            Back to Sign In
          </button>
        </div>
      </header>

      <div className="container py-5 my-auto">
        <div
          className="bg-white rounded-4 border shadow-sm p-4 p-md-5 mx-auto text-center"
          style={{ maxWidth: '480px' }}
        >
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center text-primary mb-3"
            style={{ width: 56, height: 56, backgroundColor: '#EEF2FF' }}
          >
            <KeyRound size={26} />
          </div>

          {submitted ? (
            <div>
              <h3 className="fw-bold text-dark mb-2">Check Your Email</h3>
              <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                If an account exists for <strong className="text-dark">{email}</strong>, we have dispatched single-use
                password reset instructions and a 6-digit verification code.
              </p>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold"
                  style={{ backgroundColor: '#4F46E5' }}
                  onClick={() => setActiveView('reset_password')}
                >
                  Enter Reset Code &rarr;
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 py-2 rounded-3 small"
                  onClick={() => setSubmitted(false)}
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="fw-bold text-dark mb-1">Reset Your Password</h3>
              <p className="text-secondary small mb-4">
                Enter your work email address and we'll send you recovery instructions.
              </p>

              {errorMessage && (
                <div className="alert alert-danger py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4 text-start">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="text-start">
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">Work Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none small text-secondary d-inline-flex align-items-center gap-1"
                    onClick={() => setActiveView('login')}
                  >
                    <ArrowLeft size={14} />
                    <span>Return to Sign In</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-3 text-muted small border-top bg-white">
        &copy; 2026 WORKZEN Enterprise SaaS &bull; Self-Service Password Recovery
      </footer>
    </div>
  );
};

