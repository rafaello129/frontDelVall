import React, { useEffect } from 'react';
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
  Breadcrumbs,
  Container,
  useTheme,
  alpha
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
  Home as HomeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const CobranzaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
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
            Cargando detalles del pago...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
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
  
  if (!selectedCobranza) {
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
    <Container maxWidth="md">
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
          <Typography color="text.primary" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600 
          }}>
            <ReceiptIcon sx={{ mr: 0.5 }} fontSize="small" />
            Pago #{selectedCobranza.id}
          </Typography>
        </Breadcrumbs>
        
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          px: 1
        }}>
          <Typography variant="h4" fontWeight={700} sx={{ 
            color: theme.palette.text.primary,
            lineHeight: 1.2
          }}>
            Detalles del Pago
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/cobranza/editar/${selectedCobranza.id}`)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2
              }}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2
              }}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
        
        {/* Main Content Card */}
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
          {/* Payment Header Section */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}>
            <Box sx={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PaymentIcon 
                sx={{ 
                  fontSize: 36, 
                  color: theme.palette.primary.main 
                }} 
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                ID de Pago
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                #{selectedCobranza.id}
              </Typography>
            </Box>
            
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                label={selectedCobranza.tipoPago}
                color="primary"
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  py: 0.5,
                  px: 0.5
                }}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.8) }} />
          
          {/* Payment Info Grid */}
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 3
          }}>
            {/* Left column */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 48%' }
            }}>
              {/* Factura */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  <ReceiptIcon fontSize="small" sx={{ mr: 1 }} />
                  Factura
                </Typography>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body1" fontWeight="medium">
                    Factura Nº
                  </Typography>
                  <Link 
                    to={`/facturasView/${selectedCobranza.noFactura}`}
                    style={{
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      textDecoration: 'none'
                    }}
                  >
                    #{selectedCobranza.noFactura}
                  </Link>
                </Box>
              </Box>
              
              {/* Cliente */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  Cliente
                </Typography>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 2,
                }}>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                    {selectedCobranza.nombreComercial}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID Cliente: #{selectedCobranza.noCliente}
                  </Typography>
                </Box>
              </Box>
              
              {/* Banco */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  <AccountBalanceIcon fontSize="small" sx={{ mr: 1 }} />
                  Banco
                </Typography>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 2,
                }}>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedCobranza.banco?.nombre || `Banco #${selectedCobranza.bancoId}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Right column */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 48%' }
            }}>
              {/* Fecha */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  <EventNoteIcon fontSize="small" sx={{ mr: 1 }} />
                  Fecha de Pago
                </Typography>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 2,
                }}>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(selectedCobranza.fechaPago).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedCobranza.fechaPago).toLocaleTimeString('es-MX')}
                  </Typography>
                </Box>
              </Box>
              
              {/* Monto */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                  Monto
                </Typography>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: alpha(theme.palette.success.main, 0.08),
                  borderRadius: 2,
                  borderLeft: `4px solid ${theme.palette.success.main}`
                }}>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    {formatCurrency(selectedCobranza.total)}
                  </Typography>
                  
                  {/* Mostrar montos adicionales si existen */}
                  {selectedCobranza.tipoCambio && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Tipo de cambio:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedCobranza.tipoCambio}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedCobranza.montoDolares && (
                    <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Monto en USD:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        ${selectedCobranza.montoDolares.toFixed(2)} USD
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Referencia de Pago */}
              {selectedCobranza.referenciaPago && (
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 0.5,
                      fontWeight: 500
                    }}
                  >
                    <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                    Referencia de Pago
                  </Typography>
                  <Box sx={{
                    p: 1.5,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    borderRadius: 2,
                  }}>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedCobranza.referenciaPago}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Notas Section */}
          {selectedCobranza.notas && (
            <Box sx={{ mt: 2 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  fontWeight: 500
                }}
              >
                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                Notas
              </Typography>
              <Paper
                variant="outlined"
                sx={{ 
                  p: 2, 
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.divider, 0.5)
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {selectedCobranza.notas}
                </Typography>
              </Paper>
            </Box>
          )}
        </Paper>
        
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          px: 1
        }}>
          <Button
            component={Link}
            to="/cobranza"
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            Volver a la lista
          </Button>
          
          <Button
            component={Link}
            to={`/facturasView/${selectedCobranza.noFactura}`}
            variant="outlined"
            startIcon={<ReceiptIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            Ver Factura
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CobranzaDetailPage;