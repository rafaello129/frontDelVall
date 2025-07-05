import React, { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import AuthStatus from '../../features/auth/components/AuthStatus';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Badge,
  ListItemButton
} from '@mui/material';
// Import alpha as a separate function
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  People as PeopleIcon,
  AccountBalanceOutlined as BankIcon,
  ReceiptOutlined as InvoiceIcon,
  MonetizationOnOutlined as PaymentIcon,
  BarChartOutlined as ReportIcon,
  PaymentOutlined as ExternalPaymentIcon,
  AccessTimeOutlined as ExpiredIcon,
  InsertChartOutlinedRounded as StatisticsIcon,
  LocationOnOutlined as RegionIcon,
  EventNoteOutlined as ProyeccionIcon,
  CommentOutlined as BitacoraIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';

interface NavLinkGroup {
  name: string;
  path: string;
  icon: React.ReactNode;
  show: boolean;
  children?: NavLink[];
}

interface NavLink {
  name: string;
  path: string;
  icon?: React.ReactNode;
  show: boolean;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  // Close mobile drawer on location change
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  // Function to determine if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Toggle submenu
  const handleToggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Handle keyboard navigation for submenus
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, name: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleSubmenu(name);
    }
  };

  // Navigation structure with grouping and submenus
  const navigationGroups: NavLinkGroup[] = [
    { 
      name: 'Inicio', 
      path: '/', 
      icon: <HomeIcon />, 
      show: true 
    },
    { 
      name: 'Clientes', 
      path: '/clientes', 
      icon: <PeopleIcon />, 
      show: isAuthenticated,
      children: [
        { name: 'Lista de Clientes', path: '/clientes', show: isAuthenticated },
        { name: 'Nuevo Cliente', path: '/clientes/nuevo', show: isAuthenticated },
        { name: 'Reportes de Clientes', path: '/reportes/clientes', show: isAuthenticated }
      ]
    },
    { 
      name: 'Bancos', 
      path: '/bancos', 
      icon: <BankIcon />, 
      show: isAuthenticated 
    },
    { 
      name: 'Facturas', 
      path: '/facturas', 
      icon: <InvoiceIcon />, 
      show: isAuthenticated,
      children: [
        { name: 'Lista de Facturas', path: '/facturas', show: isAuthenticated },
      //  { name: 'Facturas Vencidas', path: '/facturas/vencidas', icon: <ExpiredIcon />, show: isAuthenticated }
      ]
    },
    { 
      name: 'Cobranza', 
      path: '/cobranza', 
      icon: <PaymentIcon />, 
      show: isAuthenticated,
      children: [
        { name: 'Lista de Cobranza', path: '/cobranza', show: isAuthenticated },
        { name: 'Reporte de Cobranza', path: '/cobranza/reportes', icon: <StatisticsIcon />, show: isAuthenticated },
        { name: 'Reporte por Región', path: '/cobranza/reportes/region', icon: <RegionIcon />, show: isAuthenticated }
      ]
    },
    { 
      name: 'Proyecciones', 
      path: '/proyecciones', 
      icon: <ProyeccionIcon />, 
      show: isAuthenticated,
      children: [
        { name: 'Lista de Proyecciones', path: '/proyecciones', show: isAuthenticated },
        { name: 'Nueva Proyección', path: '/proyecciones/nueva', icon: <AddIcon />, show: isAuthenticated }
      ]
    },
    { 
      name: 'Bitácora', 
      path: '/bitacora', 
      icon: <BitacoraIcon />, 
      show: isAuthenticated,
      children: [
        { name: 'Lista de Bitácora', path: '/bitacora', show: isAuthenticated },
        { name: 'Nueva Entrada', path: '/bitacora/nuevo', icon: <AddIcon />, show: isAuthenticated }
      ]
    },
    {
      name: 'Pagos Externos',
      path: '/pagos-externos',
      icon: <ExternalPaymentIcon />,
      show: isAuthenticated,
      children: [
        { name: 'Lista de Pagos', path: '/pagos-externos', show: isAuthenticated },
        { name: 'Nuevo Pago', path: '/pagos-externos/nuevo', show: isAuthenticated }
      ]
    },
    { 
      name: 'Reportes', 
      path: '/reportes/clientes', 
      icon: <ReportIcon />, 
      show: isAuthenticated 
    },
  ];

  const drawer = (
    <Box role="navigation" aria-label="Navegación principal">
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo.svg"
            alt="Logo Del Valle"
            style={{ height: 32, width: 'auto' }}
          />
          <Typography variant="h6" color="primary" sx={{ ml: 1, fontWeight: 'bold' }}>
            Del Valle
          </Typography>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      
      {isAuthenticated && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              alt={user?.name || 'Usuario'} 
              src={user?.image || ''}
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" noWrap>
                {user?.name || 'Usuario'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user?.email || ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      <Divider />
      
      <List component="nav" aria-label="Menú principal">
        {navigationGroups
          .filter(group => group.show)
          .map((group) => (
            <React.Fragment key={group.path}>
              {group.children ? (
                <Box>
                  <ListItemButton
                    onClick={() => handleToggleSubmenu(group.name)}
                    onKeyDown={(e) => handleKeyDown(e, group.name)}
                    selected={isActive(group.path)}
                    aria-expanded={openSubmenus[group.name]}
                    sx={{
                      borderLeft: isActive(group.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                      backgroundColor: isActive(group.path) ? alpha (theme.palette.primary.main, 0.1) : 'transparent'
                    }}
                  >
                    <ListItemIcon>
                      {group.icon}
                    </ListItemIcon>
                    <ListItemText primary={group.name} />
                    {openSubmenus[group.name] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={openSubmenus[group.name]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {group.children.filter(child => child.show).map((child) => (
                        <ListItemButton
                          key={child.path}
                          component={RouterLink}
                          to={child.path}
                          selected={isActive(child.path)}
                          sx={{ 
                            pl: 4,
                            borderLeft: isActive(child.path) ? `4px solid ${theme.palette.secondary.main}` : '4px solid transparent',
                            backgroundColor: isActive(child.path) ? alpha(theme.palette.secondary.main, 0.1) : 'transparent'
                          }}
                        >
                          <ListItemIcon>
                            {child.icon || group.icon}
                          </ListItemIcon>
                          <ListItemText primary={child.name} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              ) : (
                <ListItemButton
                  component={RouterLink}
                  to={group.path}
                  selected={isActive(group.path)}
                  sx={{
                    borderLeft: isActive(group.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                    backgroundColor: isActive(group.path) ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                  }}
                >
                  <ListItemIcon>
                    {group.icon}
                  </ListItemIcon>
                  <ListItemText primary={group.name} />
                </ListItemButton>
              )}
            </React.Fragment>
          ))}
      </List>
      {isMobile && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <AuthStatus />
        </Box>
      )}
    </Box>
  );

  // Import alpha for transparency effects
  

  return (
    <>
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={1} 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Abrir menú"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <RouterLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.svg"
              alt="Logo Del Valle"
              style={{ height: 32, width: 'auto' }}
            />
            <Typography variant="h6" color="primary" sx={{ ml: 1, fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
              Del Valle
            </Typography>
          </RouterLink>
          
          {/* Desktop navigation */}
          <Box sx={{ ml: 4, flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navigationGroups.filter(group => group.show).map((group) => {
              const isGroupActive = isActive(group.path);
              
              return group.children ? (
                <Box 
                  key={group.path} 
                  sx={{ 
                    position: 'relative',
                    display: 'inline-block',
                    '&:hover .MuiBox-root': { 
                      display: 'block' 
                    }
                  }}
                >
                  <Button
                    component={RouterLink}
                    to={group.path}
                    color={isGroupActive ? 'primary' : 'inherit'}
                    sx={{
                      my: 2, 
                      mx: 1,
                      borderBottom: isGroupActive ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                    startIcon={group.icon}
                    aria-haspopup="true"
                  >
                    {group.name}
                  </Button>
                  <Box 
                    className="MuiBox-root"
                    sx={{ 
                      display: 'none',
                      position: 'absolute', 
                      zIndex: 1000,
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      borderRadius: 1,
                      width: 220,
                      overflow: 'hidden'
                    }}
                  >
                    {group.children.filter(child => child.show).map(child => (
                      <Button
                        key={child.path}
                        component={RouterLink}
                        to={child.path}
                        fullWidth
                        startIcon={child.icon || group.icon}
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          py: 1.5,
                          color: isActive(child.path) ? 'primary.main' : 'text.primary',
                          bgcolor: isActive(child.path) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04)
                          }
                        }}
                      >
                        {child.name}
                      </Button>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Button
                  key={group.path}
                  component={RouterLink}
                  to={group.path}
                  color={isGroupActive ? 'primary' : 'inherit'}
                  sx={{
                    my: 2, 
                    mx: 1,
                    borderBottom: isGroupActive ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                  startIcon={group.icon}
                >
                  {group.name}
                </Button>
              );
            })}
          </Box>
          
          {/* Auth status for desktop */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <AuthStatus />
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile drawer */}
      {/* <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: isMobile ? 'none' : 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            marginTop: '64px', // Adjust based on AppBar height
            height: 'calc(100% - 64px)'
          },
        }}
      >
        {drawer}
      </Drawer> */}
      
      {/* Add margin to content to accommodate fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;