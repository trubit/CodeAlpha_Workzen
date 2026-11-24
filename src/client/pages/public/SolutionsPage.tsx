import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { PublicLayout } from '../../components/public/PublicLayout.js';
import {
  Rocket,
  Store,
  TrendingUp,
  Globe2,
  GitBranch,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface SolutionPersona {
  id: string;
  title: string;
  audience: string;
  problem: string;
  solution: string;
  icon: React.ReactNode;
  benefits: string[];
}

export const SolutionsPage: React.FC = () => {
  const { setActiveView } = useWorkzenStore();

  const solutions: SolutionPersona[] = [
    {
      id: 'startups',
      title: 'Startups & Early Teams',
      audience: '1 - 15 members',
      problem: 'Juggling pitch decks, product roadmaps, and bugs with zero budget for high-overhead enterprise tools.',
      solution: 'Workzen gets startups running in under three minutes with intuitive Kanban workflows and zero training overhead.',
      icon: <Rocket size={24} className="text-primary" />,
      benefits: ['Free Starter plan with 5GB storage', 'Instant board templates', 'Zero configuration required']
    },
    {
      id: 'smb',
      title: 'Small Businesses',
      audience: '10 - 50 members',
      problem: 'Tasks slipping through email cracks, missed client deadlines, and lack of accountability.',
      solution: 'Centralize all client deliverables and internal projects with clear assignees, due dates, and sprint milestones.',
      icon: <Store size={24} className="text-success" />,
      benefits: ['Consolidated project dashboards', 'Automated deadline alerts', 'Single billing source']
    },
    {
      id: 'growing-teams',
      title: 'Growing Teams',
      audience: '50 - 250 members',
      problem: 'Communication breakdown as team size expands; status update meetings taking hours every week.',
      solution: 'Async-first task tracking with live activity feeds, subtask hierarchies, and automated weekly velocity charts.',
      icon: <TrendingUp size={24} className="text-warning" />,
      benefits: ['Reduce repetitive status syncs', 'Live team capacity meters', 'Cross-project visibility']
    },
    {
      id: 'remote-teams',
      title: 'Remote & Hybrid Teams',
      audience: 'Distributed Globally',
      problem: 'Timezone delays and fragmented visibility across distributed time zones.',
      solution: 'Real-time board synchronization, unread notification counts, and calendar deadline alignment across all regions.',
      icon: <Globe2 size={24} className="text-info" />,
      benefits: ['Instant real-time board sync', 'Timezone-aware sprint dates', 'Mobile responsive accessibility']
    },
    {
      id: 'project-managers',
      title: 'Technical Project Managers',
      audience: 'Agile & Scrum Leads',
      problem: 'Inability to accurately forecast sprint completion and identify blocked contributors early.',
      solution: 'Automated velocity spline curves, cycle time measurements, and task priority matrices for confident sprint planning.',
      icon: <GitBranch size={24} className="text-danger" />,
      benefits: ['Velocity burndowns', 'Sprint estimation tracking', 'Priority indicators']
    },
    {
      id: 'large-orgs',
      title: 'Large Organizations',
      audience: '250 - 1,000 members',
      problem: 'Siloed departments and lack of visibility between engineering, design, marketing, and operations.',
      solution: 'Multi-workspace architecture allowing independent departmental autonomy under a unified company organization.',
      icon: <Building2 size={24} className="text-primary" />,
      benefits: ['Isolated departmental workspaces', 'Central organization administration', 'Role-based access policies']
    },
    {
      id: 'enterprise',
      title: 'Global Enterprise',
      audience: '1,000+ members',
      problem: 'Strict security, compliance, data sovereignty, and audit requirements that off-the-shelf tools fail.',
      solution: 'Dedicated organization data isolation, encrypted sessions, role-based access control, and complete audit logging.',
      icon: <ShieldCheck size={24} className="text-dark" />,
      benefits: ['Dedicated organization isolation', 'Single Sign-On (SSO) Support', 'Full security event audit logs']
    }
  ];

  return (
    <PublicLayout>
      {/* Header */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center max-w-800 mx-auto">
          <div className="badge bg-primary-subtle text-primary mb-3 px-3 py-1.5 fw-semibold">
            Tailored Workspaces
          </div>
          <h1 className="display-5 fw-extrabold text-dark mb-3">Solutions for Every Stage of Growth</h1>
          <p className="lead text-secondary mb-4">
            Discover how Workzen adapts to the specific operating rhythms, security boundaries, and collaboration
            challenges of your team.
          </p>
        </div>
      </section>

      {/* Solutions Cards */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="row g-4">
            {solutions.map((sol) => (
              <div key={sol.id} className="col-lg-6">
                <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border h-100 d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center p-3 bg-light border"
                    >
                      {sol.icon}
                    </div>
                    <div>
                      <h4 className="fw-bold text-dark mb-1">{sol.title}</h4>
                      <span className="badge bg-light text-secondary border small">{sol.audience}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="small fw-bold text-danger text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>
                      The Challenge
                    </div>
                    <p className="text-secondary small mb-0">{sol.problem}</p>
                  </div>

                  <div className="mb-4 flex-grow-1">
                    <div className="small fw-bold text-success text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>
                      The Workzen Solution
                    </div>
                    <p className="text-dark small mb-0 fw-medium">{sol.solution}</p>
                  </div>

                  <div className="pt-3 border-top">
                    <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                      Target Benefits
                    </div>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {sol.benefits.map((b, bIdx) => (
                        <span key={bIdx} className="badge bg-light text-dark border py-1.5 px-2.5 small fw-normal">
                          <CheckCircle2 size={13} className="text-success me-1 d-inline" />
                          {b}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5"
                      onClick={() => setActiveView('register')}
                    >
                      <span>Explore this solution</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

