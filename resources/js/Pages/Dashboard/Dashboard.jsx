import * as React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    Grid,
    Alert,
    Box,
    IconButton,
    Paper,
    Breadcrumbs,
    Typography,
    Stack,
    Chip,
    Button,
    Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import RefreshIcon from "@mui/icons-material/Refresh";
import Swal from "sweetalert2";
import BackupIcon from "@mui/icons-material/Backup";
import axios from "axios";
import numeral from "numeral";
import Summaries from "./Partials/Summaries";
import { SalesChart } from "./Partials/SalesChart";
import { OverViewCards } from "./Partials/OverViewCards";

export default function Dashboard({ version }) {
    const theme = useTheme();
    const auth = usePage().props.auth.user;
    const userPermissions = usePage().props.userPermissions || [];

    // Static values instead of dynamic data
    const totalSales = 250000.75;

    const handleClearCache = async () => {
        try {            
            // Show loading SweetAlert
            Swal.fire({
                title: 'Clearing All Caches...',
                text: 'Please wait while we clear Laravel and browser caches',
                icon: 'info',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const laravelResponse = await axios.get('/clear-cache');
            
            // Clear browser cache
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // Show success message
            Swal.fire({
                title: 'All Caches Cleared!',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Server:</strong> ${laravelResponse.data.message}</p>
                        <p><strong>Front:</strong> Browser cache cleared successfully</p>
                    </div>
                `,
                icon: 'success',
                timer: 4000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Cache clear error:', error);
            
            // Show error message
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || error.message || 'Failed to clear caches',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    
    const isAdmin =
        auth.user_role === "admin" || auth.user_role === "super-admin";

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <Box
                sx={{
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "background.default",
                    px: { xs: 1.5 },
                    pb: { xs: 4, md: 6 },
                    pt: { xs: 2, },
                }}
            >
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Typography color="text.secondary">Home</Typography>
                    <Typography color="text.primary" sx={{ fontWeight: 600 }}>
                        Dashboard
                    </Typography>
                </Breadcrumbs>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 3 },
                        mb: { xs: 2, md: 3 },
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                        background: `linear-gradient(135deg, ${alpha(
                            theme.palette.primary.main,
                            0.12
                        )}, ${alpha(theme.palette.primary.main, 0.03)})`,
                    }}
                >
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Welcome back, {auth.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Monitor sales performance, cash flow, and store
                                health at a glance.
                            </Typography>
                          
                        </Box>
                    </Stack>
                </Paper>

                {userPermissions.includes('view_dashboard_analytics') && (
                    <Grid
                        container
                        spacing={{ xs: 1, md: 1.5 }}
                        sx={{ mb: { xs: 1.5, md: 2 } }}
                    >
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Alert
                                    severity="info"
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow: "0 6px 20px rgba(14,165,233,0.15)",
                                        "& .MuiAlert-message": { fontWeight: 600 },
                                    }}
                                >
                                    <strong>3</strong> Pending 
                                </Alert>
                            </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow: "0 6px 20px rgba(239,68,68,0.15)",
                                        "& .MuiAlert-message": { fontWeight: 600 },
                                    }}
                                >
                                    <strong>2</strong> Alert 
                                </Alert>
                            </Grid>
                    </Grid>
                )}

                {userPermissions.includes('view_dashboard_analytics') && <OverViewCards />}

                <Grid
                    container
                    spacing={2.5}
                    sx={{ py: { xs: 2, md: 4 }, alignItems: "stretch" }}
                >
                    {userPermissions.includes('view_dashboard_analytics') && (
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                    p: { xs: 2, md: 3 },
                                }}
                            >
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Performance Summary
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'space-between',
                                            height: 150,
                                            gap: 1,
                                            px: 1,
                                        }}
                                    >
                                        {[
                                            { label: 'Jan', value: 60, color: alpha(theme.palette.primary.main, 0.3) },
                                            { label: 'Feb', value: 80, color: alpha(theme.palette.primary.main, 0.3) },
                                            { label: 'Mar', value: 45, color: alpha(theme.palette.primary.main, 0.3) },
                                            { label: 'Apr', value: 100, color: alpha(theme.palette.success.main, 0.5) },
                                            { label: 'May', value: 65, color: alpha(theme.palette.primary.main, 0.3) },
                                            { label: 'Jun', value: 85, color: alpha(theme.palette.primary.main, 0.3) },
                                        ].map((item) => (
                                            <Box
                                                key={item.label}
                                                sx={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: item.value,
                                                        backgroundColor: item.color,
                                                        borderRadius: '4px 4px 0 0',
                                                        transition: 'height 0.3s ease',
                                                        '&:hover': {
                                                            opacity: 0.8,
                                                        },
                                                    }}
                                                />
                                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                    {item.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mt: 2,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Total Sales
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                                {numeral(totalSales).format("0,0.00")}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Growth
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                                +12.5%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    )}
                    {userPermissions.includes('view_dashboard_analytics') && (
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                    p: { xs: 2, md: 3 },
                                }}
                            >
                                <SalesChart />

                            </Paper>
                        </Grid>
                    )}
                    {userPermissions.includes('view_dashboard_summary') && <Summaries />}
                </Grid>
            </Box>

            {userPermissions.includes('access_admin_tools') && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.92),
                        backdropFilter: 'blur(8px)',
                        boxShadow: theme.shadows[4],
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                    }}
                >
                    <Tooltip title="Refresh cache" placement="top">
                        <IconButton
                            size="small"
                            onClick={handleClearCache}
                            sx={{
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                },
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Backups" placement="top">
                        <IconButton
                            size="small"
                            component="a"
                            href="/backups"
                            target="_blank"
                            sx={{
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                },
                            }}
                        >
                            <BackupIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

        </AuthenticatedLayout>
    );
}
