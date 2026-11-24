import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { createOrgSchema } from '../../../shared/validation/organization.js';
import { Building2, X, AlertCircle, CheckCircle2, Globe, Sparkles } from 'lucide-react';

export const CreateOrganisationModal: React.FC = () => {
  const {
    isCreateOrgModalOpen,
    setCreateOrgModalOpen,
    organisations,
    setOrganisations,
    setCurrentOrg,
    setActiveView
  } = useWorkzenStore();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [organizationSize, setOrganizationSize] = useState<'1-10' | '11-50' | '51-200' | '201-500' | '500+'>('11-50');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('UTC-05:00 Eastern Time');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isCreateOrgModalOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = createOrgSchema.parse({
        name,
        slug: slug || undefined,
        description: description || undefined,
        industry,
        organizationSize,
        website: website || undefined,
        country,
        timezone
      });

      const response = await apiClient.createOrganisation(payload);

      if (response.success && response.data?.organisation) {
        const newOrg = response.data.organisation;
        setOrganisations([newOrg, ...organisations]);
        setCurrentOrg(newOrg);
        setSuccessMessage(`Organization '${newOrg.name}' created successfully!`);

        setTimeout(() => {
          setCreateOrgModalOpen(false);
          setActiveView('org_dashboard');
          setSuccessMessage(null);
          setName('');
          setSlug('');
          setDescription('');
        }, 800);
      }
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors[0]?.message || 'Validation error');
      } else if (err.statusCode === 401 || err.code === 'UNAUTHORIZED' || err.code === 'TOKEN_EXPIRED_OR_INVALID') {
        setError('Your session has expired. Please sign in again to create an organization.');
      } else if (err.message === 'Failed to fetch' || err.code === 'NETWORK_ERROR') {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to create organization');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 1050,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg border border-slate-200 w-100"
        style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
              style={{ width: 44, height: 44, backgroundColor: '#4F46E5' }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Create New Organization</h5>
              <p className="text-muted small m-0">Set up a dedicated organization workspace for your team</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2"
            onClick={() => setCreateOrgModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 d-flex flex-column gap-3">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 m-0">
              <AlertCircle size={16} className="text-danger flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 m-0">
              <CheckCircle2 size={16} className="text-success flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Org Name */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Organization Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Acme Corporation or Initech Labs"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Organization Slug (Identifier)
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted small">workzen.io/org/</span>
              <input
                type="text"
                className="form-control"
                placeholder="acme-corporation"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                disabled={isLoading}
              />
            </div>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              Unique alphanumeric slug. Collisions are resolved automatically.
            </span>
          </div>

          {/* Industry & Size */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-dark mb-1">Industry / Category</label>
              <select
                className="form-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isLoading}
              >
                <option value="Technology & Software">Technology & Software</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Marketing & Creative Agency">Marketing & Creative Agency</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Consulting & Professional Services">Consulting & Services</option>
                <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                <option value="Education & Non-Profit">Education & Non-Profit</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-dark mb-1">Organization Size</label>
              <select
                className="form-select"
                value={organizationSize}
                onChange={(e) => setOrganizationSize(e.target.value as any)}
                disabled={isLoading}
              >
                <option value="1-10">1 - 10 members</option>
                <option value="11-50">11 - 50 members</option>
                <option value="51-200">51 - 200 members</option>
                <option value="201-500">201 - 500 members</option>
                <option value="500+">500+ Enterprise</option>
              </select>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">Official Website (Optional)</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <Globe size={16} />
              </span>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              className="form-control"
              placeholder="Brief summary of your company or project scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Country & Timezone */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-dark mb-1">Country / Region</label>
              <select
                className="form-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoading}
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Australia">Australia</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Singapore">Singapore</option>
                <option value="International">International</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-dark mb-1">Timezone</label>
              <select
                className="form-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isLoading}
              >
                <option value="UTC-08:00 Pacific Time">UTC-08:00 Pacific Time</option>
                <option value="UTC-05:00 Eastern Time">UTC-05:00 Eastern Time</option>
                <option value="UTC+00:00 UTC / GMT">UTC+00:00 UTC / GMT</option>
                <option value="UTC+01:00 Central European">UTC+01:00 Central European</option>
                <option value="UTC+05:30 Indian Standard">UTC+05:30 Indian Standard</option>
                <option value="UTC+08:00 Singapore / HK">UTC+08:00 Singapore / HK</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-2">
            <button
              type="button"
              className="btn btn-light text-secondary fw-medium px-4 rounded-3"
              onClick={() => setCreateOrgModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-4 rounded-3 shadow-sm"
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Creating...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Create Organization</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

