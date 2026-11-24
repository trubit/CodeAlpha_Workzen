import React from 'react';
import { TaskPriority } from '../../../shared/constants/status.js';
import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getMeta = () => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Urgent',
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FECACA',
          icon: <AlertCircle size={size === 'sm' ? 11 : 13} className="me-1" />
        };
      case 'high':
        return {
          label: 'High Priority',
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FDE68A',
          icon: <ArrowUp size={size === 'sm' ? 11 : 13} className="me-1" />
        };
      case 'medium':
        return {
          label: 'Medium',
          bg: '#EFF6FF',
          text: '#2563EB',
          border: '#BFDBFE',
          icon: <Minus size={size === 'sm' ? 11 : 13} className="me-1" />
        };
      case 'low':
      default:
        return {
          label: 'Low Priority',
          bg: '#ECFDF5',
          text: '#059669',
          border: '#A7F3D0',
          icon: <ArrowDown size={size === 'sm' ? 11 : 13} className="me-1" />
        };
    }
  };

  const meta = getMeta();

  return (
    <span
      className="d-inline-flex align-items-center fw-semibold rounded-pill"
      style={{
        backgroundColor: meta.bg,
        color: meta.text,
        border: `1px solid ${meta.border}`,
        padding: size === 'sm' ? '1.5px 6px' : '3px 10px',
        fontSize: size === 'sm' ? '0.68rem' : '0.74rem'
      }}
    >
      {meta.icon}
      <span>{meta.label}</span>
    </span>
  );
};

