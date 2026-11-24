import React, { useState, useEffect } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import {
  Building2,
  Paintbrush,
  Shield,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Upload,
  Globe,
  Save,
  Trash2
} from 'lucide-react';

export const OrganisationSettingsPage: React.FC = () => {
  const {
    currentOrg,
    setCurrentOrg,
    setTransferOwnershipModalOpen,
    setDeleteOrgModalOpen,
    currentUser
  } = useWorkzenStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'security' | 'ownership' | 'danger'>('profile');

  // Profile Form State
  const [name, setName] = useState(currentOrg?.name || '');
  const [description, setDescription] = useState(currentOrg?.description || '');
  const [industry, setIndustry] = useState(currentOrg?.industry || 'Technology & Software');
  const [organizationSize, setOrganizationSize] = useState<any>(currentOrg?.organizationSize || '11-50');
  const [website, setWebsite] = useState(currentOrg?.website || '');
  const [country, setCountry] = useState(currentOrg?.country || 'United States');
  const [timezone, setTimezone] = useState(currentOrg?.timezone || 'UTC-05:00 Eastern Time');
  const [billingEmail, setBillingEmail] = useState(currentOrg?.billingEmail || '');

  // Branding Form State
  const [logoUrl, setLogoUrl] = useState(currentOrg?.logoUrl || '');

  // Security Form State
  const [enforce2FA, setEnforce2FA] = useState(currentOrg?.settings?.enforce2FA || false);
  const [allowedDomains, setAllowedDomains] = useState(
    currentOrg?.settings?.allowedDomains?.join(', ') || ''
  );
  const [defaultMemberRole, setDefaultMemberRole] = useState<'admin' | 'member' | 'guest'>(
    (currentOrg?.settings?.defaultMemberRole as any) || 'member'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name);
      setDescription(currentOrg.description || '');
      setIndustry(currentOrg.industry || 'Technology & Software');
      setOrganizationSize(currentOrg.organizationSize || '11-50');
      setWebsite(currentOrg.website || '');
      setCountry(currentOrg.country || 'United States');
      setTimezone(currentOrg.timezone || 'UTC-05:00 Eastern Time');
      setBillingEmail(currentOrg.billingEmail || '');
      setLogoUrl(currentOrg.logoUrl || '');
      setEnforce2FA(currentOrg.settings?.enforce2FA || false);
      setAllowedDomains(currentOrg.settings?.allowedDomains?.join(', ') || '');
      setDefaultMemberRole((currentOrg.settings?.defaultMemberRole as any) || 'member');
    }
  }, [currentOrg]);

  if (!currentOrg) {
    return (
      <div className="wz-card p-5 text-center my-4">
        <Building2 size={32} className="text-muted mb-2 opacity-50 mx-auto" />
        <h5 className="fw-bold text-dark">No Organization Selected</h5>
        <p className="text-muted small mb-0">Please select an organization from the top menu to manage its settings.</p>
      </div>
    );
  }

  const isOwner = currentOrg.ownerId === currentUser?._id;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await apiClient.updateOrganisation(currentOrg._id, {
        name,
        description,
        industry,
        organizationSize,
        website: website || undefined,
        country,
        timezone,
        billingEmail: billingEmail || undefined
      });

      if (res.success && res.data) {
        setCurrentOrg(res.data);
        setFeedback({ type: 'success', message: 'Organization profile updated successfully!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update organization profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await apiClient.updateOrganisationLogo(currentOrg._id, logoUrl);
      if (res.success && res.data) {
        setCurrentOrg(res.data);
        setFeedback({ type: 'success', message: 'Organization branding logo updated!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update logo' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const domainsArray = allowedDomains
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);

      const res = await apiClient.updateOrganisationSettings(currentOrg._id, {
        enforce2FA,
        allowedDomains: domainsArray,
        defaultMemberRole,
        timezone
      });

      if (res.success && res.data) {
        setCurrentOrg(res.data);
        setFeedback({ type: 'success', message: 'Security and regional settings saved successfully!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update settings' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div>
        <h3 className="fw-bold text-dark m-0">Organization Settings</h3>
        <p className="text-muted small m-0 mt-0.5">Manage identity, security policies, branding, and lifecycle</p>
      </div>

      {feedback && (
        <div
          className={`alert ${
            feedback.type === 'success' ? 'alert-success' : 'alert-danger'
          } d-flex align-items-center gap-2 py-2 px-3 small rounded-3 m-0 shadow-xs`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-danger flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Settings Card with Tab Navigation */}
      <div className="wz-card p-0 overflow-hidden">
        {/* Tab Header */}
        <div className="d-flex border-bottom bg-light px-3 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            className={`btn btn-sm d-flex align-items-center gap-1.5 py-2 px-3 border-0 rounded-top-3 fw-semibold ${
              activeTab === 'profile' ? 'bg-white text-primary border-bottom border-primary border-2' : 'text-secondary hover-bg-white'
            }`}
            onClick={() => { setActiveTab('profile'); setFeedback(null); }}
          >
            <Building2 size={15} /> Profile & General
          </button>
          <button
            type="button"
            className={`btn btn-sm d-flex align-items-center gap-1.5 py-2 px-3 border-0 rounded-top-3 fw-semibold ${
              activeTab === 'branding' ? 'bg-white text-primary border-bottom border-primary border-2' : 'text-secondary hover-bg-white'
            }`}
            onClick={() => { setActiveTab('branding'); setFeedback(null); }}
          >
            <Paintbrush size={15} /> Branding & Logo
          </button>
          <button
            type="button"
            className={`btn btn-sm d-flex align-items-center gap-1.5 py-2 px-3 border-0 rounded-top-3 fw-semibold ${
              activeTab === 'security' ? 'bg-white text-primary border-bottom border-primary border-2' : 'text-secondary hover-bg-white'
            }`}
            onClick={() => { setActiveTab('security'); setFeedback(null); }}
          >
            <Shield size={15} /> Security & Regional
          </button>
          <button
            type="button"
            className={`btn btn-sm d-flex align-items-center gap-1.5 py-2 px-3 border-0 rounded-top-3 fw-semibold ${
              activeTab === 'ownership' ? 'bg-white text-primary border-bottom border-primary border-2' : 'text-secondary hover-bg-white'
            }`}
            onClick={() => { setActiveTab('ownership'); setFeedback(null); }}
          >
            <KeyRound size={15} /> Ownership
          </button>
          <button
            type="button"
            className={`btn btn-sm d-flex align-items-center gap-1.5 py-2 px-3 border-0 rounded-top-3 fw-semibold ${
              activeTab === 'danger' ? 'bg-white text-danger border-bottom border-danger border-2' : 'text-danger hover-bg-white'
            }`}
            onClick={() => { setActiveTab('danger'); setFeedback(null); }}
          >
            <AlertTriangle size={15} /> Danger Zone
          </button>
        </div>

        {/* Tab 1: Profile & General */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-4 d-flex flex-column gap-3">
            <h5 className="fw-bold text-dark m-0">Organization Profile Details</h5>
            <p className="text-muted small m-0">Basic public information about your company or enterprise workspace.</p>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || !isOwner}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark mb-1">Billing Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  disabled={isLoading || !isOwner}
                />
              </div>
            </div>

            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Description</label>
              <textarea
                rows={2}
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading || !isOwner}
              />
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark mb-1">Industry Sector</label>
                <select
                  className="form-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isLoading || !isOwner}
                >
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="Marketing & Creative Agency">Marketing & Creative Agency</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Consulting & Professional Services">Consulting & Services</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark mb-1">Organization Size</label>
                <select
                  className="form-select"
                  value={organizationSize}
                  onChange={(e) => setOrganizationSize(e.target.value)}
                  disabled={isLoading || !isOwner}
                >
                  <option value="1-10">1 - 10 employees</option>
                  <option value="11-50">11 - 50 employees</option>
                  <option value="51-200">51 - 200 employees</option>
                  <option value="201-500">201 - 500 employees</option>
                  <option value="500+">500+ Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Official Website</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={isLoading || !isOwner}
              />
            </div>

            {isOwner && (
              <div className="d-flex justify-content-end pt-3 border-top mt-2">
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3 fw-semibold shadow-sm"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  disabled={isLoading}
                >
                  <Save size={16} /> Save Profile Changes
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Branding & Logo */}
        {activeTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="p-4 d-flex flex-column gap-3">
            <h5 className="fw-bold text-dark m-0">Organization Visual Branding</h5>
            <p className="text-muted small m-0">Customize your workspace logo and brand appearance.</p>

            <div className="d-flex align-items-center gap-4 p-4 border rounded-3 bg-light">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#4F46E5',
                  fontSize: '2rem',
                  overflow: 'hidden'
                }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-100 h-100 object-fit-cover" />
                ) : (
                  currentOrg.name.charAt(0)
                )}
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-bold text-dark m-0">Organization Logo</h6>
                <p className="text-muted small m-0 mt-1">Recommended size 256x256px. PNG, JPG, or SVG.</p>
                <div className="mt-2">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={isLoading || !isOwner}
                  />
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="d-flex justify-content-end pt-3 border-top mt-2">
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3 fw-semibold shadow-sm"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  disabled={isLoading}
                >
                  <Save size={16} /> Update Brand Logo
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 3: Security & Regional */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveSecurity} className="p-4 d-flex flex-column gap-4">
            <div>
              <h5 className="fw-bold text-dark m-0">Security & Access Policies</h5>
              <p className="text-muted small m-0">Control organization authentication and self-registration boundaries.</p>
            </div>

            {/* 2FA Toggle */}
            <div className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light">
              <div>
                <h6 className="fw-bold text-dark m-0">Enforce Two-Factor Authentication (2FA)</h6>
                <p className="text-muted small m-0">Mandate OTP verification for all members when signing into this organization.</p>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  type="checkbox"
                  role="switch"
                  className="form-check-input"
                  style={{ width: 44, height: 22 }}
                  checked={enforce2FA}
                  onChange={(e) => setEnforce2FA(e.target.checked)}
                  disabled={isLoading || !isOwner}
                />
              </div>
            </div>

            {/* Allowed Domains */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Approved Email Domains</label>
              <input
                type="text"
                className="form-control"
                placeholder="acme.com, acme.io"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                disabled={isLoading || !isOwner}
              />
              <span className="text-muted small">Comma-separated email domains permitted for auto-joining.</span>
            </div>

            {/* Default Role */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Default Role for New Members</label>
              <select
                className="form-select"
                value={defaultMemberRole}
                onChange={(e) => setDefaultMemberRole(e.target.value as any)}
                disabled={isLoading || !isOwner}
              >
                <option value="member">Member (Standard project participation)</option>
                <option value="admin">Administrator (Workspace management)</option>
                <option value="guest">Guest (Restricted read access)</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">Standard Localization Timezone</label>
              <select
                className="form-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isLoading || !isOwner}
              >
                <option value="UTC-08:00 Pacific Time">UTC-08:00 Pacific Time</option>
                <option value="UTC-05:00 Eastern Time">UTC-05:00 Eastern Time</option>
                <option value="UTC+00:00 UTC / GMT">UTC+00:00 UTC / GMT</option>
                <option value="UTC+01:00 Central European">UTC+01:00 Central European</option>
                <option value="UTC+05:30 Indian Standard">UTC+05:30 Indian Standard</option>
                <option value="UTC+08:00 Singapore / HK">UTC+08:00 Singapore / HK</option>
              </select>
            </div>

            {isOwner && (
              <div className="d-flex justify-content-end pt-3 border-top mt-2">
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3 fw-semibold shadow-sm"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                  disabled={isLoading}
                >
                  <Save size={16} /> Save Security Policies
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 4: Ownership & Account Information */}
        {activeTab === 'ownership' && (
          <div className="p-4 d-flex flex-column gap-3">
            <h5 className="fw-bold text-dark m-0">Organization Ownership & Governance</h5>
            <p className="text-muted small m-0">View the administrative owner and safely delegate ownership.</p>

            <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-bold">Current Registered Owner</span>
                <h6 className="fw-bold text-dark m-0 mt-1">
                  {currentUser?._id === currentOrg.ownerId ? `${currentUser.firstName} ${currentUser.lastName} (You)` : 'Organization Owner'}
                </h6>
                <p className="text-muted small m-0">{currentOrg.billingEmail}</p>
              </div>
              <span className="badge bg-primary text-white">Active Owner</span>
            </div>

            {isOwner ? (
              <div className="p-3 border rounded-3 border-warning-subtle bg-warning-subtle d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-bold text-dark m-0">Transfer Ownership to Teammate</h6>
                  <p className="text-muted small m-0">
                    Delegate supreme administrative authority to another active member.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-warning text-dark fw-semibold rounded-3 shadow-xs"
                  onClick={() => setTransferOwnershipModalOpen(true)}
                >
                  Transfer Ownership
                </button>
              </div>
            ) : (
              <p className="text-muted small p-2 border rounded-3 bg-light m-0">
                Only the registered organization owner can transfer ownership.
              </p>
            )}
          </div>
        )}

        {/* Tab 5: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="p-4 d-flex flex-column gap-3">
            <h5 className="fw-bold text-danger m-0">Danger Zone: Archive Organization</h5>
            <p className="text-muted small m-0">
              Permanently archive this organization and deactivate all member access.
            </p>

            <div className="p-3 border border-danger-subtle rounded-3 bg-danger-subtle d-flex align-items-center justify-content-between">
              <div>
                <h6 className="fw-bold text-danger m-0">Archive '{currentOrg.name}'</h6>
                <p className="text-secondary small m-0">
                  This organization will be safely archived from active workspaces and blocked from selection.
                </p>
              </div>
              {isOwner ? (
                <button
                  type="button"
                  className="btn btn-danger fw-semibold rounded-3 shadow-xs"
                  onClick={() => setDeleteOrgModalOpen(true)}
                >
                  <Trash2 size={16} className="me-1.5" /> Archive Organization
                </button>
              ) : (
                <span className="badge bg-secondary text-white">Owner Only</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

