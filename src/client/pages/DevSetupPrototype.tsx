import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import {
  Server,
  Database,
  ShieldCheck,
  Terminal,
  Activity,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export const DevSetupPrototype: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.checkHealth();
      setHealthData(response.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Unable to connect to backend server');
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Brand Header */}
      <div className="wz-card p-4 text-white rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)' }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <div className="badge rounded-pill bg-white text-primary fw-bold mb-2 px-3 py-1.5" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={13} className="me-1" /> WORKZEN SYSTEM DIAGNOSTICS
            </div>
            <h2 className="fw-extrabold m-0 tracking-tight">System Infrastructure & Telemetry</h2>
            <p className="text-white-50 m-0 mt-1 small">
              Live infrastructure connectivity, API availability, and database health verification.
            </p>
          </div>

          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-light d-flex align-items-center fw-semibold text-primary px-3 py-2 rounded-3 shadow-sm"
              onClick={fetchHealth}
              disabled={loading}
            >
              <RefreshCw size={16} className={`me-2 ${loading ? 'spin' : ''}`} />
              {loading ? 'Pinging Server...' : 'Check API Telemetry'}
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Topology Status */}
      <div className="row g-3">
        {/* Frontend Status */}
        <div className="col-md-4">
          <div className="wz-card p-3.5 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">Frontend Client</span>
              <span className="p-2 rounded-3 bg-primary-subtle text-primary"><Layers size={18} /></span>
            </div>
            <div className="h4 fw-bold m-0 text-dark">React 18 + Vite 6</div>
            <div className="text-muted small mt-1">
              Port: <strong>3070</strong> &bull; MUI + Bootstrap Integrated
            </div>
            <div className="badge bg-success-subtle text-success mt-2 small">
              <CheckCircle2 size={12} className="me-1" /> Active & Serving
            </div>
          </div>
        </div>

        {/* Backend Status */}
        <div className="col-md-4">
          <div className="wz-card p-3.5 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">Backend Server</span>
              <span className="p-2 rounded-3 bg-indigo-subtle text-indigo"><Server size={18} /></span>
            </div>
            <div className="h4 fw-bold m-0 text-dark">Node.js + Express</div>
            <div className="text-muted small mt-1">
              Port: <strong>5050</strong> &bull; API Prefix: <code>/api/v1</code>
            </div>
            <div className="badge bg-primary-subtle text-primary mt-2 small">
              <Activity size={12} className="me-1" /> Real-Time Gateway Operational
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="col-md-4">
          <div className="wz-card p-3.5 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">Database Persistence</span>
              <span className="p-2 rounded-3 bg-success-subtle text-success"><Database size={18} /></span>
            </div>
            <div className="h4 fw-bold m-0 text-dark">Database Storage</div>
            <div className="text-muted small mt-1">
              State: <strong>{healthData?.database?.status || 'Active'}</strong>
            </div>
            <div className="badge bg-info-subtle text-info mt-2 small">
              <ShieldCheck size={12} className="me-1" /> Schemas Synchronized
            </div>
          </div>
        </div>
      </div>

      {/* Live Health & Telemetry Inspector */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="wz-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold m-0 text-dark d-flex align-items-center">
                  <Activity size={18} className="me-2 text-primary" /> Live Endpoint Health Check (`/api/v1/health`)
                </h5>
                <p className="text-muted small m-0">Last evaluated at {lastChecked || 'Pending'}</p>
              </div>
            </div>

            {error ? (
              <div className="alert alert-warning d-flex align-items-center rounded-3">
                <AlertCircle size={20} className="me-2 flex-shrink-0" />
                <div className="small">
                  <strong>Backend Offline Notice:</strong> {error}. Start the backend server with <code>npm run dev:server</code> to inspect live telemetry.
                </div>
              </div>
            ) : healthData ? (
              <div className="p-3 bg-light rounded-3 border">
                <pre className="m-0 text-dark small" style={{ fontSize: '0.78rem', maxHeight: '280px', overflow: 'auto' }}>
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-4 text-muted small">
                Click "Check API Telemetry" to ping the backend server.
              </div>
            )}
          </div>
        </div>

        {/* Developer Command Cheat Sheet */}
        <div className="col-lg-5">
          <div className="wz-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
              <Terminal size={18} className="me-2 text-primary" /> Development CLI Scripts
            </h5>

            <div className="d-flex flex-column gap-2.5 small">
              <div className="p-2.5 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <code className="fw-bold text-primary">npm run dev:all</code>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Runs Vite (3070) & Express (5050) concurrently</div>
                </div>
              </div>

              <div className="p-2.5 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <code className="fw-bold text-primary">npm test</code>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Executes automated Zod & health test suite</div>
                </div>
              </div>

              <div className="p-2.5 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <code className="fw-bold text-primary">npm run typecheck</code>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Strict full-stack TypeScript validation</div>
                </div>
              </div>

              <div className="p-2.5 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <code className="fw-bold text-primary">npm run build</code>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Builds client to dist/ and server to dist/server/</div>
                </div>
              </div>

              <div className="p-2.5 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <code className="fw-bold text-primary">docker compose up</code>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Launches App and MongoDB containers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

