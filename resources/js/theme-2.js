// resources/js/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Enterprise-grade Slate Gray MUI theme for POS
const theme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main: '#475569', // Slate Gray
            dark: '#37474F',
            light: '#64748B',
            contrastText: '#FFFFFF',
        },

        secondary: {
            main: '#1E293B', // Deep slate
            dark: '#0F172A',
            light: '#334155',
            contrastText: '#FFFFFF',
        },

        success: {
            main: '#2E7D32',
            contrastText: '#FFFFFF',
        },

        error: {
            main: '#D32F2F',
            contrastText: '#FFFFFF',
        },

        warning: {
            main: '#ED6C02',
            contrastText: '#FFFFFF',
        },

        info: {
            main: '#0288D1',
            contrastText: '#FFFFFF',
        },

        grey: {
            50: '#FAFAFA',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
        },

        background: {
            default: '#F1F5F9',
            paper: '#FFFFFF',
        },

        text: {
            primary: '#0F172A',
            secondary: '#475569',
        },
    },

    spacing: 8,

    shape: {
        borderRadius: 6,
    },

    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        fontSize: 14,
        h1: { fontWeight: 600 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        body1: { fontWeight: 400, lineHeight: 1.5 },
        body2: { fontWeight: 400, lineHeight: 1.4 },
        button: { textTransform: 'none', fontWeight: 600 },
    },

    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
                    minHeight: 40,
                    fontWeight: 600,
                    '&.Mui-disabled': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        color: alpha(theme.palette.primary.contrastText || '#FFFFFF', 0.6),
                        boxShadow: 'none',
                    },
                }),
                containedPrimary: ({ theme }) => ({
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    boxShadow: '0 1px 2px rgba(2,6,23,0.04)',
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        boxShadow: '0 2px 6px rgba(2,6,23,0.06)',
                    },
                }),
                outlinedPrimary: ({ theme }) => ({
                    borderColor: theme.palette.grey[300],
                    '&:hover': { backgroundColor: theme.palette.grey[50] },
                }),
                text: ({ theme }) => ({
                    padding: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`,
                }),
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': { borderColor: theme.palette.grey[300] },
                    '&:hover fieldset': { borderColor: theme.palette.grey[400] },
                    '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px rgba(71,85,105,0.06)`,
                    },
                }),
            },
        },

        MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small' },
            styleOverrides: {
                root: ({ theme }) => ({ width: '100%' }),
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius + 4,
                    padding: theme.spacing(2),
                    boxShadow: '0 24px 60px rgba(2,6,23,0.15)',
                    minWidth: 360,
                    margin: theme.spacing(2),
                    marginTop: theme.spacing(4),
                    maxHeight: 'calc(100% - 64px)',
                    '&.app-modal-paper': {
                        borderRadius: theme.shape.borderRadius + 4,
                    },
                }),
            },
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: ({ theme }) => ({
                    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
                    '& .MuiTypography-root': { fontWeight: 600 },
                    '&.app-modal-title': {
                        marginBottom: theme.spacing(1.5),
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
                        color: theme.palette.primary.contrastText || theme.palette.common.white,
                        '&.modal-title--success': {
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`,
                            color: theme.palette.success.contrastText || theme.palette.common.white,
                        },
                        '&.modal-title--no-margin': {
                            marginBottom: 0,
                        },
                    },
                }),
            },
        },

        MuiAppBar: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderBottom: `1px solid ${theme.palette.grey[200]}`,
                    height: 64,
                }),
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.grey[200]}`,
                    width: 260,
                    paddingTop: theme.spacing(2),
                }),
            },
        },

        MuiDataGrid: {
            styleOverrides: {
                root: ({ theme }) => ({
                    border: `1px solid ${theme.palette.grey[200]}`,
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',

                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: theme.palette.grey[100],
                        borderBottom: `1px solid ${theme.palette.grey[200]}`,
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        height: 56,
                    },

                    '& .MuiDataGrid-columnSeparator': { display: 'none' },

                    '& .MuiDataGrid-cell': {
                        borderBottom: `1px solid ${theme.palette.grey[100]}`,
                        padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },

                    '& .MuiDataGrid-row': {
                        '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] },
                        '&:hover': { backgroundColor: theme.palette.grey[100] },
                        '&.Mui-selected': { backgroundColor: 'rgba(71,85,105,0.08) !important' },
                    },

                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: theme.palette.background.paper,
                        borderTop: `1px solid ${theme.palette.grey[200]}`,
                        height: 56,
                    },

                    '& .MuiDataGrid-toolbarContainer': {
                        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
                        backgroundColor: theme.palette.background.paper,
                    },

                    '& .MuiCheckbox-root': { color: theme.palette.grey[600] },
                }),
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }) => ({
                    backgroundColor: theme.palette.grey[800],
                    color: '#fff',
                    fontSize: '0.8125rem',
                    borderRadius: theme.shape.borderRadius,
                }),
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.grey[100]}`,
                    boxShadow: 'none',
                }),
            },
        },

        MuiDivider: {
            styleOverrides: {
                root: ({ theme }) => ({ backgroundColor: theme.palette.grey[200] }),
            },
        },
    },
});

export default theme;
