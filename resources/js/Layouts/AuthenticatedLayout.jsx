import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { MenuItem, Avatar, Menu } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import RestoreIcon from '@mui/icons-material/Restore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QuickNotes from "@/Components/QuickNotes/QuickNotes";
import arsasoft_logo from "@/arsasoft.png";
const drawerWidth = 240;

function AuthenticatedLayout({ header, children, ...props }) {
    const user = usePage().props.auth.user;
    const site_name = usePage().props.settings.site_name;
    const modules = usePage().props.modules;
    const pageLabel = usePage().props.pageLabel;
    const pathname = usePage().url;
    const permissions = usePage().props.userPermissions || [];
    const profilePictureUrl = user?.profile_picture_url || "";

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const userMenuOpen = Boolean(anchorEl);
    const [open, setOpen] = useState(true); // Drawer open state for desktop (always true for permanent drawer)

    useEffect(() => {
        const childDiv = document.querySelector(".scrollParent");
        if (childDiv) {
            childDiv.setAttribute("data-custom-attribute", "value");
        }
    }, []);

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const [collapse, setCollapse] = useState(false);
    const [highlightParent, setHighlightParent] = useState(false);
    const handleCollapse = () => {
        setCollapse(!collapse);
        setHighlightParent(true);
    };

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleUserMenuClose();
        router.post(document.location.origin + "/logout");
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (user?.name) {
            const names = user.name.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[names.length - 1][0]).toUpperCase();
            }
            return user.name.substring(0, 2).toUpperCase();
        }
        return user?.email?.substring(0, 2).toUpperCase() || 'U';
    };

    //Logic to selected menu item
    // const isSelected = (href) => pathname === href || pathname.startsWith(href + '/');
    const isSelected = (href) => {
        const baseHref = href.split("?")[0]; // Extract the base path by removing query parameters
        return pathname === baseHref || pathname.startsWith(baseHref);
    };

    const NavItem = ({ href, icon: Icon, label, open, selected, onClick, icontype }) => (
        <Link preserveScroll href={href}>
            <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                    selected={selected}
                    sx={[
                        {
                            minHeight: 48,
                            px: 2.5,
                            transition: "all 0.2s ease-in-out",

                            // 🔹 Base style for all items
                            color: (theme) => theme.palette.text.primary,
                            "& .MuiListItemIcon-root": {
                                color: (theme) => theme.palette.text.secondary,
                            },

                            // 🔹 Hover — same for all items
                            "&:hover": {
                                color: (theme) => theme.palette.primary.contrastText,
                                backgroundColor: (theme) => theme.palette.primary.light,
                                "& .MuiListItemIcon-root": {
                                    color: (theme) => theme.palette.primary.contrastText,
                                },
                            },

                            // 🔹 Selected — visually stronger (but distinct from hover)
                            "&.Mui-selected": {
                                color: (theme) => theme.palette.primary.contrastText,
                                backgroundColor: (theme) => theme.palette.primary.main,
                                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                                boxShadow: (theme) =>
                                    `inset 3px 0 0 ${theme.palette.primary.dark}`, // left highlight bar effect
                                "& .MuiListItemIcon-root": {
                                    color: (theme) => theme.palette.primary.contrastText,
                                },

                                // 🔹 Keep hover behavior consistent even when selected
                                "&:hover": {
                                    backgroundColor: (theme) => theme.palette.primary.dark,
                                },
                            },
                        },
                        open ? { justifyContent: "initial" } : { justifyContent: "center" },
                    ]}

                    onClick={onClick}
                >
                    <ListItemIcon
                        sx={[
                            {
                                minWidth: 0,
                                justifyContent: "center",
                            },
                            open ? { mr: 3 } : { mr: "auto" },
                        ]}
                    >
                        {icontype && icontype === 'fa' ? (
                            <FontAwesomeIcon icon={Icon} size="xl" />
                        ) : (
                            Icon && <Icon />
                        )}
                    </ListItemIcon>
                    <ListItemText
                        primary={label}
                        sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                    />
                </ListItemButton>
            </ListItem>
        </Link>
    );

    const drawer = (
        <>
            <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
                <img
                    src={arsasoft_logo}
                    style={{ objectFit: "contain", height: "100%" }}
                ></img>
            </Toolbar>
            <Divider />
            <List>
                {permissions.includes("view_dashboard") && (
                    <NavItem
                        href="/dashboard"
                        icon={DashboardIcon}
                        label="Dashboard"
                        open={open}
                        selected={isSelected("/dashboard")}
                    />
                )}

                {permissions.includes("view_settings") && (
                    <NavItem
                        href="/settings"
                        icon={SettingsIcon}
                        label="Settings"
                        open={open}
                        selected={isSelected("/settings")}
                    />
                )}
                {permissions.includes("view_restore") && (
                    <NavItem
                        href="/restore"
                        icon={RestoreIcon}
                        label="Recovery Center"
                        open={open}
                        selected={isSelected("/restore")}
                    />
                )}
                <NavItem
                    href="/profile"
                    icon={ManageAccountsIcon}
                    label="Profile"
                    open={open}
                    selected={isSelected("/profile")}
                />
                { permissions.includes("view_users") && (
                    <>
                        <ListItemButton
                            onClick={handleCollapse}
                            selected={
                                isSelected("/users") ||
                                isSelected("/user/role")
                            }
                        >
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Users" />

                            {(collapse ||
                                isSelected("/users") ||
                                isSelected("/user/role")) ? (
                                <ExpandLess />
                            ) : (
                                <ExpandMore />
                            )}
                        </ListItemButton>

                        <Collapse
                            in={
                                collapse ||
                                isSelected("/users") ||
                                isSelected("/user/role")
                            }
                            timeout="auto"
                            unmountOnExit
                        >
                            <List component="div" disablePadding>
                                {permissions.includes("view_users") && (
                                    <NavItem
                                        href="/users"
                                        icon={null}
                                        label="All Users"
                                        open={open}
                                        selected={isSelected("/users")}
                                    />
                                )}

                                {permissions.includes("view_roles") && (
                                    <NavItem
                                        href="/user/role"
                                        icon={null}
                                        label="User Roles"
                                        open={open}
                                        selected={isSelected("/user/role")}
                                    />
                                )}
                            </List>
                        </Collapse>
                    </>
                )}

                <NavItem
                    href={"#"}
                    icon={LogoutIcon}
                    label="Logout"
                    open={open}
                    onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        router.post(document.location.origin + "/logout"); // Call your logout function here
                    }}
                />
            </List>
        </>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: { xs: 1, sm: 2 }, display: { sm: "none" } }}
                    >
                        <MenuIcon fontSize="large" />
                    </IconButton>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: { xs: 1, sm: 2 },
                        }}
                    >
                        <Typography
                            variant="h5"
                            noWrap
                            component="div"
                            sx={{
                                textTransform: "capitalize",
                                fontSize: { xs: "0.875rem", sm: "1.25rem", md: "1.5rem" },
                                flex: { xs: 1, sm: 'none' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                            }}
                        >
                            {site_name ? `${site_name} | ` : ''}{pageLabel}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <Tooltip title={user?.name || user?.email || "User"} arrow>
                                <IconButton
                                    onClick={handleUserMenuOpen}
                                    size="small"
                                    sx={{
                                        p: { xs: 0.5, sm: 1 },
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        },
                                        transition: 'transform 0.2s',
                                    }}
                                >
                                    <Avatar
                                        src={profilePictureUrl || undefined}
                                        sx={{
                                            width: { xs: 32, sm: 40 },
                                            height: { xs: 32, sm: 40 },
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: { xs: '0.75rem', sm: '1rem' },
                                            border: '2px solid',
                                            borderColor: 'white',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        }}
                                    >
                                        {!profilePictureUrl && getUserInitials()}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorEl={anchorEl}
                                open={userMenuOpen}
                                onClose={handleUserMenuClose}
                                onClick={handleUserMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                PaperProps={{
                                    sx: {
                                        mt: 1.5,
                                        minWidth: { xs: 180, sm: 200 },
                                        maxWidth: { xs: '90vw', sm: 'none' },
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    }
                                }}
                                sx={{
                                    '& .MuiPaper-root': {
                                        maxHeight: { xs: 'calc(100vh - 100px)', sm: 'none' },
                                    }
                                }}
                            >
                                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        {user?.name || 'User'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        {user?.email || ''}
                                    </Typography>
                                </Box>
                                <MenuItem
                                    component={Link}
                                    href="/profile"
                                    onClick={handleUserMenuClose}
                                    sx={{ py: { xs: 1, sm: 1.5 } }}
                                >
                                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                                        <ManageAccountsIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Profile"
                                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                    />
                                </MenuItem>
                                {permissions.includes("settings") && (
                                    <MenuItem
                                        component={Link}
                                        href="/settings"
                                        onClick={handleUserMenuClose}
                                        sx={{ py: { xs: 1, sm: 1.5 } }}
                                    >
                                        <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                                            <SettingsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Settings"
                                            primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                        />
                                    </MenuItem>
                                )}
                                <Divider />
                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{
                                        color: 'error.main',
                                        py: { xs: 1, sm: 1.5 }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                                        <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Logout"
                                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                    />
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                    open
                    classes={{
                        paper: "scrollParent", // Adds class to the child div
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 2,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                {children}
            </Box>

            {/* Quick Notes Feature - Available on all pages */}
            <QuickNotes />
        </Box>
    );
}

export default AuthenticatedLayout;
