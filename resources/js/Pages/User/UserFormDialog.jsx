import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, TextField, MenuItem, Button, Box, Typography,
  IconButton, InputAdornment, CircularProgress, Divider,
  Avatar, Chip, useTheme, alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function UserFormDialog({ open, handleClose, user, roles = [] }) {
  const theme = useTheme();
  const isEditMode = Boolean(user);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
  const usernameCheckTimeoutRef = useRef(null);

  const getInitialFormData = () => ({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    user_name: user?.user_name || '',
    user_role: user?.user_role || (roles[0]?.name || 'user'),
  });

  const [formState, setFormState] = useState(getInitialFormData());

  useEffect(() => {
    if (open) {
      setFormState(getInitialFormData());
      setShowPassword(false);
      setUsernameStatus({ checking: false, available: null, message: '' });
      if (usernameCheckTimeoutRef.current) clearTimeout(usernameCheckTimeoutRef.current);
    }
  }, [open, user, roles]);

  const checkUsernameAvailability = (username, userId = null) => {
    if (!username || username.trim().length < 3) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }
    if (usernameCheckTimeoutRef.current) clearTimeout(usernameCheckTimeoutRef.current);
    setUsernameStatus({ checking: true, available: null, message: 'Checking...' });

    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.post('/api/check-username', {
          user_name: username.trim(),
          user_id: userId,
        }, {
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
          },
        });
        setUsernameStatus({
          checking: false,
          available: response.data.available,
          message: response.data.message,
        });
      } catch (error) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: error.response?.data?.message || 'Error checking username',
        });
      }
    }, 500);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (name === 'user_name') checkUsernameAvailability(value, user?.id);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const endpoint = user ? `/user/${user.id}` : '/user';
    router.post(endpoint, formState, {
      onSuccess: (resp) => {
        Swal.fire({
          title: 'Success!',
          text: resp?.props?.flash?.message || (user ? 'User updated!' : 'User created!'),
          icon: 'success',
          showConfirmButton: true,
        });
        handleClose();
      },
      onError: (errors) => {
        Swal.fire({
          title: 'Error!',
          text: errors ? Object.values(errors).flat().join(' | ') : 'An unexpected error occurred.',
          icon: 'error',
          showConfirmButton: true,
        });
      },
    });
  };

  const getUsernameHelperText = () => {
    if (usernameStatus.checking) return 'Checking availability...';
    if (usernameStatus.available === true) return 'Username is available';
    if (usernameStatus.available === false) return usernameStatus.message;
    if (formState.user_name && formState.user_name.length < 3) return 'Minimum 3 characters required';
    return '';
  };

  const getUsernameColor = () => {
    if (usernameStatus.available === true) return 'success';
    if (usernameStatus.available === false) return 'error';
    return 'primary';
  };

  const gradientBg = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`;

  const SectionLabel = ({ icon, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {React.cloneElement(icon, { sx: { fontSize: 16, color: theme.palette.primary.main } })}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.8 }}
      >
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
          },
        },
      }}
      maxWidth="sm"
      fullWidth
    >
      {/* Gradient Header */}
      <DialogTitle
        sx={{
          background: gradientBg,
          color: '#fff',
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 40, height: 40 }}>
            {isEditMode
              ? <EditNoteIcon sx={{ fontSize: 22, color: '#fff' }} />
              : <PersonAddAltIcon sx={{ fontSize: 22, color: '#fff' }} />}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {isEditMode ? 'Edit User' : 'Add New User'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {isEditMode ? `Editing: ${user?.user_name}` : 'Fill in the details below'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: '#fff',
            bgcolor: alpha('#fff', 0.12),
            '&:hover': { bgcolor: alpha('#fff', 0.22) },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        {/* Account Info Section */}
        <Box sx={{ mb: 2 }}>
          <SectionLabel icon={<PersonIcon />} label="Account Information" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="user_name"
                label="Username"
                variant="outlined"
                required
                size="small"
                value={formState.user_name}
                onChange={handleChange}
                color={getUsernameColor()}
                error={usernameStatus.available === false}
                helperText={getUsernameHelperText()}
                slotProps={{
                  formHelperText: {
                    sx: {
                      color: usernameStatus.available === true
                        ? theme.palette.success.main
                        : undefined,
                    },
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {usernameStatus.checking
                          ? <CircularProgress size={16} />
                          : usernameStatus.available === true
                            ? <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                            : usernameStatus.available === false
                              ? <ErrorIcon color="error" sx={{ fontSize: 18 }} />
                              : null}
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                variant="outlined"
                required
                size="small"
                value={formState.name}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Contact & Security Section */}
        <Box sx={{ mb: 2 }}>
          <SectionLabel icon={<LockIcon />} label="Contact & Security" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                variant="outlined"
                required
                size="small"
                value={formState.email}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="password"
                label={isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                required={!isEditMode}
                size="small"
                value={formState.password}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword
                            ? <VisibilityOffIcon sx={{ fontSize: 18 }} />
                            : <VisibilityIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Role Section */}
        <Box sx={{ mb: 1 }}>
          <SectionLabel icon={<AdminPanelSettingsIcon />} label="Role & Permissions" />
          <TextField
            fullWidth
            name="user_role"
            label="User Role"
            variant="outlined"
            required
            select
            size="small"
            value={formState.user_role}
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AdminPanelSettingsIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              },
            }}
          >
            {roles.map((role) => (
              <MenuItem key={role.name} value={role.name}>
                <Chip
                  label={role.name.toUpperCase()}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.grey[100], 0.5),
        }}
      >
        <Button onClick={handleClose} variant="outlined" size="medium" sx={{ minWidth: 100, borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="medium"
          sx={{
            minWidth: 130,
            borderRadius: 2,
            fontWeight: 700,
            background: gradientBg,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
            '&:hover': { boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.45)}` },
          }}
        >
          {isEditMode ? 'Save Changes' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
