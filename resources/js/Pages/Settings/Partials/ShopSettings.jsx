import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Grid,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraFrontRoundedIcon from '@mui/icons-material/PhotoCameraFrontRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import ImageIcon from '@mui/icons-material/Image';
import { styled } from '@mui/material/styles';

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

const MediaUploadCard = ({
    title,
    description,
    preview,
    inputName,
    helperText,
    onChange,
    icon: IconComponent,
}) => {
    const theme = useTheme();
    const [localPreview, setLocalPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create local preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalPreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Call parent onChange handler
            onChange(e);
        }
    };

    const displayPreview = localPreview || preview;

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                p: 3,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}08 100%)`,
                border: `1px solid ${theme.palette.primary.main}25`,
                minHeight: 380,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}15 100%)`,
                            color: 'primary.main',
                            boxShadow: 2,
                        }}
                    >
                        <IconComponent fontSize="medium" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                            {description}
                        </Typography>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        height: 240,
                        border: `2px dashed ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    {displayPreview ? (
                        <Box
                            component="img"
                            src={displayPreview}
                            alt={`${title} preview`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: 1,
                                p: 1,
                            }}
                        />
                    ) : (
                        <Stack spacing={1} alignItems="center">
                            <ImageIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                No preview available
                            </Typography>
                        </Stack>
                    )}
                </Box>

                <Stack spacing={1.5}>
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.25,
                        }}
                    >
                        {displayPreview ? 'Change Media' : 'Upload Media'}
                        <VisuallyHiddenInput
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            name={inputName}
                            accept="image/*"
                        />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                        {helperText}
                    </Typography>
                </Stack>
            </Stack>
        </Card>
    );
};

export default function ShopSettings({ settingFormData, handleChange, handleFileChange, handleSubmit }) {
    return (
        <form encType="multipart/form-data" onSubmit={handleSubmit} method="post">
            <input type="hidden" name="setting_type" value="site_information" />
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                <Card elevation={1} sx={{ mb: 3, p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                        Site Branding
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <MediaUploadCard
                                title="Site Logo"
                                description="Displayed across reports, pdfs."
                                preview={settingFormData.site_logo}
                                inputName="site_logo"
                                helperText="Recommended: PNG with transparent background · Max 2MB"
                                onChange={handleFileChange}
                                icon={PhotoCameraFrontRoundedIcon}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <MediaUploadCard
                                title="Favicon"
                                description="Browser tab icon."
                                preview={settingFormData.favicon}
                                inputName="favicon"
                                helperText="Recommended: 32x32 or 16x16 ICO/PNG · Max 500KB"
                                onChange={handleFileChange}
                                icon={AppsRoundedIcon}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Card
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.05) 100%)',
                                    border: '1px solid rgba(16,185,129,0.15)',
                                    borderRadius: 2,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Site Name"
                                    name="site_name"
                                    required
                                    value={settingFormData.site_name || ''}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'background.paper',
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.main',
                                                },
                                            },
                                        },
                                    }}
                                />
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

