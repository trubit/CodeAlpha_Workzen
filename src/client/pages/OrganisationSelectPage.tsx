import React, { useEffect, useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { Building2, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

export const OrganisationSelectPage: React.FC = () => {
  const {
    organisations,
    setOrganisations,
    currentOrg,
    setCurrentOrg,
    setActiveView,
    setCreateOrgModalOpen
  } = useWorkzenStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiClient
      .listOrganisations()
      .then((res) => {
        if (res.success && res.data?.organisations) {
          setOrganisations(res.data.organisations);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = async (org: any) => {
    setIsLoading(true);
    try {
      await apiClient.selectOrganisation(org._id);
      setCurrentOrg(org);
      setActiveView('org_dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5 px-3 min-vh-100"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <div className="bg-white rounded-4 shadow-sm border border-slate-200 p-4 p-md-5 w-100" style={{ maxWidth: 540 }}>
        <div className="text-center mb-4">
          <div
            className="rounded-3 d-inline-flex align-items-center justify-content-center text-white shadow-sm mb-3"
            style={{ width: 48, height: 48, backgroundColor: '#4F46E5' }}
          >
            <Building2 size={24} />
          </div>
          <h3 className="fw-bold text-dark m-0">Select Organization</h3>
          <p className="text-secondary small mt-1">Choose the workspace tenant you want to collaborate in</p>
        </div>

        <div className="d-flex flex-column gap-2.5 mb-4">
          {organisations.length === 0 ? (
            <div className="text-center py-4 border border-dashed rounded-3 p-4">
              <Building2 size={32} className="text-muted mb-2 opacity-50" />
              <h6 className="fw-semibold text-dark">No Organizations Found</h6>
              <p className="text-muted small mb-3">You don't belong to any organizations yet. Create one to get started.</p>
              <button
                className="btn btn-sm btn-primary rounded-3 fw-semibold px-3 py-1.5"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                onClick={() => setCreateOrgModalOpen(true)}
              >
                <Plus size={14} className="me-1" /> Create Organization
              </button>
            </div>
          ) : (
            organisations.map((org) => {
              const isSelected = org._id === currentOrg?._id;
              return (
                <div
                  key={org._id}
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between transition-all cursor-pointer ${
                    isSelected ? 'border-primary bg-primary-subtle' : 'border-slate-200 bg-white hover-bg-light'
                  }`}
                  onClick={() => handleSelect(org)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: isSelected ? '#4F46E5' : '#64748B'
                      }}
                    >
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark m-0">{org.name}</h6>
                      <span className="text-muted small">
                        {org.plan} plan &bull; slug: /{org.slug}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="badge bg-primary text-white d-flex align-items-center gap-1">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <button className="btn btn-sm btn-outline-secondary rounded-2">
                      Select <ArrowRight size={12} className="ms-1" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          className="btn btn-outline-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
          onClick={() => setCreateOrgModalOpen(true)}
          disabled={isLoading}
        >
          <Plus size={16} /> Create Another Organization
        </button>
      </div>
    </div>
  );
};

