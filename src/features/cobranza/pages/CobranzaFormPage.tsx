import React, { useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useCobranzas } from '../hooks/useCobranzas';
import { useFacturas } from '../../factura/hooks/useFacturas';
import type { CreateCobranzaDto, UpdateCobranzaDto } from '../types';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import CobranzaForm from '../../../components/cobranza/CobranzaForm';

const CobranzaFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // Añadido para acceder a location.state
  
  const { 
    getCobranzaById, 
    selectedCobranza, 
    isLoading, 
    error, 
    addCobranza,
    updateCobranzaById 
  } = useCobranzas();
  const { clearFactura, getFacturaById } = useFacturas();
  
  const isEditMode = !!id;
  
  // Obtener valores iniciales del state si existen (enviados desde FacturaViewPage)
  const initialFacturaId = location.state?.facturaId;
  const initialClienteId = location.state?.clienteId;
  
  useEffect(() => {
    clearFactura();
    if (isEditMode && id) {
      getCobranzaById(Number(id));
    } else if (initialFacturaId) {
      // Si venimos desde la vista de factura, cargar los datos de esa factura
      getFacturaById(String(initialFacturaId));
    }
  }, [id, isEditMode, initialFacturaId, getCobranzaById, getFacturaById, clearFactura]);
  
  const handleSubmit = async (data: CreateCobranzaDto | UpdateCobranzaDto) => {
    try {
      if (isEditMode && selectedCobranza) {
        // Actualización
        await updateCobranzaById(selectedCobranza.id, data as UpdateCobranzaDto);
        navigate(`/cobranza/${selectedCobranza.id}`);
      } else {
        // Creación
        await addCobranza(data as CreateCobranzaDto);
        
        // Si venimos de una factura, redirigir de vuelta a ella
        if (initialFacturaId) {
          navigate(`/facturasView/${initialFacturaId}`);
        } else {
          navigate('/cobranza');
        }
      }
    } catch (error) {
      console.error('Error al guardar pago:', error);
    }
  };
  
  if (isEditMode && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (isEditMode && error) {
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
  
  if (isEditMode && !selectedCobranza) {
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
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 4 }}>
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
          {isEditMode ? 'Editar Pago' : 'Registrar Nuevo Pago'}
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEditMode ? (
              <>
                <EditIcon fontSize="large" color="primary" />
                Editar Pago #{selectedCobranza?.id}
              </>
            ) : (
              <>
                <AddIcon fontSize="large" color="primary" />
                {initialFacturaId ? 
                  `Registrar Pago para Factura #${initialFacturaId}` : 
                  'Registrar Nuevo Pago'}
              </>
            )}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <CobranzaForm
          cobranza={selectedCobranza || undefined}
          onSubmit={handleSubmit}
          onCancel={() => initialFacturaId ? 
            navigate(`/facturasView/${initialFacturaId}`) : 
            navigate('/cobranza')
          }
          isLoading={isLoading}
          initialFacturaId={initialFacturaId}
          initialClienteId={initialClienteId}
        />
      </Paper>
    </Box>
  );
};

export default CobranzaFormPage;