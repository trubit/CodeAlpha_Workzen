import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { PublicLayout } from '../../components/public/PublicLayout.js';
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

interface FAQCategory {
  category: string;
  items: { q: string; a: string }[];
}

export const FAQPage: React.FC = () => {
  const { setActiveView } = useWorkzenStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'Getting Started-0': true
  });

  const faqData: FAQCategory[] = [
    {
      category: 'Getting Started',
      items: [
        {
          q: 'What is WORKZEN and how does it differ from traditional tools?',
          a: 'Workzen is an enterprise SaaS platform engineered to eliminate project management clutter. By combining intuitive Kanban swimlanes, sprint calendar planning, and real-time velocity analytics in an uncluttered interface, Workzen lets teams execute faster with lower cognitive overhead.'
        },
        {
          q: 'How long does it take to onboard our organization?',
          a: 'Under three minutes. You can create your company organization, set up your first workspace, invite team members with designated roles, and start organizing projects immediately.'
        }
      ]
    },
    {
      category: 'Projects',
      items: [
        {
          q: 'Can we manage multiple concurrent projects within a single workspace?',
          a: 'Yes. Workzen allows you to create unlimited projects within each workspace, each with its own independent sprint cycles, milestone deadlines, and task directories.'
        },
        {
          q: 'Can we import existing boards from other project management tools?',
          a: 'Workzen includes structured import tools to help teams easily bring tasks, statuses, priorities, and descriptions from external tools into their workspaces.'
        }
      ]
    },
    {
      category: 'Tasks',
      items: [
        {
          q: 'What task metadata is supported?',
          a: 'Each task supports a title, rich description, priority level (Urgent, High, Medium, Low), workflow status (Done, In Progress, Review, To Do, Backlog), subtask checklists, due date, story point estimates, and secure file attachments.'
        },
        {
          q: 'Are subtasks supported?',
          a: 'Yes. Tasks support nested subtask completion meters. Progress updates automatically reflect on the parent card in real time.'
        }
      ]
    },
    {
      category: 'Teams',
      items: [
        {
          q: 'How does team directory and assignment work?',
          a: 'Team administrators can assign members to projects and tasks. Members have clear role tags (Owner, Admin, Member, Viewer) that dictate edit permissions.'
        },
        {
          q: 'Can we see individual member workloads?',
          a: 'Yes. The Velocity & Reports dashboard includes team workload bars indicating active versus completed tasks per contributor to prevent burnout.'
        }
      ]
    },
    {
      category: 'Workspaces',
      items: [
        {
          q: 'What is the difference between an Organization and a Workspace?',
          a: 'An Organization represents your company or business account and manages members, security policies, and billing. Workspaces are dedicated departmental spaces (e.g., Engineering, Marketing, Design) within the organization.'
        }
      ]
    },
    {
      category: 'Collaboration',
      items: [
        {
          q: 'Does Workzen update in real time when colleagues move cards?',
          a: 'Yes. Workzen synchronizes updates in real time. When a card moves or a status changes, all active team members see the changes instantly.'
        }
      ]
    },
    {
      category: 'Account & Security',
      items: [
        {
          q: 'How does Workzen ensure multi-tenant data isolation?',
          a: 'Every organization is strictly isolated within dedicated data boundaries. Continuous access control checks ensure that each organization can only view its own members, workspaces, and deliverables.'
        },
        {
          q: 'Is two-factor authentication (OTP) supported?',
          a: 'Yes. Workzen authentication supports email OTP verification and password reset workflows.'
        }
      ]
    },
    {
      category: 'Pricing & Subscriptions',
      items: [
        {
          q: 'Is there a free tier available?',
          a: 'Yes. The Starter plan is free forever for up to 5 team members with unlimited Kanban boards and 5GB of secure cloud file storage.'
        },
        {
          q: 'Which payment options are supported for paid upgrades?',
          a: 'Workzen supports major international and regional credit/debit cards as well as invoice-based payments for enterprise plans.'
        }
      ]
    }
  ];

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = faqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <PublicLayout>
      {/* Header */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center max-w-800 mx-auto">
          <div className="badge bg-primary-subtle text-primary mb-3 px-3 py-1.5 fw-semibold">
            Help & Knowledge Hub
          </div>
          <h1 className="display-5 fw-extrabold text-dark mb-3">Frequently Asked Questions</h1>
          <p className="lead text-secondary mb-4">
            Find answers to common questions about Workzen features, workflows, architecture, and subscriptions.
          </p>

          {/* Search Input */}
          <div className="max-w-600 mx-auto position-relative">
            <Search
              size={18}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
            />
            <input
              type="text"
              className="form-control form-control-lg rounded-pill ps-5 border shadow-sm"
              placeholder="Search questions (e.g. multi-tenant, Kanban, pricing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Accordion Categories */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4 max-w-800 mx-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border p-5">
              <HelpCircle size={44} className="text-muted mb-3" />
              <h5 className="fw-bold text-dark mb-1">No matching questions found</h5>
              <p className="text-secondary small mb-3">
                Try searching for a different keyword or contact our enterprise team directly.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-3 fw-semibold"
                style={{ backgroundColor: '#4F46E5' }}
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-5">
              {filteredCategories.map((cat) => (
                <div key={cat.category}>
                  <h4 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{ width: 8, height: 8, backgroundColor: '#4F46E5' }}
                    />
                    <span>{cat.category}</span>
                  </h4>
                  <div className="d-flex flex-column gap-2.5">
                    {cat.items.map((item, idx) => {
                      const key = `${cat.category}-${idx}`;
                      const isOpen = !!openItems[key];
                      return (
                        <div key={key} className="bg-white rounded-3 border shadow-xs overflow-hidden">
                          <button
                            type="button"
                            className="btn w-100 text-start p-3.5 d-flex justify-content-between align-items-center border-0"
                            onClick={() => toggleItem(key)}
                            aria-expanded={isOpen}
                          >
                            <span className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                              {item.q}
                            </span>
                            {isOpen ? (
                              <ChevronUp size={18} className="text-primary flex-shrink-0 ms-2" />
                            ) : (
                              <ChevronDown size={18} className="text-secondary flex-shrink-0 ms-2" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-3.5 pb-3.5 text-secondary small" style={{ lineHeight: 1.6 }}>
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback Contact Box */}
          <div className="p-4 p-md-5 rounded-4 bg-white border shadow-sm text-center mt-5">
            <MessageCircle size={32} className="text-primary mb-2" />
            <h4 className="fw-bold text-dark mb-1">Still have questions?</h4>
            <p className="text-secondary small mb-3">
              Can't find the answer you're looking for? Our engineering team is happy to answer technical inquiries.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary fw-semibold px-4 py-2 rounded-3"
              onClick={() => setActiveView('contact')}
            >
              Get in Touch with Our Team
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

