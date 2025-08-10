import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
  Paper,
  alpha,
  useTheme,
  Alert,
  Stack,
  Fade
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchPagoExternoById,
  updatePagoExterno,
  selectSelectedPagoExterno,
  selectPagosExternosLoading,
  selectPagosExternosError,
} from '../pagoExternoSlice';
import { PagoExternoForm } from '../components/PagoExternoForm';
import type { UpdatePagoExternoDto } from '../types';
import { toast } from 'react-toastify';
import {
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export const PagoExternoEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const pagoExterno = useAppSelector(selectSelectedPagoExterno);
  const isLoading = useAppSelector(selectPagosExternosLoading);
  const error = useAppSelector(selectPagosExternosError);

  useEffect(() => {
    if (id) {
      dispatch(fetchPagoExternoById(parseInt(id)))
        .unwrap()
        .catch(_error => {
          toast.error('Error al cargar los datos del pago externo');
          navigate('/pagos-externos');
        });
    }
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = (data: UpdatePagoExternoDto) => {
    if (id) {
      dispatch(updatePagoExterno({ id: parseInt(id), pagoExternoData: data }))
        .unwrap()
        .then(() => {
          toast.success('Pago externo actualizado exitosamente');
          navigate(`/pagos-externos/${id}`);
        })
        .catch(_error => {
          toast.error('Error al actualizar el pago externo');
        });
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/pagos-externos/${id}`);
    } else {
      navigate('/pagos-externos');
    }
  };

  if (isLoading && !pagoExterno) {
    return (
      <Container maxWidth="lg">
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
            Cargando datos del pago externo...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!pagoExterno && !isLoading) {
    return (
      <Container maxWidth="lg">
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
            No se encontró el pago externo solicitado o no tiene permisos para editarlo.
          </Alert>
          <Link
            href="/pagos-externos"
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
            Volver a la lista de pagos externos
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Stack spacing={3} mb={4}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link 
              color="inherit" 
              href="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                '&:hover': { color: theme.palette.primary.dark },
                fontWeight: 500,
              }}
            >
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Inicio
            </Link>
            <Link 
              color="inherit" 
              href="/pagos-externos"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                '&:hover': { color: theme.palette.primary.dark },
                fontWeight: 500,
              }}
            >
              <MoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
              Pagos Externos
            </Link>
            <Link 
              color="inherit" 
              href={`/pagos-externos/${id}`}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                '&:hover': { color: theme.palette.primary.dark },
                fontWeight: 500,
              }}
            >
              Detalle #{id}
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
              Editar
            </Typography>
          </Breadcrumbs>
          
          {/* Page Title */}
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
              Editar Pago Externo
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Modifique los datos del pago externo #{id}
            </Typography>
          </Box>
        </Stack>

        {/* Form Section */}
        {pagoExterno && (
          <Fade in={!!pagoExterno}>
            <Paper 
              elevation={2}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Box sx={{ 
                p: 3, 
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EditIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Editar Pago #{id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actualice la información del pago externo
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <PagoExternoForm
                  initialData={pagoExterno}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={isLoading}
                  isEditing={true}
                />
              </Box>
            </Paper>
          </Fade>
        )}
      </Box>
    </Container>
  );
};