import { createTheme } from '@mui/material/styles';

export const workzenTheme = createTheme({
  palette: {
    primary: {
      main: '#6366F1', // Workzen Modern Indigo
      light: '#EEF2FF',
      dark: '#4338CA',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#0EA5E9', // Sky Blue
      light: '#E0F2FE',
      dark: '#0284C7',
      contrastText: '#FFFFFF'
    },
    success: {
      main: '#10B981', // Emerald
      light: '#ECFDF5',
      dark: '#059669'
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FFFBEB',
      dark: '#D97706'
    },
    error: {
      main: '#F43F5E', // Rose / Danger
      light: '#FFF1F2',
      dark: '#E11D48'
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B'
    },
    divider: '#E2E8F0'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em'
    }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 18px',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12
        }
      }
    }
  }
});
