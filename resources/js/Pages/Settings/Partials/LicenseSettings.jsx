import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    AlertTitle,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Fade,
    Zoom
} from '@mui/material';
import {
    CloudDownload,
    CloudUpload,
    Refresh,
    CheckCircle,
    Error,
    Warning,
    Info,
    Notifications,
    NotificationsActive,
    Security,
    Timer,
    Computer,
    Mail,
    Person,
    CalendarToday,
    Key,
    FileDownload,
    Delete,
    Help
} from '@mui/icons-material';

const LicenseSettings = ({ settings }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [currentLicense, setCurrentLicense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [backupOnlyMode, setBackupOnlyMode] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);

    useEffect(() => {
        try {
            // Clear localStorage for fresh start (testing)
            localStorage.removeItem('current_license');
            
            loadCurrentLicense();
            loadNotifications();
            checkForSessionNotifications();
            checkEmergencyStatus();
            checkBackupOnlyMode();

            // Set up periodic refresh (every 30 seconds)
            const refreshInterval = setInterval(() => {
                console.log('Running periodic license refresh...');
                loadCurrentLicense(false, true); // Force refresh from server
            }, 30 * 1000); // 30 seconds

            return () => {
                clearInterval(refreshInterval);
            };
        } catch (error) {
            console.error('Error in license settings useEffect:', error);
        }
    }, []); // Empty dependency array - run once on mount

    // Separate effect for license validation when license changes
    useEffect(() => {
        try {
            if (currentLicense?.license_key) {
                validateCurrentLicense();
            }
        } catch (error) {
            console.error('Error in license validation effect:', error);
        }
    }, [currentLicense?.license_key]);

    const checkBackupOnlyMode = () => {
        // Check if we're in backup-only mode (expired license)
        const backupMode = window.sessionStorage.getItem('backup_only_mode');
        const licenseExpiredInfo = window.sessionStorage.getItem('license_expired_info');
        
        if (backupMode === 'true' || licenseExpiredInfo) {
            setBackupOnlyMode(true);
            
            if (licenseExpiredInfo) {
                const info = JSON.parse(licenseExpiredInfo);
                setError(info.message);
            }
        }
    };

    const handleGenerateBackup = async () => {
        if (!currentLicense?.license_key) {
            setError('No license available for backup');
            return;
        }

        setBackupLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/api/license/backup/generate', {
                license_key: currentLicense.license_key
            });

            if (response.data.success) {
                setSuccess('Backup link generated successfully!');
                
                // Create download link
                const link = document.createElement('a');
                link.href = response.data.download_link;
                link.download = response.data.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Show expiry info
                Swal.fire({
                    title: 'Backup Created!',
                    html: `
                        <p>Your license backup has been created and downloaded.</p>
                        <p><strong>Important:</strong> The download link expires in 24 hours.</p>
                        <p>Keep this backup file safe - you can use it to restore your license.</p>
                    `,
                    icon: 'success',
                });
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to generate backup';
            setError(message);
        } finally {
            setBackupLoading(false);
        }
    };

    const checkEmergencyStatus = async () => {
        try {
            const response = await axios.get('/api/license/emergency-status');
            // Handle emergency status if needed
        } catch (error) {
            // Emergency status endpoint might not exist - that's okay
            console.log('Emergency status endpoint not available:', error.message);
        }
    };

    const loadNotifications = async () => {
        try {
            const response = await axios.get('/api/license/notifications');
            if (response.data.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (error) {
            console.log('Notifications not available:', error.message);
            setNotifications([]);
        }
    };

    const checkForSessionNotifications = () => {
        try {
            const notifications = sessionStorage.getItem('license_notifications');
            if (notifications) {
                setNotifications(JSON.parse(notifications));
                sessionStorage.removeItem('license_notifications');
            }
        } catch (error) {
            console.log('Session notifications error:', error);
        }
    };

    const clearNotifications = async () => {
        try {
            await axios.post('/api/license/notifications/clear');
            setNotifications([]);
        } catch (error) {
            // If endpoint doesn't exist, just clear local state
            setNotifications([]);
        }
    };

    const getNotificationColor = (level) => {
        switch (level) {
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'success': return 'success';
            default: return 'info';
        }
    };

    const getNotificationIcon = (level) => {
        switch (level) {
            case 'error': return <NotificationsActive color="error" />;
            case 'warning': return <NotificationsActive color="warning" />;
            case 'success': return <NotificationsActive color="success" />;
            default: return <Notifications color="info" />;
        }
    };

    const loadCurrentLicense = async (clearMessages = false, forceRefresh = false) => {
        try {
            // If force refresh, skip localStorage and go straight to server
            if (!forceRefresh) {
                // First try to get from localStorage for immediate display
                const storedLicense = localStorage.getItem('current_license');
                if (storedLicense) {
                    try {
                        const licenseData = JSON.parse(storedLicense);
                        setCurrentLicense(licenseData);
                        setLicenseKey(licenseData?.license_key || '');
                        console.log('Loaded license from localStorage:', licenseData);
                    } catch (e) {
                        console.warn('Invalid stored license data:', e);
                        localStorage.removeItem('current_license');
                    }
                }
            }

            // Then try to get current license from server
            try {
                const response = await axios.get('/api/license/info');
                if (response.data.success) {
                    setCurrentLicense(response.data.license);
                    setLicenseKey(response.data.license?.license_key || '');
                    
                    // Store license data in localStorage for persistence
                    if (response.data.license) {
                        localStorage.setItem('current_license', JSON.stringify(response.data.license));
                        console.log('Loaded license from server:', response.data.license);
                    } else {
                        localStorage.removeItem('current_license');
                    }
                    
                    // Only clear messages if explicitly requested
                    if (clearMessages) {
                        setError('');
                        setSuccess('');
                    }
                } else {
                    console.log('Server response:', response.data.message);
                    // Don't show error for "no license found" - that's normal
                    if (!response.data.message.includes('No active license found')) {
                        setError(response.data.message);
                    }
                }
            } catch (error) {
                // If no license is found, that's okay - just ignore
                if (error.response?.status !== 404 && error.response?.status !== 400) {
                    console.log('License info not available:', error.message);
                } else {
                    console.log('No license found - this is normal if no license is activated');
                }
            }
        } catch (error) {
            console.error('Unexpected error in loadCurrentLicense:', error);
        }
    };

    const validateCurrentLicense = async () => {
        if (!currentLicense?.license_key) {
            console.log('No license to validate');
            return;
        }

        console.log('Validating license:', currentLicense.license_key);

        try {
            // Get hardware fingerprint (web-only version)
            const hardwareFingerprint = generateBrowserFingerprint();

            console.log('Sending validation request with hardware ID:', hardwareFingerprint.substring(0, 16) + '...');

            const response = await axios.post('/api/license/verify', {
                license_key: currentLicense.license_key,
                hardware_id: hardwareFingerprint,
            });

            console.log('Validation response:', response.data);

            if (response.data.success && response.data.license) {
                // Update license state with server-validated data
                setCurrentLicense(response.data.license);
                localStorage.setItem('current_license', JSON.stringify(response.data.license));
                
                // Show expiration message if expired
                if (!response.data.valid && response.data.message.includes('expired')) {
                    setError('License has expired. Please renew your license.');
                    // Store expiration info in session for backup-only mode
                    sessionStorage.setItem('license_expired', 'true');
                    sessionStorage.setItem('license_expired_message', response.data.message);
                } else if (response.data.valid) {
                    // Clear any previous expiration messages
                    if (response.data.message.includes('valid')) {
                        setSuccess('License is valid');
                    }
                }
            }
        } catch (error) {
            console.error('License validation failed:', error);
            setError('License validation failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleActivateLicense = async () => {
        if (!licenseKey.trim()) {
            setError('Please enter a license key');
            return;
        }

        // Validate license key format (XXXX-XXXX-XXXX-XXXX)
        const licensePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!licensePattern.test(licenseKey.toUpperCase())) {
            setError('Invalid license key format. Please use format: XXXX-XXXX-XXXX-XXXX');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // For web environment, use browser fingerprint
            const hardwareFingerprint = generateBrowserFingerprint();
            const machineId = hardwareFingerprint.substring(0, 16).toUpperCase();

            console.log('Activating license:', {
                license_key: licenseKey.toUpperCase(),
                hardware_id: hardwareFingerprint,
                machine_id: machineId
            });

            const response = await axios.post('/api/license/activate', {
                license_key: licenseKey.toUpperCase(),
                hardware_id: hardwareFingerprint,
                machine_id: machineId,
                app_version: '1.0.0' // You can get this from package.json
            });

            console.log('Activation response:', response.data);

            if (response.data.success) {
                setSuccess(response.data.message || 'License activated successfully!');
                setCurrentLicense(response.data.license);
                
                // Store license data in localStorage for persistence
                if (response.data.license) {
                    localStorage.setItem('current_license', JSON.stringify(response.data.license));
                }
                
                // Don't clear the license key immediately to show success
                setTimeout(() => setLicenseKey(''), 2000);
                
                Swal.fire({
                    title: 'Success!',
                    text: response.data.message || 'License activated successfully!',
                    icon: 'success',
                });
            } else {
                setError(response.data.message || 'Activation failed');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to activate license';
            setError(message);
            console.error('Activation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateBrowserFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash).toString(16).padStart(64, '0');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ padding: { xs: '1rem', sm: '2rem' }, marginBottom: "1rem" }}>
                {/* Simple test to ensure component renders */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    License Management
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    
                    {notifications.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={`${notifications.length} Notifications`}
                                color="primary"
                                variant="outlined"
                                size="small"
                                onClick={() => setShowNotifications(!showNotifications)}
                                sx={{ cursor: 'pointer' }}
                            />
                            <IconButton 
                                size="small" 
                                onClick={clearNotifications}
                                title="Clear all notifications"
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {showNotifications && notifications.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                Notifications
                            </Typography>
                            <List dense>
                                {notifications.map((notification, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            {getNotificationIcon(notification.level)}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={notification.message}
                                            primaryTypographyProps={{ 
                                                color: getNotificationColor(notification.level) + '.main',
                                                variant: 'body2'
                                            }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                        <Chip 
                                            label={notification.type.replace('_', ' ').toUpperCase()}
                                            size="small"
                                            variant="outlined"
                                            color={getNotificationColor(notification.level)}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                )}

                <Grid container spacing={3}>
                    {/* License Activation */}
                    <Grid size={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Activate License
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="License Key"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                            helperText="Enter your license key in the format: XXXX-XXXX-XXXX-XXXX"
                            disabled={loading}
                        />
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleActivateLicense}
                                disabled={loading || !licenseKey.trim()}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Activating...' : 'Activate License'}
                            </Button>
                        </Box>
                    </Grid>

                    <Divider sx={{ width: '100%', my: 2 }} />

                    {/* Current License Status */}
                    <Grid size={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Current License Status
                        </Typography>
                        
                        {currentLicense ? (
                            <Box sx={{ 
                                p: 3, 
                                border: 1, 
                                borderColor: 'divider', 
                                borderRadius: 1,
                                backgroundColor: 'background.paper'
                            }}>
                                <Grid container spacing={2}>
                                    <Grid size={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            License Key
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {currentLicense.license_key}
                                        </Typography>
                                    </Grid>
                                    <Grid size={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Chip 
                                            label={currentLicense.is_active ? 'Active' : 'Inactive'}
                                            color={currentLicense.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid size={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Activated On
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(currentLicense.activated_at)}
                                        </Typography>
                                    </Grid>
                                    <Grid size={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Expires On
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(currentLicense.expires_at)}
                                        </Typography>
                                    </Grid>
                                    <Grid size={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Activations
                                        </Typography>
                                        <Typography variant="body1">
                                            {currentLicense.activation_count} / {currentLicense.max_activations}
                                        </Typography>
                                    </Grid>
                                    <Grid size={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            License Type
                                        </Typography>
                                        <Chip 
                                            label={currentLicense.is_trial ? 'Trial' : 'Full'}
                                            color={currentLicense.is_trial ? 'warning' : 'primary'}
                                            size="small"
                                        />
                                    </Grid>
                                    {currentLicense.customer_name && (
                                        <Grid size={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Customer Name
                                            </Typography>
                                            <Typography variant="body1">
                                                {currentLicense.customer_name}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {currentLicense.machine_id && (
                                        <Grid size={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Machine ID
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                                {currentLicense.machine_id}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                                
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                            loadCurrentLicense(true, true); // Clear messages and force refresh
                                            validateCurrentLicense(); // Also validate with server
                                        }}
                                        disabled={loading}
                                    >
                                        Refresh License Status
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ 
                                p: 3, 
                                border: 1, 
                                borderColor: 'divider', 
                                borderRadius: 1,
                                textAlign: 'center',
                                backgroundColor: 'background.default'
                            }}>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                    No license activated
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Enter a license key above to activate your license
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* License Backup Section */}
                    {currentLicense && (
                        <Grid size={12}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                License Backup
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Generate Backup
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Download a backup file of your license data
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={handleGenerateBackup}
                                            disabled={backupLoading}
                                            startIcon={backupLoading ? <CircularProgress size={16} /> : <FileDownload />}
                                            fullWidth
                                        >
                                            {backupLoading ? 'Generating...' : 'Download Backup'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    )}

                    {/* License Information */}
                    <Grid size={12}>
                        <Box sx={{ mt: 2, p: 2, borderRadius: 1, border: 1, borderColor: 'divider' }}>
                            <Typography variant="body2" color="text.primary">
                                <strong>Important:</strong> Keep your license key and backup files safe. 
                                They are required for license recovery and system migration.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid> 
            </Paper>
        </Box>
    );
};

export default LicenseSettings;
