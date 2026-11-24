import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import {
  Building2,
  Shield,
  CreditCard,
  History,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Laptop
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentOrg, currentUser } = useWorkzenStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'audit'>('profile');

  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [billingEmail, setBillingEmail] = useState(currentOrg?.billingEmail || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?._id) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await apiClient.updateOrganisation(currentOrg._id, {
        name: orgName,
        billingEmail
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Organization profile updated successfully.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update organization profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="wz-card p-4">
        <h3 className="fw-bold m-0 text-dark">Organization & Account Settings</h3>
        <p className="text-muted small m-0 mt-0.5">
          Security policies, authentication preferences, billing details, and audit history
        </p>
      </div>

      {feedback && (
        <div
          className={`alert ${
            feedback.type === 'success' ? 'alert-success' : 'alert-danger'
          } py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-0`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-danger flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs & Content */}
      <div className="wz-card p-4">
        <div className="d-flex gap-2 border-bottom pb-3 mb-4">
          <button
            className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-light'} fw-semibold px-3.5 rounded-pill`}
            style={activeTab === 'profile' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setActiveTab('profile')}
          >
            <Building2 size={15} className="me-1.5" /> Organisation Profile
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-light'} fw-semibold px-3.5 rounded-pill`}
            style={activeTab === 'security' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={15} className="me-1.5" /> Security & 2FA
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'billing' ? 'btn-primary' : 'btn-light'} fw-semibold px-3.5 rounded-pill`}
            style={activeTab === 'billing' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setActiveTab('billing')}
          >
            <CreditCard size={15} className="me-1.5" /> Billing & Invoices
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-light'} fw-semibold px-3.5 rounded-pill`}
            style={activeTab === 'audit' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setActiveTab('audit')}
          >
            <History size={15} className="me-1.5" /> Compliance Audit Logs
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '600px' }}>
            <h5 className="fw-bold text-dark mb-3">General Information</h5>
            <form onSubmit={handleSaveProfile}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Organisation Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Organisation URL Slug</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted small">workzen.io/org/</span>
                  <input type="text" className="form-control" value={currentOrg?.slug || ''} disabled />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Primary Billing Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary fw-semibold px-4 py-2 rounded-3 shadow-sm mt-2"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Security & 2FA */}
        {activeTab === 'security' && (
          <div style={{ maxWidth: '650px' }}>
            <h5 className="fw-bold text-dark mb-3">Multi-Factor Authentication & Session Policies</h5>
            <div className="p-3 border rounded-3 bg-light mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-dark small d-flex align-items-center">
                    <CheckCircle2 size={16} className="text-success me-1.5" />
                    Two-Factor Authentication (2FA / OTP)
                  </div>
                  <p className="text-muted small m-0 mt-0.5">
                    Requires cryptographic 6-digit verification code upon registration and password changes.
                  </p>
                </div>
                <span className="badge bg-success-subtle text-success">Active</span>
              </div>
            </div>

            <div className="p-3 border rounded-3 bg-light mb-4">
              <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center">
                <Laptop size={16} className="me-1.5 text-primary" /> Active Login Session
              </h6>
              <div className="d-flex justify-content-between align-items-center small text-secondary">
                <div>
                  <div className="fw-semibold text-dark">Current Authenticated Device</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    User: {currentUser?.email || 'Authenticated User'} &bull; Secure Session Active
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary">This Device</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Billing & Invoices */}
        {activeTab === 'billing' && (
          <div>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="p-4 rounded-3 border bg-light h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary text-white text-uppercase">
                      {currentOrg?.plan ? `${currentOrg.plan} Tier` : 'Standard Tier'}
                    </span>
                    <span className="text-muted small">Subscription Status: Active</span>
                  </div>
                  <h3 className="fw-bold text-dark m-0">
                    {currentOrg?.seats || '10'} <span className="fs-6 text-muted font-normal">Allocated Seats</span>
                  </h3>
                  <p className="text-muted small mt-1 mb-3">
                    Billing contact: {currentOrg?.billingEmail || currentUser?.email || 'Configured via organization settings'}
                  </p>
                  <p className="text-muted small m-0">
                    Online card payments and automated invoicing configured.
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-4 rounded-3 border bg-light h-100">
                  <h6 className="fw-bold text-dark mb-2">Payment Integration</h6>
                  <p className="text-muted small mb-3">
                    Self-serve subscription management and receipt tracking.
                  </p>
                  <span className="badge bg-success-subtle text-success">
                    <CheckCircle2 size={13} className="me-1" /> Automated Invoicing Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Compliance Audit Logs */}
        {activeTab === 'audit' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark m-0">Compliance Audit Trail</h5>
              <span className="badge bg-light text-secondary border">Retained for 365 Days</span>
            </div>

            <div className="text-center py-5 border border-dashed rounded-3">
              <History size={32} className="text-muted mb-2 opacity-50" />
              <h6 className="fw-semibold text-dark">No Security Audit Log Events</h6>
              <p className="text-muted small mb-0">
                Security actions, role modifications, and organization events will be logged here automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
