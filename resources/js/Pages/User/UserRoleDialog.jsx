import * as React from 'react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormGroup, FormControlLabel, Switch,  Grid } from '@mui/material';
import Swal from 'sweetalert2';



export default function UserRoleDialog({ open, handleClose, user_role }) {
  const [formState, setFormState] = useState({
    user_role: '',
    permissions: [],
  });

  const permissions = [
    // Dashboard permissions
    "view_dashboard",
    "view_dashboard_analytics", 
    "view_dashboard_summary",
    "access_admin_tools",
    
    // POS permissions
    "view_pos",
    "see_cost_of_product",
    "discount_product",
    
        
        
        
        
        
        
        "view_vendor_balance_log",
    "update_vendor_balance",
    
        
        "add_salary",
    "update_balance",
    "view_employee_balance_log",
    "update_employee_balance",
        
    // Settings permissions
    "view_settings",
    "edit_settings",
    "update_settings",
    "shop_settings",
    "currency_settings",
    "receipt_settings",
    "template_settings",
    "view_templates",
    "edit_templates",
    "view_custom_css",
    "edit_custom_css",
    "manage_modules",
    "customer_report_settings",
    "barcode_settings",
    "misc_settings",
    "mail_settings",
    
    // Users & Roles permissions
    "view_users",
    "create_user",
    "edit_user",
    "delete_user",
    "deactivate_user",
    "view_roles",
    "create_role",
    "edit_role",
    "delete_role",
    "manage_role_permissions",
    
        
    
    // Recovery
    "view_restore",
                        "restore_users",
    "permanent_delete",
  ];

  useEffect(() => {
    if (user_role) {
      setFormState({
        user_role: user_role.name || '', // Set the user role from the user data
        permissions: user_role.permissions?.map(p => p.name) || [],
      });
    } else {
      setFormState({
        user_role: '', // Default to an empty string
        permissions: [], // Default to no permissions
      });
    }
  }, [user_role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePermissionChange = (event) => {
    const { value, checked } = event.target;
    setFormState((prevState) => {
      const permissions = checked
        ? [...prevState.permissions, value]
        : prevState.permissions.filter(permission => permission !== value);
      return { ...prevState, permissions };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const endpoint = user_role ? `/user/${user_role.id}/role` : '/user/role';

    router.post(endpoint, formState, {
      onSuccess: (resp) => {
        const responseMessage = resp.props.flash?.message || 'User role and permissions updated!';

        Swal.fire({
          title: 'Success!',
          text: responseMessage,
          icon: 'success',
          position: 'bottom-start',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
        });
        handleClose(); // Close dialog on success
      },
      onError: (errors) => {
        const errorMessages = Object.values(errors).flat().join(' | ');
        Swal.fire({
          title: 'Error!',
          text: errorMessages || 'An unexpected error occurred.',
          icon: 'error',
          confirmButtonText: 'OK',
          timerProgressBar: true,
        });
      },
    });
  };

  const isMobile = window.innerWidth < 768;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={'sm'}
      fullWidth={true}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
      fullScreen={isMobile}
    >
      <DialogTitle>User Role and Permissions</DialogTitle>
      <DialogContent>
        {/* User Role - TextField */}
        <TextField
          className="py-8"
          required
          margin="dense"
          id="user_role"
          name="user_role"
          label="User Role"
          type="text"
          fullWidth
          variant="outlined"
          value={formState.user_role}
          onChange={handleChange}
          disabled={formState.user_role === 'admin' || formState.user_role === 'super-admin'}
        />

        <FormGroup sx={{ mt: '1rem' }}>
          <h4>Permissions</h4>
          <Grid container spacing={2}>
            {permissions.map((permission, index) => (
              <Grid
                key={index}
                size={{xs:6, sm:4}}
              >
                <FormControlLabel
                sx={{textTransform: "capitalize"}}
                  control={
                    <Switch
                      checked={formState.permissions.includes(permission)} // Check if permission is in the list
                      onChange={handlePermissionChange}
                      value={permission}  // Permission ID as value
                      name="permissions"
                    />
                  }
                  label={permission} // Display permission name
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">SAVE</Button>
      </DialogActions>
    </Dialog>
  );
}
