import React from 'react';
import { TaskPriority } from '../../../shared/constants/status.js';
import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PriorityChipProps {
  priority: TaskPriority;
}

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority }) => {
  const getConfig = () => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Urgent',
          color: '#DC2626',
          bg: '#FEF2F2',
          icon: <AlertCircle size={13} className="me-1" />
        };
      case 'high':
        return {
          label: 'High',
          color: '#D97706',
          bg: '#FFFBEB',
          icon: <ArrowUp size={13} className="me-1" />
        };
      case 'medium':
        return {
          label: 'Medium',
          color: '#2563EB',
          bg: '#EFF6FF',
          icon: <Minus size={13} className="me-1" />
        };
      case 'low':
      default:
        return {
          label: 'Low',
          color: '#64748B',
          bg: '#F8FAFC',
          icon: <ArrowDown size={13} className="me-1" />
        };
    }
  };

  const cfg = getConfig();

  return (
    <span
      className="d-inline-flex align-items-center px-2 py-0.5 rounded fw-medium"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: '0.72rem',
        border: `1px solid ${cfg.color}30`
      }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

