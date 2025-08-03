import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  Alert,
  Stack,
  Fade,
  Divider,
  Chip,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  BarChart, 
  TableChart, 
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  NavigateNext as NavigateNextIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchPagosExternos,
  deletePagoExterno,
  selectPagosExternos,
  selectPagosExternosLoading,
  selectPagosExternosError,
  fetchEstadisticasPorTipo,
  fetchEstadisticasPorSucursal,
  selectEstadisticasPorTipo,
  selectEstadisticasPorSucursal,
  selectEstadisticasMetadata
} from '../pagoExternoSlice';
import { PagoExternoList } from '../components/PagoExternoList';
import { PagoExternoFilters } from '../components/PagoExternoFilters';
import { PagoExternoEstadisticas } from '../components/PagoExternoEstadisticas';
import type { FilterPagoExternoDto, EstadisticasOptions } from '../types';
import { toast } from 'react-toastify';

export const PagoExternoListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const pagosExternos = useAppSelector(selectPagosExternos);
  const isLoading = useAppSelector(selectPagosExternosLoading);
  const error = useAppSelector(selectPagosExternosError);
  const estadisticasPorTipo = useAppSelector(selectEstadisticasPorTipo);
  const estadisticasPorSucursal = useAppSelector(selectEstadisticasPorSucursal);
  const estadisticasMetadata = useAppSelector(selectEstadisticasMetadata);
  
  const [filters, setFilters] = useState<FilterPagoExternoDto>({
    limit: 10,
    skip: 0,
    sortBy: 'fechaPago',
    order: 'desc',
    incluirCliente: true,
    incluirBanco: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    pagoId: null as number | null,
    isDeleting: false
  });
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'statistics'>('list');
  const [showFilters, setShowFilters] = useState(true);
  const [estadisticasOptions, setEstadisticasOptions] = useState<EstadisticasOptions>({
    fechaDesde: new Date(new Date().setDate(new Date().getDate() - 30)),
    fechaHasta: new Date(),
    incluirDetalle: true,
    agruparPor: 'mes',
    moneda: 'MXN',
    compararConPeriodoAnterior: 30
  });

  // Cargar pagos al inicio o cuando cambien los filtros
  useEffect(() => {
    dispatch(fetchPagosExternos(filters))
      .unwrap()
      .then(response => {
        setTotalItems(response.total);
      })
      .catch(error => {
        toast.error('Error al cargar los pagos externos');
      });
  }, [dispatch, filters]);

  // Cargar estadísticas cuando se cambia a esa vista
  useEffect(() => {
    if (viewMode === 'statistics') {
      loadStatistics();
    }
  }, [dispatch, viewMode]);

  // Mostrar error si hay alguno
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadStatistics = () => {
    dispatch(fetchEstadisticasPorTipo(estadisticasOptions));
    dispatch(fetchEstadisticasPorSucursal(estadisticasOptions));
  };

  const handleEstadisticasOptionsChange = (newOptions: EstadisticasOptions) => {
    setEstadisticasOptions(prev => ({
      ...prev,
      ...newOptions
    }));
    
    // If the options are changed, reload the statistics
    dispatch(fetchEstadisticasPorTipo({
      ...estadisticasOptions,
      ...newOptions
    }));
    dispatch(fetchEstadisticasPorSucursal({
      ...estadisticasOptions,
      ...newOptions
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      skip: (page - 1) * prev.limit!
    }));
  };

  const handleFilterChange = (newFilters: FilterPagoExternoDto) => {
    setCurrentPage(1);
    setFilters({
      ...newFilters,
      limit: filters.limit,
      skip: 0,
      incluirCliente: true,
      incluirBanco: true
    });
  };

  const handleViewDetails = (id: number) => {
    navigate(`/pagos-externos/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/pagos-externos/editar/${id}`);
  };

  const handleDelete = (id: number) => {
    setDeleteDialog({
      open: true,
      pagoId: id,
      isDeleting: false
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.pagoId) {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      
      dispatch(deletePagoExterno(deleteDialog.pagoId))
        .unwrap()
        .then(() => {
          toast.success('Pago externo eliminado exitosamente');
          // Actualizar lista después de eliminar
          dispatch(fetchPagosExternos(filters));
        })
        .catch(error => {
          toast.error('Error al eliminar el pago externo');
        })
        .finally(() => {
          setDeleteDialog({
            open: false,
            pagoId: null,
            isDeleting: false
          });
        });
    }
  };

  // Calcular totales para los cards de resumen
  const totalMonto = pagosExternos.reduce((sum, pago) => sum + pago.monto, 0);
  const totalUSD = pagosExternos.reduce((sum, pago) => sum + (pago.montoDolares || 0), 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Stack spacing={3} mb={4}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link 
              component={RouterLink}
              to="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                '&:hover': { color: theme.palette.primary.dark },
                fontWeight: 500,
              }}
            >
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Inicio
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
              }}
            >
              <MoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
              Pagos Externos
            </Typography>
          </Breadcrumbs>
          
          {/* Page Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                Pagos Externos
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                Administre y analice todos los pagos externos del sistema
              </Typography>
            </Box>
            
            <Button
              component={RouterLink}
              to="/pagos-externos/nuevo"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.25
              }}
            >
              Nuevo Pago Externo
            </Button>
          </Box>
        </Stack>
        
        {/* Summary Cards */}


        {/* View Mode Tabs */}
        <Paper 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={viewMode}
            onChange={(_, newValue) => setViewMode(newValue)}
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': {
                minHeight: 56,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem'
              },
            }}
          >
            <Tab
              value="list"
              label="Lista de Pagos"
              icon={<TableChart />}
              iconPosition="start"
            />
            <Tab
              value="statistics"
              label="Estadísticas"
              icon={<BarChart />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>
        
        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Content Based on View Mode */}
        {viewMode === 'list' && (
          <Fade in={viewMode === 'list'}>
            <Box>
              {/* Filters Section */}
              <Box sx={{ mb: 3 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterListIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Filtros de Búsqueda
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="text" 
                      color="inherit"
                      startIcon={<RefreshIcon />}
                      onClick={() => {
                        dispatch(fetchPagosExternos(filters));
                        toast.info('Actualizando lista de pagos');
                      }}
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
                      onClick={() => setShowFilters(!showFilters)}
                      startIcon={<SearchIcon />}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </Button>
                  </Box>
                </Box>
                
                {showFilters && (
                  <Paper 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                    }}
                  >
                    <PagoExternoFilters
                      onFilter={handleFilterChange}
                      initialFilters={filters}
                    />
                  </Paper>
                )}
              </Box>
              {!isLoading && pagosExternos.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 3,
            mb: 4
          }}>
            {/* Total Pagos */}
            <Card sx={{ 
              flex: '1 1 0',
              minWidth: { xs: '100%', sm: '180px' },
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
                      Total Pagos
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {pagosExternos.length}
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
                    <MoneyIcon 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.primary.main 
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Total MXN */}
            <Card sx={{ 
              flex: '1 1 0',
              minWidth: { xs: '100%', sm: '180px' },
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
                      Total (MXN)
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ${totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Chip 
                    label="MXN" 
                    color="success" 
                    variant="filled" 
                    sx={{ 
                      fontWeight: 'bold',
                      px: 1
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Total USD */}
            <Card sx={{ 
              flex: '1 1 0',
              minWidth: { xs: '100%', sm: '180px' },
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
                      Total (USD)
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      ${totalUSD.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Chip 
                    label="USD" 
                    color="info" 
                    variant="filled" 
                    sx={{ 
                      fontWeight: 'bold',
                      px: 1
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
              {/* List Content */}
              <Paper 
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                {isLoading && (
                  <Box sx={{ 
                    width: '100%',
                    height: 4,
                    bgcolor: theme.palette.background.paper,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box
                      sx={{
                        width: '30%',
                        height: '100%',
                        bgcolor: theme.palette.primary.main,
                        position: 'absolute',
                        animation: 'progressAnimation 1.5s infinite',
                        '@keyframes progressAnimation': {
                          '0%': {
                            left: '-30%',
                          },
                          '100%': {
                            left: '100%',
                          },
                        },
                      }}
                    />
                  </Box>
                )}
                
                <PagoExternoList
                  pagosExternos={pagosExternos}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentPage={currentPage}
                  pageSize={filters.limit}
                  isLoading={isLoading}
                />
              </Paper>
            </Box>
          </Fade>
        )}

        {viewMode === 'statistics' && (
          <Fade in={viewMode === 'statistics'}>
            <Box>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <PagoExternoEstadisticas
                  estadisticasPorTipo={estadisticasPorTipo}
                  estadisticasPorSucursal={estadisticasPorSucursal}
                  estadisticasMetadata={estadisticasMetadata}
                  options={estadisticasOptions}
                  onOptionsChange={handleEstadisticasOptionsChange}
                  isLoading={isLoading}
                />
              </Paper>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteDialog.isDeleting && setDeleteDialog({ ...deleteDialog, open: false })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 450
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6" fontWeight="bold">
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', mb: 2 }}>
            ¿Está seguro de que desea eliminar este pago externo? Esta acción no se puede deshacer y eliminará todos los datos asociados.
          </DialogContentText>
          <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
            Los datos eliminados no podrán ser recuperados posteriormente.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
            disabled={deleteDialog.isDeleting}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error"
            variant="contained"
            disabled={deleteDialog.isDeleting}
            startIcon={deleteDialog.isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {deleteDialog.isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
      
    </Container>
  );
};