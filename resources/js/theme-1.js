// resources/js/theme.js
import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10B981', // Emerald
      contrastText: '#fff',
    },
    secondary: {
      main: '#3B82F6', // Indigo
      contrastText: '#fff',
    },
    error: {
      main: '#EF4444', // Red
    },
    success: {
      main: '#10B981', // Emerald
      light: '#34D399',
      dark: '#059669',
      contrastText: '#fff',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#fff',
    },
    info: {
      main: '#3B82F6', // Blue
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#fff',
    },
    background: {
      default: '#F9FAFB', // App background
      paper: '#FFFFFF',   // Card / box backgrounds
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Noto Sans Arabic", sans-serif',
    fontSize: 14,
    h6: { fontWeight: 600 },
    body1: { fontWeight: 400 },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            color: alpha(theme.palette.primary.contrastText || '#FFFFFF', 0.6),
            boxShadow: 'none',
          },
        }),
        contained: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.success.dark} 100%)`,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark || theme.palette.success.dark} 0%, ${theme.palette.success.dark} 100%)`,
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
          },
        }),
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: '8px',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(15,23,42,0.25)',
          margin: theme.spacing(2),
          marginTop: theme.spacing(4),
          maxHeight: 'calc(100% - 64px)',
          '&.app-modal-paper': {
            borderRadius: 16,
          },
        }),
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.app-modal-title': {
            padding: theme.spacing(2, 3),
            marginBottom: theme.spacing(1.5),
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
            color: theme.palette.primary.contrastText || '#fff',
            fontWeight: 700,
            '&.modal-title--success': {
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`,
              color: theme.palette.success.contrastText || '#fff',
            },
            '&.modal-title--no-margin': {
              marginBottom: 0,
            },
          },
        }),
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '0.5px solid rgba(224, 224, 224, 0.5)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          fontSize: '0.875rem',
          color: '#1F2937',

          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #F1F3F5',
            padding: '8px 12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            '&:focus, &:focus-within': { outline: 'none' },
            '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.06)', cursor: 'pointer' },
          },

          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F3F4F6',
            borderBottom: '1px solid #E5E7EB',
            height: 56,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#111827',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.08)',
          },

          '& .MuiDataGrid-columnHeader': {
            paddingLeft: '12px',
            paddingRight: '12px',
            display: 'flex',
            alignItems: 'center',
            '&:hover': { backgroundColor: '#ECEFF1' },
            '&:focus, &:focus-within': { outline: 'none' },
          },

          '& .MuiDataGrid-sortIcon, & .MuiDataGrid-iconButtonContainer': {
            color: '#6B7280',
          },

          '& .MuiDataGrid-iconButtonContainer:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
            color: '#374151',
          },

          '& .MuiDataGrid-row': {
            transition: 'background-color 0.18s ease',
            '&:nth-of-type(even)': { backgroundColor: '#FAFAFA' },
            '&:hover': { backgroundColor: 'rgba(16,185,129,0.08)' },
            '&.Mui-selected': {
              backgroundColor: 'rgba(16,185,129,0.14) !important',
              '&:hover': { backgroundColor: 'rgba(16,185,129,0.20) !important' },
            },
          },

          '& .MuiDataGrid-cell:last-child': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },

          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E5E7EB',
            height: 52,
          },

          '& .MuiDataGrid-toolbarContainer': {
            padding: '10px 16px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
          },

          '& .MuiDataGrid-checkboxInput input': {
            borderRadius: '4px',
            width: '18px',
            height: '18px',
          },

          '& .MuiDataGrid-columnSeparator': {
            color: 'rgba(16,185,129,0.20)',
            opacity: 1,
          },

          '& .MuiDataGrid-columnHeaderTitle': {
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          // Mobile Responsive Styles
          '@media (max-width: 600px)': {
            fontSize: '0.75rem',
            '& .MuiDataGrid-columnHeaders': {
              height: 48,
              fontSize: '0.75rem',
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: '0.75rem',
                fontWeight: 600,
              },
            },
            '& .MuiDataGrid-cell': {
              padding: '6px 8px',
              fontSize: '0.75rem',
            },
            '& .MuiDataGrid-row': {
              minHeight: '48px !important',
            },
            '& .MuiDataGrid-footerContainer': {
              height: 48,
              '& .MuiTablePagination-root': {
                fontSize: '0.75rem',
              },
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: '8px 12px',
              flexDirection: 'column',
              gap: 1,
              '& .MuiDataGrid-toolbar': {
                width: '100%',
                '& > *': {
                  fontSize: '0.75rem',
                },
              },
            },
          },
        },
      },
    },

  },
});

export default theme;
