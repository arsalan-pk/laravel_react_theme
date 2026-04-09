import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Tab,
    Tabs,
    Typography,
    Alert,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import ShopSettings from './Partials/ShopSettings';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{
                p: 4,
                backgroundColor: 'background.default',
                minHeight: '500px',
            }}
        >
            {children}
        </div>
    );
}

export default function Setting({ settings }) {
    const [settingFormData, setSettingFormData] = useState(() => {
        let currencySettings = {
            currency_symbol: 'Rs.',
            currency_code: 'LKR',
            symbol_position: 'before',
            decimal_separator: '.',
            thousands_separator: ',',
            decimal_places: '2',
            negative_format: 'minus',
            show_currency_code: 'no',
        };

        if (settings.currency_settings) {
            try {
                const parsed = JSON.parse(settings.currency_settings);
                currencySettings = { ...currencySettings, ...parsed };
            } catch (error) {
                console.error("Failed to parse currency settings:", error);
            }
        }

        return {
            site_logo: settings.site_logo,
            favicon: settings.favicon,
            site_name: settings.site_name,
            site_address: settings.site_address,
            site_phone: settings.site_contact,
            site_email: settings.site_email,
            site_website: settings.site_website,
            ...currencySettings,
        };
    });

    
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettingFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'on' : 'off') : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const { name } = e.target;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettingFormData((prev) => ({
                    ...prev,
                    [name]: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const submittedFormData = new FormData(event.currentTarget);

        axios
            .post('/settings-update', submittedFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(() => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Successfully saved',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                }).then(() => {
                    // Reload the page to update shop_name in AppBar
                    router.reload();
                });
            })
            .catch((error) => {
                console.error('Submission failed with errors:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to save settings. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            });
    };

    const [tabValue, setTabValue] = useState('shop');

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <Box sx={{ py: 3 }}>
                <Card elevation={2}>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ p: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <SettingsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'text.primary' }}>
                                    Site Settings
                                </Box>
                            </Box>
                            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', ml: 4 }}>
                                Configure site information and basic settings
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                backgroundColor: 'background.paper',
                            }}
                        >
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        minHeight: 48,
                                        '&.Mui-selected': {
                                            color: 'primary.main',
                                            fontWeight: 600,
                                        },
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: 'primary.main',
                                        height: 3,
                                    },
                                }}
                            >
                                <Tab label="Site" value="shop" />
                                <Tab label="Dashboard" value="dashboard" />
                            </Tabs>
                        </Box>

                        <TabPanel value={tabValue} index="shop">
                            <ShopSettings
                                settingFormData={settingFormData}
                                handleChange={handleChange}
                                handleFileChange={handleFileChange}
                                handleSubmit={handleSubmit}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index="dashboard">
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Dashboard Settings
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Configure dashboard preferences and display options.
                            </Typography>
                            <Alert severity="info">
                                Dashboard settings coming soon! This section will allow you to customize your dashboard experience.
                            </Alert>
                        </TabPanel>
                    </CardContent>
                </Card>
            </Box>
        </AuthenticatedLayout>
    );
}
