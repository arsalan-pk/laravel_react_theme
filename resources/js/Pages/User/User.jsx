import * as React from 'react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Grid from '@mui/material/Grid';
import { Button, Box, IconButton, Card, CardContent, Chip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import FormDialog from './UserFormDialog';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import axios from 'axios';


const columns = (handleAction) => [
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
    headerName: 'Profile Name',
    minWidth: 190,
    renderCell: (params) => (
      <Box
        onClick={() => handleAction(params.row, 'edit')}
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
        <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {params.value}
        </Box>
      </Box>
    ),
  },
  {
    field: 'user_name',
    headerName: 'Username',
    width: 150,
    renderCell: (params) => (
      <Box sx={{ fontWeight: 'medium' }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: 'user_role',
    headerName: 'Role',
    width: 130,
    renderCell: (params) => (
      <Chip
        label={params.value?.toUpperCase() || 'N/A'}
        size="small"
        color="primary"
        variant="outlined"
        sx={{ fontWeight: 'medium' }}
      />
    ),
  },
  {
    field: 'email',
    headerName: 'Email',
    minWidth: 250,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Box sx={{ fontSize: '0.875rem' }}>
          {params.value}
        </Box>
      </Box>
    ),
  },
  {
    field: 'created_at',
    headerName: 'Created At',
    minWidth: 250,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        {dayjs(params.value).format('YYYY-MM-DD hh:mm A')}
      </Box>
    ),
  },
  {
    field: "action",
    headerName: "Actions",
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      return params;
    },
  }
];

export default function User({ users, roles }) {
  const auth = usePage().props.auth.user
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleClickOpen = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleAction = (user, action) => {
    if (action === "edit") {
      setSelectedUser(user); // Set selected user for editing
      setOpen(true);
    }
    else if (action === "deactivate") {
      console.log(user.id);
      Swal.fire({
        title: 'Are you sure?',
        text: `You won't be able to revert this action!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, deactivate!'
      }).then((result) => {
        if (result.isConfirmed) {
          axios.post(`/users/${user.id}/deactivate`)
            .then((response) => {
              Swal.fire(
                'Deactivated!',
                `User ${user.name} has been deactivated.`,
                'success'
              );
              router.reload();
            })
            .catch((error) => {
              Swal.fire(
                'Failed',
                error.response.data.message,
                'error'
              );
            });
        }
      });
    }
  }

  const handleClose = () => {
    setSelectedUser(null);
    setOpen(false);
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
      handleAction(selectedRow, action);
    }
    handleMenuClose();
  };


  return (
    <AuthenticatedLayout>
      <Head title="Users" />

      <Card elevation={2}>
        <CardContent>
          <Grid container spacing={2} alignItems='center' sx={{ mb: 3 }}>
            <Grid size={12} container justifyContent='space-between' alignItems='center'>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BadgeIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'text.primary' }}>
                    Users Management
                  </Box>
                </Box>
                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', ml: 4 }}>
                  Manage system users and their access permissions
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                size="large"
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                Add User
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
              rows={users}
              columns={columns(handleAction).map((col) => {
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
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('deactivate')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>
      </Menu>

      <FormDialog open={open} handleClose={handleClose} user={selectedUser} roles={roles} />
    </AuthenticatedLayout>
  );
}