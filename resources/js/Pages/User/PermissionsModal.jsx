import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helper function to convert key to string (matches PHP keyToString)
const keyToString = (key) => {
  if (!key) return '';
  return key.replace(/[_-]/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function PermissionsModal({ open, onClose, role, permissionGroups }) {
  const theme = useTheme();

  if (!role || !role.permissions) {
    return null;
  }

  // Group permissions by their group
  const groupedPermissions = {};
  role.permissions.forEach(permission => {
    const group = permission.group || 'other';
    if (!groupedPermissions[group]) {
      groupedPermissions[group] = [];
    }
    groupedPermissions[group].push(permission);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SecurityIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Permissions for {role.name?.toUpperCase()}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${role.permissions.length} Permission${role.permissions.length !== 1 ? 's' : ''} Assigned`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 'medium', fontSize: '0.875rem' }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {Object.keys(groupedPermissions).map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{
                    mb: 1.5,
                    color: theme.palette.primary.main,
                    fontSize: '0.95rem',
                  }}
                >
                  {keyToString(group)}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {groupedPermissions[group].map((permission) => (
                    <Box
                      key={permission.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: theme.palette.action.hover,
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.action.selected,
                        },
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.success.main,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {permission.title || keyToString(permission.name)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {Object.keys(groupedPermissions).length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="body2">No permissions assigned</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ minWidth: 100 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

