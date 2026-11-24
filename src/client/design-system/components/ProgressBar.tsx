import React from 'react';
import { colors } from '../tokens/colors.js';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 8,
  color = colors.primary[600],
  showLabel = false,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-100 ${className}`}>
      <div
        className="w-100 rounded-pill overflow-hidden"
        style={{
          height,
          backgroundColor: colors.slate[100],
          border: `1px solid ${colors.slate[200]}`
        }}
      >
        <div
          className="h-100 rounded-pill transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.4s ease'
          }}
        />
      </div>
      {showLabel && (
        <div className="d-flex justify-content-between align-items-center mt-1 text-muted small" style={{ fontSize: '0.72rem' }}>
          <span>Progress</span>
          <span className="fw-semibold text-dark">{percentage}%</span>
        </div>
      )}
    </div>
  );
};

export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 64,
  strokeWidth = 6,
  color = colors.primary[600],
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-9deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.slate[200]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="position-absolute text-center">
        <span className="fw-bold text-dark" style={{ fontSize: size * 0.28 }}>
          {clampedValue}%
        </span>
        {label && <div className="text-muted" style={{ fontSize: size * 0.16 }}>{label}</div>}
      </div>
    </div>
  );
};

