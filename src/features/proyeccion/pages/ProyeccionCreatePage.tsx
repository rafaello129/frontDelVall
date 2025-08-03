import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Alert, 
  Breadcrumbs, 
  Link as MuiLink, 
  useTheme, 
  alpha,
  Paper,
  Divider
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ProyeccionForm } from '../components/ProyeccionForm';
import { useProyecciones } from '../hooks/useProyecciones';
import type { CreateProyeccionPagoDto, UpdateProyeccionPagoDto } from '../types';
import {
  Home as HomeIcon,
  EventNote as EventNoteIcon,
  NavigateNext as NavigateNextIcon,
  Add as AddIcon
} from '@mui/icons-material';

const ProyeccionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { addProyeccion, isLoading, error } = useProyecciones();
  
  // Get query parameters if coming from client page
  const queryParams = new URLSearchParams(location.search);
  const noCliente = queryParams.get('noCliente') ? Number(queryParams.get('noCliente')) : undefined;

  const handleSubmit = async (data: CreateProyeccionPagoDto | UpdateProyeccionPagoDto) => {
    try {
      // Since we're creating, we know it's a CreateProyeccionPagoDto
      const result = await addProyeccion(data as CreateProyeccionPagoDto);
      navigate(`/proyecciones/${result.id}`);
    } catch (error) {
      console.error('Error al crear proyección de pago:', error);
    }
  };

  return (
    <Container maxWidth="md">
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
            to="/proyecciones" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': { color: theme.palette.primary.dark }
            }}
          >
            <EventNoteIcon fontSize="small" sx={{ mr: 0.5 }} />
            Proyecciones
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
            Nueva Proyección
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700}
            color="text.primary"
          >
            Nueva Proyección de Pago
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mt: 1 }}
          >
            Registre una nueva proyección de pago para mantener un seguimiento de ingresos futuros.
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Form */}
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
                Crear nueva proyección
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete todos los campos requeridos para registrar la proyección
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.8) }} />
          
          <ProyeccionForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            initialNoCliente={noCliente}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default ProyeccionCreatePage;