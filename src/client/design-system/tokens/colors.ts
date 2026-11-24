export const colors = {
  // Brand Primaries
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5', // Official Brand Primary
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B'
  },

  // Secondary Accents (Sky Blue)
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E'
  },

  // Neutral / Slate
  slate: {
    50: '#F8FAFC',  // Light Mode App Background
    100: '#F1F5F9', // Secondary Surfaces / Kanban Column
    200: '#E2E8F0', // Borders & Dividers
    300: '#CBD5E1', // Subdued Borders
    400: '#94A3B8', // Icons & Subtitles
    500: '#64748B', // Secondary Text
    600: '#475569', // Strong Secondary Text
    700: '#334155', // Muted Headings
    800: '#1E293B', // Dark Mode Surfaces
    900: '#0F172A', // Dark Mode Background & Primary Text
    950: '#020617'  // Deep Canvas
  },

  // Semantic Feedback
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    500: '#10B981',
    600: '#059669',
    700: '#047857'
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309'
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C'
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8'
  }
} as const;

export const themeTokens = {
  light: {
    background: colors.slate[50],
    surface: '#FFFFFF',
    surfaceSubtle: colors.slate[100],
    border: colors.slate[200],
    borderSubtle: colors.slate[100],
    textPrimary: colors.slate[900],
    textSecondary: colors.slate[500],
    textMuted: colors.slate[400],
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
    elevatedShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03)'
  },
  dark: {
    background: colors.slate[950],
    surface: colors.slate[900],
    surfaceSubtle: colors.slate[800],
    border: colors.slate[800],
    borderSubtle: colors.slate[700],
    textPrimary: '#F8FAFC',
    textSecondary: colors.slate[400],
    textMuted: colors.slate[500],
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
    elevatedShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
  }
};

