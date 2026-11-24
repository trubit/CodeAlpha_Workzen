import React, { useState } from 'react';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { PublicLayout } from '../../components/public/PublicLayout.js';
import {
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Zap,
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { setActiveView } = useWorkzenStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Ideal for individuals, freelance builders, and small agile squads.',
      features: [
        'Up to 5 team members',
        'Unlimited Kanban boards & cards',
        'Sprint calendar view',
        '5 GB secure file storage',
        'Standard community support',
        'Single workspace'
      ],
      ctaText: 'Start Free Forever',
      isPopular: false,
      btnStyle: 'btn-outline-primary'
    },
    {
      id: 'professional',
      name: 'Professional',
      priceMonthly: 15,
      priceAnnual: 12,
      description: 'For growing teams requiring advanced velocity metrics and expanded storage.',
      features: [
        'Unlimited team members',
        'Unlimited Kanban boards & cards',
        'Sprint calendar & milestone tracking',
        'Velocity Spline & Donut Analytics',
        '50 GB secure file storage',
        'Priority email support',
        'Up to 5 workspaces per organization'
      ],
      ctaText: 'Start 14-Day Free Trial',
      isPopular: true,
      btnStyle: 'btn-primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceMonthly: null,
      priceAnnual: null,
      description: 'Dedicated organization security, tailored governance, and high-capacity workspaces.',
      features: [
        'Unlimited workspaces & organizations',
        'Dedicated organization data isolation',
        'Single Sign-On (SSO) Support',
        'Full security audit log export',
        'Expanded cloud storage quotas',
        'Dedicated technical support',
        'Custom contracts & invoicing'
      ],
      ctaText: 'Contact Enterprise Sales',
      isPopular: false,
      btnStyle: 'btn-outline-dark'
    }
  ];

  const comparisonRows = [
    { feature: 'Team Members', starter: '5 members', pro: 'Unlimited', ent: 'Unlimited' },
    { feature: 'Kanban Boards', starter: 'Unlimited', pro: 'Unlimited', ent: 'Unlimited' },
    { feature: 'Sprint Calendar', starter: 'Yes', pro: 'Yes', ent: 'Yes' },
    { feature: 'Velocity Analytics', starter: 'Basic', pro: 'Full Spline & Donut', ent: 'Advanced + Export' },
    { feature: 'Secure File Storage', starter: '5 GB', pro: '50 GB', ent: 'Custom Quota' },
    { feature: 'Organization Data Isolation', starter: 'Standard', pro: 'Standard', ent: 'Dedicated Boundary' },
    { feature: 'SAML / SSO Support', starter: 'No', pro: 'Planned', ent: 'Supported' },
    { feature: 'Audit Trail Logs', starter: 'No', pro: '30 Days', ent: '1 Year Retention' },
    { feature: 'Billing Options', starter: 'Free', pro: 'Card & Online Payments', ent: 'Invoicing & Wire' }
  ];

  return (
    <PublicLayout>
      {/* Header */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center max-w-800 mx-auto">
          <div className="badge bg-primary-subtle text-primary mb-3 px-3 py-1.5 fw-semibold">
            Simple, Transparent Pricing
          </div>
          <h1 className="display-5 fw-extrabold text-dark mb-3">Predictable Plans That Scale With You</h1>
          <p className="lead text-secondary mb-4">
            No surprise overages. Choose the plan that fits your squad today and upgrade seamlessly as your delivery demands expand.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="d-inline-flex align-items-center bg-light p-1.5 rounded-pill border">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold border-0 ${
                billingCycle === 'monthly' ? 'bg-white shadow-xs text-dark' : 'text-secondary'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold border-0 d-flex align-items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-white shadow-xs text-dark' : 'text-secondary'
              }`}
              onClick={() => setBillingCycle('annual')}
            >
              <span>Annual Billing</span>
              <span className="badge rounded-pill bg-success-subtle text-success small" style={{ fontSize: '0.7rem' }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="row g-4 justify-content-center mb-5">
            {plans.map((p) => {
              const price = billingCycle === 'annual' ? p.priceAnnual : p.priceMonthly;
              return (
                <div key={p.id} className="col-lg-4 col-md-6">
                  <div
                    className={`p-4 p-md-5 rounded-4 bg-white border h-100 d-flex flex-column position-relative ${
                      p.isPopular ? 'border-primary border-2 shadow-lg' : 'shadow-sm'
                    }`}
                    style={p.isPopular ? { borderColor: '#4F46E5' } : {}}
                  >
                    {p.isPopular && (
                      <span
                        className="badge position-absolute top-0 start-50 translate-middle text-white fw-bold px-3 py-1.5 rounded-pill shadow-sm"
                        style={{ backgroundColor: '#4F46E5', fontSize: '0.75rem' }}
                      >
                        MOST POPULAR
                      </span>
                    )}

                    <div className="fw-bold text-dark fs-5 mb-1">{p.name}</div>
                    <div className="d-flex align-items-baseline mb-2">
                      {price !== null ? (
                        <>
                          <span className="display-5 fw-extrabold text-dark tracking-tight">
                            {price === 0 ? 'Free' : `$${price}`}
                          </span>
                          {price > 0 && <span className="text-muted ms-1 small">/ seat / month</span>}
                        </>
                      ) : (
                        <span className="display-5 fw-extrabold text-dark tracking-tight">Custom</span>
                      )}
                    </div>
                    <p className="text-secondary small mb-4 flex-grow-0" style={{ minHeight: '44px' }}>
                      {p.description}
                    </p>

                    <div className="pt-3 border-top mb-4 flex-grow-1">
                      <div className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                        Included Features
                      </div>
                      <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                        {p.features.map((feat, fIdx) => (
                          <li key={fIdx} className="d-flex align-items-start gap-2 small text-dark">
                            <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`btn ${p.btnStyle} w-100 py-2.5 rounded-3 fw-bold mt-auto`}
                      style={p.isPopular ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
                      onClick={() => (p.id === 'enterprise' ? setActiveView('contact') : setActiveView('register'))}
                    >
                      {p.ctaText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Infrastructure Notice */}
          <div className="p-4 rounded-4 bg-white border text-center max-w-800 mx-auto mb-5">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-primary fw-semibold">
              <CreditCard size={18} />
              <span>Transparent & Flexible Billing</span>
            </div>
            <p className="text-secondary small mb-0">
              Workzen supports standard international payment methods with transparent invoices, automatic receipt generation,
              and self-serve plan adjustments.
            </p>
          </div>

          {/* Feature Comparison Matrix */}
          <div className="bg-white rounded-4 border shadow-sm p-4 p-md-5">
            <h4 className="fw-bold text-dark mb-4 text-center">Detailed Feature Comparison</h4>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: '40%' }}>Feature Module</th>
                    <th scope="col" style={{ width: '20%' }} className="text-center">Starter</th>
                    <th scope="col" style={{ width: '20%' }} className="text-center text-primary">Professional</th>
                    <th scope="col" style={{ width: '20%' }} className="text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="fw-medium text-dark">{row.feature}</td>
                      <td className="text-center text-secondary small">{row.starter}</td>
                      <td className="text-center fw-semibold text-primary small">{row.pro}</td>
                      <td className="text-center text-dark small fw-medium">{row.ent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

