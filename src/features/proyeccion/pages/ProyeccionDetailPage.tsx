import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Container,
  useTheme,
  alpha,
  Breadcrumbs,
  Link as MuiLink,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  EventNote as EventNoteIcon,
  NavigateNext as NavigateNextIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBox as AccountBoxIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProyecciones } from '../hooks/useProyecciones';
import { ProyeccionEstadoChip } from '../components/ProyeccionEstadoChip';

const ProyeccionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { 
    selectedProyeccion, 
    getProyeccionById, 
    removeProyeccion,
    isLoading, 
    error 
  } = useProyecciones();
  
  const [loadingData, setLoadingData] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    isDeleting: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          const proyeccionId = parseInt(id, 10);
          await getProyeccionById(proyeccionId);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, getProyeccionById]);

  const handleEdit = () => {
    navigate(`/proyecciones/${id}/editar`);
  };

  const handleDelete = () => {
    setDeleteDialog({ open: true, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      if (id) {
        await removeProyeccion(parseInt(id, 10));
        setDeleteDialog({ open: false, isDeleting: false });
        navigate('/proyecciones');
      }
    } catch (error) {
      console.error('Error al eliminar proyección:', error);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteDialog.isDeleting) {
      setDeleteDialog({ open: false, isDeleting: false });
    }
  };

  // Format date
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'PPP', { locale: es });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
            No se encontró la proyección solicitada o no tiene permisos para verla.
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

  if (!selectedProyeccion) {
    return null;
  }

  const clienteName = selectedProyeccion.cliente?.razonSocial || 
    selectedProyeccion.cliente?.comercial || 
    `Cliente #${selectedProyeccion.noCliente}`;

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
            Proyección #{selectedProyeccion.id}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography 
            variant="h4" 
            component="h1"
            fontWeight={700}
            color="text.primary"
          >
            Proyección de Pago #{selectedProyeccion.id}
          </Typography>
          
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={handleEdit}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
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
                fontWeight: 600
              }}
            >
              Eliminar
            </Button>
          </Stack>
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

        {/* Status Card */}
        <Box sx={{ mb: 4 }}>
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {getInitials(clienteName)}
                  </Avatar>
                  
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {clienteName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cliente #{selectedProyeccion.noCliente}
                    </Typography>
                  </Box>
                </Stack>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight={600} mr={1}>
                    Estado:
                  </Typography>
                  <ProyeccionEstadoChip 
                    estado={selectedProyeccion.estado} 
                    size="medium" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Main Content Cards */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Información del Cliente */}
          <Card 
            sx={{ 
              flex: '1 1 0',
              width: { xs: '100%', md: 'calc(50% - 12px)' },
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Información del Cliente
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No. Cliente
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedProyeccion.noCliente}
                    </Typography>
                    {selectedProyeccion.cliente && (
                      <Button 
                        variant="text" 
                        size="small"
                        component={Link}
                        to={`/clientes/${selectedProyeccion.noCliente}`}
                        sx={{ 
                          ml: 1,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                        startIcon={<AccountBoxIcon fontSize="small" />}
                      >
                        Ver Perfil
                      </Button>
                    )}
                  </Box>
                </Box>
                
                {selectedProyeccion.cliente && (
                  <>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Razón Social
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedProyeccion.cliente.razonSocial}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Nombre Comercial
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedProyeccion.cliente.comercial || selectedProyeccion.cliente.razonSocial}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Información de Pago */}
          <Card 
            sx={{ 
              flex: '1 1 0',
              width: { xs: '100%', md: 'calc(50% - 12px)' },
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AttachMoneyIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.success.main 
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Información de Pago
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fecha Proyectada
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(selectedProyeccion.fechaProyectada)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monto
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight={700} 
                    color="success.main"
                    sx={{ mt: 0.5 }}
                  >
                    {formatCurrency(selectedProyeccion.monto)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        
        {/* Metadata & Footer */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Creado el {format(new Date(selectedProyeccion.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Última actualización: {format(new Date(selectedProyeccion.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Typography>
          </Box>
        </Box>
        
        {/* Action Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            mt: 4
          }}
        >
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/proyecciones"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Volver a proyecciones
          </Button>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 450
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6" fontWeight="bold">
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', mb: 2 }}>
            ¿Está seguro de que desea eliminar esta proyección de pago? Esta acción no se puede deshacer y eliminará todos los datos asociados.
          </DialogContentText>
          <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
            Los datos eliminados no podrán ser recuperados posteriormente.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            disabled={deleteDialog.isDeleting}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteDialog.isDeleting}
            startIcon={deleteDialog.isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {deleteDialog.isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProyeccionDetailPage;