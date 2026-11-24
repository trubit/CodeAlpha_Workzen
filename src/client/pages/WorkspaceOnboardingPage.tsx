import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { apiClient } from '../api/client.js';
import { ArrowLeft, Check, Sparkles, HelpCircle } from 'lucide-react';

const TYPES = [
  { id: 'engineering', label: '💻 Engineering & Tech' },
  { id: 'marketing', label: '🚀 Growth & Marketing' },
  { id: 'design', label: '🎨 Product & Design' },
  { id: 'operations', label: '⚡ Operations & HR' }
];

export const WorkspaceOnboardingPage: React.FC = () => {
  const {
    currentOrg,
    workspaces,
    setWorkspaces,
    setCurrentWorkspace,
    setActiveView
  } = useWorkzenStore();

  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('engineering');
  const [allowDomainJoin, setAllowDomainJoin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a workspace name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        type: selectedType,
        isPrivate: !allowDomainJoin,
        themeColor: '#10B981',
        settings: {
          defaultTaskView: 'kanban' as const,
          allowGuestAccess: false,
          requireApprovalForProjects: false
        }
      };

      if (currentOrg?._id) {
        const res = await apiClient.createWorkspace(currentOrg._id, payload);
        if (res.success && res.data?.workspace) {
          const newWs = res.data.workspace;
          setWorkspaces([newWs, ...workspaces]);
          setCurrentWorkspace(newWs);
          setActiveView('workspace_dashboard');
          return;
        }
      }

      // Fallback
      const newWs: any = {
        _id: `ws_${Date.now()}`,
        organisationId: currentOrg?._id || 'org_1',
        name: name.trim(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: selectedType,
        themeColor: '#10B981',
        isPrivate: !allowDomainJoin,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setWorkspaces([newWs, ...workspaces]);
      setCurrentWorkspace(newWs);
      setActiveView('workspace_dashboard');
    } catch (err: any) {
      setError(err?.message || 'Error creating workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-between p-4 p-md-5"
      style={{
        backgroundColor: '#F3F8F2',
        color: '#1E293B',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Top Header Logo */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 p-1.5 d-flex align-items-center justify-content-center shadow-xs text-white"
            style={{ backgroundColor: '#10B981', width: 32, height: 32 }}
          >
            <Sparkles size={18} />
          </div>
          <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em' }}>
            WORKZEN
          </span>
        </div>

        <button
          type="button"
          className="btn btn-link text-muted p-0 text-decoration-none small d-flex align-items-center gap-1"
          onClick={() => setActiveView('workspace_dashboard')}
        >
          <HelpCircle size={15} />
          <span>Need help?</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="container" style={{ maxWidth: 1060 }}>
        <div className="row align-items-center g-5">
          {/* Left: Step Form matching Mixpanel prototype */}
          <div className="col-lg-6">
            <div style={{ maxWidth: 460 }}>
              <h1 className="fw-bolder text-dark mb-2" style={{ fontSize: '2.1rem', letterSpacing: '-0.03em' }}>
                Create your Workspace
              </h1>
              <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
                This is where your team can work and collaborate on projects within{' '}
                <strong>{currentOrg?.name || 'your Organization'}</strong>.
              </p>

              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3.5">
                {/* Workspace Name Input */}
                <div>
                  <label className="form-label small fw-bold text-dark mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3 bg-white border-0 shadow-xs"
                    placeholder="e.g. Yanga Operations, Core Tech"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    style={{ fontSize: '0.95rem', padding: '12px 16px' }}
                  />
                </div>

                {/* Type pills selector */}
                <div>
                  <label className="form-label small fw-bold text-dark mb-1.5">
                    Workspace Focus
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`btn rounded-3 border-0 py-2 px-3 small text-start transition-all ${
                          selectedType === t.id
                            ? 'shadow-xs fw-bold'
                            : 'bg-white text-secondary'
                        }`}
                        style={{
                          backgroundColor: selectedType === t.id ? '#D8F343' : '#FFFFFF',
                          color: selectedType === t.id ? '#0F172A' : '#475569'
                        }}
                        onClick={() => setSelectedType(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domain join checkbox matching prototype */}
                <div className="form-check mt-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="domainJoinCheck"
                    checked={allowDomainJoin}
                    onChange={(e) => setAllowDomainJoin(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label
                    className="form-check-label small text-secondary"
                    htmlFor="domainJoinCheck"
                    style={{ cursor: 'pointer' }}
                  >
                    Anyone with your organization domain can view and join
                  </label>
                </div>

                {/* Action Buttons: Back & Lime Continue Button */}
                <div className="d-flex align-items-center gap-3 pt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-semibold"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#475569' }}
                    onClick={() => setActiveView('workspace_dashboard')}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="btn rounded-pill px-5 py-2.5 fw-bold shadow-sm transition-all"
                    style={{
                      backgroundColor: '#D8F343',
                      color: '#0F172A',
                      border: 'none',
                      fontSize: '0.95rem'
                    }}
                    disabled={isSubmitting || !name.trim()}
                  >
                    {isSubmitting ? 'Creating...' : 'Continue'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Isometric Graphic representation from Dribbble prototype */}
          <div className="col-lg-6 d-none d-lg-flex justify-content-center">
            <div
              className="p-5 rounded-5 bg-white bg-opacity-70 shadow-lg border border-white position-relative d-flex flex-column align-items-center justify-content-center text-center"
              style={{
                width: '100%',
                maxWidth: 440,
                minHeight: 380,
                backdropFilter: 'blur(8px)'
              }}
            >
              {/* Isometric blocks graphic mockup */}
              <div
                className="rounded-4 p-4 mb-4 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #E2F89F 0%, #A7F3D0 100%)',
                  width: 140,
                  height: 140,
                  transform: 'rotate(-6deg)'
                }}
              >
                <div
                  className="rounded-3 bg-white p-3 h-100 d-flex flex-column align-items-center justify-content-center shadow-xs"
                  style={{ transform: 'rotate(6deg)' }}
                >
                  <Sparkles size={36} className="text-success" />
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-1">Smart Project Workspaces</h5>
              <p className="text-secondary small mb-0" style={{ maxWidth: 280 }}>
                High-performance workspaces designed for seamless team collaboration, real-time board updates, and automated reporting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="d-flex align-items-center justify-content-between small text-muted pt-4">
        <span>© 2026 WORKZEN Enterprise SaaS</span>
        <span>"Plan Smarter. Work Together. Achieve More."</span>
      </div>
    </div>
  );
};

