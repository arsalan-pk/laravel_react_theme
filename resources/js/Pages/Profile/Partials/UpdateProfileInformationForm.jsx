import { useForm, usePage, router } from '@inertiajs/react';
import { TextField, Button, Box, Typography, Alert, InputAdornment, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import Swal from 'sweetalert2';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    // Swal.fire already shows success notification, no need for additional Alert

    const submit = (e) => {
        e.preventDefault();
        router.post('/profile', data, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Profile information updated successfully!',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false,
                });
            },
            onError: (errors) => {
                Swal.fire({
                    title: 'Error!',
                    text: errors ? Object.values(errors).flat().join(' | ') : 'An error occurred while updating your profile.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            },
        });
    };

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update your account's profile information and email address.
            </Typography>

            <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <PersonIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    autoComplete="name"
                />

                <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    autoComplete="username"
                />

                {mustVerifyEmail && user.email_verified_at === null && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            Your email address is unverified.{' '}
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => router.post('/email/verification-notification')}
                                sx={{ textTransform: 'none', p: 0, minWidth: 'auto', ml: 0.5 }}
                            >
                                Click here to re-send the verification email.
                            </Button>
                        </Typography>
                        {status === 'verification-link-sent' && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                                A new verification link has been sent to your email address.
                            </Typography>
                        )}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={processing}
                        sx={{ minWidth: 120 }}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
