import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Typography,
    IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme, alpha } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { useState } from "react";

export default function Edit({ mustVerifyEmail, status }) {
    const theme = useTheme();
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const initials = (user.name || "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";

    const emailVerified = Boolean(user.email_verified_at);
    const roleLabel = user.user_role || "Standard User";
    const profilePictureUrl = user.profile_picture_url || "";

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('profile_picture', selectedFile);

        router.post('/profile/upload-picture', formData, {
            onSuccess: () => {
                setUploadDialogOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
            },
            onError: (errors) => {
                console.error('Upload error:', errors);
            }
        });
    };

    const handleDeletePicture = () => {
        if (confirm('Are you sure you want to delete your profile picture?')) {
            router.delete('/profile/delete-picture', {
                onSuccess: () => {
                    // Page will reload with updated data
                }
            });
        }
    };

    const handleCloseDialog = () => {
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleClosePreviewDialog = () => {
        setPreviewDialogOpen(false);
    };

    const handleAvatarClick = () => {
        if (profilePictureUrl) {
            setPreviewDialogOpen(true);
        } else {
            setUploadDialogOpen(true);
        }
    };

    const summaryCards = [
        {
            title: "Account Email",
            value: user.email || "—",
            subtitle: emailVerified ? "Email verified" : "Verification pending",
            icon: <EmailIcon />,
            color: emailVerified
                ? theme.palette.success.main
                : theme.palette.warning.main,
        },
        {
            title: "Account Role",
            value: roleLabel,
            subtitle: "Primary permission",
            icon: <AdminPanelSettingsIcon />,
            color: theme.palette.info.main,
        },
        {
            title: "Member Since",
            value: user.created_at
                ? dayjs(user.created_at).format("MMM DD, YYYY")
                : "—",
            subtitle: "Account created",
            icon: <EventAvailableIcon />,
            color: theme.palette.primary.main,
        },
        {
            title: "Last Updated",
            value: user.updated_at
                ? dayjs(user.updated_at).format("MMM DD, YYYY")
                : "—",
            subtitle: "Profile changes",
            icon: <AccessTimeIcon />,
            color: theme.palette.text.primary,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <Box
                sx={{
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "background.default",
                    px: { xs: 1.5, md: 3 },
                    pb: { xs: 4, md: 6 },
                    pt: { xs: 2, md: 3 },
                }}
            >
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Typography
                        component="span"
                        color="text.secondary"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            "&:hover": { color: "primary.main" },
                        }}
                        onClick={() => router.visit("/dashboard")}
                    >
                        <HomeIcon sx={{ fontSize: 18 }} />
                        Home
                    </Typography>
                    <Typography
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        color="text.primary"
                    >
                        <PersonIcon sx={{ fontSize: 18 }} />
                        Profile
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
                        spacing={3}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                        sx={{ width: '100%' }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={profilePictureUrl || undefined}
                                    sx={{
                                        width: 72,
                                        height: 72,
                                        fontSize: 28,
                                        backgroundColor: alpha(
                                            theme.palette.primary.main,
                                            0.15
                                        ),
                                        color: theme.palette.primary.main,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                    onClick={handleAvatarClick}
                                >
                                    {!profilePictureUrl && initials}
                                </Avatar>
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: -4,
                                        right: -4,
                                        backgroundColor: theme.palette.primary.main,
                                        color: 'white',
                                        width: 28,
                                        height: 28,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.dark,
                                        },
                                    }}
                                    onClick={handleAvatarClick}
                                >
                                    <CameraAltIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {user.name || "User Profile"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    Manage your personal information and secure your account.
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        size="small"
                                        color={emailVerified ? "success" : "warning"}
                                        icon={<VerifiedUserIcon />}
                                        label={
                                            emailVerified
                                                ? "Email Verified"
                                                : "Verification Pending"
                                        }
                                    />
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={roleLabel}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            lg: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: { xs: 1.5, md: 2 },
                        mb: { xs: 2, md: 3 },
                    }}
                >
                    {summaryCards.map((card) => (
                        <Card key={card.title} sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: "50%",
                                            backgroundColor: alpha(card.color, 0.12),
                                            color: card.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {card.subtitle}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                            elevation={0}
                            sx={{
                                height: "100%",
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                    sx={{ mb: 2.5 }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.12
                                            ),
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <PersonIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Profile Information
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Update your personal details and contact info.
                                        </Typography>
                                    </Box>
                                </Stack>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                            elevation={0}
                            sx={{
                                height: "100%",
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                    sx={{ mb: 2.5 }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.12
                                            ),
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <LockIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Update Password
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Keep your account secure with a strong password.
                                        </Typography>
                                    </Box>
                                </Stack>
                                <UpdatePasswordForm />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Upload Profile Picture Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Upload Profile Picture
                    <IconButton
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                },
                            }}
                            onClick={() => document.getElementById('profile-picture-input').click()}
                        >
                            <CameraAltIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body1" sx={{ mb: 0.5 }}>
                                Click to upload or drag and drop
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                JPEG, PNG, GIF, WebP (Max 5MB)
                            </Typography>
                            <input
                                id="profile-picture-input"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </Box>
                        {previewUrl && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Preview:
                                </Typography>
                                <Avatar
                                    src={previewUrl}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        margin: '0 auto',
                                    }}
                                />
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!selectedFile}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Profile Picture Preview Dialog */}
            <Dialog
                open={previewDialogOpen}
                onClose={handleClosePreviewDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Profile Picture
                    <IconButton
                        onClick={handleClosePreviewDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar
                            src={profilePictureUrl}
                            sx={{
                                width: 200,
                                height: 200,
                                margin: '0 auto',
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        startIcon={<DeleteIcon />}
                        onClick={handleDeletePicture}
                        color="error"
                    >
                        Delete
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<CameraAltIcon />}
                        onClick={() => {
                            setPreviewDialogOpen(false);
                            setUploadDialogOpen(true);
                        }}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
