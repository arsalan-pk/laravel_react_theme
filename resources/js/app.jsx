import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { PurchaseProvider } from './Context/PurchaseContext';
import { SharedProvider } from './Context/SharedContext';
import { useCurrencyStore } from './stores/currencyStore';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import theme from './theme-6';

const muiCache = createCache({ key: 'mui', prepend: true });

// Suppress known MUI dev-only warnings that are not actionable
if (import.meta.env.DEV) {
    const originalError = console.error.bind(console);
    console.error = (...args) => {
        const msg = typeof args[0] === 'string' ? args[0] : '';
        if (msg.includes(':first-child') || msg.includes('pseudo class')) return;
        originalError(...args);
    };
}

const appName = import.meta.env.VITE_APP_NAME || 'ARSASOFT';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    progress: {
        color: theme.palette.primary.dark,
        showSpinner: false,
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize currency store from Inertia props
        let currencySettingsFromServer = props.initialPage?.props?.settings?.currency_settings || {};

        if (typeof currencySettingsFromServer === 'string') {
            try {
                currencySettingsFromServer = JSON.parse(currencySettingsFromServer);
            } catch (e) {
                console.error('Failed to parse currency settings:', e);
                currencySettingsFromServer = {};
            }
        }

        useCurrencyStore.setState({
            settings: {
                currency_symbol: 'Rs.',
                currency_code: 'PKR',
                symbol_position: 'before',
                decimal_separator: '.',
                thousands_separator: ',',
                decimal_places: '2',
                negative_format: 'minus',
                show_currency_code: 'no',
                ...currencySettingsFromServer,
            },
        });

        // Auto-reload on CSRF token mismatch (419) — happens after logout
        // This gives the browser a fresh token instead of showing "Page Expired"
        router.on('invalid', (e) => {
            if (e.detail?.response?.status === 419) {
                e.preventDefault();
                window.location.reload();
            }
        });

        root.render(
            <CacheProvider value={muiCache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles
                    styles={(theme) => ({
                        '*::-webkit-scrollbar': {
                            width: 8,
                            height: 8,
                        },
                        '*::-webkit-scrollbar-track': {
                            background: theme.palette.background.default,
                        },
                        '*::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 10,
                        },
                        '*::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                        '*': {
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.default}`,
                        },
                    })}
                />
                <PurchaseProvider>
                    <SharedProvider>
                        <App {...props} />
                    </SharedProvider>
                </PurchaseProvider>
            </ThemeProvider>
            </CacheProvider>
        );
    },
});
