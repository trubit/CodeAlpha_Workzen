import React, { useState } from 'react';
import { useWorkzenStore, ActiveView } from '../../store/useWorkzenStore.js';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'landing', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'About' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' }
];

export const PublicNavbar: React.FC = () => {
  const { activeView, setActiveView } = useWorkzenStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top border-bottom bg-white"
      style={{
        zIndex: 1030,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        fontFamily: "'Inter', sans-serif"
      }}
      aria-label="Public Main Navigation"
    >
      <div className="container py-2">
        {/* Brand Logo */}
        <div
          className="d-flex align-items-center"
          role="button"
          tabIndex={0}
          onClick={() => setActiveView('landing')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setActiveView('landing');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white me-2.5 shadow-sm"
            style={{ width: 36, height: 36, backgroundColor: '#4F46E5' }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <span className="fw-bolder fs-4 text-dark tracking-tight">WORKZEN</span>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="btn btn-link text-dark d-lg-none border-0 p-1"
          type="button"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Navigation Links */}
        <div className="collapse navbar-collapse d-none d-lg-flex justify-content-between align-items-center ms-4">
          <ul className="navbar-nav d-flex align-items-center gap-1 mb-0">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className="nav-link border-0 bg-transparent px-3 py-2 rounded-2 position-relative"
                    style={{
                      color: isActive ? '#4F46E5' : '#334155',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      transition: 'color 0.15s ease'
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <span
                        className="position-absolute bottom-0 start-50 translate-middle-x"
                        style={{
                          width: '24px',
                          height: '2px',
                          backgroundColor: '#4F46E5',
                          borderRadius: '2px'
                        }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Action CTAs */}
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-link text-decoration-none fw-semibold px-3 py-2"
              style={{ color: '#475569', fontSize: '0.92rem' }}
              onClick={() => setActiveView('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn text-white fw-semibold px-3.5 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1.5"
              style={{
                backgroundColor: '#4F46E5',
                borderColor: '#4F46E5',
                fontSize: '0.92rem',
                transition: 'background-color 0.15s ease'
              }}
              onClick={() => setActiveView('register')}
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer / Backdrop */}
      {mobileMenuOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 vh-100"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1040,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white h-100 p-4 d-flex flex-column"
            style={{ width: '310px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white"
                  style={{ width: 32, height: 32, backgroundColor: '#4F46E5' }}
                >
                  <Sparkles size={18} />
                </div>
                <span className="fw-bolder fs-5 text-dark">WORKZEN</span>
              </div>
              <button
                type="button"
                className="btn btn-link text-secondary p-1 border-0"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-grow-1 overflow-auto">
              <ul className="nav flex-column gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <li key={item.id} className="nav-item">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`nav-link w-100 text-start border-0 px-3 py-2.5 rounded-3 fw-semibold ${
                          isActive ? 'bg-primary-subtle text-primary' : 'text-dark bg-transparent'
                        }`}
                        style={{ fontSize: '0.95rem' }}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Mobile CTAs */}
            <div className="pt-3 border-top d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-semibold"
                onClick={() => {
                  setActiveView('login');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn text-white w-100 py-2.5 rounded-3 fw-semibold shadow-sm"
                style={{ backgroundColor: '#4F46E5' }}
                onClick={() => {
                  setActiveView('register');
                  setMobileMenuOpen(false);
                }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

