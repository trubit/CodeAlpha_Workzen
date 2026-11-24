import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { Sparkles, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { setActiveView } = useWorkzenStore();

  return (
    <footer
      className="bg-dark text-white pt-5 pb-4 mt-auto"
      style={{
        backgroundColor: '#0F172A',
        borderTop: '1px solid #1E293B',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div className="container">
        <div className="row g-4 pb-5 border-bottom border-secondary border-opacity-25">
          {/* Brand Column */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
                style={{ width: 34, height: 34, backgroundColor: '#4F46E5' }}
              >
                <Sparkles size={18} />
              </div>
              <span className="fw-bolder fs-4 tracking-tight">WORKZEN</span>
            </div>
            <p className="text-secondary small mb-3" style={{ maxWidth: '320px', lineHeight: 1.6 }}>
              A unified enterprise project management and team collaboration SaaS platform. Plan smarter,
              work together, and achieve more with complete visibility and Zen clarity.
            </p>
            <div className="d-flex align-items-center gap-2 text-secondary small">
              <ShieldCheck size={16} className="text-success" />
              <span>Enterprise Data Isolation &bull; Role-Based Security</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-uppercase fw-bold text-white small mb-3 tracking-wider" style={{ fontSize: '0.78rem' }}>
              Platform
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('features')}
                >
                  Features & Modules
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('kanban')}
                >
                  Interactive Kanban
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('calendar')}
                >
                  Sprint Calendar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('analytics')}
                >
                  Velocity Analytics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('pricing')}
                >
                  Pricing Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-uppercase fw-bold text-white small mb-3 tracking-wider" style={{ fontSize: '0.78rem' }}>
              Solutions
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('solutions')}
                >
                  Startups & Early Teams
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('solutions')}
                >
                  Remote & Hybrid Teams
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('solutions')}
                >
                  Technical Project Managers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('solutions')}
                >
                  Large Organisations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('solutions')}
                >
                  Enterprise Portfolios
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-uppercase fw-bold text-white small mb-3 tracking-wider" style={{ fontSize: '0.78rem' }}>
              Company
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('about')}
                >
                  About Workzen
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('about')}
                >
                  Mission & Values
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('faq')}
                >
                  FAQ & Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('contact')}
                >
                  Contact Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Developer & Architecture Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-uppercase fw-bold text-white small mb-3 tracking-wider" style={{ fontSize: '0.78rem' }}>
              Governance
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('dev_setup')}
                >
                  System & Health Telemetry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('settings')}
                >
                  Security Audit Logs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-white text-start"
                  onClick={() => setActiveView('faq')}
                >
                  Privacy & Data Isolation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center pt-4 small text-secondary">
          <div className="mb-2 mb-sm-0">
            &copy; 2026 WORKZEN Enterprise SaaS. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>"Plan Smarter. Work Together. Achieve More."</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

