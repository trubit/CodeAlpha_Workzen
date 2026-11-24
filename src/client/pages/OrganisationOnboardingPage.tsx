import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { Building2, Globe, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const OrganisationOnboardingPage: React.FC = () => {
  const { setCurrentOrg, setActiveView, organisations, setOrganisations } = useWorkzenStore();

  const [orgName, setOrgName] = useState('Acme Global Technologies');
  const [dataCentre, setDataCentre] = useState<'nigeria' | 'us' | 'eu'>('nigeria');
  const [autoJoinDomain, setAutoJoinDomain] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const regionMap = {
        nigeria: { country: 'Nigeria', timezone: 'UTC+01:00 West Africa' },
        us: { country: 'United States', timezone: 'UTC-05:00 Eastern Time' },
        eu: { country: 'Germany (EU)', timezone: 'UTC+01:00 Central European' }
      };

      const res = await apiClient.createOrganisation({
        name: orgName,
        industry: 'Technology & Software',
        country: regionMap[dataCentre].country,
        timezone: regionMap[dataCentre].timezone
      });

      if (res.success && res.data?.organisation) {
        setOrganisations([res.data.organisation, ...organisations]);
        setCurrentOrg(res.data.organisation);
        setActiveView('org_dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#F4F8F4' }}>
      {/* Top Navbar */}
      <header className="p-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
            style={{ width: 36, height: 36, backgroundColor: '#4F46E5', fontSize: '1.1rem' }}
          >
            W
          </div>
          <span className="fw-bold fs-5 text-dark tracking-tight">WORKZEN</span>
        </div>
        <span className="badge bg-white text-muted border px-3 py-1.5 rounded-pill small">
          Step 1 of 3: Organization Onboarding
        </span>
      </header>

      {/* Main Split Layout (Inspired by Mixpanel / Sassy Dribbble benchmark) */}
      <div className="container my-auto py-4">
        <div className="row align-items-center g-5">
          {/* Left Column: Form */}
          <div className="col-12 col-lg-6">
            <div className="pe-lg-4">
              <h1 className="display-6 fw-bold text-dark mb-2">Create your Organization</h1>
              <p className="text-secondary mb-4">
                This is where your team can work and collaborate on projects with dedicated data privacy and security.
              </p>

              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="d-flex flex-column gap-4">
                {/* Organization Name */}
                <div>
                  <label className="form-label small fw-semibold text-dark mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-lg bg-white border-slate-200 rounded-3 shadow-2xs fs-6 py-2.5"
                    placeholder="Enter organization name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Data Centre Residency Pills */}
                <div>
                  <label className="form-label small fw-semibold text-dark mb-1.5 d-flex align-items-center gap-1">
                    <span>Data Centre Residency</span>
                    <span className="text-muted" title="Data is stored within your preferred compliance region">ⓘ</span>
                  </label>
                  <div className="row g-2">
                    <div className="col-4">
                      <button
                        type="button"
                        className={`btn w-100 py-2.5 px-2 rounded-3 text-nowrap fw-semibold small transition-all ${
                          dataCentre === 'nigeria'
                            ? 'text-dark border-2'
                            : 'btn-outline-secondary bg-white text-secondary'
                        }`}
                        style={{
                          backgroundColor: dataCentre === 'nigeria' ? '#CCFB5D' : '#FFFFFF',
                          borderColor: dataCentre === 'nigeria' ? '#A3E635' : '#E2E8F0'
                        }}
                        onClick={() => setDataCentre('nigeria')}
                      >
                        🇳🇬 Nigeria
                      </button>
                    </div>
                    <div className="col-4">
                      <button
                        type="button"
                        className={`btn w-100 py-2.5 px-2 rounded-3 text-nowrap fw-semibold small transition-all ${
                          dataCentre === 'us'
                            ? 'text-dark border-2'
                            : 'btn-outline-secondary bg-white text-secondary'
                        }`}
                        style={{
                          backgroundColor: dataCentre === 'us' ? '#CCFB5D' : '#FFFFFF',
                          borderColor: dataCentre === 'us' ? '#A3E635' : '#E2E8F0'
                        }}
                        onClick={() => setDataCentre('us')}
                      >
                        🇺🇸 United States
                      </button>
                    </div>
                    <div className="col-4">
                      <button
                        type="button"
                        className={`btn w-100 py-2.5 px-2 rounded-3 text-nowrap fw-semibold small transition-all ${
                          dataCentre === 'eu'
                            ? 'text-dark border-2'
                            : 'btn-outline-secondary bg-white text-secondary'
                        }`}
                        style={{
                          backgroundColor: dataCentre === 'eu' ? '#CCFB5D' : '#FFFFFF',
                          borderColor: dataCentre === 'eu' ? '#A3E635' : '#E2E8F0'
                        }}
                        onClick={() => setDataCentre('eu')}
                      >
                        🇪🇺 Europe (EU)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checkbox: Anyone with domain */}
                <div className="form-check d-flex align-items-start gap-2 m-0">
                  <input
                    type="checkbox"
                    className="form-check-input mt-1"
                    id="autoJoinCheck"
                    checked={autoJoinDomain}
                    onChange={(e) => setAutoJoinDomain(e.target.checked)}
                  />
                  <label className="form-check-label small text-secondary" htmlFor="autoJoinCheck">
                    Anyone with your verified company email domain can automatically join this workspace.
                  </label>
                </div>

                {/* Bottom Actions: Back & Continue */}
                <div className="d-flex align-items-center gap-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary bg-white text-dark fw-semibold px-4 py-2.5 rounded-3"
                    onClick={() => setActiveView('landing')}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn fw-bold px-4 py-2.5 rounded-3 text-dark d-inline-flex align-items-center gap-2 shadow-xs"
                    style={{ backgroundColor: '#CCFB5D', borderColor: '#A3E635' }}
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Creating...' : 'Continue & Set Up'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Isometric Graphic Illustration */}
          <div className="col-12 col-lg-6 text-center">
            <div
              className="p-5 rounded-5 border bg-white shadow-sm d-inline-block position-relative"
              style={{ maxWidth: 480 }}
            >
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4"
                style={{ width: 120, height: 120, backgroundColor: '#EEF2FF' }}
              >
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-white shadow-md"
                  style={{ width: 72, height: 72, backgroundColor: '#4F46E5' }}
                >
                  <Sparkles size={36} />
                </div>
              </div>

              <h4 className="fw-bold text-dark mb-2">Unified Enterprise Workspace</h4>
              <p className="text-muted small mb-4">
                "Plan Smarter. Work Together. Achieve More." Every project, task, and team is organized within dedicated,
                isolated organization spaces.
              </p>

              <div className="d-flex justify-content-center gap-2">
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill small">
                  <ShieldCheck size={14} className="text-success me-1 inline" /> Enterprise Security
                </span>
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill small">
                  <Globe size={14} className="text-primary me-1 inline" /> Regional Cloud
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
