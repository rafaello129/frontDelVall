import React, { useEffect, useState, useMemo } from 'react';
import { useFacturas } from '../hooks/useFacturas';
import FacturasTable from '../../../components/factura/FacturasTable';
import FacturaForm from '../../../components/factura/FacturaForm';
import type { Factura, CreateFacturaDto, FilterFacturaDto, UpdateFacturaDto } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Collapse, Card, CardContent, Stack, Chip,
  Divider, Fade, useTheme, alpha, Tooltip, Breadcrumbs,
  Link as MuiLink, CircularProgress, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import ClienteFilterSelect from '../../../components/cliente/ClienteFilterSelect';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FacturasPage: React.FC = () => {
  const theme = useTheme();
  const { 
    facturas,
    isLoading,
    error,
    getAllFacturas,
    addFactura,
    updateFacturaById,
    removeFactura,
    cambiarEstado
  } = useFacturas();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [filters, setFilters] = useState<FilterFacturaDto>({
    limit: 25,
    skip: 0,
    incluirCliente: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getAllFacturas(filters);
  }, [getAllFacturas, filters]);

  useEffect(() => {
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOpenCreateForm = () => {
    setSelectedFactura(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditForm = (factura: Factura) => {
    setSelectedFactura(factura);
    setFormDialogOpen(true);
    setViewDialogOpen(false);
  };

  const handleOpenViewDetails = (factura: Factura) => {
    setSelectedFactura(factura);
    setViewDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormDialogOpen(false);
  };

  const handleCloseView = () => {
    setViewDialogOpen(false);
  };

  const handleSubmit = async (data: CreateFacturaDto | UpdateFacturaDto) => {
    try {
      if (selectedFactura) {
        // Update
        await updateFacturaById(selectedFactura.noFactura, data as UpdateFacturaDto);
        setSuccessMessage(`Factura ${selectedFactura.noFactura} actualizada correctamente`);
      } else {
        // Create
        await addFactura(data as CreateFacturaDto);
        setSuccessMessage(`Factura creada correctamente`);
      }
      handleCloseForm();
      getAllFacturas(filters); // Reload the list
    } catch (error) {
      console.error('Error al guardar factura:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedFactura) return;
    
    setIsDeleting(true);
    try {
      await removeFactura(selectedFactura.noFactura);
      setSuccessMessage(`Factura ${selectedFactura.noFactura} eliminada correctamente`);
      getAllFacturas(filters); // Reload the list
    } catch (error) {
      console.error('Error al eliminar factura:', error);
    } finally {
      setDeleteConfirmDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = (factura: Factura) => {
    setSelectedFactura(factura);
    setDeleteConfirmDialogOpen(true);
  };

  const handleCambiarEstado = async (noFactura: string, estado: string) => {
    try {
      await cambiarEstado(noFactura, estado);
      setSuccessMessage(`Factura ${noFactura} marcada como ${estado}`);
      if (selectedFactura?.noFactura === noFactura) {
        setSelectedFactura(prev => prev ? { ...prev, estado } : null);
      }
      getAllFacturas(filters); // Reload the list
      handleCloseView();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterFacturaDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Format number as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Get status chip color
  const getStatusChipProps = (status: string) => {
    switch (status) {
      case 'Pagada':
        return {
          icon: <CheckCircleIcon />,
          color: 'success' as const,
          bgcolor: alpha(theme.palette.success.main, 0.8)
        };
      case 'Vencida':
        return {
          icon: <WarningIcon />,
          color: 'error' as const,
          bgcolor: alpha(theme.palette.error.main, 0.8)
        };
      case 'Cancelada':
        return {
          icon: <CancelIcon />,
          color: 'default' as const,
          bgcolor: alpha(theme.palette.text.disabled, 0.8)
        };
      default: // Pending
        return {
          icon: <WarningIcon />,
          color: 'warning' as const,
          bgcolor: alpha(theme.palette.warning.main, 0.8)
        };
    }
  };

  // Memoize the detail content to avoid unnecessary re-renders
  const facturaDetailContent = useMemo(() => {
    if (!selectedFactura) return null;
    
    const statusChipProps = getStatusChipProps(selectedFactura.estado);
    
    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Factura #{selectedFactura.noFactura}
          </Typography>
          <Chip
            icon={statusChipProps.icon}
            label={selectedFactura.estado}
            color={statusChipProps.color}
            sx={{ 
              fontWeight: 500,
              px: 1,
              bgcolor: statusChipProps.bgcolor
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, mb: 2, pr: { sm: 1 } }}>
            <Typography variant="body2" color="text.secondary">Fecha de Emisión</Typography>
            <Typography variant="body1" fontWeight="medium">
              {format(new Date(selectedFactura.emision), 'PPP', { locale: es })}
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%' }, mb: 2, pl: { sm: 1 } }}>
            <Typography variant="body2" color="text.secondary">Cliente</Typography>
            <Typography variant="body1" fontWeight="medium">
              #{selectedFactura.noCliente} {selectedFactura.cliente?.razonSocial}
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%' }, mb: 2, pr: { sm: 1 } }}>
            <Typography variant="body2" color="text.secondary">Total Factura</Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatCurrency(selectedFactura.montoTotal)}
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%' }, mb: 2, pl: { sm: 1 } }}>
            <Typography variant="body2" color="text.secondary">Saldo Pendiente</Typography>
            <Typography variant="body1" fontWeight="medium" color={
              selectedFactura.saldo > 0 ? 'error.main' : 'success.main'
            }>
              {formatCurrency(selectedFactura.saldo)}
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%' }, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Fecha de Vencimiento</Typography>
            <Typography variant="body1" fontWeight="medium">
              {format(new Date(selectedFactura.fechaVencimiento), 'PPP', { locale: es })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(selectedFactura.fechaVencimiento), { 
                addSuffix: true, 
                locale: es 
              })}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Concepto</Typography>
        <Typography variant="body1" paragraph>
          {selectedFactura.concepto}
        </Typography>
      </>
    );
  }, [selectedFactura, theme]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink 
            component={Link} 
            to="/" 
            underline="hover" 
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Inicio
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} />
            Facturas
          </Typography>
        </Breadcrumbs>
        
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Facturas
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar filtros' : 'Filtros'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateForm}
            >
              Nueva Factura
            </Button>
          </Box>
        </Box>
        
        {/* Success message */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}
        
        {/* Error message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}
        
        {/* Filters */}
        <Collapse in={showFilters}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              borderTop: `4px solid ${theme.palette.primary.main}`
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Filtros</Typography>
              <Button 
                size="small" 
                onClick={() => {
                  setFilters({
                    limit: 25,
                    skip: 0,
                    incluirCliente: true
                  });
                }}
              >
                Limpiar filtros
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flexBasis: { xs: '100%', md: '31%' }, flexGrow: 1 }}>
                <ClienteFilterSelect
                  label="Cliente"
                  value={filters.noCliente}
                  onChange={(value) => handleFilterChange('noCliente', value)}
                  type="noCliente"
                  placeholder="Todos los clientes"
                
                />
              </Box>
              
              <Box sx={{ flexBasis: { xs: '100%', md: '31%' }, flexGrow: 1 }}>
              <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Vencida">Vencida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
              </Box>
              
              <Box sx={{ 
                flexBasis: { xs: '100%', md: '31%' }, 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'flex-end' 
              }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => getAllFacturas(filters)}
                  disabled={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Cargando...' : 'Aplicar Filtros'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Collapse>
        
        {/* Main content */}
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <FacturasTable
            facturas={facturas}
            onView={handleOpenViewDetails}
            onEdit={handleOpenEditForm}
            onDelete={handleConfirmDelete}
            isLoading={isLoading}
          />
          
          {isLoading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
        </Paper>
        
        {/* Create/Edit Factura Dialog */}
        <Dialog 
          open={formDialogOpen} 
          onClose={handleCloseForm}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedFactura ? 'Editar' : 'Crear'} Factura
              </Typography>
              <IconButton onClick={handleCloseForm} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <FacturaForm
              factura={selectedFactura || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isLoading={isLoading}
              isEditing={!!selectedFactura}
            />
          </DialogContent>
        </Dialog>
        
        {/* View Factura Details Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={handleCloseView}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Detalles de Factura
              </Typography>
              <IconButton onClick={handleCloseView} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {facturaDetailContent}
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Box>
              {selectedFactura && selectedFactura.estado !== 'Pagada' && selectedFactura.estado !== 'Cancelada' && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleCloseView();
                    if (selectedFactura) handleOpenEditForm(selectedFactura);
                  }}
                >
                  Editar
                </Button>
              )}
            </Box>
       
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmDialogOpen}
          onClose={() => setDeleteConfirmDialogOpen(false)}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro de eliminar la factura {selectedFactura?.noFactura}? Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteConfirmDialogOpen(false)} 
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDelete} 
              disabled={isDeleting}
              startIcon={isDeleting && <CircularProgress size={16} color="inherit" />}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default FacturasPage;