import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFacturas } from '../hooks/useFacturas';
import FacturaForm from '../../../components/factura/FacturaForm';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link as MuiLink, 
  CircularProgress, 
  Alert, 
  Paper,
  Container,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type { UpdateFacturaDto } from '../types';

const FacturaEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { getFacturaById, selectedFactura, updateFacturaById, isLoading, error } = useFacturas();
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) getFacturaById(id);
  }, [id, getFacturaById]);

  const handleSubmit = async (data: UpdateFacturaDto) => {
    try {
      await updateFacturaById(id!, data);
      setSuccess('Factura actualizada correctamente');
      setTimeout(() => navigate(`/facturas/${id}`), 1000);
    } catch (e) { /* manejar error */ }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh' 
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Cargando factura...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <MuiLink 
            component={Link} 
            to="/facturas" 
            color="primary"
            sx={{ 
              display: 'flex',
              alignItems: 'center', 
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> 
            Volver a la lista de facturas
          </MuiLink>
        </Box>
      </Container>
    );
  }

  if (!selectedFactura) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="warning" 
          variant="filled"
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          No se encontró la factura solicitada.
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <MuiLink 
            component={Link} 
            to="/facturas" 
            color="primary"
            sx={{ 
              display: 'flex',
              alignItems: 'center', 
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> 
            Volver a la lista de facturas
          </MuiLink>
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
          sx={{ 
            mb: 3,
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center'
            },
            px: 1
          }}
        >
          <MuiLink 
            component={Link} 
            to="/" 
            color="inherit" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': {
                color: theme.palette.primary.dark
              }
            }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> Inicio
          </MuiLink>
          <MuiLink 
            component={Link} 
            to="/facturas" 
            color="inherit" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': {
                color: theme.palette.primary.dark
              }
            }}
          >
            <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> Facturas
          </MuiLink>
          <MuiLink 
            component={Link} 
            to={`/facturasView/${id}`} 
            color="inherit"
            sx={{ 
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': {
                color: theme.palette.primary.dark
              }
            }}
          >
            Ver factura
          </MuiLink>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
            Editar factura
          </Typography>
        </Breadcrumbs>
        
        {/* Page Header */}
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 3,
            px: 1
          }}
        >
          Editar Factura #{id}
        </Typography>
        
        {/* Main Content */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
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
              <EditIcon 
                sx={{ 
                  fontSize: 28, 
                  color: theme.palette.primary.main 
                }} 
              />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Modificando factura #{id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Actualice los campos necesarios y guarde los cambios
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.8) }} />
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
              }}
            >
              {success}
            </Alert>
          )}
          
          <FacturaForm
            factura={selectedFactura}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/facturasView/${id}`)}
            isLoading={isLoading}
            isEditing
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default FacturaEditPage;