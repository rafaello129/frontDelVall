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
  Divider
} from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BitacoraForm } from '../components/BitacoraForm';
import { useBitacora } from '../hooks/useBitacora';
import type { UpdateBitacoraPagoDto } from '../types';
import { 
  Home as HomeIcon, 
  Book as BookIcon, 
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const BitacoraEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { selectedBitacora, getBitacoraById, editBitacora, isLoading, error } = useBitacora();
  const [loadingData, setLoadingData] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadBitacora = async () => {
      try {
        if (id) {
          await getBitacoraById(parseInt(id, 10));
        }
      } catch (error) {
        console.error('Error loading bitacora entry:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadBitacora();
  }, [id, getBitacoraById]);

  const handleSubmit = async (data: UpdateBitacoraPagoDto) => {
    try {
      if (id) {
        await editBitacora(parseInt(id, 10), data);
        setSubmitSuccess(true);
        
        // Navigate after a short delay
        setTimeout(() => {
          // Navigate based on where the record came from
          if (selectedBitacora?.noCliente) {
            navigate(`/clientes/${selectedBitacora.noCliente}`);
          } else if (selectedBitacora?.proyeccionId) {
            navigate(`/proyecciones/${selectedBitacora.proyeccionId}`);
          } else {
            navigate('/bitacora');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error al actualizar entrada en bitácora:', error);
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
            Cargando registro de bitácora...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!selectedBitacora && !isLoading) {
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
            No se encontró la entrada de bitácora solicitada o no tiene permisos para editarla.
          </Alert>
          <MuiLink
            component={Link}
            to="/bitacora"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
            Volver a la lista de bitácora
          </MuiLink>
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
          <MuiLink 
            component={Link} 
            to={`/bitacora/${id}`} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': { color: theme.palette.primary.dark }
            }}
          >
            Registro #{id}
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
            fontWeight="bold" 
            color="text.primary"
          >
            Editar Registro en Bitácora
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mt: 1, maxWidth: 800 }}
          >
            Actualice la información del registro #{id} en la bitácora de pagos.
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
              Registro actualizado correctamente. Redirigiendo...
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
        
        {/* Form container */}
        {selectedBitacora && (
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
                  Editando Registro #{id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modifique los campos necesarios y guarde los cambios
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.8) }} />
            
            <BitacoraForm 
              initialData={selectedBitacora} 
              onSubmit={handleSubmit} 
              isLoading={isLoading}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default BitacoraEditPage;