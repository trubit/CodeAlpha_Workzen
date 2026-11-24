import React, { useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { colors } from '../tokens/colors.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isPassword?: boolean;
  isSearch?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  isPassword = false,
  isSearch = false,
  type = 'text',
  className = '',
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-100 mb-2">
      {label && (
        <label className="form-label fw-semibold text-secondary small mb-1" style={{ fontSize: '0.8rem' }}>
          {label}
        </label>
      )}

      <div className="input-group">
        {(startIcon || isSearch) && (
          <span className="input-group-text bg-white border-end-0 text-muted ps-3">
            {isSearch ? <Search size={15} /> : startIcon}
          </span>
        )}

        <input
          type={resolvedType}
          disabled={disabled}
          className={`form-control ${startIcon || isSearch ? 'border-start-0' : ''} ${
            isPassword || endIcon ? 'border-end-0' : ''
          } ${error ? 'is-invalid border-danger' : ''} ${className}`}
          style={{
            fontSize: '0.875rem',
            padding: '8px 12px',
            borderColor: error ? colors.danger[500] : colors.slate[200],
            backgroundColor: disabled ? colors.slate[100] : '#FFFFFF',
            boxShadow: 'none'
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="input-group-text bg-white border-start-0 text-muted pe-3"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            style={{ cursor: 'pointer' }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {!isPassword && endIcon && (
          <span className="input-group-text bg-white border-start-0 text-muted pe-3">
            {endIcon}
          </span>
        )}
      </div>

      {error && (
        <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>
          {error}
        </div>
      )}
      {!error && helperText && (
        <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
          {helperText}
        </div>
      )}
    </div>
  );
};

