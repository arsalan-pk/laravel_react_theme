import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import axios from "axios";
import dayjs from "dayjs";

export default function ReminderDialog({
    open,
    setOpen,
    selectedContact = null,
    onSuccess
}) {
    const [reminderDate, setReminderDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && selectedContact) {
            setReminderDate(selectedContact.reminder_at || '');
        }
    }, [open, selectedContact]);

    const handleClose = () => {
        setOpen(false);
        setReminderDate('');
    };

    const handleSave = () => {
        if (!selectedContact) return;

        setLoading(true);

        axios
            .post(`/contact/${selectedContact.id}/update-reminder`, {
                reminder_at: reminderDate
            })
            .then((response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.data.message,
                    timer: 1500,
                    showConfirmButton: false
                });
                handleClose();
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update reminder date',
                });
                console.error('Error updating reminder:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                    Set Reminder Date
                </Typography>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Set the next wasoli date for customer payment reminder
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reminder Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            min: dayjs().format('YYYY-MM-DD')
                        }}
                    />
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
                <Button 
                    onClick={handleClose} 
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
