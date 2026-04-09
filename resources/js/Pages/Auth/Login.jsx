import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import arsasoft_logo from '@/arsasoft.png';

export default function Login({ status, canResetPassword, version }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const submit = (e) => {
    e.preventDefault();
    post(route('login'), { onFinish: () => reset('password') });
  };

  return (
    <GuestLayout>
      <Head title="Log in" />

      {status && (
        <Typography
          variant="body2"
          sx={{ mb: 2, color: 'success.main', fontWeight: 500 }}
        >
          {status}
        </Typography>
      )}

      <Box
        component="form"
        onSubmit={submit}
        sx={{
          maxWidth: 400,
          mx: 'auto',
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src={arsasoft_logo}
            alt="arsasoft logo"
            style={{ height: '60px', objectFit: 'contain' }}
          />
        </Box>

        {/* Email */}
        <TextField
          label="Email or Username"
          id="email"
          name="email"
          type="text"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          fullWidth
          autoComplete="username"
          autoFocus
          error={!!errors.email}
          helperText={errors.email}
        />

        {/* Password with show/hide toggle */}
        <TextField
          label="Password"
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
          fullWidth
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={togglePasswordVisibility}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData('remember', e.target.checked)}
              color="primary"
            />
          }
          label={<Typography variant="body2">Remember me</Typography>}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          {canResetPassword && (
            <Link
              href={route('password.request')}
              style={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                color: '#555',
              }}
            >
              Forgot your password?
            </Link>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={processing}
          >
            Log in
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
