import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
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
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProyecciones } from '../hooks/useProyecciones';
import { ProyeccionEstadoChip } from '../components/ProyeccionEstadoChip';

const ProyeccionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedProyeccion, 
    getProyeccionById, 
    removeProyeccion,
    isLoading, 
    error 
  } = useProyecciones();
  
  const [loadingData, setLoadingData] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);

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
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (id) {
        await removeProyeccion(parseInt(id, 10));
        setDeleteDialog(false);
        navigate('/proyecciones');
      }
    } catch (error) {
      console.error('Error al eliminar proyección:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedProyeccion && !isLoading) {
    return (
      <Alert severity="error">
        No se encontró la proyección solicitada o no tiene permisos para verla.
      </Alert>
    );
  }

  if (!selectedProyeccion) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/proyecciones')} 
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Proyección de Pago #{selectedProyeccion.id}
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Editar
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6">
              Estado:
            </Typography>
            <ProyeccionEstadoChip estado={selectedProyeccion.estado} />
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3}>
              {/* Información del Cliente */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Información del Cliente
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        No. Cliente
                      </Typography>
                      <Typography variant="body1">
                        {selectedProyeccion.noCliente}
                        {selectedProyeccion.cliente && (
                          <Button 
                            variant="text" 
                            size="small"
                            onClick={() => navigate(`/clientes/${selectedProyeccion.noCliente}`)}
                            sx={{ ml: 1 }}
                          >
                            Ver Cliente
                          </Button>
                        )}
                      </Typography>
                    </Box>
                    
                    {selectedProyeccion.cliente && (
                      <>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Razón Social
                          </Typography>
                          <Typography variant="body1">
                            {selectedProyeccion.cliente.razonSocial}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Nombre Comercial
                          </Typography>
                          <Typography variant="body1">
                            {selectedProyeccion.cliente.comercial || selectedProyeccion.cliente.razonSocial}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Paper>
              </Box>

              {/* Información de Pago - Simplified */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Información de Pago
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha Proyectada
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(selectedProyeccion.fechaProyectada), 'dd/MM/yyyy', { locale: es })}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monto
                      </Typography>
                      <Typography variant="body1">
                        ${selectedProyeccion.monto.toLocaleString('es-MX')}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Box>

            <Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Creado el {format(new Date(selectedProyeccion.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Última actualización: {format(new Date(selectedProyeccion.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta proyección de pago? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProyeccionDetailPage;