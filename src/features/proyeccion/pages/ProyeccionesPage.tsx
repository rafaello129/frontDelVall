import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
    Tooltip,
  Stack,
  useTheme,
  alpha,
  Container,
  Chip,
  Card,
  CardContent,
  Alert,
  Divider,
  LinearProgress,
  CircularProgress,
  Collapse,
  Fade
} from '@mui/material';
import type { SelectChangeEvent} from '@mui/material/Select';
import { 
  Add as AddIcon, 
  FilterList as FilterListIcon, 
  Clear as ClearIcon,
  CalendarMonth as CalendarIcon,
  EventNote as EventNoteIcon,
  DateRange as DateRangeIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ProyeccionListItem } from '../components/ProyeccionListItem';
import { useProyecciones } from '../hooks/useProyecciones';
import { EstadoProyeccion } from '../types';

const ProyeccionesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { 
    proyecciones, 
    pagination, 
    isLoading, 
    error, 
    getAllProyecciones, 
    removeProyeccion, 
    setPaginationParams 
  } = useProyecciones();

  // Simplified Filter state
  const [filters, setFilters] = useState({
    fechaDesde: null as Date | null,
    fechaHasta: null as Date | null,
    estado: '' as EstadoProyeccion | '',
    searchTerm: '',
  });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    proyeccionId: 0,
    isDeleting: false
  });

  // Show filters state
  const [showFilters, setShowFilters] = useState(true);

  // Load initial data
  useEffect(() => {
    loadProyecciones();
  }, [pagination.page, pagination.limit]);

  // Load proyecciones with current filters
  const loadProyecciones = () => {
    // Convert Date | null to Date | undefined
    const appliedFilters = {
      page: pagination.page,
      limit: pagination.limit,
      estado: filters.estado || undefined,
      fechaDesde: filters.fechaDesde || undefined,
      fechaHasta: filters.fechaHasta || undefined,
      searchTerm: filters.searchTerm || undefined,
    };
    
    getAllProyecciones(appliedFilters);
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Select changes
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFilters(prev => ({ ...prev, [name as string]: value }));
    }
  };

  // Handle date filter changes
  const handleDateChange = (field: 'fechaDesde' | 'fechaHasta') => (date: Date | null) => {
    setFilters(prev => ({ ...prev, [field]: date }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPaginationParams(1); // Reset to first page
    loadProyecciones();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      fechaDesde: null,
      fechaHasta: null,
      estado: '',
      searchTerm: '',
    });
    setPaginationParams(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    event=event;
    setPaginationParams(value);
  };

  // Open delete dialog
  const handleDeleteClick = (id: number) => {
    setDeleteDialog({
      open: true,
      proyeccionId: id,
      isDeleting: false
    });
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      proyeccionId: 0,
      isDeleting: false
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      await removeProyeccion(deleteDialog.proyeccionId);
      handleCloseDeleteDialog();
      loadProyecciones(); // Reload after delete
    } catch (error) {
      console.error('Error al eliminar la proyección:', error);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Handle edit
  const handleEditClick = (id: number) => {
    navigate(`/proyecciones/${id}/editar`);
  };

  // Count proyecciones by status
  const pendienteCount = proyecciones.filter(p => p.estado === EstadoProyeccion.PENDIENTE).length;
  const procesadoCount = proyecciones.filter(p => p.estado === EstadoProyeccion.CUMPLIDA).length;

  // Active filter count
  const activeFilterCount = Object.values(filters).filter(v => 
    v !== '' && v !== null && v !== undefined
  ).length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Typography 
            variant="h4" 
            component="h1"
            fontWeight={700}
            color="text.primary"
          >
            Proyecciones de Pago
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Ver Calendario" arrow>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/proyecciones/calendario')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Vista Calendario
              </Button>
            </Tooltip>
            
            <Tooltip title={showFilters ? "Ocultar filtros" : "Mostrar filtros"} arrow>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {showFilters ? "Ocultar filtros" : "Filtros"}
                {activeFilterCount > 0 && (
                  <Chip 
                    label={activeFilterCount} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1, height: 20, minWidth: 20 }}
                  />
                )}
              </Button>
            </Tooltip>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/proyecciones/nueva')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2
              }}
            >
              Nueva Proyección
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        {!isLoading && proyecciones.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 3,
            mb: 4
          }}>
            {/* Total Proyecciones */}
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
                      Total Proyecciones
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {proyecciones.length}
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
                    <EventNoteIcon 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.primary.main 
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Pendientes */}
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
                      Pendientes
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {pendienteCount}
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
                    <DateRangeIcon 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.warning.main 
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Procesados */}
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
                      Procesados
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {procesadoCount}
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
                    <CalendarIcon 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.success.main 
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Simplified Filters Section */}
        <Collapse in={showFilters}>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2
            }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Filtros de Búsqueda
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={3}>
              <Box 
                display="flex" 
                gap={3} 
                flexWrap="wrap"
              >
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <DatePicker
                    label="Fecha Desde"
                    value={filters.fechaDesde}
                    onChange={handleDateChange('fechaDesde')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "medium",
                        variant: "outlined"
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <DatePicker
                    label="Fecha Hasta"
                    value={filters.fechaHasta}
                    onChange={handleDateChange('fechaHasta')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "medium",
                        variant: "outlined"
                      }
                    }}
                  />
                </Box>
              </Box>
              
              <Box 
                display="flex" 
                gap={3} 
                flexWrap="wrap"
              >
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="estado-label">Estado</InputLabel>
                    <Select
                      labelId="estado-label"
                      name="estado"
                      value={filters.estado}
                      onChange={handleSelectChange}
                      label="Estado"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {Object.values(EstadoProyeccion).map((estado) => (
                        <MenuItem key={estado} value={estado}>
                          {estado}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField
                    name="searchTerm"
                    label="Buscar por cliente"
                    fullWidth
                    variant="outlined"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Box>
              </Box>
              
              <Box 
                display="flex" 
                justifyContent="flex-end" 
                gap={2}
                flexWrap="wrap"
              >
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Limpiar Filtros
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleApplyFilters}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  Aplicar Filtros
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Collapse>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              mb: 2
            }}
          >
            {filters.fechaDesde && (
              <Chip 
                label={`Desde: ${filters.fechaDesde.toLocaleDateString()}`}
                color="primary"
                variant="outlined"
                onDelete={() => setFilters(prev => ({ ...prev, fechaDesde: null }))}
                sx={{ borderRadius: 2 }}
              />
            )}
            
            {filters.fechaHasta && (
              <Chip 
                label={`Hasta: ${filters.fechaHasta.toLocaleDateString()}`}
                color="primary"
                variant="outlined"
                onDelete={() => setFilters(prev => ({ ...prev, fechaHasta: null }))}
                sx={{ borderRadius: 2 }}
              />
            )}
            
            {filters.estado && (
              <Chip 
                label={`Estado: ${filters.estado}`}
                color="primary"
                variant="outlined"
                onDelete={() => setFilters(prev => ({ ...prev, estado: '' }))}
                sx={{ borderRadius: 2 }}
              />
            )}
            
            {filters.searchTerm && (
              <Chip 
                label={`Búsqueda: ${filters.searchTerm}`}
                color="primary"
                variant="outlined"
                onDelete={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
        )}

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

        {/* Loading state */}
        {isLoading && (
          <Paper 
            sx={{ 
              p: 0, 
              mb: 4, 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <LinearProgress />
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={40} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                Cargando proyecciones...
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Empty state */}
        {!isLoading && proyecciones.length === 0 && (
          <Fade in={true}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}
            >
              <CalendarIcon 
                sx={{ 
                  fontSize: 60, 
                  color: alpha(theme.palette.text.secondary, 0.5),
                  mb: 2 
                }} 
              />
              <Typography variant="h5" fontWeight="medium" color="text.primary" gutterBottom>
                No hay proyecciones disponibles
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}
              >
                {activeFilterCount > 0 
                  ? 'No se encontraron proyecciones con los filtros aplicados. Pruebe con otros criterios de búsqueda.' 
                  : 'Aún no hay proyecciones de pago registradas. Cree su primera proyección para empezar a gestionar pagos futuros.'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/proyecciones/nueva')}
                sx={{ 
                  mt: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1
                }}
              >
                Crear Primera Proyección
              </Button>
            </Paper>
          </Fade>
        )}

        {/* Results List */}
        {!isLoading && proyecciones.length > 0 && (
          <Paper 
            sx={{ 
              p: 0, 
              mb: 4, 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Resultados: {proyecciones.length} proyecciones
              </Typography>
            </Box>
            
            <List sx={{ p: 0 }}>
              {proyecciones.map((proyeccion) => (
                <ProyeccionListItem
                  key={proyeccion.id}
                  proyeccion={proyeccion}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </List>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  py: 2.5,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
                <Pagination
                  count={Math.ceil(pagination.total / pagination.limit)}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="large"
                  sx={{
                    '.MuiPaginationItem-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={!deleteDialog.isDeleting ? handleCloseDeleteDialog : undefined}
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
              ¿Está seguro de que desea eliminar esta proyección de pago? Esta acción no se puede deshacer y eliminará todos los datos asociados.
            </DialogContentText>
            <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
              Los datos eliminados no podrán ser recuperados posteriormente.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={handleCloseDeleteDialog}
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
              onClick={handleConfirmDelete} 
              color="error" 
              variant="contained"
              disabled={deleteDialog.isDeleting}
              startIcon={deleteDialog.isDeleting ? 
                <CircularProgress size={16} color="inherit" /> : 
                <DeleteIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {deleteDialog.isDeleting ? 'Eliminando...' : 'Eliminar Proyección'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProyeccionesPage;