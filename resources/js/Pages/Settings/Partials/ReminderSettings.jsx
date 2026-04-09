import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

const ReminderSettings = ({ handleSubmit, settingFormData, handleChange, setSettingFormData, settings }) => {
    const [testing, setTesting] = useState({
        email: false,
        whatsapp: false,
        sms: false,
    });
    const [testEmail, setTestEmail] = useState('');
    const [testPhone, setTestPhone] = useState('');

    useEffect(() => {
        try {
            const parsedSettings = settings.reminder_settings ? JSON.parse(settings.reminder_settings) : {};
            setSettingFormData({
                ...settingFormData,
                due_days: parsedSettings.due_days ?? '',
                next_reminder_gap_days: parsedSettings.next_reminder_gap_days ?? '',
                default_reminder_message: parsedSettings.default_reminder_message ||
                   "محترم {customer_name},\n\nیہ ایک یاد دہانی ہے کہ آپ کا انوائس #{invoice_number} جس کی رقم {amount_pending} ہے، ابھی تک بقایا ہے۔\n\nآخری تاریخ: {due_date}\n\nبراہِ کرم اپنی سہولت کے مطابق جلد از جلد ادائیگی مکمل کریں۔\n\nشکریہ!",
                enable_whatsapp_url: parsedSettings.enable_whatsapp_url !== false,
                enable_whatsapp_cloud: parsedSettings.enable_whatsapp_cloud === true,
                enable_email: parsedSettings.enable_email !== false,
                enable_sms: parsedSettings.enable_sms === true,
                enable_physical_visit: parsedSettings.enable_physical_visit !== false,
                sms_gateway: parsedSettings.sms_gateway || '',
                whatsapp_cloud_api_key: parsedSettings.whatsapp_cloud_api_key || '',
                whatsapp_cloud_api_secret: parsedSettings.whatsapp_cloud_api_secret || '',
            });
        } catch (error) {
            console.error("Failed to parse reminder settings:", error);
        }
    }, []);

    const handleSwitchChange = (name) => (event) => {
        const value = event.target.checked;
        setSettingFormData({
            ...settingFormData,
            [name]: value,
        });
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter a test email address',
                icon: 'error',
            });
            return;
        }

        setTesting({ ...testing, email: true });
        try {
            const response = await axios.post('/reminder/test-email', {
                test_email: testEmail,
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: response.data.message,
                    icon: 'success',
                });
            } else {
                Swal.fire({
                    title: 'Failed!',
                    text: response.data.message,
                    icon: 'error',
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to send test email',
                icon: 'error',
            });
        } finally {
            setTesting({ ...testing, email: false });
        }
    };

    const handleTestWhatsApp = async () => {
        if (!testPhone) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter a test phone number',
                icon: 'error',
            });
            return;
        }

        setTesting({ ...testing, whatsapp: true });
        try {
            const response = await axios.post('/reminder/test-whatsapp-cloud', {
                test_phone: testPhone,
            });

            Swal.fire({
                title: response.data.success ? 'Success!' : 'Info',
                text: response.data.message,
                icon: response.data.success ? 'success' : 'info',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to test WhatsApp Cloud API',
                icon: 'error',
            });
        } finally {
            setTesting({ ...testing, whatsapp: false });
        }
    };

    const handleTestSMS = async () => {
        if (!testPhone) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter a test phone number',
                icon: 'error',
            });
            return;
        }

        setTesting({ ...testing, sms: true });
        try {
            const response = await axios.post('/reminder/test-sms', {
                test_phone: testPhone,
            });

            Swal.fire({
                title: response.data.success ? 'Success!' : 'Failed!',
                text: response.data.message,
                icon: response.data.success ? 'success' : 'error',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to send test SMS',
                icon: 'error',
            });
        } finally {
            setTesting({ ...testing, sms: false });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            method="post"
        >
            <input type="hidden" name="setting_type" value={'reminder_settings'} />
            <input type="hidden" name="enable_whatsapp_url" value={settingFormData.enable_whatsapp_url !== false ? 'on' : 'off'} />
            <input type="hidden" name="enable_whatsapp_cloud" value={settingFormData.enable_whatsapp_cloud === true ? 'on' : 'off'} />
            <input type="hidden" name="enable_email" value={settingFormData.enable_email !== false ? 'on' : 'off'} />
            <input type="hidden" name="enable_sms" value={settingFormData.enable_sms === true ? 'on' : 'off'} />
            <input type="hidden" name="enable_physical_visit" value={settingFormData.enable_physical_visit !== false ? 'on' : 'off'} />
            <Box
                sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Grid
                    container
                    spacing={2}
                    width={{ xs: "100%", sm: "60%" }}
                    flexDirection={'column'}
                >
                    <Grid container size={12} spacing={2}>
                        <Paper sx={{ padding: { xs: '0.5rem', sm: "1rem" }, marginBottom: "1rem", width: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Reminder Configuration
                            </Typography>

                            <Grid size={12} container spacing={2}>
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Next Reminder Gap (Days)"
                                        name="next_reminder_gap_days"
                                        type="number"
                                        required
                                        value={settingFormData.next_reminder_gap_days ?? ''}
                                        onChange={handleChange}
                                        helperText="Number of days after sending a reminder before the next reminder is due"
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>

                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Default Reminder Message"
                                        name="default_reminder_message"
                                        multiline
                                        rows={8}
                                        value={settingFormData.default_reminder_message || ''}
                                        onChange={handleChange}
                                        helperText="Use placeholders: {customer_name}, {invoice_number}, {amount_pending}, {due_date}"
                                    />
                                </Grid>

                                <Grid size={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                        Enable Sending Methods
                                    </Typography>
                                </Grid>

                                <Grid size={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settingFormData.enable_whatsapp_url !== false}
                                                onChange={handleSwitchChange('enable_whatsapp_url')}
                                                name="enable_whatsapp_url"
                                            />
                                        }
                                        label="WhatsApp URL"
                                    />
                                </Grid>

                                <Grid size={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settingFormData.enable_whatsapp_cloud === true}
                                                onChange={handleSwitchChange('enable_whatsapp_cloud')}
                                                name="enable_whatsapp_cloud"
                                            />
                                        }
                                        label="WhatsApp Cloud API"
                                    />
                                </Grid>

                                <Grid size={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settingFormData.enable_email !== false}
                                                onChange={handleSwitchChange('enable_email')}
                                                name="enable_email"
                                            />
                                        }
                                        label="Email"
                                    />
                                </Grid>
                                {settingFormData.enable_email && (
                                    <Grid size={12}>
                                        <Box display="flex" gap={2} alignItems="flex-end">
                                            <TextField
                                                label="Test Email Address"
                                                type="email"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                                placeholder="test@example.com"
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleTestEmail}
                                                disabled={testing.email || !testEmail}
                                            >
                                                {testing.email ? 'Testing...' : 'Test Email'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                )}

                                <Grid size={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settingFormData.enable_sms === true}
                                                onChange={handleSwitchChange('enable_sms')}
                                                name="enable_sms"
                                            />
                                        }
                                        label="SMS"
                                    />
                                </Grid>

                                <Grid size={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settingFormData.enable_physical_visit !== false}
                                                onChange={handleSwitchChange('enable_physical_visit')}
                                                name="enable_physical_visit"
                                            />
                                        }
                                        label="Physical Visit"
                                    />
                                </Grid>

                                {settingFormData.enable_sms && (
                                    <>
                                        <Grid size={12}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="SMS Gateway Configuration"
                                                name="sms_gateway"
                                                value={settingFormData.sms_gateway || ''}
                                                onChange={handleChange}
                                                helperText="SMS gateway API endpoint or configuration"
                                            />
                                        </Grid>
                                        <Grid size={12}>
                                            <Box display="flex" gap={2} alignItems="flex-end">
                                                <TextField
                                                    label="Test Phone Number"
                                                    value={testPhone}
                                                    onChange={(e) => setTestPhone(e.target.value)}
                                                    placeholder="e.g., 1234567890"
                                                    size="small"
                                                    sx={{ flex: 1 }}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={handleTestSMS}
                                                    disabled={testing.sms || !testPhone}
                                                >
                                                    {testing.sms ? 'Testing...' : 'Test SMS'}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </>
                                )}

                                {settingFormData.enable_whatsapp_cloud && (
                                    <>
                                        <Grid size={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="WhatsApp Cloud API Key"
                                                name="whatsapp_cloud_api_key"
                                                type="password"
                                                value={settingFormData.whatsapp_cloud_api_key || ''}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid size={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="WhatsApp Cloud API Secret"
                                                name="whatsapp_cloud_api_secret"
                                                type="password"
                                                value={settingFormData.whatsapp_cloud_api_secret || ''}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid size={12}>
                                            <Box display="flex" gap={2} alignItems="flex-end">
                                                <TextField
                                                    label="Test Phone Number"
                                                    value={testPhone}
                                                    onChange={(e) => setTestPhone(e.target.value)}
                                                    placeholder="e.g., 1234567890"
                                                    size="small"
                                                    sx={{ flex: 1 }}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={handleTestWhatsApp}
                                                    disabled={testing.whatsapp || !testPhone}
                                                >
                                                    {testing.whatsapp ? 'Testing...' : 'Test WhatsApp'}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </>
                                )}
                            </Grid>

                            <Grid
                                size={12}
                                justifyContent={"end"}
                                sx={{ display: "flex", mt: 2 }}
                                spacing={1}
                                container
                            >
                                <Button
                                    type="submit"
                                    variant="outlined"
                                    size="large"
                                    color="success"
                                    fullWidth
                                >
                                    UPDATE
                                </Button>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </form>
    );
};

export default ReminderSettings;

