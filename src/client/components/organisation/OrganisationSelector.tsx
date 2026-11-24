import React, { useState, useRef, useEffect } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';
import { ChevronDown, Search, Plus, Settings, Check } from 'lucide-react';

export const OrganisationSelector: React.FC = () => {
  const {
    currentOrg,
    organisations,
    setOrganisations,
    setCurrentOrg,
    setCreateOrgModalOpen,
    setActiveView
  } = useWorkzenStore();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = apiClient.getAuthToken();
    if (!token) return;

    apiClient
      .listOrganisations()
      .then((res) => {
        if (res.success && res.data?.organisations) {
          setOrganisations(res.data.organisations);
          if (!currentOrg && res.data.organisations.length > 0) {
            setCurrentOrg(res.data.organisations[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = async (org: any) => {
    if (org._id === currentOrg?._id) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.selectOrganisation(org._id);
      setCurrentOrg(org);
      setActiveView('org_dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const filtered = organisations.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-light border bg-white d-flex align-items-center gap-2.5 py-1.5 px-3 rounded-3 shadow-xs text-start"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
          style={{ width: 26, height: 26, backgroundColor: '#4F46E5', fontSize: '0.8rem' }}
        >
          {currentOrg?.name?.charAt(0) || 'W'}
        </div>
        <div className="d-flex flex-column text-truncate" style={{ maxWidth: 160 }}>
          <span className="fw-semibold text-dark text-truncate small leading-tight">
            {currentOrg?.name || 'Select Organization'}
          </span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
            {currentOrg?.plan ? `${currentOrg.plan.toUpperCase()} Plan` : 'Organization'}
          </span>
        </div>
        <ChevronDown size={14} className="text-muted ms-1" />
      </button>

      {/* Popover Dropdown (Matching B2B Web App Dribbble reference) */}
      {isOpen && (
        <div
          className="position-absolute start-0 mt-1.5 bg-white rounded-4 shadow-xl border border-slate-200 py-2"
          style={{ width: 320, zIndex: 1060 }}
        >
          {/* Search Bar */}
          <div className="px-3 pb-2 pt-1">
            <div className="position-relative">
              <Search
                size={14}
                className="position-absolute text-muted"
                style={{ top: '50%', left: 10, transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                autoFocus
                className="form-control form-control-sm ps-4 bg-light border-0 rounded-3 text-dark"
                placeholder="Search for an organization"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div className="dropdown-divider my-1"></div>

          {/* List Items */}
          <div style={{ maxHeight: 240, overflowY: 'auto' }} className="px-2">
            {filtered.map((org) => {
              const isSelected = org._id === currentOrg?._id;
              return (
                <button
                  key={org._id}
                  type="button"
                  className={`w-100 text-start px-2.5 py-2 my-1 rounded-3 d-flex align-items-center justify-content-between border-0 transition-all ${
                    isSelected ? 'shadow-xs' : 'bg-transparent hover-bg-light'
                  }`}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(90deg, #FEF08A 0%, #FACC15 100%)'
                      : 'transparent'
                  }}
                  onClick={() => handleSelect(org)}
                >
                  <div className="d-flex align-items-center gap-2.5 text-truncate">
                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: isSelected ? '#FFFFFF' : '#F1F5F9',
                        color: '#0F172A',
                        fontSize: '0.85rem'
                      }}
                    >
                      {org.name.charAt(0)}
                    </div>
                    <div className="text-truncate">
                      <div className="text-dark small fw-semibold text-truncate">{org.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        /{org.slug}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span
                      className="badge bg-dark text-white rounded-pill px-2.5 py-1 fw-bold"
                      style={{ fontSize: '0.65rem' }}
                    >
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="dropdown-divider my-1"></div>

          {/* Bottom Actions (Matching Reference) */}
          <div className="d-flex align-items-center justify-content-between px-3 pt-2">
            <button
              type="button"
              className="btn btn-link text-primary p-0 text-decoration-none small fw-semibold d-flex align-items-center gap-1"
              style={{ fontSize: '0.78rem' }}
              onClick={() => {
                setIsOpen(false);
                setCreateOrgModalOpen(true);
              }}
            >
              <Plus size={14} /> Create New Organization
            </button>
            <button
              type="button"
              className="btn btn-link text-dark p-0 text-decoration-none small fw-semibold d-flex align-items-center gap-1"
              style={{ fontSize: '0.78rem' }}
              onClick={() => {
                setIsOpen(false);
                setActiveView('org_settings');
              }}
            >
              <Settings size={13} /> Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
