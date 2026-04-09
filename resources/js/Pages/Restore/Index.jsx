import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Chip,
    Alert,
    AlertTitle,
    Breadcrumbs
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestoreIcon from '@mui/icons-material/Restore';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PurchaseIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';

export default function RestoreIndex({ deletedCounts, pageLabel }) {
    const { userPermissions } = usePage().props;
    const permissions = userPermissions || [];

    const restoreCards = [
                                                        {
            title: 'Users',
            count: deletedCounts.users,
            icon: <PersonIcon sx={{ fontSize: 40, color: '#5d4037' }} />,
            link: '/restore/users',
            permission: 'restore_users',
            description: 'Restore deleted user accounts and profiles'
        }
    ];

    const totalDeleted = Object.values(deletedCounts).reduce((sum, count) => sum + count, 0);

    return (
        <AuthenticatedLayout>
            <Head title={pageLabel} />

            <Box sx={{ p: 3 }}>
                {/* Breadcrumbs */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{ mb: 2 }}
                >
                    <Link
                        href="/dashboard"
                        style={{ textDecoration: 'none', color: '#1976d2' }}
                    >
                        Dashboard
                    </Link>
                    <Typography color="text.primary">Recovery Center</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <RestoreIcon sx={{ fontSize: 32, mr: 2, color: '#1976d2' }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        {pageLabel}
                    </Typography>
                </Box>

                {totalDeleted === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <AlertTitle>No Deleted Records</AlertTitle>
                        There are currently no deleted records that can be restored.
                    </Alert>
                ) : (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <AlertTitle>Deleted Records Found</AlertTitle>
                        There are {totalDeleted} deleted records across all categories that can be restored.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {restoreCards.map((card) => (
                        permissions.includes(card.permission) && (
                            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.title}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                                        <Box sx={{ mb: 2 }}>
                                            {card.icon}
                                        </Box>

                                        <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            {card.title}
                                        </Typography>

                                        <Chip
                                            label={`${card.count} deleted`}
                                            color={card.count > 0 ? 'warning' : 'success'}
                                            sx={{ mb: 2 }}
                                        />

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            {card.description}
                                        </Typography>

                                        <Button
                                            component={Link}
                                            href={card.link}
                                            variant="contained"
                                            startIcon={<RestoreIcon />}
                                            disabled={card.count === 0}
                                            fullWidth
                                            sx={{
                                                mt: 'auto',
                                                backgroundColor: card.count > 0 ? '#1976d2' : '#e0e0e0',
                                                '&:hover': {
                                                    backgroundColor: card.count > 0 ? '#1565c0' : '#e0e0e0'
                                                }
                                            }}
                                        >
                                            {card.count > 0 ? 'View & Restore' : 'No Records'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    ))}
                </Grid>

                {permissions.includes('permanent_delete') && totalDeleted > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Alert severity="error">
                            <AlertTitle>Permanent Deletion Warning</AlertTitle>
                            You have permission to permanently delete records. This action cannot be undone.
                            Use this feature with extreme caution.
                        </Alert>
                    </Box>
                )}
            </Box>
        </AuthenticatedLayout>
    );
}
