import React, { useEffect, useState } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import CobranzasFilter from '../components/cobranzasFilters';
import CobranzasTable from '../../../components/cobranza/CobranzasTable';
import CobranzaForm from '../../../components/cobranza/CobranzaForm';
import Button from '../../../components/common/Button';
import type { Cobranza, CreateCobranzaDto, FilterCobranzaDto, UpdateCobranzaDto } from '../types';
import { useFacturas } from '../../factura/hooks/useFacturas';
import { 
  Box, 
  Typography, 
  Paper, 
  Fade, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  IconButton, 
  Chip, 
  useTheme,
  Divider,
  Alert,
  Pagination,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  EventNote as EventNoteIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

const CobranzasPage: React.FC = () => {
  const theme = useTheme();
  const { 
    cobranzas,
    isLoading,
    error,
    getAllCobranzas,
    addCobranza,
    updateCobranzaById,
    removeCobranza
  } = useCobranzas();
  const { clearFactura } = useFacturas();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCobranza, setSelectedCobranza] = useState<Cobranza | null>(null);
  const [filters, setFilters] = useState<FilterCobranzaDto>({
    limit: 25,
    skip: 0,
    incluirBanco: true,
    incluirCliente: true,
    incluirFactura: true,
    order: 'desc',
    sortBy: 'fechaPago'
  });
  
  useEffect(() => {
    clearFactura();
  }, [isFormOpen, clearFactura]);
  
  useEffect(() => {
    getAllCobranzas(filters);
  }, [getAllCobranzas, filters]);

  const handleFilterChange = (newFilters: FilterCobranzaDto) => {
    // Reset pagination when filters change
    setFilters({
      ...newFilters,
      skip: 0, // Reset to first page when filter changes
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newSkip = (page - 1) * filters.limit;
    setFilters(prevFilters => ({
      ...prevFilters,
      skip: newSkip
    }));
  };

  const handleOpenCreateForm = () => {
    setSelectedCobranza(null);
    setIsFormOpen(true);
    setIsViewOpen(false);
  };

  const handleOpenEditForm = (cobranza: Cobranza) => {
    setSelectedCobranza(cobranza);
    setIsFormOpen(true);
    setIsViewOpen(false);
  };

  const handleOpenViewDetails = (cobranza: Cobranza) => {
    setSelectedCobranza(cobranza);
    setIsViewOpen(true);
    setIsFormOpen(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCobranza(null);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedCobranza(null);
  };

  const handleSubmit = async (data: CreateCobranzaDto | UpdateCobranzaDto) => {
    try {
      if (selectedCobranza) {
        // Actualización
        await updateCobranzaById(selectedCobranza.id, data as UpdateCobranzaDto);
      } else {
        // Creación
        await addCobranza(data as CreateCobranzaDto);
      }
      handleCloseForm();
      // Reset to first page and reload with current filters
      setFilters(prev => ({...prev, skip: 0}));
      getAllCobranzas({...filters, skip: 0});
    } catch (error) {
      console.error('Error al guardar pago:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este pago?')) {
      try {
        await removeCobranza(id);
        getAllCobranzas(filters);
      } catch (error) {
        console.error('Error al eliminar pago:', error);
      }
    }
  };

  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Calculate current page for pagination
  const currentPage = Math.floor(filters.skip / filters.limit) + 1;
  const totalPages = Math.ceil((cobranzas.length > 0 ? filters.limit * 2 : 0) / filters.limit); // Estimate for demo

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2 
      }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PaymentIcon sx={{ mr: 1 }} />
          Gestión de Cobranza
        </Typography>
        <Button 
          variant="primary"
          onClick={handleOpenCreateForm}
          leftIcon={<AttachMoneyIcon />}
        >
          Registrar Nuevo Pago
        </Button>
      </Box>

      {/* Filter Component */}
      <CobranzasFilter
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content - Table */}
      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <CobranzasTable
          cobranzas={cobranzas}
          onView={handleOpenViewDetails}
          onEdit={handleOpenEditForm}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {cobranzas.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderTop: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {filters.skip + 1} - {filters.skip + cobranzas.length} resultados
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="medium"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6">
            {selectedCobranza ? 'Editar' : 'Registrar'} Pago
          </Typography>
          <IconButton size="small" onClick={handleCloseForm} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <CobranzaForm
            cobranza={selectedCobranza || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={isViewOpen}
        onClose={handleCloseView}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon fontSize="small" />
            Detalles del Pago #{selectedCobranza?.id}
          </Typography>
          <IconButton size="small" onClick={handleCloseView} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCobranza && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <EventNoteIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Fecha de Pago
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(selectedCobranza.fechaPago).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <ReceiptIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Factura
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{selectedCobranza.noFactura}
                  </Typography>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <PersonIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Cliente
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{selectedCobranza.noCliente} - {selectedCobranza.nombreComercial}
                  </Typography>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <AttachMoneyIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Monto
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    {formatCurrency(selectedCobranza.total)}
                  </Typography>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Tipo de Cambio
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedCobranza.tipoCambio}
                  </Typography>
                </Box>
                
                {selectedCobranza.montoDolares && (
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Monto en USD
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${selectedCobranza.montoDolares.toFixed(2)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Tipo de Pago
                  </Typography>
                  <Chip 
                    label={selectedCobranza.tipoPago} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <AccountBalanceIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Banco
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedCobranza.banco?.nombre || `Banco #${selectedCobranza.bancoId}`}
                  </Typography>
                </Box>
                
                {selectedCobranza.referenciaPago && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Referencia de Pago
                    </Typography>
                    <Typography variant="body1">
                      {selectedCobranza.referenciaPago}
                    </Typography>
                  </Box>
                )}
                
                {selectedCobranza.notas && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Notas
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(0,0,0,0.01)',
                        mt: 0.5
                      }}
                    >
                      <Typography variant="body2">
                        {selectedCobranza.notas}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outline"
            onClick={handleCloseView}
          >
            Cerrar
          </Button>
          <Button
            variant="primary"
            leftIcon={<EditIcon />}
            onClick={() => {
              handleCloseView();
              if (selectedCobranza) handleOpenEditForm(selectedCobranza);
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CobranzasPage;