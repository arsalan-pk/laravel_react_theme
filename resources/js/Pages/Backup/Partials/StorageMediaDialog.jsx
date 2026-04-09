import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
    IconButton,
    TextField,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Box,
    Stack,
    Typography,
    Divider,
    Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { router } from "@inertiajs/react";
import Swal from "sweetalert2";

const initialFormState = {
    name: "",
    type: "local",
    is_active: true,
    is_default: false,
    description: "",
    config: {},
};

const typeConfigFields = {
    local: [],
    custom_path: [
        { key: "path", label: "Path", type: "text", required: true },
    ],
    s3: [
        { key: "key", label: "Access Key ID", type: "text", required: true },
        { key: "secret", label: "Secret Access Key", type: "password", required: true },
        { key: "region", label: "Region", type: "text", required: true },
        { key: "bucket", label: "Bucket", type: "text", required: true },
        { key: "path", label: "Path (optional)", type: "text", required: false },
    ],
    google_drive: [
        { key: "client_id", label: "Client ID", type: "text", required: true },
        { key: "client_secret", label: "Client Secret", type: "password", required: true },
        { key: "refresh_token", label: "Refresh Token", type: "password", required: true },
        { key: "folder_id", label: "Folder ID (optional)", type: "text", required: false },
    ],
    ftp: [
        { key: "host", label: "Host", type: "text", required: true },
        { key: "username", label: "Username", type: "text", required: true },
        { key: "password", label: "Password", type: "password", required: true },
        { key: "port", label: "Port", type: "number", required: false, default: 21 },
        { key: "path", label: "Path (optional)", type: "text", required: false },
    ],
    sftp: [
        { key: "host", label: "Host", type: "text", required: true },
        { key: "username", label: "Username", type: "text", required: true },
        { key: "password", label: "Password", type: "password", required: false },
        { key: "private_key", label: "Private Key", type: "textarea", required: false },
        { key: "port", label: "Port", type: "number", required: false, default: 22 },
        { key: "path", label: "Path (optional)", type: "text", required: false },
    ],
};

export default function StorageMediaDialog({
    open,
    setOpen,
    types,
    refreshStorageMedia,
    storageMediaToEdit,
}) {
    const isEditMode = !!storageMediaToEdit;
    const [form, setForm] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode && storageMediaToEdit) {
            setForm({
                name: storageMediaToEdit.name || "",
                type: storageMediaToEdit.type || "local",
                is_active: storageMediaToEdit.is_active ?? true,
                is_default: storageMediaToEdit.is_default ?? false,
                description: storageMediaToEdit.description || "",
                config: storageMediaToEdit.config || {},
            });
        } else {
            setForm(initialFormState);
        }
        setErrors({});
    }, [open, storageMediaToEdit, isEditMode]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleFieldChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const handleConfigChange = (key, value) => {
        setForm({
            ...form,
            config: {
                ...form.config,
                [key]: value,
            },
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const url = isEditMode
                ? `/backup-storage-media/${storageMediaToEdit.id}`
                : "/backup-storage-media";
            const method = isEditMode ? "POST" : "POST";

            // Ensure config is properly formatted for the backend
            const submitData = {
                ...form,
                config: form.config || {},
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: data.message || `Storage media ${isEditMode ? "updated" : "created"} successfully`,
                });
                handleClose();
                refreshStorageMedia();
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message || `Failed to ${isEditMode ? "update" : "create"} storage media`,
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const currentConfigFields = typeConfigFields[form.type] || [];

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6">
                            {isEditMode ? "Edit Storage Media" : "Add Storage Media"}
                        </Typography>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Name"
                            name="name"
                            value={form.name}
                            onChange={handleFieldChange}
                            fullWidth
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                        />

                        <TextField
                            select
                            label="Type"
                            name="type"
                            value={form.type}
                            onChange={handleFieldChange}
                            fullWidth
                            required
                            error={!!errors.type}
                            helperText={errors.type}
                        >
                            {Object.entries(types || {}).map(([key, label]) => (
                                <MenuItem key={key} value={key}>
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {currentConfigFields.length > 0 && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Configuration & Credentials
                                </Typography>
                                {currentConfigFields.map((field) => (
                                    <TextField
                                        key={field.key}
                                        label={field.label}
                                        type={field.type === "textarea" ? "text" : field.type}
                                        value={form.config[field.key] || field.default || ""}
                                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                        fullWidth
                                        required={field.required}
                                        multiline={field.type === "textarea"}
                                        rows={field.type === "textarea" ? 4 : 1}
                                        error={!!errors[`config.${field.key}`]}
                                        helperText={errors[`config.${field.key}`] || (field.required ? "Required" : "Optional")}
                                        placeholder={field.default ? `Default: ${field.default}` : ""}
                                    />
                                ))}
                            </>
                        )}

                        <TextField
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={handleFieldChange}
                            fullWidth
                            multiline
                            rows={2}
                            error={!!errors.description}
                            helperText={errors.description}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleFieldChange}
                                />
                            }
                            label="Active"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_default"
                                    checked={form.is_default}
                                    onChange={handleFieldChange}
                                />
                            }
                            label="Set as Default"
                        />

                        {Object.keys(errors).length > 0 && (
                            <Alert severity="error">
                                Please fix the errors above before submitting.
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}


