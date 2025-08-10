import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Alert, 
  CircularProgress, 
  Paper, 
  Breadcrumbs,
  Link as MuiLink,
  useTheme,
  alpha,
  Fade,
  Divider,
  Button,
} from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ProyeccionForm } from '../components/ProyeccionForm';
import { useProyecciones } from '../hooks/useProyecciones';
import type { UpdateProyeccionPagoDto } from '../types';
import {
  Edit as EditIcon,
  Home as HomeIcon,
  EventNote as EventNoteIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const ProyeccionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const { selectedProyeccion, getProyeccionById, editProyeccion, isLoading, error } = useProyecciones();
  const [loadingData, setLoadingData] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadProyeccion = async () => {
      try {
        if (id) {
          await getProyeccionById(parseInt(id, 10));
        }
      } catch (error) {
        console.error('Error loading proyeccion:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadProyeccion();
  }, [id, getProyeccionById]);

  const handleSubmit = async (data: UpdateProyeccionPagoDto) => {
    try {
      if (id) {
        await editProyeccion(parseInt(id, 10), data);
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate(`/proyecciones/${id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error al actualizar proyección de pago:', error);
    }
  };

  if (loadingData) {
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
            Cargando proyección...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!selectedProyeccion && !isLoading) {
    return (
      <Container maxWidth="md">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: 3,
            py: 4 
          }}
        >
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              width: '100%', 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            No se encontró la proyección solicitada o no tiene permisos para editarla.
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/proyecciones')}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Volver a proyecciones
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
          <MuiLink 
            component={Link} 
            to={`/proyecciones/${id}`} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': { color: theme.palette.primary.dark }
            }}
          >
            Proyección #{id}
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
            Editar
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
            Editar Proyección de Pago
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mt: 1 }}
          >
            Actualiza la información de esta proyección de pago y guarda los cambios.
          </Typography>
        </Box>
        
        {/* Success Message */}
        {submitSuccess && (
          <Fade in={submitSuccess}>
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              Proyección actualizada correctamente. Redirigiendo...
            </Alert>
          </Fade>
        )}
        
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
        {selectedProyeccion && (
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
                <EditIcon 
                  sx={{ 
                    fontSize: 28, 
                    color: theme.palette.primary.main 
                  }} 
                />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Editando proyección #{id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modifique los campos necesarios y guarde los cambios
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.8) }} />
            
            <ProyeccionForm 
              initialData={selectedProyeccion} 
              onSubmit={handleSubmit} 
              isLoading={isLoading}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ProyeccionEditPage;