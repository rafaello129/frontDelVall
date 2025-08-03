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
  Breadcrumbs,
  Container,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import CobranzaForm from '../../../components/cobranza/CobranzaForm';

const CobranzaFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
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
      <Container maxWidth="md">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70vh' 
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Cargando datos del pago...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (isEditMode && error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
          <Alert 
            severity="error"
            variant="filled" 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
          <Button 
            component={Link} 
            to="/cobranza" 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
          >
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (isEditMode && !selectedCobranza) {
    return (
      <Container maxWidth="md">
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
          <Alert 
            severity="warning" 
            variant="filled"
            sx={{ mb: 2 }}
          >
            No se encontró el pago solicitado
          </Alert>
          <Button 
            component={Link} 
            to="/cobranza" 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
          >
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 3, px: 1 }}
        >
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: theme.palette.primary.main,
            fontWeight: 500
          }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Inicio
          </Link>
          <Link to="/cobranza" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: theme.palette.primary.main,
            fontWeight: 500
          }}>
            <PaymentIcon sx={{ mr: 0.5 }} fontSize="small" />
            Cobranzas
          </Link>
          {isEditMode ? (
            <Typography color="text.primary" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600 
            }}>
              <EditIcon sx={{ mr: 0.5 }} fontSize="small" />
              Editar Pago #{id}
            </Typography>
          ) : (
            <Typography color="text.primary" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600 
            }}>
              <AddIcon sx={{ mr: 0.5 }} fontSize="small" />
              {initialFacturaId ? 
                `Registrar Pago para Factura #${initialFacturaId}` : 
                'Nuevo Pago'}
            </Typography>
          )}
        </Breadcrumbs>
        
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          px: 1
        }}>
          <Typography variant="h4" fontWeight={700} sx={{ 
            color: theme.palette.text.primary,
            lineHeight: 1.2
          }}>
            {isEditMode ? (
              <>Editar Pago</>
            ) : (
              initialFacturaId ? 
                <>Registrar Pago para Factura</> : 
                <>Registrar Nuevo Pago</>
            )}
          </Typography>
          
          {initialFacturaId && (
            <Chip 
              label={`Factura #${initialFacturaId}`}
              color="primary"
              icon={<ReceiptIcon />}
              sx={{ 
                fontSize: '0.9rem', 
                fontWeight: 'bold',
                py: 2.5
              }}
            />
          )}
        </Box>
        
        {/* Form Card */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 3,
            mb: 4,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}>
            <Box sx={{ 
              width: 54, 
              height: 54, 
              borderRadius: '50%', 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isEditMode ? (
                <EditIcon 
                  sx={{ 
                    fontSize: 28, 
                    color: theme.palette.primary.main 
                  }} 
                />
              ) : (
                <PaymentIcon 
                  sx={{ 
                    fontSize: 28, 
                    color: theme.palette.primary.main 
                  }} 
                />
              )}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {isEditMode ? `Modificando pago #${id}` : 'Información del nuevo pago'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode ? 
                  'Actualice los campos necesarios y guarde los cambios' : 
                  'Complete todos los campos requeridos para registrar el pago'}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.8) }} />
          
          {/* Form Component */}
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
          
          {/* Información adicional */}
          <Box sx={{ mt: 4 }}>
            <Alert 
              severity="info"
              variant="outlined"
              icon={false}
              sx={{ 
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05)
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <SaveIcon color="info" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {isEditMode ? 'Sobre la edición de pagos' : 'Sobre el registro de pagos'}
                  </Typography>
                  <Typography variant="body2">
                    {isEditMode 
                      ? 'Al editar un pago, se actualizarán los registros contables asociados. Asegúrese de que los datos son correctos antes de guardar los cambios.'
                      : 'El pago se registrará en el sistema y se asociará a la factura correspondiente. Verifique todos los datos antes de enviar el formulario.'}
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CobranzaFormPage;