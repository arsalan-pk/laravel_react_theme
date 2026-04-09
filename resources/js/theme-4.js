// resources/js/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Enterprise Teal Theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0D9488', // Teal 600
            dark: '#0F766E', // Teal 700
            light: '#14B8A6', // Teal 500
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#134E4A', // Deep Teal 900
            contrastText: '#FFFFFF',
        },

        background: {
            default: '#F0FDFE', // Teal 50
            paper: '#FFFFFF',
        },

        text: {
            primary: '#0F172A', // Slate 900
            secondary: '#334155', // Slate 700
        },

        success: {
            main: '#0D9488',
        },

        error: {
            main: '#DC2626',
        },

        warning: {
            main: '#D97706',
        },

        info: {
            main: '#0284C7',
        },
    },

    typography: {
        fontFamily: [
            'Inter',
            'Roboto',
            'Helvetica',
            'Arial',
            'sans-serif'
        ].join(','),
        h1: { fontWeight: 600 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 }
    },

    shape: {
        borderRadius: 10,
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 10,
                    paddingLeft: '18px',
                    paddingRight: '18px',
                    '&.Mui-disabled': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        color: alpha(theme.palette.primary.contrastText || '#FFFFFF', 0.6),
                        boxShadow: 'none',
                    },
                }),
                containedPrimary: {
                    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                    color: '#FFFFFF',
                }
            }
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                }
            }
        },

        MuiTextField: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                }
            }
        },

        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: 16,
                    boxShadow: '0 24px 60px rgba(15,23,42,0.2)',
                    margin: theme.spacing(2),
                    marginTop: theme.spacing(4),
                    maxHeight: 'calc(100% - 64px)',
                    '&.app-modal-paper': {
                        borderRadius: 16,
                    },
                })
            }
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&.app-modal-title': {
                        padding: theme.spacing(2, 3),
                        marginBottom: theme.spacing(1.5),
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
                        color: theme.palette.primary.contrastText || '#FFF',
                        fontWeight: 600,
                        '&.modal-title--success': {
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`,
                            color: theme.palette.success.contrastText || '#FFF',
                        },
                        '&.modal-title--no-margin': {
                            marginBottom: 0,
                        },
                    },
                })
            }
        },

        MuiDataGrid: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid rgba(13,148,136,0.25)',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.875rem',
                },
                columnHeaders: {
                    backgroundColor: '#CCFBF1', // Teal 100
                    borderBottom: '1px solid rgba(13,148,136,0.3)',
                    fontWeight: 600,
                },
                cell: {
                    borderBottom: '1px solid #E2E8F0',
                },
                row: {
                    '&:nth-of-type(even)': {
                        backgroundColor: '#F0FDFE',
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(13,148,136,0.08)',
                    }
                }
            }
        }
    }
});

export default theme;