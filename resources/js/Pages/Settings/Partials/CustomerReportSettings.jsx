import React from 'react';
import {
    Box,
    Button,
    Card,
    CardActions,
    FormControlLabel,
    Grid,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import IOSSwitch from '@/Components/CustomSwitch';

const fontOptions = [
    { label: 'Arial', fontFamily: 'Arial, sans-serif' },
    { label: 'Helvetica', fontFamily: 'Helvetica, sans-serif' },
    { label: 'Times New Roman', fontFamily: "'Times New Roman', serif" },
    { label: 'Courier New', fontFamily: "'Courier New', monospace" },
    { label: 'Verdana', fontFamily: 'Verdana, sans-serif' },
    { label: 'Georgia', fontFamily: 'Georgia, serif' },
    { label: 'Palatino', fontFamily: 'Palatino, serif' },
    { label: 'Garamond', fontFamily: 'Garamond, serif' },
    { label: 'Bookman', fontFamily: 'Bookman, serif' },
    { label: 'Comic Sans MS', fontFamily: "'Comic Sans MS', cursive" },
    { label: 'Trebuchet MS', fontFamily: "'Trebuchet MS', sans-serif" },
    { label: 'Arial Black', fontFamily: "'Arial Black', sans-serif" },
    { label: 'Impact', fontFamily: 'Impact, sans-serif' },
    { label: 'Lucida Console', fontFamily: "'Lucida Console', monospace" },
    { label: 'Tahoma', fontFamily: 'Tahoma, sans-serif' },
    { label: 'Hack', fontFamily: "'Hack', monospace" },
    { label: 'Tisa Mono', fontFamily: "'Tisa Mono', monospace" },
    { label: 'Space Mono', fontFamily: "'Space Mono', monospace" },
];

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function CustomerReportSettings({ settingFormData, handleChange, handleFileChange, handleFontChange, handleSubmit }) {
    return (
        <form encType="multipart/form-data" onSubmit={handleSubmit} method="post">
            <input type="hidden" name="setting_type" value="customer_report" />
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                <Card elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                        Customer Report Settings
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Customer Report Template"
                                name="customer_report_template"
                                value={settingFormData.customer_report_template}
                                onChange={handleChange}
                                select
                            >
                                <MenuItem value="thermal">Thermal (80mm)</MenuItem>
                                <MenuItem value="a5">A5 (148 × 210 mm)</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Show Shop Name"
                                name="customer_report_show_shop_name"
                                value={settingFormData.customer_report_show_shop_name}
                                onChange={handleChange}
                                select
                            >
                                <MenuItem value={1}>Show</MenuItem>
                                <MenuItem value={0}>Hide</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        name="customer_report_show_logo"
                                        value={settingFormData.customer_report_show_logo}
                                        onChange={handleChange}
                                        checked={settingFormData.customer_report_show_logo === 'on'}
                                    />
                                }
                                label="Show Logo"
                                sx={{ gap: 1.5 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        name="customer_report_show_address"
                                        value={settingFormData.customer_report_show_address}
                                        onChange={handleChange}
                                        checked={settingFormData.customer_report_show_address === 'on'}
                                    />
                                }
                                label="Show Address"
                                sx={{ gap: 1.5 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        name="customer_report_show_contact"
                                        value={settingFormData.customer_report_show_contact}
                                        onChange={handleChange}
                                        checked={settingFormData.customer_report_show_contact === 'on'}
                                    />
                                }
                                label="Show Contact"
                                sx={{ gap: 1.5 }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                name="customer_report_font"
                                label="Choose Font for Customer Report"
                                value={settingFormData.customer_report_font || ''}
                                onChange={handleFontChange}
                                select
                            >
                                {fontOptions.map((option) => (
                                    <MenuItem key={option.fontFamily} value={option.fontFamily}>
                                        <Typography style={{ fontFamily: option.fontFamily }}>
                                            {option.label}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Left Padding (px)"
                                name="customer_report_padding_left"
                                type="number"
                                value={settingFormData.customer_report_padding_left || ''}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Right Padding (px)"
                                name="customer_report_padding_right"
                                type="number"
                                value={settingFormData.customer_report_padding_right || ''}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid size={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Payment Terms"
                                name="payment_terms"
                                multiline
                                rows={4}
                                value={settingFormData.payment_terms || ''}
                                onChange={handleChange}
                                placeholder="Payment is due within 7 days of invoice date."
                                helperText="This text will appear on customer statements"
                            />
                        </Grid>

                        <Grid size={12}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Customer Report Logo
                            </Typography>
                            <Card
                                elevation={0}
                                sx={{
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: 2,
                                    },
                                }}
                            >
                                {settingFormData.customer_report_logo ? (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 180,
                                            backgroundImage: `url(${settingFormData.customer_report_logo})`,
                                            backgroundSize: 'contain',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            p: 2,
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 180,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'background.default',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Logo Preview
                                        </Typography>
                                    </Box>
                                )}
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        tabIndex={-1}
                                        startIcon={<CloudUploadIcon />}
                                        fullWidth
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Upload Report Logo
                                        <VisuallyHiddenInput
                                            type="file"
                                            onChange={handleFileChange}
                                            name="customer_report_logo"
                                            accept="image/*"
                                        />
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            minWidth: 150,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Box>
        </form>
    );
}

