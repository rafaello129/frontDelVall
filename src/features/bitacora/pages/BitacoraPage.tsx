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
import  type { SelectChangeEvent } from '@mui/material';
import { Add as AddIcon, FilterList as FilterListIcon, Clear as ClearIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BitacoraListItem } from '../components/BitacoraListItem';
import { useBitacora } from '../hooks/useBitacora';
import { TipoBitacora } from '../types';
import { Sucursal } from '../../shared/enums';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';

const BitacoraPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    bitacoras, 
    pagination, 
    isLoading, 
    error, 
    getAllBitacoras, 
    removeBitacora, 
    setPaginationParams 
  } = useBitacora();

  // Filter state
  const [filters, setFilters] = useState({
    fechaDesde: null as Date | null,
    fechaHasta: null as Date | null,
    tipo: '' as TipoBitacora | '',
    sucursal: '' as Sucursal | '',
    noCliente: null as number | null,
    searchTerm: '',
  });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    bitacoraId: 0,
  });

  // Show filters state
  const [showFilters, setShowFilters] = useState(true);

  // Load initial data
  useEffect(() => {
    loadBitacoras();
  }, [pagination.page, pagination.limit]);

  // Load bitacoras with current filters
  const loadBitacoras = () => {
    // Convert null dates to undefined for the API
    const appliedFilters = {
      page: pagination.page,
      limit: pagination.limit,
      tipo: filters.tipo || undefined,
      sucursal: filters.sucursal || undefined,
      noCliente: filters.noCliente || undefined,
      fechaDesde: filters.fechaDesde || undefined,
      fechaHasta: filters.fechaHasta || undefined,
      searchTerm: filters.searchTerm || undefined,
    };
    
    getAllBitacoras(appliedFilters);
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle select changes specifically
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

  // Handle client change in filters
  const handleClienteChange = (clienteId: number | null) => {
    setFilters(prev => ({ ...prev, noCliente: clienteId }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPaginationParams(1); // Reset to first page
    loadBitacoras();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      fechaDesde: null,
      fechaHasta: null,
      tipo: '',
      sucursal: '',
      noCliente: null,
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
      bitacoraId: id,
    });
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      bitacoraId: 0,
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      await removeBitacora(deleteDialog.bitacoraId);
      handleCloseDeleteDialog();
      loadBitacoras(); // Reload after delete
    } catch (error) {
      console.error('Error al eliminar la entrada de bitácora:', error);
    }
  };

  // Handle edit
  const handleEditClick = (id: number) => {
    navigate(`/bitacora/${id}/editar`);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography  component="h1">
          Bitácora de Pagos
        </Typography>
        <Box>
          <Tooltip title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}>
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/bitacora/nuevo')}
            sx={{ ml: 1 }}
          >
            Nuevo Registro
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
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
              
              <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
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
              
              <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
                <ClienteAutocomplete
                  value={filters.noCliente || ''}
                  onChange={handleClienteChange}
                  size="small"
                  showEmpty
                />
              </Box>
            </Box>
            
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    name="tipo"
                    value={filters.tipo}
                    onChange={handleSelectChange}
                    label="Tipo"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {Object.values(TipoBitacora).map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sucursal</InputLabel>
                  <Select
                    name="sucursal"
                    value={filters.sucursal}
                    onChange={handleSelectChange}
                    label="Sucursal"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {Object.values(Sucursal).map((sucursal) => (
                      <MenuItem key={sucursal} value={sucursal}>
                        {sucursal}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
                <TextField
                  name="searchTerm"
                  label="Buscar"
                  fullWidth
                  size="small"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Buscar en comentarios..."
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
        <Typography>Cargando registros de bitácora...</Typography>
      ) : bitacoras.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay registros en la bitácora
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/bitacora/nuevo')}
            sx={{ mt: 2 }}
          >
            Crear Primer Registro
          </Button>
        </Paper>
      ) : (
        <Paper>
          <List>
            {bitacoras.map((bitacora) => (
              <BitacoraListItem
                key={bitacora.id}
                bitacora={bitacora}
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
            ¿Estás seguro de que deseas eliminar esta entrada de la bitácora? Esta acción no se puede deshacer.
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

export default BitacoraPage;