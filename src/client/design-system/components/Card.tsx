import React from 'react';
import { colors } from '../tokens/colors.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  className = '',
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return 12;
      case 'lg':
        return 24;
      case 'md':
      default:
        return 16;
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: '#FFFFFF',
          border: `1px solid ${colors.slate[200]}`,
          boxShadow: 'none'
        };
      case 'flat':
        return {
          backgroundColor: colors.slate[50],
          border: '1px solid transparent',
          boxShadow: 'none'
        };
      case 'elevated':
      default:
        return {
          backgroundColor: '#FFFFFF',
          border: `1px solid ${colors.slate[200]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'
        };
    }
  };

  return (
    <div
      className={`rounded-3 ${hoverable ? 'hover-shadow transition-all' : ''} ${className}`}
      style={{
        ...getVariantStyles(),
        padding: getPadding(),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

