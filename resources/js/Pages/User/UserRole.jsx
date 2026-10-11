import * as React from 'react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Grid from '@mui/material/Grid';
import { Button, Box, Card, CardContent, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import UserRoleDialog from './UserRoleDialog';
import PermissionsModal from './PermissionsModal';
import axios from 'axios';
import Swal from 'sweetalert2';

// Helper function to convert key to string (matches PHP keyToString)
const keyToString = (key) => {
  if (!key) return '';
  return key.replace(/[_-]/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const columns = (handleEdit, handleViewPermissions, handleMenuClick) => [
  {
    field: 'id',
    headerName: 'ID',
    width: 80,
    renderCell: (params) => (
      <Box sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
        #{params.value.toString().padStart(4, '0')}
      </Box>
    ),
  },
  {
    field: 'name',
    headerName: 'Role Name',
    width: 200,
    renderCell: (params) => (
      <Box
        onClick={() => handleEdit(params.row)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <ShieldIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {params.value?.toUpperCase() || 'N/A'}
        </Box>
      </Box>
    ),
  },
  {
    field: 'permissions_list',
    headerName: 'Permissions',
    width: 500,
    flex: 1,
    renderCell: (params) => {
      const permissionCount = params.row.permissions?.length || 0;
      const formattedPermissions = params.row.permissions
        ?.map(p => p.title || keyToString(p.name))
        .join(', ') || 'No permissions assigned';

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleViewPermissions(params.row);
          }}
        >
          <Chip
            icon={<SecurityIcon />}
            label={`${permissionCount} Permission${permissionCount !== 1 ? 's' : ''}`}
            size="small"
            color={permissionCount > 0 ? 'success' : 'default'}
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewPermissions(params.row);
            }}
          />
          <Box
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {formattedPermissions.length > 80 ? `${formattedPermissions.substring(0, 80)}...` : formattedPermissions}
          </Box>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewPermissions(params.row);
            }}
            variant="outlined"
            sx={{
              minWidth: 'auto',
              textTransform: 'none',
              fontSize: '0.75rem',
              px: 1,
            }}
          >
            View
          </Button>
        </Box>
      );
    },
  },
  {
    field: 'action',
    headerName: 'Actions',
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      return params;
    },
  },
];

export default function UserRole({ roles, permissions, permission_groups }) {
  const auth = usePage().props.auth.user
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleClickOpen = () => {
    setSelectedRole(null);
    setOpen(true);
  };

  const handleEdit = (role) => {
    router.visit(`/user/role/${role.id}/edit`);
  };

  const handleViewPermissions = (role) => {
    setSelectedRoleForPermissions(role);
    setPermissionsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedRole(null);
    setOpen(false);
  };

  const handlePermissionsModalClose = () => {
    setPermissionsModalOpen(false);
    setSelectedRoleForPermissions(null);
  };

  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleMenuAction = (action) => {
    if (selectedRow) {
      if (action === 'edit') {
        handleEdit(selectedRow);
      } else if (action === 'delete') {
        handleDelete(selectedRow);
      }
    }
    handleMenuClose();
  };

  const handleDelete = (role) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the role "${role.name.toUpperCase()}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`/user/role/${role.id}`)
          .then((response) => {
            if (response.data.success) {
              Swal.fire({
                title: 'Deleted!',
                text: response.data.message || 'Role deleted successfully!',
                icon: 'success',
                confirmButtonColor: '#10B981',
              }).then(() => {
                router.reload({ only: ['roles'] });
              });
            } else {
              Swal.fire({
                title: 'Error!',
                text: response.data.message || 'Failed to delete role.',
                icon: 'error',
                confirmButtonColor: '#EF4444',
              });
            }
          })
          .catch((error) => {
            const errorMessage =
              error.response?.data?.message ||
              error.response?.data?.error ||
              'An error occurred while deleting the role.';

            Swal.fire({
              title: 'Error!',
              text: errorMessage,
              icon: 'error',
              confirmButtonColor: '#EF4444',
            });
          });
      }
    });
  };


  return (
    <AuthenticatedLayout>
      <Head title="User Roles" />

      <Card elevation={2}>
        <CardContent>
          <Grid container spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
            <Grid size={12} container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SecurityIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'text.primary' }}>
                    User Roles & Permissions
                  </Box>
                </Box>
                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', ml: 4 }}>
                  Manage roles and assign permissions to control user access
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.visit('/user/role/create')}
                size="large"
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                Add Role
              </Button>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              height: 'calc(100vh - 280px)',
              minHeight: 500,
            }}
          >
            <DataGrid
              rows={roles}
              columns={columns(handleEdit, handleViewPermissions, handleMenuClick).map((col) => {
                if (col.field === 'action') {
                  return {
                    ...col,
                    renderCell: (params) => (
                      <IconButton
                        onClick={(e) => handleMenuClick(e, params.row)}
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    ),
                  };
                }
                return col;
              })}
              getRowId={(row) => row.id}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>


      <UserRoleDialog open={open} handleClose={handleClose} user_role={selectedRole} permissions={permissions} />

      <PermissionsModal
        open={permissionsModalOpen}
        onClose={handlePermissionsModalClose}
        role={selectedRoleForPermissions}
        permissionGroups={permission_groups}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Role</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Role</ListItemText>
        </MenuItem>
      </Menu>
    </AuthenticatedLayout>
  );
}