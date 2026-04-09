import * as React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import dayjs from "dayjs";

import {
    Button,
    Box,
    Paper,
    Breadcrumbs,
    Typography,
    Stack,
    Card,
    CardContent,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert,
    LinearProgress,
} from "@mui/material";

import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import BackupIcon from "@mui/icons-material/Backup";
import StorageIcon from "@mui/icons-material/Storage";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadIcon from "@mui/icons-material/Upload";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";

import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import axios from "axios";

export default function BackupIndex({ storageMedia, backups: initialBackups, pageLabel }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [backups, setBackups] = useState(initialBackups || []);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBackup, setSelectedBackup] = useState(null);

    const fetchBackups = async () => {
        try {
            const response = await axios.get("/backups/list");
            setBackups(response.data);
        } catch (error) {
            console.error("Failed to fetch backups:", error);
        }
    };

    const handleCreateBackup = async () => {
        setLoading(true);
        Swal.fire({
            title: 'Creating Backup...',
            text: 'This may take several minutes for large databases. Please wait.',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await axios.post("/backups/create", {}, {
                timeout: 300000, // 5 minutes timeout
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Backup created successfully!",
                });
                fetchBackups();
            } else {
                throw new Error(response.data.message || "Backup creation failed");
            }
        } catch (error) {
            console.error('Backup creation error:', error);
            
            let errorMessage = "Failed to create backup";
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (backup) => {
        window.location.href = `/download-backup/${backup.name}`;
    };

    const handleDelete = async (backup) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `This will permanently delete the backup "${backup.name}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/backups/${backup.name}`);
                Swal.fire("Deleted!", "The backup has been deleted.", "success");
                fetchBackups();
            } catch (error) {
                Swal.fire(
                    "Error!",
                    error.response?.data?.error || "Failed to delete backup.",
                    "error"
                );
            }
        }
    };

    const handleMenuClick = (event, backup) => {
        setAnchorEl(event.currentTarget);
        setSelectedBackup(backup);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedBackup(null);
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <BackupIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                        {pageLabel || "Backup & Restore"}
                    </Typography>
                </Box>
            }
        >
            <Head title="Backup & Restore" />

            <Box sx={{ p: 3 }}>
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <HomeIcon sx={{ fontSize: 20 }} />
                        <Typography>Home</Typography>
                    </Box>
                    <Typography color="text.primary">Backups</Typography>
                </Breadcrumbs>

                {/* Create Backup Section */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AddIcon />
                            Create Backup
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Create a complete backup of your database and media files.
                        </Typography>

                        <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <BackupIcon />}
                                onClick={handleCreateBackup}
                                disabled={loading}
                                size="large"
                            >
                                {loading ? "Creating..." : "Create Backup"}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchBackups}
                            >
                                Refresh
                            </Button>

                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<DownloadIcon />}
                                onClick={() => window.open('/restore-standalone', '_blank')}
                            >
                                Restore Backup
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Backup History */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <StorageIcon />
                            Backup History
                        </Typography>

                        {backups.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No backups found. Create your first backup above.
                            </Alert>
                        ) : (
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                {backups.map((backup, index) => (
                                    <Paper
                                        key={index}
                                        sx={{
                                            p: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                                            "&:hover": {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                            },
                                        }}
                                    >
                                        <Stack
                                            direction={isMobile ? "column" : "row"}
                                            justifyContent="space-between"
                                            alignItems={isMobile ? "flex-start" : "center"}
                                            spacing={2}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    {backup.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Size: {backup.size_formatted} • Created: {backup.created_at ? dayjs(backup.created_at).format("YYYY-MM-DD HH:mm:ss") : "—"}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownload(backup)}
                                                >
                                                    Download
                                                </Button>

                                                <IconButton
                                                    onClick={(e) => handleMenuClick(e, backup)}
                                                    size="small"
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </CardContent>
                </Card>

                {/* Action Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleDelete(selectedBackup)} sx={{ color: "error.main" }}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        </AuthenticatedLayout>
    );
}