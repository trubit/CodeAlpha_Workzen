import React, { useState, useEffect, useRef } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import {
  Sparkles,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  RotateCw
} from 'lucide-react';

export const EmailVerificationPage: React.FC = () => {
  const { setActiveView, pendingAuthEmail, setAuthToken, setCurrentUser } = useWorkzenStore();

  const [email, setEmail] = useState(pendingAuthEmail || '');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle URL token auto-verification if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const paramEmail = params.get('email');

    if (token && paramEmail) {
      setEmail(paramEmail);
      autoVerifyToken(paramEmail, token);
    }
  }, []);

  const autoVerifyToken = async (targetEmail: string, token: string) => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.post<any>('/auth/verify-email', {
        email: targetEmail,
        token
      });

      if (res.data?.accessToken) {
        setAuthToken(res.data.accessToken);
        apiClient.setAuthToken(res.data.accessToken);
      }
      if (res.data?.user) {
        setCurrentUser(res.data.user);
      }
      setActiveView('account_verified');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification link expired or invalid.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6-digit code
      const pasted = value.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = otpDigits.join('');

    if (code.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await apiClient.post<any>('/auth/verify-email', {
        email: email.trim(),
        otp: code
      });

      if (res.data?.accessToken) {
        setAuthToken(res.data.accessToken);
        apiClient.setAuthToken(res.data.accessToken);
      }
      if (res.data?.user) {
        setCurrentUser(res.data.user);
      }
      setActiveView('account_verified');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await apiClient.post('/auth/resend-verification', { email: email.trim() });
      setStatusMessage('A new verification code has been dispatched to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
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
            Back to Sign In
          </button>
        </div>
      </header>

      <div className="container py-5 my-auto">
        <div
          className="bg-white rounded-4 border shadow-sm p-4 p-md-5 mx-auto text-center"
          style={{ maxWidth: '520px' }}
        >
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center text-primary mb-3"
            style={{ width: 64, height: 64, backgroundColor: '#EEF2FF' }}
          >
            <Mail size={32} />
          </div>

          <h3 className="fw-bold text-dark mb-1">Verify Your Email Address</h3>
          <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
            We've sent a 6-digit security code and activation link to:<br />
            <strong className="text-dark">{email}</strong>
          </p>

          {errorMessage && (
            <div className="alert alert-danger py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4 text-start">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="alert alert-success py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4 text-start">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify}>
            {/* 6 Digit Inputs */}
            <div className="d-flex justify-content-center gap-2 gap-sm-3 mb-4">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-control text-center fw-bold fs-4 rounded-3 border"
                  style={{ width: '48px', height: '56px', borderColor: digit ? '#4F46E5' : '#E2E8F0' }}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="btn text-white w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={18} className="spinner-border spinner-border-sm" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <span>Verify & Activate Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-top d-flex justify-content-center align-items-center gap-2 small text-secondary">
            <span>Didn't receive the email?</span>
            {resendCooldown > 0 ? (
              <span className="text-muted fw-semibold">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-primary fw-bold d-flex align-items-center gap-1"
                onClick={handleResend}
              >
                <RotateCw size={14} />
                <span>Resend Code</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-3 text-muted small border-top bg-white">
        &copy; 2026 WORKZEN Enterprise SaaS &bull; Cryptographic Email Verification
      </footer>
    </div>
  );
};

