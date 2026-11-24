import React from 'react';
import { colors } from '../tokens/colors.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[600],
          color: '#FFFFFF',
          border: '1px solid transparent',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        };
      case 'secondary':
        return {
          backgroundColor: colors.slate[100],
          color: colors.slate[800],
          border: `1px solid ${colors.slate[200]}`
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary[600],
          border: `1px solid ${colors.primary[300]}`
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.slate[600],
          border: '1px solid transparent'
        };
      case 'danger':
        return {
          backgroundColor: colors.danger[600],
          color: '#FFFFFF',
          border: '1px solid transparent'
        };
      case 'tertiary':
      default:
        return {
          backgroundColor: colors.primary[50],
          color: colors.primary[700],
          border: `1px solid ${colors.primary[200]}`
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '5px 10px', fontSize: '0.8rem', borderRadius: '6px' };
      case 'lg':
        return { padding: '12px 22px', fontSize: '1rem', borderRadius: '10px' };
      case 'md':
      default:
        return { padding: '8px 16px', fontSize: '0.875rem', borderRadius: '8px' };
    }
  };

  return (
    <button
      disabled={disabled || loading}
      className={`d-inline-flex align-items-center justify-content-center fw-semibold transition-all ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
      {...props}
    >
      {loading && (
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
          style={{ width: '1em', height: '1em', borderWidth: '0.15em' }}
        />
      )}
      {!loading && icon && iconPosition === 'left' && <span className="me-1.5 d-inline-flex">{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="ms-1.5 d-inline-flex">{icon}</span>}
    </button>
  );
};

