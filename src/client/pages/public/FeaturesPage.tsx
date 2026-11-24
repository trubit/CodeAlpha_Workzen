import React from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { PublicLayout } from '../../components/public/PublicLayout.js';
import {
  Kanban,
  CheckSquare,
  Users2,
  Calendar,
  BarChart3,
  Bell,
  Clock,
  Briefcase,
  ShieldCheck,
  FileCode2,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  UploadCloud
} from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  status: 'Available' | 'Roadmap';
  capabilities: string[];
}

export const FeaturesPage: React.FC = () => {
  const { setActiveView } = useWorkzenStore();

  const features: FeatureItem[] = [
    {
      id: 'project-management',
      title: 'Project Portfolio Management',
      category: 'Core Operations',
      description: 'Centralize multi-sprint project roadmaps, milestone tracking, and cross-functional team ownership.',
      icon: <Briefcase size={22} className="text-primary" />,
      status: 'Available',
      capabilities: ['Multi-project directory', 'Sprint milestone deadlines', 'Project status rollups', 'Custom categories']
    },
    {
      id: 'task-management',
      title: 'Granular Task Engine',
      category: 'Core Operations',
      description: 'Break complex epics into discrete, assignable task units with rich metadata and priority tags.',
      icon: <CheckSquare size={22} className="text-primary" />,
      status: 'Available',
      capabilities: ['Subtask checklists', 'Priority matrix tagging', 'Custom labels & tags', 'Activity audit history']
    },
    {
      id: 'kanban-boards',
      title: 'Visual Kanban Boards',
      category: 'Core Operations',
      description: 'Streamlined swimlanes with real-time column counters and drag-and-drop status flow.',
      icon: <Kanban size={22} className="text-primary" />,
      status: 'Available',
      capabilities: ['Custom workflow stages', 'Instant column metrics', 'Card hover micro-interactions', 'Swimlane filters']
    },
    {
      id: 'team-collaboration',
      title: 'Team Presence & Directory',
      category: 'Collaboration',
      description: 'Empower cross-functional squads with transparent ownership, avatar stacking, and instant mentions.',
      icon: <Users2 size={22} className="text-success" />,
      status: 'Available',
      capabilities: ['Department grouping', 'Member capacity meters', 'Avatar presence rings', 'Role assignment']
    },
    {
      id: 'workspace-hub',
      title: 'Multi-Tenant Workspace Hub',
      category: 'Governance',
      description: 'Partition departmental workflows into distinct workspaces with unified tenant billing and governance.',
      icon: <Layers size={22} className="text-success" />,
      status: 'Available',
      capabilities: ['Organisation switching', 'Isolated team workspaces', 'Workspace storage quotas', 'Custom workspace icons']
    },
    {
      id: 'calendar-scheduling',
      title: 'Sprint Calendar & Deadlines',
      category: 'Planning',
      description: 'High-visibility monthly and weekly sprint views to forecast capacity and avoid release crunches.',
      icon: <Calendar size={22} className="text-warning" />,
      status: 'Available',
      capabilities: ['Month & week views', 'Sprint milestone pinning', 'Deadline conflict alerts', 'Direct task rescheduling']
    },
    {
      id: 'notification-centre',
      title: 'Unified Notification Centre',
      category: 'Collaboration',
      description: 'Stay informed with unread badge indicators, assignment alerts, and deadline notifications.',
      icon: <Bell size={22} className="text-warning" />,
      status: 'Available',
      capabilities: ['Unread badge counters', 'Categorized alert tabs', 'Mark all as read', 'Task jump triggers']
    },
    {
      id: 'reports-analytics',
      title: 'Reports & Velocity Analytics',
      category: 'Intelligence',
      description: 'Data-driven insights featuring weekly completion spline curves and team workload capacity bars.',
      icon: <BarChart3 size={22} className="text-info" />,
      status: 'Available',
      capabilities: ['Weekly completion splines', 'Status distribution donut', 'Member workload gauges', 'Cycle time telemetry']
    },
    {
      id: 'workflow-automations',
      title: 'Workflow Automations',
      category: 'Productivity',
      description: 'Trigger-based automatic status progressions, auto-assignments, and webhook event dispatching.',
      icon: <Zap size={22} className="text-info" />,
      status: 'Roadmap',
      capabilities: ['Status change triggers', 'Auto-assign rules', 'Outgoing webhooks', 'Recurring task scheduling']
    },
    {
      id: 'file-management',
      title: 'Secure File & Asset Storage',
      category: 'Infrastructure',
      description: 'Secure enterprise file uploads, task attachments, and project document storage with instant preview generation.',
      icon: <UploadCloud size={22} className="text-primary" />,
      status: 'Available',
      capabilities: ['High-speed delivery', 'Preview generation', 'Versioned attachments', 'Organization storage management']
    },
    {
      id: 'time-tracking',
      title: 'Time & Estimate Tracking',
      category: 'Planning',
      description: 'Compare planned story estimates against actual completion times to optimize scheduling accuracy.',
      icon: <Clock size={22} className="text-secondary" />,
      status: 'Roadmap',
      capabilities: ['Story point estimation', 'Time logging per subtask', 'Estimate variance graphs', 'Client billing export']
    },
    {
      id: 'enterprise-rbac',
      title: 'Role-Based Access Control & Audit',
      category: 'Governance',
      description: 'Granular role definitions (Owner, Admin, Manager, Member, Viewer) with comprehensive security audit logs.',
      icon: <ShieldCheck size={22} className="text-danger" />,
      status: 'Available',
      capabilities: ['Granular permissions', 'Session security policies', 'Administrative audit trail', 'Scoped workspace boundaries']
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center max-w-800 mx-auto">
          <div className="badge bg-primary-subtle text-primary mb-3 px-3 py-1.5 fw-semibold">
            Comprehensive Platform Suite
          </div>
          <h1 className="display-5 fw-extrabold text-dark mb-3">Enterprise Features & Modules</h1>
          <p className="lead text-secondary mb-4">
            Twelve core capability modules designed to help modern startups and enterprise organizations plan
            smarter, work together, and achieve more.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-primary fw-semibold px-4 py-2.5 rounded-3 shadow-sm d-flex align-items-center gap-2"
              style={{ backgroundColor: '#4F46E5' }}
              onClick={() => setActiveView('register')}
            >
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary fw-semibold px-4 py-2.5 rounded-3"
              onClick={() => setActiveView('kanban')}
            >
              Explore Kanban Board
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="row g-4">
            {features.map((feat) => (
              <div key={feat.id} className="col-lg-4 col-md-6">
                <div className="bg-white p-4 rounded-4 shadow-sm border h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div
                      className="rounded-3 d-inline-flex align-items-center justify-content-center p-2.5 bg-light border"
                    >
                      {feat.icon}
                    </div>
                    <span
                      className={`badge rounded-pill px-2.5 py-1 small fw-semibold ${
                        feat.status === 'Available'
                          ? 'bg-success-subtle text-success'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {feat.status === 'Available' ? 'Active' : 'Planned'}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{feat.title}</h5>
                  <p className="text-secondary small mb-3 flex-grow-1" style={{ lineHeight: 1.6 }}>
                    {feat.description}
                  </p>

                  <div className="pt-3 border-top mt-auto">
                    <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                      Key Capabilities
                    </div>
                    <ul className="list-unstyled d-flex flex-column gap-1.5 mb-0">
                      {feat.capabilities.map((cap, cIdx) => (
                        <li key={cIdx} className="d-flex align-items-center gap-2 small text-dark">
                          <span
                            className="rounded-circle d-inline-block"
                            style={{ width: 5, height: 5, backgroundColor: '#4F46E5' }}
                          />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-5 bg-white border-top text-center">
        <div className="container py-3">
          <h3 className="fw-bold text-dark mb-2">Need a tailored capability for your team?</h3>
          <p className="text-secondary max-w-600 mx-auto mb-4">
            Our team supports custom organization configurations and tailored enterprise deployments.
          </p>
          <button
            type="button"
            className="btn btn-outline-primary fw-semibold px-4 py-2.5 rounded-3"
            onClick={() => setActiveView('contact')}
          >
            Contact Our Team
          </button>
        </div>
      </section>
    </PublicLayout>
  );
};

