import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import ClienteList from '../components/ClienteList';
import ClienteFilter from '../components/ClienteFilter';
import type { FilterClienteDto } from '../types';
import { motion } from 'framer-motion';
import { 
  Box, Typography, Paper, Button, Divider, Breadcrumbs,
  Link as MuiLink, useTheme, Collapse, IconButton,
  Alert, Fab, Tooltip, alpha, Container, Stack,
  Badge, Card, CardContent, CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  BarChart as BarChartIcon,
  FilterList as FilterListIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  InsertChartOutlinedSharp,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import {usePapaParse} from 'react-papaparse';
import CsvReader from '../components/csvReader';

const ClientesPage: React.FC = () => {
  const theme = useTheme();
  const { getAllClientes, resetError, setPagination, clientes, isLoading, error } = useCliente();
  const [filters, setFilters] = useState<FilterClienteDto>({});
  const [showFilters, setShowFilters] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force filter component refresh
  
  useEffect(() => {
    setPagination(10,10);
    resetError();
    getAllClientes(filters);
  }, []);

  const handleFilter = (newFilters: FilterClienteDto) => {
    setFilters(newFilters);
    getAllClientes(newFilters);
  };

  const handleRefresh = () => {
    getAllClientes(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setRefreshKey(prev => prev + 1);
    getAllClientes({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Counters
  const activeClients = clientes?.filter(cliente => cliente.status === 'Activo').length || 0;
  const suspendedClients = clientes?.filter(cliente => cliente.status === 'Suspendido').length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
          >
            <MuiLink 
              component={Link} 
              to="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                fontWeight: 500,
                '&:hover': { color: theme.palette.primary.dark }
              }}
            >
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Inicio
            </MuiLink>
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
              Clientes
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold" 
                color="text.primary"
                sx={{ mb: 0.5 }}
              >
                Gestión de Clientes
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Administre, filtre y exporte la información de sus clientes
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1.5,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                variant="outlined"
                onClick={toggleFilters}
                startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>

              <Button
                component={Link}
                to="/clientes/csv"
                variant="outlined"
                color="secondary"
                startIcon={<BarChartIcon />}
                sx={{ 
                  whiteSpace: 'nowrap', 
                  display: { xs: 'none', sm: 'flex' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Subir CSV
              </Button>
              
              <Button
                component={Link}
                to="/clientes/nuevo"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  whiteSpace: 'nowrap',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2
                }}
              >
                Nuevo Cliente
              </Button>
              
              <Button
                component={Link}
                to="/clientes/excel"
                variant="outlined"
                startIcon={<InsertChartOutlinedSharp />}
                sx={{ 
                  whiteSpace: 'nowrap',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Exportar Excel
              </Button>
            </Box>
          </Box>



          {/* Filters */}
          <Collapse in={showFilters}>
            <Paper 
              elevation={1}
              sx={{ 
                p: 3, 
                mb: 4,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon color="primary" />
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    Filtrar Clientes
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="small" 
                    startIcon={<RefreshIcon />} 
                    onClick={handleRefresh}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Actualizar
                  </Button>
                  
                  <Button 
                    variant="text" 
                    color="inherit" 
                    size="small" 
                    onClick={handleClearFilters}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </Stack>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <ClienteFilter 
                key={refreshKey}
                onFilter={handleFilter} 
                initialFilters={filters} 
              />
            </Paper>
          </Collapse>
          
          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Client List */}
          <ClienteList filters={filters} />
          
          {/* Floating refresh button */}
          <Tooltip title="Actualizar datos">
            <Fab 
              color="primary" 
              size="medium" 
              aria-label="refresh"
              onClick={handleRefresh}
              sx={{ 
                position: 'fixed',
                bottom: 24,
                right: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <RefreshIcon />
            </Fab>
          </Tooltip>
        </Box>

                  {/* Stats Cards */}
                  <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 3,
            mb: 4
          }}>
            {/* Total Clients */}
            <Card sx={{ 
              flex: '1 1 0',
              minWidth: { xs: '100%', sm: '200px', md: '180px' },
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Clientes
                    </Typography>
                    <Typography fontWeight="bold" color="text.primary">
                      {isLoading ? <CircularProgress size={24} /> : clientes?.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PeopleIcon 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.primary.main 
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Active Clients */}
            <Card sx={{ 
              flex: '1 1 0',
              minWidth: { xs: '100%', sm: '200px', md: '180px' },
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Clientes Activos
                    </Typography>
                    <Typography fontWeight="bold" color="success.main">
                      {isLoading ? <CircularProgress size={24} /> : activeClients}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BusinessIcon 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.success.main 
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Suspended Clients */}
            <Card sx={{ 
              flex: '1 1 0',
              minWidth: { xs: '100%', sm: '200px', md: '180px' },
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Clientes Suspendidos
                    </Typography>
                    <Typography fontWeight="bold" color="warning.main">
                      {isLoading ? <CircularProgress size={24} /> : suspendedClients}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DashboardIcon 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.warning.main 
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
      </Container>
    </motion.div>
  );
};

export default ClientesPage;