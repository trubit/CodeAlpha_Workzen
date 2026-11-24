import React from 'react';
import { Card } from './Card.js';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { colors } from '../tokens/colors.js';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  iconBgColor = colors.primary[50],
  iconColor = colors.primary[600]
}) => {
  return (
    <Card variant="elevated" padding="md" hoverable>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-secondary small fw-semibold" style={{ fontSize: '0.8rem' }}>
          {label}
        </span>
        {icon && (
          <div
            className="rounded-3 d-flex align-items-center justify-content-center p-2"
            style={{ backgroundColor: iconBgColor, color: iconColor }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="h3 fw-bold text-dark m-0 tracking-tight" style={{ fontWeight: 800 }}>
        {value}
      </div>

      {change && (
        <div className="d-flex align-items-center small fw-medium mt-1.5" style={{ fontSize: '0.75rem' }}>
          {trend === 'up' && (
            <span className="text-success d-flex align-items-center me-1.5">
              <TrendingUp size={13} className="me-0.5" /> {change}
            </span>
          )}
          {trend === 'down' && (
            <span className="text-danger d-flex align-items-center me-1.5">
              <TrendingDown size={13} className="me-0.5" /> {change}
            </span>
          )}
          {trend === 'neutral' && <span className="text-muted me-1.5">{change}</span>}
          <span className="text-muted">vs last period</span>
        </div>
      )}
    </Card>
  );
};

