import React from 'react';
import {
    Box,
    Button,
    Card,
    Grid,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';

const fontOptions = [
    // Professional Monospace Fonts (Great for Receipt Alignment)
    { label: 'Roboto Mono', fontFamily: "'Roboto Mono', monospace" },
    { label: 'Source Code Pro', fontFamily: "'Source Code Pro', monospace" },
    { label: 'Fira Code', fontFamily: "'Fira Code', monospace" },
    { label: 'Courier New', fontFamily: "'Courier New', monospace" },
    { label: 'Consolas', fontFamily: "'Consolas', monospace" },
    { label: 'Space Mono', fontFamily: "'Space Mono', monospace" },
    { label: 'Hack', fontFamily: "'Hack', monospace" },
    { label: 'Tisa Mono', fontFamily: "'Tisa Mono', monospace" },
    { label: 'Lucida Console', fontFamily: "'Lucida Console', monospace" },
    
    // Professional Sans-Serif Fonts (Clean & Modern)
    { label: 'Roboto', fontFamily: "'Roboto', sans-serif" },
    { label: 'Open Sans', fontFamily: "'Open Sans', sans-serif" },
    { label: 'Inter', fontFamily: "'Inter', sans-serif" },
    { label: 'Lato', fontFamily: "'Lato', sans-serif" },
    { label: 'Montserrat', fontFamily: "'Montserrat', sans-serif" },
    { label: 'Poppins', fontFamily: "'Poppins', sans-serif" },
    { label: 'Arial', fontFamily: 'Arial, sans-serif' },
    { label: 'Helvetica', fontFamily: 'Helvetica, sans-serif' },
    { label: 'Verdana', fontFamily: 'Verdana, sans-serif' },
    { label: 'Trebuchet MS', fontFamily: "'Trebuchet MS', sans-serif" },
    { label: 'Tahoma', fontFamily: 'Tahoma, sans-serif' },
    { label: 'Arial Black', fontFamily: "'Arial Black', sans-serif" },
    
    // Professional Serif Fonts (Elegant & Traditional)
    { label: 'Merriweather', fontFamily: "'Merriweather', serif" },
    { label: 'Playfair Display', fontFamily: "'Playfair Display', serif" },
    { label: 'Times New Roman', fontFamily: "'Times New Roman', serif" },
    { label: 'Georgia', fontFamily: 'Georgia, serif' },
    { label: 'Palatino', fontFamily: 'Palatino, serif' },
    { label: 'Garamond', fontFamily: 'Garamond, serif' },
    { label: 'Bookman', fontFamily: 'Bookman, serif' },
    
    // Other Fonts
    { label: 'Impact', fontFamily: 'Impact, sans-serif' },
    { label: 'Comic Sans MS', fontFamily: "'Comic Sans MS', cursive" },
];

export default function ReceiptSettings({ settingFormData, handleChange, handleFontChange, handleSubmit }) {
    return (
        <form encType="multipart/form-data" onSubmit={handleSubmit} method="post">
            <input type="hidden" name="setting_type" value="receipt" />
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                <Card elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                        Receipt Settings
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Receipt Note"
                                name="sale_receipt_note"
                                multiline
                                rows={3}
                                required
                                value={settingFormData.sale_receipt_note}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Second Note"
                                name="sale_receipt_second_note"
                                multiline
                                rows={3}
                                value={settingFormData.sale_receipt_second_note}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Show Shop Name"
                                name="show_receipt_shop_name"
                                required
                                value={settingFormData.show_receipt_shop_name}
                                onChange={handleChange}
                                select
                            >
                                <MenuItem value={1}>Show</MenuItem>
                                <MenuItem value={0}>Hide</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Show Receipt Logo"
                                name="show_receipt_logo"
                                required
                                value={settingFormData.show_receipt_logo}
                                onChange={handleChange}
                                select
                            >
                                <MenuItem value={1}>Show</MenuItem>
                                <MenuItem value={0}>Hide</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Receipt Page Type"
                                name="sale_receipt_page_type"
                                required
                                value={settingFormData.sale_receipt_page_type}
                                onChange={handleChange}
                                select
                            >
                                <MenuItem value="thermal">Thermal (80 mm)</MenuItem>
                                <MenuItem value="a5">A5 (148 × 210 mm)</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Padding Right"
                                name="sale_print_padding_right"
                                required
                                value={settingFormData.sale_print_padding_right}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Padding Left"
                                name="sale_print_padding_left"
                                required
                                value={settingFormData.sale_print_padding_left}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                name="sale_print_font"
                                label="Choose Font for Receipt"
                                value={settingFormData.sale_print_font}
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

