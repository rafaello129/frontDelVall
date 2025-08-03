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
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import type { SelectChangeEvent} from '@mui/material/Select';
import { Add as AddIcon, FilterList as FilterListIcon, Clear as ClearIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ProyeccionListItem } from '../components/ProyeccionListItem';
import { useProyecciones } from '../hooks/useProyecciones';
import { EstadoProyeccion } from '../types';
import { CalendarIcon } from '@mui/x-date-pickers';

const ProyeccionesPage: React.FC = () => {
  const navigate = useNavigate();
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
    setPaginationParams(value);
  };

  // Open delete dialog
  const handleDeleteClick = (id: number) => {
    setDeleteDialog({
      open: true,
      proyeccionId: id,
    });
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      proyeccionId: 0,
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      await removeProyeccion(deleteDialog.proyeccionId);
      handleCloseDeleteDialog();
      loadProyecciones(); // Reload after delete
    } catch (error) {
      console.error('Error al eliminar la proyección:', error);
    }
  };

  // Handle edit
  const handleEditClick = (id: number) => {
    navigate(`/proyecciones/${id}/editar`);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Proyecciones de Pago
        </Typography>
        <Box>
        <Tooltip title="Ver Calendario">
      <Button
        variant="outlined"
        startIcon={<CalendarIcon />}
        onClick={() => navigate('/proyecciones/calendario')}
        sx={{ mr: 1 }}
      >
        Vista Calendario
      </Button>
    </Tooltip>
    
          <Tooltip title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}>
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/proyecciones/nueva')}
            sx={{ ml: 1 }}
          >
            Nueva Proyección
          </Button>
        </Box>
      </Box>

      {/* Simplified Filters Section */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <DatePicker
                  label="Fecha Desde"
                  value={filters.fechaDesde}
                  onChange={handleDateChange('fechaDesde')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small"
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
                      size: "small"
                    }
                  }}
                />
              </Box>
            </Box>
            
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
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
                  label="Buscar"
                  fullWidth
                  size="small"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                />
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
              >
                Aplicar Filtros
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Error Message */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Loading or Empty State */}
      {isLoading ? (
        <Typography>Cargando proyecciones...</Typography>
      ) : proyecciones.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay proyecciones de pago disponibles
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/proyecciones/nueva')}
            sx={{ mt: 2 }}
          >
            Crear Primera Proyección
          </Button>
        </Paper>
      ) : (
        <Paper>
          <List>
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
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={Math.ceil(pagination.total / pagination.limit)}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta proyección de pago? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProyeccionesPage;