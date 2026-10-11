import * as React from 'react';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Checkbox,
    Typography,
    Alert,
} from '@mui/material';
import Swal from 'sweetalert2';

// Helper function to convert key to string
const keyToString = (key) => {
    return key.replace(/[_-]/g, ' ').toLowerCase();
};

// Helper function to get assigned permissions count for a group
const getAssignedPermissionsCount = (role, group, permissionGroups) => {
    if (!role || !role.permissions) return 0;
    const assignedPermissions = role.permissions.filter(p => p.group === group);
    const totalInGroup = permissionGroups[group]?.length || 0;
    return assignedPermissions.length;
};

export default function CreateRole({ permission_groups, role }) {
    const { errors } = usePage().props;
    const isEdit = !!role;

    const [formState, setFormState] = useState({
        name: '',
        permissions: [],
    });

    const [groupStates, setGroupStates] = useState({});

    useEffect(() => {
        if (role) {
            const rolePermissions = role.permissions?.map(p => p.id) || [];
            setFormState({
                name: role.name || '',
                permissions: rolePermissions,
            });

            // Initialize group states
            const groups = {};
            Object.keys(permission_groups).forEach(group => {
                const groupPermissions = permission_groups[group].map(p => p.id);
                const selectedInGroup = rolePermissions.filter(id => groupPermissions.includes(id));
                groups[group] = {
                    allSelected: selectedInGroup.length === groupPermissions.length && groupPermissions.length > 0,
                    selectedCount: selectedInGroup.length,
                };
            });
            setGroupStates(groups);
        } else {
            // Initialize group states for new role
            const groups = {};
            Object.keys(permission_groups).forEach(group => {
                groups[group] = {
                    allSelected: false,
                    selectedCount: 0,
                };
            });
            setGroupStates(groups);
        }
    }, [role, permission_groups]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePermissionChange = (permissionId, group) => {
        setFormState((prevState) => {
            const isSelected = prevState.permissions.includes(permissionId);
            const newPermissions = isSelected
                ? prevState.permissions.filter(id => id !== permissionId)
                : [...prevState.permissions, permissionId];

            // Update group state
            const groupPermissions = permission_groups[group].map(p => p.id);
            const selectedInGroup = newPermissions.filter(id => groupPermissions.includes(id));
            const allSelected = selectedInGroup.length === groupPermissions.length && groupPermissions.length > 0;

            setGroupStates((prevGroups) => ({
                ...prevGroups,
                [group]: {
                    allSelected,
                    selectedCount: selectedInGroup.length,
                },
            }));

            return {
                ...prevState,
                permissions: newPermissions,
            };
        });
    };

    const handleGroupAllChange = (group) => {
        const groupPermissions = permission_groups[group].map(p => p.id);
        const currentGroupState = groupStates[group];
        const shouldSelectAll = !currentGroupState.allSelected;

        setFormState((prevState) => {
            let newPermissions;
            if (shouldSelectAll) {
                // Add all group permissions
                newPermissions = [...new Set([...prevState.permissions, ...groupPermissions])];
            } else {
                // Remove all group permissions
                newPermissions = prevState.permissions.filter(id => !groupPermissions.includes(id));
            }

            setGroupStates((prevGroups) => ({
                ...prevGroups,
                [group]: {
                    allSelected: shouldSelectAll,
                    selectedCount: shouldSelectAll ? groupPermissions.length : 0,
                },
            }));

            return {
                ...prevState,
                permissions: newPermissions,
            };
        });
    };

    const handleAssignAllChange = () => {
        const allPermissionIds = Object.values(permission_groups)
            .flat()
            .map(p => p.id);
        const allSelected = formState.permissions.length === allPermissionIds.length && allPermissionIds.length > 0;

        if (allSelected) {
            // Deselect all
            setFormState((prevState) => ({
                ...prevState,
                permissions: [],
            }));

            // Update all group states
            const newGroupStates = {};
            Object.keys(permission_groups).forEach(group => {
                newGroupStates[group] = {
                    allSelected: false,
                    selectedCount: 0,
                };
            });
            setGroupStates(newGroupStates);
        } else {
            // Select all
            setFormState((prevState) => ({
                ...prevState,
                permissions: allPermissionIds,
            }));

            // Update all group states
            const newGroupStates = {};
            Object.keys(permission_groups).forEach(group => {
                const groupPermissions = permission_groups[group].map(p => p.id);
                newGroupStates[group] = {
                    allSelected: true,
                    selectedCount: groupPermissions.length,
                };
            });
            setGroupStates(newGroupStates);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const endpoint = isEdit ? `/user/role/${role.id}` : '/user/role';
        const method = isEdit ? 'put' : 'post';

        router[method](endpoint, formState, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: isEdit ? 'Role updated successfully!' : 'Role created successfully!',
                    icon: 'success',
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    toast: true,
                });
                router.visit('/user/role');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat().join(' | ');
                Swal.fire({
                    title: 'Error!',
                    text: errorMessages || 'An unexpected error occurred.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            },
        });
    };

    // Check if all permissions are selected
    const allPermissionIds = Object.values(permission_groups)
        .flat()
        .map(p => p.id);
    const allSelected = formState.permissions.length === allPermissionIds.length && allPermissionIds.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Role' : 'Create Role'} />
           
                <Card elevation={1} sx={{ p: 3 }}>
                    <CardHeader
                        title={isEdit ? 'Edit role and assign permission' : 'Create role and assign permission'}
                        subheader="Be careful when giving permissions, as it will allow access to those features."
                        subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        required
                                        id="role-name"
                                        name="name"
                                        label="Role Name"
                                        value={formState.name}
                                        onChange={handleChange}
                                        error={!!errors?.name}
                                        helperText={errors?.name}
                                        InputProps={{
                                            startAdornment: <i className="ri-key-2-line" style={{ marginRight: 8, color: '#666' }}></i>,
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 4, mb: 2 }}>
                                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                                    <Grid size={{ xs: 12, md: 9 }}>
                                        <Typography variant="h6" fontWeight="bold" textTransform="capitalize">
                                            Assign Permissions
                                        </Typography>
                                        {errors?.permissions && (
                                            <Alert severity="error" sx={{ mt: 1 }}>
                                                {errors.permissions}
                                            </Alert>
                                        )}
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={allSelected}
                                                    onChange={handleAssignAllChange}
                                                />
                                            }
                                            label="Assign all permissions"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Grid container spacing={2}>
                                {Object.keys(permission_groups).map((group, groupIndex) => {
                                    const groupPermissions = permission_groups[group];
                                    const groupState = groupStates[group] || { allSelected: false, selectedCount: 0 };
                                    const isEditMode = isEdit && role;
                                    const assignedCount = isEditMode
                                        ? getAssignedPermissionsCount(role, group, permission_groups)
                                        : groupState.selectedCount;
                                    const allInGroupSelected = isEditMode
                                        ? assignedCount === groupPermissions.length && groupPermissions.length > 0
                                        : groupState.allSelected;

                                    return (
                                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={group}>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    textTransform="capitalize"
                                                    sx={{ mb: 1 }}
                                                >
                                                    {keyToString(group)}
                                                </Typography>

                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={allInGroupSelected}
                                                            onChange={() => handleGroupAllChange(group)}
                                                        />
                                                    }
                                                    label="Select all"
                                                    sx={{ textTransform: 'capitalize', mb: 1 }}
                                                />

                                                {groupPermissions.map((permission) => {
                                                    const isChecked = formState.permissions.includes(permission.id);
                                                    return (
                                                        <FormControlLabel
                                                            key={permission.id}
                                                            control={
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onChange={() => handlePermissionChange(permission.id, group)}
                                                                    value={permission.id}
                                                                />
                                                            }
                                                            label={permission.title || permission.name}
                                                            sx={{ textTransform: 'capitalize', display: 'block' }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Button type="submit" variant="contained" color="primary">
                                    {isEdit ? 'Update' : 'Save'}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
           
        </AuthenticatedLayout>
    );
}

