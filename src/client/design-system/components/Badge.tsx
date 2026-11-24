import React from 'react';
import { colors } from '../tokens/colors.js';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'slate';
  size?: 'sm' | 'md';
  pill?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  pill = true,
  className = ''
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary[50], color: colors.primary[700], border: colors.primary[200] };
      case 'secondary':
        return { bg: colors.secondary[50], color: colors.secondary[700], border: colors.secondary[200] };
      case 'success':
        return { bg: colors.success[50], color: colors.success[700], border: colors.success[200] };
      case 'warning':
        return { bg: colors.warning[50], color: colors.warning[700], border: colors.warning[200] };
      case 'danger':
        return { bg: colors.danger[50], color: colors.danger[700], border: colors.danger[200] };
      case 'slate':
      default:
        return { bg: colors.slate[100], color: colors.slate[700], border: colors.slate[200] };
    }
  };

  const style = getStyles();

  return (
    <span
      className={`d-inline-flex align-items-center fw-semibold ${pill ? 'rounded-pill' : 'rounded-2'} ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '0.7rem' : '0.78rem',
        letterSpacing: '0.01em'
      }}
    >
      {children}
    </span>
  );
};

