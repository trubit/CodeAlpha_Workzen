import React from 'react';
import { TaskStatus } from '../../../shared/constants/status.js';

export interface StatusPillProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'done':
        return { label: 'Done', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' };
      case 'in_progress':
        return { label: 'In Progress', bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE', dot: '#6366F1' };
      case 'review':
        return { label: 'In Review', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' };
      case 'todo':
        return { label: 'To Do', bg: '#F1F5F9', color: '#334155', border: '#E2E8F0', dot: '#94A3B8' };
      case 'backlog':
        return { label: 'Backlog', bg: '#F8FAFC', color: '#64748B', border: '#CBD5E1', dot: '#CBD5E1' };
      case 'cancelled':
        return { label: 'Cancelled', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#EF4444' };
      default:
        return { label: status, bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', dot: '#94A3B8' };
    }
  };

  const s = getStyles();

  return (
    <span
      className="d-inline-flex align-items-center fw-semibold rounded-pill"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: size === 'sm' ? '1.5px 7px' : '3px 10px',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem'
      }}
    >
      <span
        className="rounded-circle me-1.5 flex-shrink-0"
        style={{ width: 6, height: 6, backgroundColor: s.dot }}
      />
      {s.label}
    </span>
  );
};

