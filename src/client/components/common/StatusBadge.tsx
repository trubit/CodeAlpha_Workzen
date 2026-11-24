import React from 'react';
import { TaskStatus } from '../../../shared/constants/status.js';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'done':
        return 'badge-soft-success';
      case 'in_progress':
        return 'badge-soft-primary';
      case 'review':
        return 'badge-soft-warning';
      case 'todo':
        return 'badge-soft-slate';
      case 'backlog':
        return 'badge-soft-slate text-secondary';
      case 'cancelled':
        return 'badge-soft-danger';
      default:
        return 'badge-soft-slate';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'todo':
        return 'To Do';
      case 'done':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <span className={`badge rounded-pill px-2.5 py-1.5 fw-semibold ${getBadgeStyle()}`} style={{ fontSize: '0.75rem' }}>
      {getLabel()}
    </span>
  );
};

