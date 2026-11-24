import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { PublicLayout } from '../../components/public/PublicLayout.js';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  Heart,
  Eye,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { setActiveView } = useWorkzenStore();

  const values = [
    {
      title: 'Clarity Over Clutter',
      desc: 'Modern software is overloaded with redundant notifications, hidden settings, and visual noise. We believe every pixel should serve cognitive focus and task completion.'
    },
    {
      title: 'Deterministic Security',
      desc: 'Enterprise collaboration software requires strict organizational data isolation, secure session authentication, and complete audit logging from day one.'
    },
    {
      title: 'Ergonomic Velocity',
      desc: 'Speed is not just backend latency—it is the fluidity of UI micro-interactions, keyboard accessibility, and predictable workflow transitions.'
    },
    {
      title: 'Customer-Obsessed Simplicity',
      desc: 'We solve genuine collaboration friction for real teams without introducing unnecessary complexity, proprietary vendor lock-in, or artificial limits.'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center max-w-800 mx-auto">
          <div className="badge bg-primary-subtle text-primary mb-3 px-3 py-1.5 fw-semibold">
            Our Purpose & Vision
          </div>
          <h1 className="display-5 fw-extrabold text-dark mb-3">Empowering Teams to Achieve Decisive Clarity</h1>
          <p className="lead text-secondary mb-4">
            Workzen was conceived to bring 'Zen' tranquility to high-velocity 'Work'. We engineer unified workspaces
            that give individuals, engineering squads, and enterprise leaders effortless visibility over their deliverables.
          </p>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="row g-4 mb-5">
            <div className="col-lg-6">
              <div className="p-4 p-md-5 rounded-4 bg-white border shadow-sm h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-primary mb-3"
                  style={{ width: 44, height: 44, backgroundColor: '#EEF2FF' }}
                >
                  <Target size={22} />
                </div>
                <h3 className="fw-bold text-dark mb-3">Our Mission</h3>
                <p className="text-secondary leading-relaxed mb-0">
                  To eliminate the chaos, context switching, and cognitive overload of modern project management.
                  By unifying sprint planning, Kanban tracking, and velocity analytics into an intuitive, distraction-free
                  workspace, Workzen empowers teams around the world to execute with confidence.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 p-md-5 rounded-4 bg-white border shadow-sm h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-success mb-3"
                  style={{ width: 44, height: 44, backgroundColor: '#ECFDF5' }}
                >
                  <Eye size={22} />
                </div>
                <h3 className="fw-bold text-dark mb-3">Our Product Vision</h3>
                <p className="text-secondary leading-relaxed mb-0">
                  We envision a future where enterprise tools are as enjoyable, responsive, and beautifully crafted as
                  the best consumer products. Workzen is built to scale from solo creators to global multi-tenant
                  organizations without sacrificing simplicity, speed, or security.
                </p>
              </div>
            </div>
          </div>

          {/* Core Values Grid */}
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-uppercase fw-bold text-primary small tracking-wider" style={{ color: '#4F46E5' }}>
              Guiding Principles
            </h6>
            <h2 className="display-6 fw-bold text-dark">The Values Behind Workzen</h2>
          </div>

          <div className="row g-4 mb-5">
            {values.map((val, idx) => (
              <div key={idx} className="col-md-6">
                <div className="p-4 rounded-4 bg-white border shadow-xs h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span
                      className="rounded-circle d-inline-flex align-items-center justify-content-center text-white small fw-bold"
                      style={{ width: 24, height: 24, backgroundColor: '#4F46E5', fontSize: '0.75rem' }}
                    >
                      {idx + 1}
                    </span>
                    <h5 className="fw-bold text-dark mb-0">{val.title}</h5>
                  </div>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Architecture Dedication */}
          <div className="p-4 p-md-5 rounded-4 bg-white border text-center max-w-800 mx-auto">
            <h4 className="fw-bold text-dark mb-2">Built on Resilient Engineering Foundations</h4>
            <p className="text-secondary small mb-4">
              Workzen is engineered on a modern, strictly governed technology stack designed for performance, stability,
              and security. Every capability is thoroughly tested to provide a seamless, dependable experience for teams worldwide.
            </p>
            <button
              type="button"
              className="btn btn-primary fw-semibold px-4 py-2.5 rounded-3 shadow-sm d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: '#4F46E5' }}
              onClick={() => setActiveView('register')}
            >
              <span>Experience Workzen</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

