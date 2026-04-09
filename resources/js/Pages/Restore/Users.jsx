import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Tooltip,
    TablePagination,
    Breadcrumbs
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonIcon from '@mui/icons-material/Person';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { format } from 'date-fns';
import { Link } from '@inertiajs/react';

export default function RestoreUsers({ users, pageLabel }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [restoreDialog, setRestoreDialog] = useState(false);
    // Users cannot be permanently deleted, so no delete dialog needed
    const [loading, setLoading] = useState(false);
    const { userPermissions } = usePage().props;
    const permissions = userPermissions || [];

    const handleRestore = async () => {
        if (!selectedUser) return;
        
        setLoading(true);
        try {
            await router.post(`/restore/users/${selectedUser.id}`, {}, {
                onSuccess: (page) => {
                    console.log('Restore success:', page);
                    setRestoreDialog(false);
                    setSelectedUser(null);
                    setLoading(false);
                    // Small delay to ensure modal closes before reload
                    setTimeout(() => {
                        router.reload();
                    }, 100);
                },
                onError: (errors) => {
                    console.error('Restore failed:', errors);
                    setLoading(false);
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Users cannot be permanently deleted for security and audit reasons

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
                    <Link 
                        href="/restore" 
                        style={{ textDecoration: 'none', color: '#1976d2' }}
                    >
                        Recovery Center
                    </Link>
                    <Typography color="text.primary">Users</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PersonIcon sx={{ fontSize: 32, mr: 2, color: '#5d4037' }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        {pageLabel}
                    </Typography>
                </Box>

                {users.data.length === 0 ? (
                    <Alert severity="info">No deactivated users found. All users are currently active.</Alert>
                ) : (
                    <>
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            These users have been deactivated and can be reactivated.
                        </Alert>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Email</strong></TableCell>
                                        <TableCell><strong>Role</strong></TableCell>
                                        <TableCell><strong>Deactivated Date</strong></TableCell>
                                        <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {user.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={user.user_role?.toUpperCase() || 'N/A'} 
                                                    size="small" 
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(user.updated_at), 'MMM dd, yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <Tooltip title="Restore User">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setRestoreDialog(true);
                                                            }}
                                                            size="small"
                                                        >
                                                            <RestoreIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    
                                                    {/* Users cannot be permanently deleted for security and audit reasons */}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            component="div"
                            count={users.total}
                            page={users.current_page - 1}
                            onPageChange={(event, newPage) => {
                                router.get(`/restore/users?page=${newPage + 1}`);
                            }}
                            rowsPerPage={users.per_page}
                            rowsPerPageOptions={[]}
                        />
                    </>
                )}

                {/* Dialogs */}
                <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)}>
                    <DialogTitle>Reactivate User</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to reactivate "{selectedUser?.name}"?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRestoreDialog(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleRestore} variant="contained" disabled={loading} startIcon={<RestoreIcon />}>
                            {loading ? 'Reactivating...' : 'Reactivate'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Users cannot be permanently deleted for security and audit reasons */}
            </Box>
        </AuthenticatedLayout>
    );
}
