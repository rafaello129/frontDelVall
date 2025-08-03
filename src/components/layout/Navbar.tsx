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
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar,
  ListItemButton,
  Stack,
  Chip,
  Badge
} from '@mui/material';
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
  PaymentOutlined as ExternalPaymentIcon,
  EventNoteOutlined as ProyeccionIcon,
  CommentOutlined as BitacoraIcon,
  AddCircleOutline as AddIcon,
  InsertChartOutlinedRounded,
  Notifications,
  Settings,
} from '@mui/icons-material';

interface NavLinkGroup {
  name: string;
  path: string;
  icon: React.ReactNode;
  show: boolean;
  badge?: string;
  children?: NavLink[];
}

interface NavLink {
  name: string;
  path: string;
  icon?: React.ReactNode;
  show: boolean;
  badge?: string;
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
      badge: 'New',
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
      ]
    },
    { 
      name: 'Cobranza', 
      path: '/cobranza', 
      icon: <PaymentIcon />, 
      show: isAuthenticated,
      children: [
        { name: 'Lista de Cobranza', path: '/cobranza', show: isAuthenticated },
        { name: 'Reporte de Cobranza', path: '/cobranza/reportes', show: isAuthenticated },
        { name: 'Reporte por Región', path: '/cobranza/reportes/region', show: isAuthenticated }
      ]
    },
    { 
      name: 'Proyecciones', 
      path: '/proyecciones', 
      icon: <ProyeccionIcon />, 
      show: isAuthenticated,
      children: [
        { name: 'Calendario de Proyecciones', path: '/proyecciones/calendario', show: isAuthenticated },
        { name: 'Lista de Proyecciones', path: '/proyecciones', show: isAuthenticated },
        { name: 'Nueva Proyección', path: '/proyecciones/nueva', icon: <AddIcon />, show: isAuthenticated },
        { name: 'Estadísticas', path: '/proyecciones/estadisticas', show: isAuthenticated },
        { name: 'Analítica', path: '/proyecciones/analitica', icon: <InsertChartOutlinedRounded />, show: isAuthenticated }
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
  ];

  const renderMobileDrawer = () => (
    <Box role="navigation" aria-label="Navegación principal">
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo.svg"
            alt="Logo Del Valle"
            style={{ height: 32, width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            Del Valle
          </Typography>
        </Box>
        <IconButton 
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
          edge="end"
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      
      {isAuthenticated && (
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              alt={user?.name || 'Usuario'} 
              src={user?.image || ''}
              sx={{ 
                width: 40, 
                height: 40,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
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
      
      <List component="nav" aria-label="Menú principal" sx={{ px: 1 }}>
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
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(59, 130, 246, 0.12) 100%)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(group.path) ? 'primary.main' : 'inherit' }}>
                      {group.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={group.name}
                      primaryTypographyProps={{
                        fontWeight: isActive(group.path) ? 600 : 400,
                      }}
                    />
                    {group.badge && (
                      <Chip 
                        label={group.badge} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 20,
                          backgroundColor: 'primary.main',
                          color: 'white',
                        }}
                      />
                    )}
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
                            borderRadius: 2,
                            ml: 2,
                            mr: 1,
                            mb: 0.5,
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {child.icon || group.icon}
                          </ListItemIcon>
                          <ListItemText primary={child.name} />
                          {child.badge && (
                            <Chip 
                              label={child.badge} 
                              size="small" 
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 18,
                              }}
                            />
                          )}
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
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(59, 130, 246, 0.12) 100%)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(group.path) ? 'primary.main' : 'inherit' }}>
                    {group.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={group.name}
                    primaryTypographyProps={{
                      fontWeight: isActive(group.path) ? 600 : 400,
                    }}
                  />
                  {group.badge && (
                    <Chip 
                      label={group.badge} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.7rem',
                        height: 20,
                        backgroundColor: 'primary.main',
                        color: 'white',
                      }}
                    />
                  )}
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

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="Abrir menú"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: 'text.primary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <RouterLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.svg"
              alt="Logo Del Valle"
              style={{ height: 32, width: 'auto' }}
            />
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ 
                ml: 1, 
                fontWeight: 'bold', 
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
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
                    '&:hover .submenu': { 
                      opacity: 1,
                      visibility: 'visible',
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  <Button
                    component={RouterLink}
                    to={group.path}
                    color="inherit"
                    sx={{
                      my: 1, 
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      color: isGroupActive ? 'primary.main' : 'text.primary',
                      backgroundColor: isGroupActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      fontWeight: isGroupActive ? 600 : 500,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                    startIcon={group.icon}
                    endIcon={group.badge ? (
                      <Chip 
                        label={group.badge} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 18,
                          backgroundColor: 'primary.main',
                          color: 'white',
                        }}
                      />
                    ) : null}
                  >
                    {group.name}
                  </Button>
                  <Box 
                    className="submenu"
                    sx={{ 
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      mt: 1,
                      zIndex: 1300,
                      opacity: 0,
                      visibility: 'hidden',
                      transform: 'translateY(-10px)',
                      transition: 'all 0.2s ease-in-out',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 2,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      width: 240,
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
                          px: 2,
                          borderRadius: 0,
                          color: isActive(child.path) ? 'primary.main' : 'text.primary',
                          backgroundColor: isActive(child.path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          fontWeight: isActive(child.path) ? 600 : 400,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                          }
                        }}
                        endIcon={child.badge ? (
                          <Chip 
                            label={child.badge} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.7rem',
                              height: 18,
                            }}
                          />
                        ) : null}
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
                  color="inherit"
                  sx={{
                    my: 1, 
                    mx: 0.5,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    color: isGroupActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isGroupActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    fontWeight: isGroupActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  startIcon={group.icon}
                  endIcon={group.badge ? (
                    <Chip 
                      label={group.badge} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.7rem',
                        height: 18,
                        backgroundColor: 'primary.main',
                        color: 'white',
                      }}
                    />
                  ) : null}
                >
                  {group.name}
                </Button>
              );
            })}
          </Box>
          
          {/* Desktop user actions */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated && (
              <>
                <IconButton
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                    }
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
                <IconButton
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                    }
                  }}
                >
                  <Settings />
                </IconButton>
              </>
            )}
            <AuthStatus />
          </Stack>
        </Toolbar>
      </AppBar> 
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        {renderMobileDrawer()}
      </Drawer>
      
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
    </>
  );
};

export default Navbar;