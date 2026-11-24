import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { PublicLayout } from '../components/public/PublicLayout.js';
import { PriorityBadge } from '../design-system/components/PriorityBadge.js';
import { StatusPill } from '../design-system/components/StatusPill.js';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Kanban,
  Users2,
  Calendar,
  BarChart3,
  CheckCircle2,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Briefcase,
  HelpCircle,
  TrendingUp,
  Target,
  Sparkle
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, tasks } = useWorkzenStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does Workzen safeguard organization data privacy?',
      a: 'Workzen enforces strict multi-tenant data boundaries. Every organization record is strictly isolated and protected with authenticated session tokens and granular role-based access control policies.'
    },
    {
      q: 'Can our engineering squads integrate agile sprints and Kanban boards?',
      a: 'Yes. Workzen includes real-time Kanban boards with customizable status columns, drag-and-drop mechanics, estimation point tracking, and sprint calendar synchronization.'
    },
    {
      q: 'Is there a limit on projects or tasks on the free tier?',
      a: 'The Starter plan offers unlimited tasks and projects for up to 5 team members with 5GB of secure cloud file storage, making it ideal for startups and agile project squads.'
    },
    {
      q: 'How are team velocity and workload tracked?',
      a: 'The Velocity Analytics engine automatically measures weekly sprint completions, cycle times, subtask completion rates, and team member workload allocations without manual timesheets.'
    }
  ];

  return (
    <PublicLayout>
      {/* 1. HERO SECTION WITH GRADIENT MESH */}
      <section
        className="py-5 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #312E81 75%, #4338CA 100%)',
          minHeight: '620px'
        }}
      >
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            {/* Left Hero Content */}
            <div className="col-lg-6">
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-4 border border-white border-opacity-20 shadow-sm"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <span
                  className="rounded-circle d-inline-block"
                  style={{ width: 8, height: 8, backgroundColor: '#10B981' }}
                />
                <span className="small fw-semibold tracking-wide text-uppercase" style={{ fontSize: '0.75rem' }}>
                  Enterprise Project Management & Team Collaboration
                </span>
              </div>

              <h1
                className="display-4 fw-extrabold text-white mb-3 tracking-tight"
                style={{ lineHeight: 1.15, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)' }}
              >
                Simplify Your Workflow.<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #A5B4FC 0%, #818CF8 50%, #C7D2FE 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Amplify Your Impact.
                </span>
              </h1>

              <p
                className="lead text-light text-opacity-80 mb-4"
                style={{ fontSize: '1.15rem', lineHeight: 1.6, maxWidth: '540px' }}
              >
                Plan Smarter. Work Together. Achieve More. The high-performance workspace designed for modern teams.
                Orchestrate projects with decisive precision, track velocity with Zen clarity, and collaborate with enterprise trust.
              </p>

              {/* CTAs */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <button
                  type="button"
                  className="btn text-white fw-bold px-4 py-3 rounded-3 shadow-lg d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#4F46E5',
                    borderColor: '#4F46E5',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setActiveView('register')}
                >
                  <span>Start Free Trial</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light fw-semibold px-4 py-3 rounded-3"
                  style={{ fontSize: '1rem' }}
                  onClick={() => setActiveView('enterprise_dashboard')}
                >
                  Explore Interactive App
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="d-flex align-items-center gap-4 text-light text-opacity-75 small pt-2">
                <div className="d-flex align-items-center gap-1.5">
                  <ShieldCheck size={16} className="text-success" />
                  <span>Enterprise Data Security</span>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <Zap size={16} className="text-warning" />
                  <span>Real-Time Collaboration</span>
                </div>
              </div>
            </div>

            {/* Right Hero Product Preview Canvas */}
            <div className="col-lg-6">
              <div
                className="bg-white rounded-4 shadow-2xl p-3 border border-light border-opacity-20"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  transform: 'perspective(1000px) rotateY(-2deg) rotateX(1deg)'
                }}
              >
                {/* Mock App Window Title Bar */}
                <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle bg-danger d-inline-block" style={{ width: 10, height: 10 }} />
                    <span className="rounded-circle bg-warning d-inline-block" style={{ width: 10, height: 10 }} />
                    <span className="rounded-circle bg-success d-inline-block" style={{ width: 10, height: 10 }} />
                    <span className="text-muted ms-2 small fw-semibold">WORKZEN &bull; Core Engineering Sprint 14</span>
                  </div>
                  <span className="badge bg-light text-secondary border small">Live Workspace</span>
                </div>

                {/* Mini Kanban Columns Preview */}
                <div className="row g-2">
                  <div className="col-4">
                    <div className="bg-light p-2 rounded-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-dark">To Do</span>
                        <span className="badge bg-white text-secondary border">3</span>
                      </div>
                      <div className="bg-white p-2 rounded-2 shadow-xs mb-2 border">
                        <div className="small fw-semibold text-dark mb-1">SSO Auth Flow</div>
                        <PriorityBadge priority="urgent" />
                      </div>
                      <div className="bg-white p-2 rounded-2 shadow-xs border">
                        <div className="small fw-semibold text-dark mb-1">API Webhooks</div>
                        <PriorityBadge priority="medium" />
                      </div>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="bg-light p-2 rounded-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-dark">In Progress</span>
                        <span className="badge bg-white text-secondary border">2</span>
                      </div>
                      <div className="bg-white p-2 rounded-2 shadow-xs mb-2 border">
                        <div className="small fw-semibold text-dark mb-1">Payment Gateways</div>
                        <PriorityBadge priority="high" />
                      </div>
                      <div className="bg-white p-2 rounded-2 shadow-xs border">
                        <div className="small fw-semibold text-dark mb-1">Rate Limiter</div>
                        <PriorityBadge priority="low" />
                      </div>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="bg-light p-2 rounded-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-dark">Done</span>
                        <span className="badge bg-white text-secondary border">8</span>
                      </div>
                      <div className="bg-white p-2 rounded-2 shadow-xs mb-2 border">
                        <div className="small fw-semibold text-dark mb-1">Design Tokens</div>
                        <StatusPill status="done" />
                      </div>
                      <div className="bg-white p-2 rounded-2 shadow-xs border">
                        <div className="small fw-semibold text-dark mb-1">Docker Compose</div>
                        <StatusPill status="done" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CUSTOMER PROBLEMS WE SOLVE */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-uppercase fw-bold text-primary small tracking-wider" style={{ color: '#4F46E5' }}>
              Why Teams Switch to Workzen
            </h6>
            <h2 className="display-6 fw-bold text-dark">Eliminate Operational Friction</h2>
            <p className="text-secondary">
              Traditional enterprise tools are cluttered, slow, and expensive. Workzen provides an ultra-clean,
              high-performance workspace that solves your team's biggest collaboration headaches.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light border h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-danger mb-3"
                  style={{ width: 44, height: 44, backgroundColor: '#FEF2F2' }}
                >
                  <Lock size={22} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Tool Fragmentation</h5>
                <p className="text-secondary small mb-0">
                  Stop scattering tickets across spreadsheets, emails, and disconnected chat apps. Workzen
                  unifies projects, discussions, and sprint schedules in a single pane.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light border h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-warning mb-3"
                  style={{ width: 44, height: 44, backgroundColor: '#FFFBEB' }}
                >
                  <Clock size={22} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Cognitive Overload</h5>
                <p className="text-secondary small mb-0">
                  Over-engineered software slows developers and managers down. Our Zen design philosophy prioritizes
                  speed, readable hierarchy, and zero clutter.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light border h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-primary mb-3"
                  style={{ width: 44, height: 44, backgroundColor: '#EEF2FF' }}
                >
                  <BarChart3 size={22} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Bottleneck Obscurity</h5>
                <p className="text-secondary small mb-0">
                  Know exactly where tasks are stalled with automated sprint cycle times, workload capacity meters,
                  and instant milestone progress donuts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN PLATFORM CAPABILITIES */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-uppercase fw-bold text-primary small tracking-wider" style={{ color: '#4F46E5' }}>
              Engineered For Delivery
            </h6>
            <h2 className="display-6 fw-bold text-dark">Main Platform Capabilities</h2>
            <p className="text-secondary">
              Everything your organization needs to orchestrate cross-functional teams with precision.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-primary mb-3"
                  style={{ width: 42, height: 42, backgroundColor: '#EEF2FF' }}
                >
                  <Kanban size={20} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Kanban Boards</h5>
                <p className="text-secondary small mb-3">
                  Visual workflow boards with custom status pipelines, priority tags, and subtask trees.
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none d-flex align-items-center gap-1"
                  onClick={() => setActiveView('kanban')}
                >
                  <span>Explore Board View</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-success mb-3"
                  style={{ width: 42, height: 42, backgroundColor: '#ECFDF5' }}
                >
                  <Calendar size={20} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Sprint Calendar</h5>
                <p className="text-secondary small mb-3">
                  Coordinate release dates, sprint milestones, and individual task deadlines with monthly/weekly views.
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0 text-success fw-semibold small text-decoration-none d-flex align-items-center gap-1"
                  onClick={() => setActiveView('calendar')}
                >
                  <span>Explore Calendar</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-warning mb-3"
                  style={{ width: 42, height: 42, backgroundColor: '#FFFBEB' }}
                >
                  <TrendingUp size={20} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Velocity Reports</h5>
                <p className="text-secondary small mb-3">
                  Weekly completion spline wave charts, status distribution donuts, and team workload bars.
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0 text-warning fw-semibold small text-decoration-none d-flex align-items-center gap-1"
                  onClick={() => setActiveView('analytics')}
                >
                  <span>Explore Analytics</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center text-info mb-3"
                  style={{ width: 42, height: 42, backgroundColor: '#EFF6FF' }}
                >
                  <Users2 size={20} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Team Governance</h5>
                <p className="text-secondary small mb-3">
                  Granular Role-Based Access Control (RBAC), multi-tenant department separation, and audit trails.
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0 text-info fw-semibold small text-decoration-none d-flex align-items-center gap-1"
                  onClick={() => setActiveView('team')}
                >
                  <span>Explore Team Hub</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE STRATEGIC BENEFIT PILLARS */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4">
          <div className="row g-5 align-items-center mb-5">
            <div className="col-lg-6">
              <div className="badge bg-primary-subtle text-primary mb-2 px-3 py-1.5 fw-semibold">
                Strategic Pillar 01
              </div>
              <h3 className="fw-bold text-dark mb-3">Project Management Without Chaos</h3>
              <p className="text-secondary mb-4">
                Structured workspaces let technical project managers configure customized workflows, backlog
                refinements, and multi-sprint roadmaps while keeping contributors focused on active deliverables.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2">
                <li className="d-flex align-items-center gap-2 text-dark small fw-medium">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Customizable Kanban swimlanes and priority matrices</span>
                </li>
                <li className="d-flex align-items-center gap-2 text-dark small fw-medium">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Subtask hierarchies and estimate point rollups</span>
                </li>
                <li className="d-flex align-items-center gap-2 text-dark small fw-medium">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Real-time sprint progress calculations</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-4 bg-light border text-center">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="bg-white p-3 rounded-3 shadow-xs border">
                      <div className="fs-4 fw-bold text-primary mb-1">Live</div>
                      <div className="small text-muted">Sprint Progress Tracking</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-white p-3 rounded-3 shadow-xs border">
                      <div className="fs-4 fw-bold text-success mb-1">Clear</div>
                      <div className="small text-muted">Velocity & Burndown</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="bg-white p-3 rounded-3 shadow-xs border text-start">
                      <div className="small fw-bold text-dark mb-1">Active Sprint Burndown</div>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: '78%', backgroundColor: '#4F46E5' }}
                        />
                      </div>
                      <div className="d-flex justify-content-between small text-muted mt-1">
                        <span>Sprint milestone tracking</span>
                        <span>Kanban synchronized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW WORKZEN WORKS (3-STEP TIMELINE) */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-uppercase fw-bold text-primary small tracking-wider" style={{ color: '#4F46E5' }}>
              Simple Onboarding
            </h6>
            <h2 className="display-6 fw-bold text-dark">How Workzen Works</h2>
            <p className="text-secondary">Get your entire team up and running in under three minutes.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold mb-3"
                  style={{ width: 48, height: 48, backgroundColor: '#4F46E5', fontSize: '1.2rem' }}
                >
                  1
                </div>
                <h5 className="fw-bold text-dark mb-2">Create Your Organization</h5>
                <p className="text-secondary small mb-0">
                  Register your organization with a unique workspace domain. Invite team members with predefined
                  roles and permissions.
                </p>
              </div>
            </div>

            <div className="col-md-4 text-center">
              <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold mb-3"
                  style={{ width: 48, height: 48, backgroundColor: '#4F46E5', fontSize: '1.2rem' }}
                >
                  2
                </div>
                <h5 className="fw-bold text-dark mb-2">Orchestrate Workflows</h5>
                <p className="text-secondary small mb-0">
                  Create projects, configure Kanban columns, assign tasks, attach files, and set milestone deadlines.
                </p>
              </div>
            </div>

            <div className="col-md-4 text-center">
              <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold mb-3"
                  style={{ width: 48, height: 48, backgroundColor: '#4F46E5', fontSize: '1.2rem' }}
                >
                  3
                </div>
                <h5 className="fw-bold text-dark mb-2">Track Team Velocity</h5>
                <p className="text-secondary small mb-0">
                  Monitor sprint progress, review weekly completion spline charts, and resolve blockers with zero friction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING PREVIEW */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-uppercase fw-bold text-primary small tracking-wider" style={{ color: '#4F46E5' }}>
              Transparent Investment
            </h6>
            <h2 className="display-6 fw-bold text-dark">Predictable Plans for Every Stage</h2>
            <p className="text-secondary">
              No hidden fees. Scale effortlessly from free squad collaboration to enterprise multi-tenant deployments.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Starter */}
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-4 bg-light border h-100 d-flex flex-column">
                <div className="fw-bold text-dark fs-5 mb-1">Starter</div>
                <div className="display-5 fw-bold text-dark mb-1">Free</div>
                <p className="text-muted small mb-4">Perfect for individuals and small agile squads.</p>
                <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary flex-grow-1">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Up to 5 team members</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Unlimited Kanban tasks & boards</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Sprint calendar view</span>
                  </li>
                </ul>
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 py-2.5 rounded-3 fw-semibold mt-3"
                  onClick={() => setActiveView('register')}
                >
                  Get Started Free
                </button>
              </div>
            </div>

            {/* Professional (Featured) */}
            <div className="col-lg-4 col-md-6">
              <div
                className="p-4 rounded-4 bg-white border border-primary border-2 shadow-lg h-100 d-flex flex-column position-relative"
                style={{ borderColor: '#4F46E5' }}
              >
                <span
                  className="badge position-absolute top-0 start-50 translate-middle text-white fw-bold px-3 py-1.5 rounded-pill shadow-sm"
                  style={{ backgroundColor: '#4F46E5', fontSize: '0.75rem' }}
                >
                  MOST POPULAR
                </span>
                <div className="fw-bold text-dark fs-5 mb-1">Professional</div>
                <div className="display-5 fw-bold text-primary mb-1" style={{ color: '#4F46E5' }}>
                  $12<span className="fs-6 fw-normal text-muted"> / seat / mo</span>
                </div>
                <p className="text-muted small mb-4">For growing companies needing velocity metrics.</p>
                <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary flex-grow-1">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Everything in Starter</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Unlimited team seats</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Velocity Spline & Donut Analytics</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Secure cloud file storage (50 GB)</span>
                  </li>
                </ul>
                <button
                  type="button"
                  className="btn text-white w-100 py-2.5 rounded-3 fw-bold shadow-sm mt-3"
                  style={{ backgroundColor: '#4F46E5' }}
                  onClick={() => setActiveView('register')}
                >
                  Start 14-Day Free Trial
                </button>
              </div>
            </div>

            {/* Enterprise */}
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-4 bg-light border h-100 d-flex flex-column">
                <div className="fw-bold text-dark fs-5 mb-1">Enterprise</div>
                <div className="display-5 fw-bold text-dark mb-1">Custom</div>
                <p className="text-muted small mb-4">Dedicated organization isolation and tailored security.</p>
                <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary flex-grow-1">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Unlimited workspaces & projects</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Single Sign-On (SSO) Support</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>Comprehensive audit trail & export</span>
                  </li>
                </ul>
                <button
                  type="button"
                  className="btn btn-outline-dark w-100 py-2.5 rounded-3 fw-semibold mt-3"
                  onClick={() => setActiveView('contact')}
                >
                  Contact Enterprise Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-uppercase fw-bold text-primary small tracking-wider" style={{ color: '#4F46E5' }}>
              Common Inquiries
            </h6>
            <h2 className="display-6 fw-bold text-dark">Frequently Asked Questions</h2>
            <p className="text-secondary">Quick answers to common questions about Workzen.</p>
          </div>

          <div className="max-w-800 mx-auto">
            <div className="d-flex flex-column gap-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-white rounded-3 border shadow-xs overflow-hidden">
                    <button
                      type="button"
                      className="btn w-100 text-start p-3.5 d-flex justify-content-between align-items-center border-0"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="fw-bold text-dark" style={{ fontSize: '1rem' }}>
                        {faq.q}
                      </span>
                      {isOpen ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} className="text-secondary" />}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-secondary small" style={{ lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION BANNER */}
      <section
        className="py-5 text-white text-center position-relative"
        style={{
          background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 50%, #6366F1 100%)'
        }}
      >
        <div className="container py-4">
          <h2 className="display-5 fw-extrabold text-white mb-3">Ready to Plan Smarter and Work Together?</h2>
          <p className="lead text-light text-opacity-90 max-w-600 mx-auto mb-4" style={{ fontSize: '1.15rem' }}>
            Join forward-thinking product teams, startups, and enterprise squads who use Workzen to deliver with decisive clarity.
          </p>
          <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
            <button
              type="button"
              className="btn btn-light text-primary fw-bold px-4 py-3 rounded-3 shadow-lg d-flex align-items-center gap-2"
              style={{ fontSize: '1rem', color: '#4F46E5' }}
              onClick={() => setActiveView('register')}
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn-outline-light fw-semibold px-4 py-3 rounded-3"
              style={{ fontSize: '1rem' }}
              onClick={() => setActiveView('contact')}
            >
              Talk to Our Team
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
