import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { MenuItem, Button, Box, Typography, IconButton, useTheme, InputAdornment, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BadgeIcon from '@mui/icons-material/Badge';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
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
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    }
  }, [open, user, roles]);

  const checkUsernameAvailability = async (username, userId = null) => {
    if (!username || username.trim().length < 3) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    // Set checking state
    setUsernameStatus({ checking: true, available: null, message: 'Checking...' });

    // Debounce the API call
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.post('/api/check-username', {
          user_name: username.trim(),
          user_id: userId,
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
    }, 500); // 500ms debounce
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check username availability in real-time
    if (name === 'user_name') {
      checkUsernameAvailability(value, user?.id);
    }
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BadgeIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            {isEditMode ? 'Edit User' : 'Add New User'}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="user_name"
              label="Username"
              variant="outlined"
              required
              value={formState.user_name}
              onChange={handleChange}
              error={usernameStatus.available === false}
              helperText={
                usernameStatus.checking
                  ? 'Checking availability...'
                  : usernameStatus.available === true
                    ? 'Username is available'
                    : usernameStatus.available === false
                      ? usernameStatus.message
                      : formState.user_name && formState.user_name.length < 3
                        ? 'Username must be at least 3 characters'
                        : ''
              }
              InputProps={{
                endAdornment: usernameStatus.checking ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : usernameStatus.available === true ? (
                  <InputAdornment position="end">
                    <CheckCircleIcon color="success" fontSize="small" />
                  </InputAdornment>
                ) : usernameStatus.available === false ? (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" fontSize="small" />
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="name"
              label="Profile Name"
              variant="outlined"
              required
              value={formState.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              variant="outlined"
              required
              value={formState.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="password"
              label={user ? 'New Password (Optional)' : 'Password'}
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              required={!user}
              value={formState.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="user_role"
              label="User Role"
              variant="outlined"
              required
              select
              value={formState.user_role}
              onChange={handleChange}
            >
              {roles.map((role) => (
                <MenuItem key={role.name} value={role.name}>
                  {role.name.toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            minWidth: 120,
            fontWeight: 600,
          }}
        >
          {isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
