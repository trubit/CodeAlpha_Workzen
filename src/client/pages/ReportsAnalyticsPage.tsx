import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { StatCard } from '../design-system/components/StatCard.js';
import { Card } from '../design-system/components/Card.js';
import { ProgressBar, CircularProgress } from '../design-system/components/ProgressBar.js';
import { Button } from '../design-system/components/Button.js';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  Filter,
  Layers,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { colors } from '../design-system/tokens/colors.js';

export const ReportsAnalyticsPage: React.FC = () => {
  const { currentProject, teamMembers, tasks } = useWorkzenStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const reviewCount = tasks.filter((t) => t.status === 'review').length;
  const backlogCount = tasks.filter((t) => t.status === 'backlog' || t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Real client-side CSV export of actual tasks
  const handleExportCsv = () => {
    if (tasks.length === 0) return;

    const headers = ['TaskKey', 'Title', 'Status', 'Priority', 'DueDate', 'Tags'];
    const rows = tasks.map((t) => [
      `"${t.taskKey || ''}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.status || ''}"`,
      `"${t.priority || ''}"`,
      `"${t.dueDate || ''}"`,
      `"${(t.tags || []).join(';')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `workzen_tasks_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Analytics Header & Controls */}
      <div className="wz-card p-4 d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <div className="badge rounded-pill bg-primary-subtle text-primary fw-bold mb-1.5 px-3 py-1">
            <BarChart3 size={13} className="me-1" /> Velocity & Sprint Telemetry
          </div>
          <h3 className="fw-bold m-0 text-dark">Reports & Executive Analytics</h3>
          <p className="text-muted small m-0 mt-0.5">
            Cross-functional deliverable velocity, sprint milestones, and resource allocation
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${timeRange === 'week' ? 'btn-primary' : 'btn-outline-secondary'} fw-medium`}
              onClick={() => setTimeRange('week')}
            >
              This Week
            </button>
            <button
              className={`btn ${timeRange === 'month' ? 'btn-primary' : 'btn-outline-secondary'} fw-medium`}
              onClick={() => setTimeRange('month')}
            >
              This Month
            </button>
            <button
              className={`btn ${timeRange === 'quarter' ? 'btn-primary' : 'btn-outline-secondary'} fw-medium`}
              onClick={() => setTimeRange('quarter')}
            >
              Quarter
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportCsv}
            disabled={tasks.length === 0}
          >
            Export Telemetry
          </Button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-0">
          <CheckCircle2 size={16} className="text-success" />
          <span>Executive task telemetry CSV generated and downloaded successfully.</span>
        </div>
      )}

      {/* Top Real Metric Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Total Tracked Work"
            value={String(totalTasks)}
            change={`${inProgressCount} active now`}
            trend="neutral"
            icon={<Layers size={18} />}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Completed Deliverables"
            value={String(completedCount)}
            change={`${completionRate}% completion`}
            trend={completionRate > 50 ? 'up' : 'neutral'}
            icon={<CheckCircle2 size={18} />}
            iconBgColor={colors.success[50]}
            iconColor={colors.success[600]}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Active In Progress"
            value={String(inProgressCount)}
            change={`${reviewCount} in review`}
            trend="neutral"
            icon={<Clock size={18} />}
            iconBgColor={colors.secondary[50]}
            iconColor={colors.secondary[600]}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Sprint Completion Rate"
            value={`${completionRate}%`}
            change={`${backlogCount} pending tasks`}
            trend={completionRate >= 50 ? 'up' : 'down'}
            icon={<TrendingUp size={18} />}
            iconBgColor={colors.warning[50]}
            iconColor={colors.warning[600]}
          />
        </div>
      </div>

      {/* Wave Chart & Status Distribution */}
      <div className="row g-4">
        {/* Status Distribution */}
        <div className="col-lg-6">
          <Card variant="elevated" padding="lg" className="h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold m-0 text-dark mb-1">Status Distribution</h5>
              <p className="text-muted small mb-4">Total {totalTasks} tasks in sprint</p>

              <div className="d-flex justify-content-center my-3">
                <CircularProgress value={completionRate} size={130} strokeWidth={11} label="Completed" />
              </div>

              <div className="d-flex flex-column gap-2 mt-4 small">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <span className="rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: colors.success[500] }} />
                    Completed
                  </span>
                  <span className="fw-bold text-dark">{completedCount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <span className="rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: colors.primary[600] }} />
                    In Progress
                  </span>
                  <span className="fw-bold text-dark">{inProgressCount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <span className="rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: colors.warning[500] }} />
                    In Review
                  </span>
                  <span className="fw-bold text-dark">{reviewCount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <span className="rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: colors.slate[400] }} />
                    Backlog
                  </span>
                  <span className="fw-bold text-dark">{backlogCount}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Task Velocity Metrics */}
        <div className="col-lg-6">
          <Card variant="elevated" padding="lg" className="h-100">
            <h5 className="fw-bold m-0 text-dark mb-1">Sprint Throughput Metrics</h5>
            <p className="text-muted small mb-4">Real calculated velocity metrics</p>

            {totalTasks === 0 ? (
              <div className="text-center py-5 border border-dashed rounded-3">
                <BarChart3 size={32} className="text-muted mb-2 opacity-50" />
                <h6 className="fw-semibold text-dark">No Sprint Telemetry</h6>
                <p className="text-muted small mb-0">Create tasks to track deliverable velocity in real time.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Completed Progress</span>
                    <span className="fw-bold text-dark">{completionRate}%</span>
                  </div>
                  <ProgressBar value={completionRate} color={colors.success[500]} height={8} />
                </div>

                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">In Progress Load</span>
                    <span className="fw-bold text-dark">
                      {totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <ProgressBar
                    value={totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0}
                    color={colors.primary[600]}
                    height={8}
                  />
                </div>

                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">In Review Rate</span>
                    <span className="fw-bold text-dark">
                      {totalTasks > 0 ? Math.round((reviewCount / totalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <ProgressBar
                    value={totalTasks > 0 ? Math.round((reviewCount / totalTasks) * 100) : 0}
                    color={colors.warning[500]}
                    height={8}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Team Workload & Capacity Table */}
      <Card variant="elevated" padding="lg">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark m-0">Team Workload & Capacity Balance</h5>
            <p className="text-muted small m-0">Active capacity distribution across assignees</p>
          </div>
          <span className="badge bg-light text-secondary border small">Live Workspace Data</span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-5 border border-dashed rounded-3">
            <Users size={32} className="text-muted mb-2 opacity-50" />
            <h6 className="fw-semibold text-dark">No Team Members Assigned</h6>
            <p className="text-muted small mb-0">Invite team members to track individual capacity and workload allocation.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-secondary small text-uppercase">
                  <th>Member</th>
                  <th>Assigned Tasks</th>
                  <th className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((mem) => {
                  const assigned = tasks.filter((t) => t.assigneeIds?.includes(mem._id)).length;
                  return (
                    <tr key={mem._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, backgroundColor: '#4F46E5', fontSize: '0.78rem' }}
                          >
                            {mem.firstName[0]}{mem.lastName[0]}
                          </div>
                          <div>
                            <span className="fw-bold text-dark small">{mem.firstName} {mem.lastName}</span>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{mem.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small fw-semibold text-dark">
                        {assigned} tasks
                      </td>
                      <td className="text-end">
                        <span className="badge bg-success-subtle text-success small">Active</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
