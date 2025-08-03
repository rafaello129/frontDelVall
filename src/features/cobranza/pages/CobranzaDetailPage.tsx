import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCobranzas } from '../hooks/useCobranzas';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  EventNote as EventNoteIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const CobranzaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCobranzaById, selectedCobranza, isLoading, error, removeCobranza } = useCobranzas();
  
  useEffect(() => {
    if (id) {
      getCobranzaById(Number(id));
    }
  }, [id, getCobranzaById]);
  
  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };
  
  const handleDelete = async () => {
    if (selectedCobranza && window.confirm('¿Está seguro de eliminar este pago?')) {
      try {
        await removeCobranza(selectedCobranza.id);
        navigate('/cobranza');
      } catch (error) {
        console.error('Error al eliminar pago:', error);
      }
    }
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          component={Link} 
          to="/cobranza" 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }
  
  if (!selectedCobranza) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
        <Alert severity="warning">No se encontró el pago solicitado</Alert>
        <Button 
          component={Link} 
          to="/cobranza" 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Inicio
        </Link>
        <Link to="/cobranza" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <PaymentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Cobranzas
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          Detalles del Pago #{selectedCobranza.id}
        </Typography>
      </Breadcrumbs>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          position: 'relative'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2
        }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon fontSize="large" color="primary" />
            Detalles del Pago
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/cobranza/editar/${selectedCobranza.id}`)}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
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
            <Link  to={`/facturasView/${selectedCobranza.noFactura}`} 
              className=" decoration-blue-500 decoration-2 underline-offset-4 hover:text-blue-600 transition"

            >
            #{selectedCobranza.noFactura}
            </Link>
             
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
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          component={Link}
          to="/cobranza"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Volver a la lista
        </Button>
      </Box>
    </Box>
  );
};

export default CobranzaDetailPage;