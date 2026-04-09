// resources/js/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Pakistan Government Official Theme (Dark Green & White)
const theme = createTheme({
    palette: {
        mode: 'light',

        // Primary: Pakistan Green
        primary: {
            main: '#00401A',   // Official Pakistan Green
            dark: '#002E12',   // Deep Forest Green
            light: '#00662A',  // Lighter Green for hover states
            contrastText: '#FFFFFF',
        },

        // Secondary: Neutral Slate / Charcoal for a professional look
        secondary: {
            main: '#334155',   // Slate 700
            dark: '#0F172A',   // Slate 900
            light: '#64748B',  // Slate 500
            contrastText: '#FFFFFF',
        },

        background: {
            default: '#F1F5F9',  // Very light gray (Slate 100) to make white cards pop
            paper: '#FFFFFF',    // Pure White
        },

        text: {
            primary: '#0F172A',   // Near Black for readability
            secondary: '#475569', // Muted Slate for labels
        },

        success: {
            main: '#10B981', // Emerald Green (distinct from Pakistan Green)
        },

        error: {
            main: '#E11D48', // Rose Red
        },

        warning: {
            main: '#F59E0B', // Amber
        },

        info: {
            main: '#00401A', // Re-using National Green for info
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
        h1: { fontWeight: 700, color: '#00401A' },
        h2: { fontWeight: 700, color: '#00401A' },
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
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    '&.Mui-disabled': {
                        backgroundColor: '#E2E8F0',
                        color: '#64748B',
                    },
                }),
                containedPrimary: {
                    // Sophisticated Green Gradient
                    background: 'linear-gradient(135deg, #00401A 0%, #002E12 100%)',
                    boxShadow: '0 4px 12px rgba(0, 64, 26, 0.2)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #005221 0%, #00401A 100%)',
                    }
                },
                outlinedPrimary: {
                    borderWidth: '1.5px',
                    borderColor: '#00401A',
                    color: '#00401A',
                    '&:hover': {
                        borderWidth: '1.5px',
                        backgroundColor: alpha('#00401A', 0.05),
                    }
                }
            }
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.02)',
                }
            }
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&.app-modal-title': {
                        background: `linear-gradient(135deg, #00401A 0%, #002E12 100%)`,
                        color: '#FFFFFF',
                        fontWeight: 700,
                    },
                })
            }
        },

        MuiDataGrid: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                },
                columnHeaders: {
                    backgroundColor: '#F8FAFC', 
                    borderBottom: '2px solid #00401A', // National Green accent line
                    color: '#00401A',
                    fontWeight: 800,
                },
                row: {
                    '&:nth-of-type(even)': {
                        backgroundColor: '#F9FCFA', // Very subtle green tint for zebra stripes
                    },
                    '&:hover': {
                        backgroundColor: alpha('#00401A', 0.04),
                    }
                }
            }
        }
    }
});

export default theme;