import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Alert,
} from '@mui/material';
import IOSSwitch from '@/Components/CustomSwitch';

export default function BarcodeSettings({
    settingFormData,
    barcodeSettings,
    handleChange,
    handleBarcodeFieldChange,
    handleSubmit,
}) {
    // Roll and Label Size State
    const initialRollWidth = barcodeSettings.get('roll_width') || '4';
    const [rollWidth, setRollWidth] = useState(initialRollWidth);
    const [isCustomRoll, setIsCustomRoll] = useState(!['2', '3', '4', '6', '8'].includes(initialRollWidth));
    const [customRollWidth, setCustomRollWidth] = useState(isCustomRoll ? initialRollWidth : '');

    const [labelWidth, setLabelWidth] = useState(
        barcodeSettings.get('label_width') || '2'
    );
    const [labelHeight, setLabelHeight] = useState(
        barcodeSettings.get('label_height') || '1.0'
    );
    const [labelsPerRow, setLabelsPerRow] = useState(
        barcodeSettings.get('labels_per_row') || '2'
    );
    const [gap, setGap] = useState(
        barcodeSettings.get('gap') || '2'
    );

    // Handle roll width change
    const handleRollWidthChange = (value) => {
        if (value === 'custom') {
            setIsCustomRoll(true);
            setRollWidth(customRollWidth || '4');
        } else {
            setIsCustomRoll(false);
            setRollWidth(value);
            setCustomRollWidth('');
        }
    };

    // Handle custom roll width change
    const handleCustomRollWidthChange = (value) => {
        setCustomRollWidth(value);
        if (value) {
            setRollWidth(value);
        }
    };

    // Calculate labels per row when roll width, label width, or gap changes
    useEffect(() => {
        const roll = parseFloat(rollWidth); // in inches
        const label = parseFloat(labelWidth); // in inches
        const gapMm = parseFloat(gap); // in mm
        if (roll > 0 && label > 0 && gapMm >= 0) {
            // Convert gap from mm to inches for calculation
            const gapInches = gapMm / 25.4;
            // Calculate: (label_width * labels_per_row) + (gap * (labels_per_row - 1)) <= roll_width
            // Solving for labels_per_row: labels_per_row <= (roll_width + gap) / (label_width + gap)
            const calculated = Math.floor((roll + gapInches) / (label + gapInches));
            const validated = Math.max(1, calculated);
            setLabelsPerRow(validated.toString());
            // Update barcodeSettings
            barcodeSettings.set('labels_per_row', validated.toString());
        }
    }, [rollWidth, labelWidth, gap]);

    // Update barcodeSettings when values change
    useEffect(() => {
        barcodeSettings.set('roll_width', rollWidth);
        barcodeSettings.set('label_width', labelWidth);
        barcodeSettings.set('label_height', labelHeight);
        barcodeSettings.set('gap', gap);
    }, [rollWidth, labelWidth, labelHeight, gap]);

    // Common roll sizes (in inches - based on real-world thermal printer standards)
    // Common roll sizes (standard thermal printer roll widths in inches)
    const commonRollSizes = ['2', '3', '4', '6', '8'];

    // Common label widths in inches (industry-standard sizes)
    const commonLabelWidths = [
        '0.5', '0.75', '0.875', '0.9', '1', '1.125', '1.25', '1.375', '1.5',
        '1.625', '1.75', '2', '2.125', '2.5', '2.75', '3', '3.5', '4'
    ];

    // Common label heights in inches (industry-standard sizes)
    const commonLabelHeights = [
        '0.2', '0.25', '0.375', '0.5', '0.625', '0.75', '0.875', '1.0',
        '1.125', '1.25', '1.375', '1.5', '1.75', '2.0', '2.5', '3.0', '4.0'
    ];

    return (
        <form encType="multipart/form-data" onSubmit={handleSubmit} method="post">
            <input type="hidden" name="setting_type" value="barcode" />
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                <Card elevation={1} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                        Label & Roll Configuration
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Roll Size
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Roll Width (inches)</InputLabel>
                                        <Select
                                            value={isCustomRoll ? 'custom' : rollWidth}
                                            label="Roll Width (inches)"
                                            onChange={(e) => handleRollWidthChange(e.target.value)}
                                        >
                                            {commonRollSizes.map((size) => (
                                                <MenuItem key={size} value={size}>
                                                    {size}" ({(parseFloat(size) * 25.4).toFixed(1)}mm)
                                                </MenuItem>
                                            ))}
                                            <MenuItem value="custom">Custom</MenuItem>
                                        </Select>
                                        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
                                            💡 1 inch = 25.4mm
                                        </Typography>
                                    </FormControl>
                                </Grid>
                                {isCustomRoll && (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Custom Roll Width (inches)"
                                            value={customRollWidth}
                                            onChange={(e) => handleCustomRollWidthChange(e.target.value)}
                                            inputProps={{ min: 1, max: 12, step: 0.25 }}
                                            helperText={`${customRollWidth ? (parseFloat(customRollWidth) * 25.4).toFixed(1) : '0'}mm (1 inch = 25.4mm)`}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>

                        <Grid size={12}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Label Size
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Label Width (inches)"
                                        value={labelWidth}
                                        onChange={(e) => setLabelWidth(e.target.value)}
                                        inputProps={{ min: 0.5, max: 8, step: 0.125 }}
                                        helperText={`${labelWidth ? (parseFloat(labelWidth) * 25.4).toFixed(1) : '0'}mm | Common sizes: 1", 1.125", 1.5", 2" | 1 inch = 25.4mm`}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Label Height (inches)</InputLabel>
                                        <Select
                                            value={labelHeight}
                                            label="Label Height (inches)"
                                            onChange={(e) => setLabelHeight(e.target.value)}
                                        >
                                            {commonLabelHeights.map((height) => (
                                                <MenuItem key={height} value={height}>
                                                    {height}" ({(parseFloat(height) * 25.4).toFixed(1)}mm)
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
                                            💡 1 inch = 25.4mm
                                        </Typography>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Gap (mm)"
                                        value={gap}
                                        onChange={(e) => setGap(e.target.value)}
                                        inputProps={{ min: 0, max: 10 }}
                                        helperText="Space between labels (in millimeters)"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Labels Per Row"
                                        value={labelsPerRow}
                                        disabled
                                        helperText="Auto-calculated based on roll width, label width, and gap"
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                backgroundColor: 'action.disabledBackground',
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            {parseFloat(rollWidth) > 0 && parseFloat(labelWidth) > 0 && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        📏 Configuration Summary:
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Roll:</strong> {rollWidth}" ({(parseFloat(rollWidth) * 25.4).toFixed(1)}mm) |
                                        <strong> Labels:</strong> {labelWidth}" × {labelHeight}" ({(parseFloat(labelWidth) * 25.4).toFixed(1)}mm × {(parseFloat(labelHeight) * 25.4).toFixed(1)}mm) |
                                        <strong> Gap:</strong> {gap}mm
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        <strong>Labels Per Row:</strong> {labelsPerRow} |
                                        {(() => {
                                            const labelWidthMm = parseFloat(labelWidth) * 25.4;
                                            const labelHeightMm = parseFloat(labelHeight) * 25.4;
                                            const rollWidthMm = parseFloat(rollWidth) * 25.4;
                                            const totalRowWidth = (labelWidthMm * parseInt(labelsPerRow)) + (parseFloat(gap) * (parseInt(labelsPerRow) - 1));
                                            return totalRowWidth <= rollWidthMm
                                                ? ` ✅ Total row width: ${totalRowWidth.toFixed(1)}mm (fits on ${rollWidthMm.toFixed(1)}mm roll)`
                                                : ` ⚠️ Warning: Total row width (${totalRowWidth.toFixed(1)}mm) exceeds roll width (${rollWidthMm.toFixed(1)}mm)!`;
                                        })()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                                        💡 Conversion: 1 inch = 25.4mm
                                    </Typography>
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </Card>

                <Card elevation={1} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                        Display Options
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        name="show_barcode_store"
                                        value={settingFormData.show_barcode_store}
                                        onChange={handleChange}
                                        checked={settingFormData.show_barcode_store === 'on'}
                                    />
                                }
                                label="Store Name"
                                sx={{ gap: 1.5 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        name="show_barcode_product_price"
                                        value={settingFormData.show_barcode_product_price}
                                        onChange={handleChange}
                                        checked={settingFormData.show_barcode_product_price === 'on'}
                                    />
                                }
                                label="Product Price"
                                sx={{ gap: 1.5 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        name="show_barcode_product_name"
                                        value={settingFormData.show_barcode_product_name}
                                        onChange={handleChange}
                                        checked={settingFormData.show_barcode_product_name === 'on'}
                                    />
                                }
                                label="Product Name"
                                sx={{ gap: 1.5 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        name="show_barcode_logo"
                                        value={settingFormData.show_barcode_logo}
                                        onChange={handleChange}
                                        checked={settingFormData.show_barcode_logo === 'on'}
                                    />
                                }
                                label="Show Logo"
                                sx={{ gap: 1.5 }}
                            />
                        </Grid>
                    </Grid>
                </Card>

                <Card elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                        Barcode Configuration
                    </Typography>
                    <Grid container spacing={2}>
                        {[...barcodeSettings.keys()].filter(key =>
                            !['roll_width', 'label_width', 'label_height', 'labels_per_row', 'gap'].includes(key)
                        ).map((key) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label={key
                                        .replace(/_/g, ' ')
                                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                                    name={key}
                                    value={barcodeSettings.get(key)}
                                    onChange={handleBarcodeFieldChange}
                                />
                            </Grid>
                        ))}
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

