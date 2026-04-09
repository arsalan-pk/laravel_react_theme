// resources/js/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Ultra‑Professional Black & White + Navy Blue Theme
const theme = createTheme({
    palette: {
        mode: 'light',

        // Primary Navy Blue
        primary: {
            main: '#1E3A8A',   // Navy 800
            dark: '#172554',   // Navy 900
            light: '#3B82F6',  // Accent blue
            contrastText: '#FFFFFF',
        },

        // Black & White / Neutral system
        secondary: {
            main: '#0F172A',   // Near‑black slate
            dark: '#000000',
            light: '#334155',
            contrastText: '#FFFFFF',
        },

        background: {
            default: '#F8FAFC',  // Clean white/slate
            paper: '#FFFFFF',    // Card backgrounds
        },

        text: {
            primary: '#0F172A',   // Strong black‑slate
            secondary: '#475569', // Gray slate
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
            main: '#1E3A8A',
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
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },

    shape: {
        borderRadius: 5,
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 8,
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    '&.Mui-disabled': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        color: alpha(theme.palette.primary.contrastText || '#FFFFFF', 0.6),
                        boxShadow: 'none',
                    },
                }),
                containedPrimary: {
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
                    color: '#FFFFFF',
                },
                outlinedPrimary: {
                    borderWidth: '2px',
                    borderColor: '#1E3A8A',
                    color: '#1E3A8A',
                }
            }
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }
            }
        },

        MuiTextField: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    background: '#FFFFFF',
                }
            }
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
                        color: theme.palette.primary.contrastText || '#FFFFFF',
                        fontWeight: 700,
                        '&.modal-title--success': {
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`,
                            color: theme.palette.success.contrastText || '#FFFFFF',
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
                    border: 'none',
                    // border: '1px solid rgba(30,58,138,0.35)',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.875rem',
                },

                columnHeaders: {
                    backgroundColor: '#E2E8F0', // Slate 200
                    borderBottom: '1px solid rgba(30,58,138,0.45)',
                    fontWeight: 700,
                    color: '#0F172A',
                },

                cell: {
                    borderBottom: '1px solid #E5E7EB',
                },

                row: {
                    '&:nth-of-type(even)': {
                        backgroundColor: '#F8FAFC',
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(30,58,138,0.07)',
                    }
                }
            }
        }
    }
});

export default theme;
