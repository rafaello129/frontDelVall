import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Breadcrumbs, 
  Link as MuiLink, 
  useTheme, 
  alpha,
  Divider
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BitacoraForm } from '../components/BitacoraForm';
import { useBitacora } from '../hooks/useBitacora';
import type { CreateBitacoraPagoDto, UpdateBitacoraPagoDto } from '../types';
import { 
  Home as HomeIcon, 
  Book as BookIcon, 
  Add as AddIcon,
  NavigateNext as NavigateNextIcon 
} from '@mui/icons-material';

const BitacoraCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { addBitacora, isLoading } = useBitacora();
  
  // Get query parameters for proyeccionId and noCliente
  const queryParams = new URLSearchParams(location.search);
  const proyeccionId = queryParams.get('proyeccionId') ? Number(queryParams.get('proyeccionId')) : undefined;
  const noCliente = queryParams.get('noCliente') ? Number(queryParams.get('noCliente')) : undefined;

  // Fix the type to match what BitacoraForm expects
  const handleSubmit = async (data: CreateBitacoraPagoDto | UpdateBitacoraPagoDto) => {
    try {
      // Since we're creating, we know the data should be valid for CreateBitacoraPagoDto
      await addBitacora(data as CreateBitacoraPagoDto);
      // Navigate based on where we came from
      if (noCliente) {
        navigate(`/clientes/${noCliente}`);
      } else if (proyeccionId) {
        navigate(`/proyecciones/${proyeccionId}`);
      } else {
        navigate('/bitacora');
      }
    } catch (error) {
      console.error('Error al crear entrada en bitácora:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': { color: theme.palette.primary.dark }
            }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Inicio
          </MuiLink>
          <MuiLink 
            component={Link} 
            to="/bitacora" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': { color: theme.palette.primary.dark }
            }}
          >
            <BookIcon fontSize="small" sx={{ mr: 0.5 }} />
            Bitácora
          </MuiLink>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
            Nuevo Registro
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold" 
            color="text.primary"
          >
            Nuevo Registro en Bitácora
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mt: 1, maxWidth: 800 }}
          >
            Añade un nuevo registro en la bitácora de pagos para mantener un seguimiento de las interacciones con el cliente.
          </Typography>
        </Box>

        {/* Form container */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 3,
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
              <AddIcon 
                sx={{ 
                  fontSize: 28, 
                  color: theme.palette.primary.main 
                }} 
              />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {proyeccionId 
                  ? "Nuevo Registro para Proyección" 
                  : noCliente 
                    ? "Nuevo Registro para Cliente" 
                    : "Formulario de Registro"
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete todos los campos requeridos para crear un nuevo registro en la bitácora
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.8) }} />
          
          <BitacoraForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            proyeccionId={proyeccionId}
            noCliente={noCliente}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default BitacoraCreatePage;