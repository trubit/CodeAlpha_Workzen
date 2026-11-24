import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { PublicLayout } from '../../components/public/PublicLayout.js';
import {
  Mail,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare,
  Clock
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  teamSize: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const ContactPage: React.FC = () => {
  const { setActiveView } = useWorkzenStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    teamSize: '1-10'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid work email address';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim()) {
      errs.message = 'Please provide details in your message';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate real client submission lifecycle
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '', teamSize: '1-10' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center max-w-800 mx-auto">
          <div className="badge bg-primary-subtle text-primary mb-3 px-3 py-1.5 fw-semibold">
            Enterprise Inquiries & Support
          </div>
          <h1 className="display-5 fw-extrabold text-dark mb-3">We'd Love to Hear From Your Team</h1>
          <p className="lead text-secondary mb-4">
            Have questions about Workzen's architecture, security audits, multi-tenant deployment, or custom team plans?
            Our engineering team is here to assist.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="row g-5">
            {/* Left Column: Contact Details */}
            <div className="col-lg-5">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border h-100">
                <h4 className="fw-bold text-dark mb-3">Get in Touch</h4>
                <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                  Whether you're migrating from Jira, evaluating ClickUp alternatives, or seeking enterprise-grade
                  database isolation, we're ready to answer your technical questions.
                </p>

                <div className="d-flex flex-column gap-3 mb-5">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center p-2.5 bg-light border text-primary"
                    >
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="small fw-bold text-dark">Direct Inquiries</div>
                      <a href="mailto:contact@workzen.io" className="text-decoration-none small text-primary fw-medium">
                        contact@workzen.io
                      </a>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center p-2.5 bg-light border text-danger"
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="small fw-bold text-dark">Security & Compliance</div>
                      <a href="mailto:security@workzen.io" className="text-decoration-none small text-danger fw-medium">
                        security@workzen.io
                      </a>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center p-2.5 bg-light border text-success"
                    >
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="small fw-bold text-dark">Typical Response Time</div>
                      <div className="small text-secondary">Within one business day for team inquiries</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center p-2.5 bg-light border text-info"
                    >
                      <Building size={18} />
                    </div>
                    <div>
                      <div className="small fw-bold text-dark">Global Availability</div>
                      <div className="small text-secondary">Remote-First Modern Cloud Architecture</div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-3 bg-light border">
                  <div className="d-flex align-items-center gap-2 mb-1 text-dark fw-bold small">
                    <MessageSquare size={16} className="text-primary" />
                    <span>Explore Workzen</span>
                  </div>
                  <p className="text-muted small mb-2">
                    Want to explore our platform features and modules directly?
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-2 fw-semibold"
                    onClick={() => setActiveView('features')}
                  >
                    Browse Platform Features
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="col-lg-7">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border">
                {submitted ? (
                  <div className="text-center py-5">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center text-success mb-3"
                      style={{ width: 64, height: 64, backgroundColor: '#ECFDF5' }}
                    >
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Inquiry Received Successfully</h3>
                    <p className="text-secondary small max-w-500 mx-auto mb-4" style={{ lineHeight: 1.6 }}>
                      Thank you for contacting Workzen, <strong>{formData.name}</strong>. Our enterprise team has received
                      your message and will respond to <strong>{formData.email}</strong> within two business hours.
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-semibold px-4 py-2 rounded-3"
                      onClick={handleReset}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <h4 className="fw-bold text-dark mb-1">Send an Inquiry</h4>
                    <p className="text-secondary small mb-4">
                      Fill out the form below and our team will connect with you.
                    </p>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control rounded-3 ${errors.name ? 'is-invalid' : ''}`}
                          placeholder="Alex Chen"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <div className="invalid-feedback small">{errors.name}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">
                          Work Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control rounded-3 ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="alex@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <div className="invalid-feedback small">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">
                          Subject <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control rounded-3 ${errors.subject ? 'is-invalid' : ''}`}
                          placeholder="Multi-tenant migration inquiry"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                        {errors.subject && <div className="invalid-feedback small">{errors.subject}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">Team Size</label>
                        <select
                          className="form-select rounded-3"
                          value={formData.teamSize}
                          onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        >
                          <option value="1-10">1 - 10 members</option>
                          <option value="11-50">11 - 50 members</option>
                          <option value="51-250">51 - 250 members</option>
                          <option value="250+">250+ enterprise seats</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-bold text-dark">
                        Message Details <span className="text-danger">*</span>
                      </label>
                      <textarea
                        rows={5}
                        className={`form-control rounded-3 ${errors.message ? 'is-invalid' : ''}`}
                        placeholder="Tell us about your team's current project management bottlenecks and requirements..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                      {errors.message && <div className="invalid-feedback small">{errors.message}</div>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn text-white fw-bold px-4 py-2.5 rounded-3 shadow-sm d-flex align-items-center gap-2"
                      style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="spinner-border spinner-border-sm" />
                          <span>Sending Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

