import React, { useEffect, useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import {
  Building2,
  Calendar,
  Clock,
  Shield,
  Layers,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OrganisationDashboard: React.FC = () => {
  const {
    currentOrg,
    setCurrentOrg,
    setActiveView,
    setCreateOrgModalOpen,
    setDeleteOrgModalOpen,
    currentUser
  } = useWorkzenStore();

  const [details, setDetails] = useState<any>(currentOrg);
  const [name, setName] = useState(currentOrg?.name || '');
  const [description, setDescription] = useState(currentOrg?.description || '');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (currentOrg?._id) {
      setName(currentOrg.name);
      setDescription(currentOrg.description || '');
      apiClient
        .getOrganisation(currentOrg._id)
        .then((res) => {
          if (res.success && res.data) {
            setDetails(res.data);
            setName(res.data.name);
            setDescription(res.data.description || '');
          }
        })
        .catch(() => {
          setDetails(currentOrg);
        });
    }
  }, [currentOrg?._id]);

  if (!currentOrg) return null;

  const isOwner = details?.isOwner ?? (details?.ownerId === currentUser?._id);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await apiClient.updateOrganisation(currentOrg._id, {
        name,
        description
      });
      if (res.success && res.data) {
        setCurrentOrg(res.data);
        setDetails(res.data);
        setFeedback({ type: 'success', message: 'Organization details updated successfully!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update organization' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header Navigation (Call Center SaaS reference) */}
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h4 className="fw-bold text-dark m-0">Organization Overview</h4>
          <p className="text-muted small m-0 mt-0.5">
            View and manage organizational settings, access policies, and team quotas
          </p>
        </div>
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

      {/* Two Column Layout (Matching Dribbble Reference) */}
      <div className="row g-4 align-items-stretch">
        {/* Left Column: Organization Summary Card */}
        <div className="col-12 col-lg-5 col-xl-4">
          <div className="wz-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              {/* Header Badge & Logo */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                  style={{ width: 56, height: 56, backgroundColor: '#4F46E5', fontSize: '1.4rem' }}
                >
                  {details?.name?.charAt(0) || 'W'}
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill small fw-semibold">
                  ● Active
                </span>
              </div>

              <h4 className="fw-bold text-dark m-0">{details?.name}</h4>
              <p className="text-muted small mt-1 mb-4">Organization ID: #{details?._id?.slice(-8) || ''}</p>

              {/* Metadata rows */}
              <div className="d-flex flex-column gap-2.5 pb-4 border-bottom">
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-muted">Created at:</span>
                  <span className="fw-bold text-dark">
                    {details?.createdAt ? new Date(details.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-muted">Subscription Plan:</span>
                  <span className="fw-bold text-dark text-uppercase">{details?.plan || 'Standard'}</span>
                </div>
              </div>

              {/* Usage Quota Information */}
              <div className="pt-4 d-flex flex-column gap-3">
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Plan Quota & Capacity
                </span>

                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-secondary">Licensed Seats</span>
                  <span className="fw-bold text-dark">{details?.seats || 10}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-secondary">Industry</span>
                  <span className="fw-bold text-dark">{details?.industry || 'Technology'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Deployment Type */}
            <div className="pt-4 border-top mt-4 d-flex justify-content-between align-items-center small">
              <span className="text-muted">Hosting Environment:</span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                Enterprise Cloud Hosting
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Organization Details Form */}
        <div className="col-12 col-lg-7 col-xl-8">
          <div className="wz-card p-4 h-100 d-flex flex-column">
            <h5 className="fw-bold text-dark mb-1">Organization Details</h5>
            <p className="text-muted small mb-4">Edit public name and operational description</p>

            <form onSubmit={handleSaveChanges} className="d-flex flex-column gap-3 flex-grow-1">
              <div>
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

              <div>
                <label className="form-label small fw-semibold text-dark mb-1">Organization Description</label>
                <textarea
                  rows={4}
                  className="form-control"
                  placeholder="Write description here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading || !isOwner}
                />
              </div>

              {isOwner && (
                <div className="mt-auto pt-3 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-4 rounded-3 shadow-xs"
                    style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                    disabled={isLoading}
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Full-Width Card: Enable/Disable Organization Toggle Switch */}
      <div className="wz-card p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h6 className="fw-bold text-dark m-0">Enable / Disable Organization</h6>
          <p className="text-muted small m-0 mt-0.5">
            All active processes and workflows associated with the organization will be halted or resumed immediately.
          </p>
        </div>
        <div className="form-check form-switch m-0">
          <input
            type="checkbox"
            role="switch"
            className="form-check-input"
            style={{ width: 48, height: 24, cursor: isOwner ? 'pointer' : 'not-allowed' }}
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            disabled={!isOwner}
          />
        </div>
      </div>

      {/* Full-Width Card: Delete Organization (Red Danger Card) */}
      <div className="wz-card p-4 d-flex flex-wrap align-items-center justify-content-between gap-3 border-danger-subtle bg-danger-subtle">
        <div>
          <h6 className="fw-bold text-danger m-0">Delete Organization</h6>
          <p className="text-secondary small m-0 mt-0.5">
            In case of the deletion of organization, the organization will be safely archived and can be restored within 60 days.
          </p>
        </div>
        {isOwner ? (
          <button
            type="button"
            className="btn btn-danger fw-semibold px-4 rounded-3 shadow-xs"
            onClick={() => setDeleteOrgModalOpen(true)}
          >
            <Trash2 size={16} className="me-1.5" /> Delete Organization
          </button>
        ) : (
          <span className="badge bg-secondary text-white">Owner Authorization Required</span>
        )}
      </div>
    </div>
  );
};
