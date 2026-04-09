import * as React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { DataGrid } from "@mui/x-data-grid";
import {
    Button,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Paper,
    Breadcrumbs,
    Typography,
    Stack,
    Card,
    CardContent,
    Divider,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import BackupIcon from "@mui/icons-material/Backup";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Swal from "sweetalert2";
import { useState, useMemo } from "react";
import StorageMediaDialog from "./Partials/StorageMediaDialog";

export default function StorageMediaIndex({ storageMedia, types, pageLabel }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedStorageMediaId, setSelectedStorageMediaId] = useState(null);
    const [openStorageMediaDialog, setOpenStorageMediaDialog] = useState(false);
    const [storageMediaToEdit, setStorageMediaToEdit] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRow, setMenuRow] = useState(null);

    const processedStorageMedia = useMemo(
        () =>
            storageMedia.map((sm) => ({
                id: sm.id,
                ...sm,
            })),
        [storageMedia]
    );

    const storageMediaColumns = [
        {
            field: "name",
            headerName: "Name",
            flex: 1.2,
            minWidth: 160,
            headerAlign: "left",
            align: "left",
            renderCell: (params) => (
                <Button
                    color="primary"
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                    onClick={() => handleEditClick(params.row)}
                >
                    {params.value}
                </Button>
            ),
        },
        {
            field: "type",
            headerName: "Type",
            flex: 0.8,
            minWidth: 130,
            headerAlign: "left",
            align: "left",
            renderCell: (params) => (
                <Chip
                    label={types[params.value] || params.value}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            ),
        },
        {
            field: "is_active",
            headerName: "Status",
            flex: 0.6,
            minWidth: 100,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Active" : "Inactive"}
                    size="small"
                    color={params.value ? "success" : "default"}
                />
            ),
        },
        {
            field: "is_default",
            headerName: "Default",
            flex: 0.6,
            minWidth: 100,
            headerAlign: "center",
            align: "center",
            renderCell: (params) =>
                params.value ? (
                    <Chip label="Default" size="small" color="primary" />
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        -
                    </Typography>
                ),
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1.5,
            minWidth: 200,
            headerAlign: "left",
            align: "left",
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary" noWrap>
                    {params.value || "-"}
                </Typography>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 0.8,
            minWidth: 100,
            sortable: false,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, params.row)}
                >
                    <MoreVertIcon />
                </IconButton>
            ),
        },
    ];

    const handleEditClick = (row) => {
        setStorageMediaToEdit(row);
        setOpenStorageMediaDialog(true);
    };

    const handleAddClick = () => {
        setStorageMediaToEdit(null);
        setOpenStorageMediaDialog(true);
    };

    const handleDeleteClick = (id) => {
        setSelectedStorageMediaId(id);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`/backup-storage-media/${selectedStorageMediaId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: data.message || "Storage media deleted successfully",
                });
                router.reload();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.message || "Failed to delete storage media",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to delete storage media",
            });
        } finally {
            setOpenDeleteDialog(false);
            setSelectedStorageMediaId(null);
        }
    };

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRow(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRow(null);
    };

    const refreshStorageMedia = () => {
        router.reload();
    };

    return (
        <AuthenticatedLayout>
            <Head title={pageLabel || "Backup Storage Media"} />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <IconButton
                        component={router.get ? "a" : "div"}
                        href="/dashboard"
                        size="small"
                        sx={{ color: "text.secondary" }}
                    >
                        <HomeIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        component={router.get ? "a" : "div"}
                        href="/backups"
                        size="small"
                        sx={{ color: "text.secondary" }}
                    >
                        <BackupIcon fontSize="small" />
                    </IconButton>
                    <Typography color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <StorageIcon fontSize="small" />
                        Storage Media
                    </Typography>
                </Breadcrumbs>

                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Backup Storage Media
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddClick}
                                >
                                    Add Storage Media
                                </Button>
                            </Box>
                            <Divider />
                            <Box sx={{ height: 600, width: "100%" }}>
                                <DataGrid
                                    rows={processedStorageMedia}
                                    columns={storageMediaColumns}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { pageSize: 25 },
                                        },
                                    }}
                                    disableRowSelectionOnClick
                                    sx={{
                                        "& .MuiDataGrid-cell:focus": {
                                            outline: "none",
                                        },
                                    }}
                                />
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                <StorageMediaDialog
                    open={openStorageMediaDialog}
                    setOpen={setOpenStorageMediaDialog}
                    types={types}
                    refreshStorageMedia={refreshStorageMedia}
                    storageMediaToEdit={storageMediaToEdit}
                />

                <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                >
                    <DialogTitle>Delete Storage Media?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this storage media? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        if (menuRow) handleEditClick(menuRow);
                        handleMenuClose();
                    }}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            if (menuRow) handleDeleteClick(menuRow.id);
                        }}
                        sx={{ color: "error.main" }}
                    >
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        </AuthenticatedLayout>
    );
}


