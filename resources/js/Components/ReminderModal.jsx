import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Divider,
    IconButton,
    Box,
    Chip,
    Stack,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";
import HomeIcon from "@mui/icons-material/Home";
import axios from "axios";
import Swal from "sweetalert2";
import { useCurrencyFormatter } from '@/lib/currencyFormatter';
import dayjs from "dayjs";

export default function ReminderModal({ open, setOpen, sale, onReminderSent }) {
    const formatCurrency = useCurrencyFormatter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [method, setMethod] = useState("whatsapp_url");
    const [reminderSettings, setReminderSettings] = useState(null);
    const [textDirection, setTextDirection] = useState("ltr");

    // Function to detect if text contains Urdu/Arabic characters
    const detectTextDirection = (text) => {
        if (!text || text.trim().length === 0) {
            return "ltr";
        }

        // Unicode ranges for Arabic script (includes Urdu)
        // Arabic: U+0600–U+06FF
        // Arabic Supplement: U+0750–U+077F
        // Arabic Extended-A: U+08A0–U+08FF
        // Arabic Presentation Forms-A: U+FB50–U+FDFF
        // Arabic Presentation Forms-B: U+FE70–U+FEFF
        const arabicUrduRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

        // Check if text contains Arabic/Urdu characters
        const hasArabicUrdu = arabicUrduRegex.test(text);

        return hasArabicUrdu ? "rtl" : "ltr";
    };

    // Update text direction when message changes
    const handleMessageChange = (e) => {
        const newMessage = e.target.value;
        setMessage(newMessage);
        setTextDirection(detectTextDirection(newMessage));
    };

    const loadReminderSettings = async () => {
        try {
            const response = await axios.get('/reminder/settings');
            if (response.data.success) {
                setReminderSettings(response.data.settings);
            } else {
                // Fallback to defaults
                setReminderSettings({
                    enable_whatsapp_url: true,
                    enable_whatsapp_cloud: false,
                    enable_email: true,
                    enable_sms: false,
                    enable_physical_visit: true,
                });
            }
        } catch (error) {
            console.error("Failed to load reminder settings", error);
            // Fallback to defaults
            setReminderSettings({
                enable_whatsapp_url: true,
                enable_whatsapp_cloud: false,
                enable_email: true,
                enable_sms: false,
                enable_physical_visit: true,
            });
        }
    };

    const generateDefaultMessage = () => {
        if (!sale || !reminderSettings) return;

        const customerName = sale.name || "Customer";
        const invoiceNumber = sale.invoice_number || "";
        const amountPending = formatCurrency(
            (parseFloat(sale.total_amount || 0) - parseFloat(sale.amount_received || 0)),
            false
        );
        const dueDate = sale.due_date ? dayjs(sale.due_date).format("YYYY-MM-DD") : "N/A";

        // Get default message from settings or use fallback
        let defaultMsg = reminderSettings.default_reminder_message ||
            `Dear ${customerName},

This is a reminder that your invoice #${invoiceNumber} with an amount of ${amountPending} is pending payment.

Due Date: ${dueDate}

Please make the payment at your earliest convenience.

Thank you!`;

        // Replace placeholders
        defaultMsg = defaultMsg.replace(/{customer_name}/g, customerName);
        defaultMsg = defaultMsg.replace(/{invoice_number}/g, invoiceNumber);
        defaultMsg = defaultMsg.replace(/{amount_pending}/g, amountPending);
        defaultMsg = defaultMsg.replace(/{due_date}/g, dueDate);

        setMessage(defaultMsg);
        setTextDirection(detectTextDirection(defaultMsg));
    };

    useEffect(() => {
        if (open && sale) {
            // Load reminder settings first, then generate message
            loadReminderSettings();
        }
    }, [open, sale]);

    useEffect(() => {
        if (reminderSettings && sale && open) {
            // Generate message after settings are loaded
            generateDefaultMessage();
        }
    }, [reminderSettings, sale, open]);

    const handleClose = () => {
        setOpen(false);
        setMessage("");
        setMethod("whatsapp_url");
        setTextDirection("ltr");
    };

    const handleSend = async () => {
        if (!sale || !method) return;

        setLoading(true);
        try {
            const response = await axios.post(`/sales/${sale.id}/send-reminder`, {
                method,
                message,
            });

            if (response.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: "Reminder sent successfully",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });

                // If WhatsApp URL, open it
                if (method === "whatsapp_url" && response.data.result?.url) {
                    window.open(response.data.result.url, "_blank");
                }

                // If Physical Visit, open receipt for printing
                if (method === "physical_visit" && response.data.result?.receipt_url) {
                    window.open(response.data.result.receipt_url, "_blank");
                }

                handleClose();
                if (onReminderSent) {
                    onReminderSent();
                }
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to send reminder",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!sale) return null;

    const amountPending = parseFloat(sale.total_amount || 0) - parseFloat(sale.amount_received || 0);
    const dueDate = sale.due_date ? dayjs(sale.due_date).format("YYYY-MM-DD") : "Not set";

    const methods = [
        {
            value: "whatsapp_url",
            label: "WhatsApp URL",
            icon: <WhatsAppIcon />,
            enabled: reminderSettings?.enable_whatsapp_url !== false,
        },
        {
            value: "whatsapp_cloud",
            label: "WhatsApp Cloud API",
            icon: <WhatsAppIcon />,
            enabled: reminderSettings?.enable_whatsapp_cloud === true,
        },
        {
            value: "email",
            label: "Email",
            icon: <EmailIcon />,
            enabled: reminderSettings?.enable_email !== false,
        },
        {
            value: "sms",
            label: "SMS",
            icon: <SmsIcon />,
            enabled: reminderSettings?.enable_sms === true,
        },
        {
            value: "physical_visit",
            label: "Physical Visit",
            icon: <HomeIcon />,
            enabled: reminderSettings?.enable_physical_visit !== false,
        },
    ].filter((m) => m.enabled);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 },
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Send Reminder
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    {/* Customer Information */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Customer Information
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: "background.default",
                                borderRadius: 1,
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Customer Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {sale.name || "Walk-in Customer"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Invoice Number
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        #{sale.invoice_number}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Phone / WhatsApp
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {sale.whatsapp || sale.phone || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {sale.email || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Amount Pending
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: 600, color: "error.main" }}
                                    >
                                        {formatCurrency(amountPending, false)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Due Date
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {dueDate}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Sending Method */}
                    <Grid item xs={12} size={12}>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                                Sending Method
                            </FormLabel>
                            <RadioGroup
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                            >
                                <Stack direction="row" spacing={1}>
                                    {methods.map((m) => (
                                        <FormControlLabel
                                            key={m.value}
                                            value={m.value}
                                            control={<Radio />}
                                            label={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {m.icon}
                                                    <Typography>{m.label}</Typography>
                                                </Box>
                                            }
                                        />
                                    ))}
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Message */}
                    <Grid item size={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={8}
                            label="Reminder Message"
                            value={message}
                            onChange={handleMessageChange}
                            variant="outlined"
                            helperText="Edit the reminder message as needed"
                            sx={{
                                "& .MuiInputBase-input": {
                                    direction: textDirection,
                                    textAlign: textDirection === "rtl" ? "right" : "left",
                                },
                            }}
                            inputProps={{
                                dir: textDirection,
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSend}
                    variant="contained"
                    disabled={loading || !message.trim() || !method}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? "Sending..." : "Send Reminder"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

