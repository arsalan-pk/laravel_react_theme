// resources/js/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Enterprise-grade Indigo MUI theme for POS
const theme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main: '#3F51B5', // Indigo
            dark: '#2C3A8C',
            light: '#5C6BC0',
            contrastText: '#FFFFFF',
        },

        secondary: {
            main: '#546E7A', // Slate neutral
            dark: '#37474F',
            light: '#78909C',
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
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },

        background: {
            default: '#F4F6F8',
            paper: '#FFFFFF',
        },

        text: {
            primary: '#1A1A1A',
            secondary: '#4A4A4A',
        },
    },

    // spacing uses 8px grid by default
    spacing: 8,

    shape: {
        borderRadius: 6, // small radius for enterprise feel
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
        // Buttons: restrained, no gradients, subtle elevation
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
                    minHeight: 40,
                    '&.Mui-disabled': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        color: alpha(theme.palette.primary.contrastText || '#FFFFFF', 0.6),
                        boxShadow: 'none',
                    },
                }),
                containedPrimary: ({ theme }) => ({
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        boxShadow: '0 2px 6px rgba(16,24,40,0.06)',
                        transform: 'none',
                    },
                }),
                outlined: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius,
                    borderColor: theme.palette.grey[300],
                    '&:hover': { borderColor: theme.palette.grey[400], backgroundColor: theme.palette.grey[50] },
                }),
            },
        },

        // TextField / Input: clean, subtle borders
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                        borderColor: theme.palette.grey[300],
                    },
                    '&:hover fieldset': {
                        borderColor: theme.palette.grey[400],
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px rgba(63,81,181,0.06)`,
                    },
                }),
            },
        },

        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    width: '100%',
                }),
            },
        },

        // Dialogs: subtle, rounded, centered
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius + 4,
                    padding: theme.spacing(2),
                    boxShadow: '0 24px 60px rgba(16,24,40,0.15)',
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

        // AppBar: flat, no heavy shadows
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderBottom: `1px solid ${theme.palette.grey[200]}`,
                    height: 64,
                }),
            },
        },

        // Drawer (sidebar): neutral paper, no heavy shadows
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

        // DataGrid: professional, table-like
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
                        '&.Mui-selected': { backgroundColor: 'rgba(63,81,181,0.08) !important' },
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

                    '& .MuiCheckbox-root': {
                        color: theme.palette.grey[600],
                    },
                }),
            },
        },

        // Tooltip: subtle elevation and neutral background
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

        // Paper: subtle borders instead of heavy shadows
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.grey[100]}`,
                    boxShadow: 'none',
                }),
            },
        },

        // Divider: subtle line
        MuiDivider: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.grey[200],
                }),
            },
        },
    },
});

export default theme;
