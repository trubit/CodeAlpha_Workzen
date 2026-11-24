import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  User,
  Building2,
  Star
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { setActiveView, setPendingAuthEmail, setAuthToken } = useWorkzenStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organisationName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(formData.password);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      errs.email = 'Corporate work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid corporate email';
    }

    if (!formData.organisationName.trim()) {
      errs.organisationName = 'Organisation name is required';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms of Service';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organisationName: formData.organisationName
      });

      // Email confirmation pended: immediately log user in
      try {
        const loginRes = await apiClient.post<any>('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        if (loginRes.data?.accessToken) {
          setAuthToken(loginRes.data.accessToken);
          setActiveView('enterprise_dashboard');
          return;
        }
      } catch {
        // Fallback to login page
        setActiveView('login');
        return;
      }

      setActiveView('login');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please verify your details.');
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
            top: '-60px',
            right: '-60px',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        {/* Top Brand Logo */}
        <div
          className="d-flex align-items-center gap-2 mb-4"
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

        {/* Hero Copy */}
        <div className="my-auto py-3">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 border border-white border-opacity-20 bg-white bg-opacity-10">
            <span className="rounded-circle bg-success d-inline-block" style={{ width: 7, height: 7 }} />
            <span className="small fw-semibold text-uppercase tracking-wide" style={{ fontSize: '0.72rem' }}>
              Free 14-Day Enterprise Trial
            </span>
          </div>

          <h2 className="display-6 fw-extrabold mb-3 text-white" style={{ lineHeight: 1.2 }}>
            Start your workflow journey today.
          </h2>
          <p className="lead text-light text-opacity-80 mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
            Create your organization workspace in seconds. No credit card required.
          </p>

          <div className="d-flex flex-column gap-3 mb-4">
            {[
              'Comprehensive project management and Kanban views',
              'Collaborative team workspaces and real-time updates',
              'Role-based permissions and secure access control',
              'Modern, responsive interface on desktop, tablet, and mobile'
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
            <span>Dedicated organization boundary &bull; Encrypted sessions &bull; Multi-tenant privacy</span>
          </div>
        </div>
      </div>

      {/* 2. Right Form Panel */}
      <div className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5 bg-white overflow-auto">
        <div className="w-100 py-3" style={{ maxWidth: '520px' }}>
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Create an account</h3>
            <p className="text-muted small">
              Already have an account?{' '}
              <span
                className="text-primary fw-semibold"
                role="button"
                onClick={() => setActiveView('login')}
                style={{ cursor: 'pointer' }}
              >
                Log in
              </span>
            </p>
          </div>

          {serverError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-4">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Names Row */}
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">First Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className={`form-control border-start-0 py-2.5 ${errors.firstName ? 'is-invalid' : ''}`}
                    placeholder="Alex"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                {errors.firstName && <div className="text-danger small mt-1">{errors.firstName}</div>}
              </div>

              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Last Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className={`form-control border-start-0 py-2.5 ${errors.lastName ? 'is-invalid' : ''}`}
                    placeholder="Morgan"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                {errors.lastName && <div className="text-danger small mt-1">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Corporate Work Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className={`form-control border-start-0 py-2.5 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="alex.morgan@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
            </div>

            {/* Organisation Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Organisation Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Building2 size={16} />
                </span>
                <input
                  type="text"
                  className={`form-control border-start-0 py-2.5 ${errors.organisationName ? 'is-invalid' : ''}`}
                  placeholder="Acme Global Technologies"
                  value={formData.organisationName}
                  onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                />
              </div>
              {errors.organisationName && <div className="text-danger small mt-1">{errors.organisationName}</div>}
            </div>

            {/* Passwords */}
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control border-start-0 border-end-0 py-2.5 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="8+ characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div className="col-sm-6">
                <label className="form-label fw-semibold text-secondary small">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-control border-start-0 border-end-0 py-2.5 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-white border-start-0 text-muted"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {errors.password && <div className="text-danger small mb-2">{errors.password}</div>}
            {errors.confirmPassword && <div className="text-danger small mb-2">{errors.confirmPassword}</div>}

            {/* Strength Meter */}
            {formData.password && (
              <div className="mb-3">
                <div className="d-flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className="flex-grow-1 rounded-pill"
                      style={{
                        height: 4,
                        backgroundColor:
                          step <= strengthScore
                            ? strengthScore <= 2
                              ? '#F59E0B'
                              : '#10B981'
                            : '#E2E8F0'
                      }}
                    />
                  ))}
                </div>
                <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                  {strengthScore <= 1 && 'Weak password'}
                  {strengthScore === 2 && 'Fair password'}
                  {strengthScore === 3 && 'Good password'}
                  {strengthScore === 4 && 'Strong password'}
                </span>
              </div>
            )}

            {/* Terms checkbox */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="agreeTerms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              />
              <label className="form-check-label small text-secondary" htmlFor="agreeTerms">
                I agree to the Workzen Terms of Service, Privacy Policy, and Acceptable Use Policy.
              </label>
              {errors.agreeTerms && <div className="text-danger small mt-1">{errors.agreeTerms}</div>}
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
                  <span>Creating Organization...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0" style={{ fontSize: '0.78rem' }}>
            Encrypted connection &bull; Enterprise data privacy
          </p>
        </div>
      </div>
    </div>
  );
};
