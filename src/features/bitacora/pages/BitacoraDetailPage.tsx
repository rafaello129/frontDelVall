import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Chip,
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
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBitacora } from '../hooks/useBitacora';
import { TipoBitacoraChip } from '../components/TipoBitacoraChip';
import { SucursalBadge } from '../../shared/components/SucursalBadge';

const BitacoraDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedBitacora, getBitacoraById, removeBitacora, isLoading, error } = useBitacora();
  const [loadingData, setLoadingData] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);

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

  const handleEdit = () => {
    navigate(`/bitacora/${id}/editar`);
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (id) {
        await removeBitacora(parseInt(id, 10));
        setDeleteDialog(false);
        navigate('/bitacora');
      }
    } catch (error) {
      console.error('Error al eliminar entrada de bitácora:', error);
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

  if (!selectedBitacora && !isLoading) {
    return (
      <Alert severity="error">
        No se encontró la entrada de bitácora solicitada o no tiene permisos para verla.
      </Alert>
    );
  }

  if (!selectedBitacora) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/bitacora')} 
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Detalle de Bitácora
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
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EventIcon color="action" />
              <Typography variant="h6">
                {format(new Date(selectedBitacora.fecha), 'dd MMMM yyyy, HH:mm', { locale: es })}
              </Typography>
              <TipoBitacoraChip tipo={selectedBitacora.tipo} />
              {selectedBitacora.sucursal && <SucursalBadge sucursal={selectedBitacora.sucursal} />}
            </Box>
            <Divider />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mt={3}>
            <Box flex={1}>
              <Typography variant="subtitle1" gutterBottom>
                Información del Cliente
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        No. Cliente
                      </Typography>
                      <Typography variant="body1">
                        {selectedBitacora.noCliente}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Clasificación
                      </Typography>
                      <Typography variant="body1">
                        {selectedBitacora.clasificacion || 'No especificada'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Razón Social
                    </Typography>
                    <Typography variant="body1">
                      {selectedBitacora.razonSocial}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nombre Comercial
                    </Typography>
                    <Typography variant="body1">
                      {selectedBitacora.comercial}
                    </Typography>
                  </Box>
                  
                  {selectedBitacora.telefono && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body1">
                        {selectedBitacora.telefono}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Box>

            <Box flex={1}>
              <Typography variant="subtitle1" gutterBottom>
                Información de Pago
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {selectedBitacora.banco && selectedBitacora.moneda && (
                    <Box display="flex" justifyContent="space-between">
                      {selectedBitacora.banco && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Banco
                          </Typography>
                          <Typography variant="body1">
                            {selectedBitacora.banco}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedBitacora.moneda && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Moneda
                          </Typography>
                          <Typography variant="body1">
                            {selectedBitacora.moneda}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {selectedBitacora.ubicacion && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Ubicación
                      </Typography>
                      <Typography variant="body1">
                        {selectedBitacora.ubicacion}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedBitacora.envioCorreo && selectedBitacora.timbrado && (
                    <Box display="flex" justifyContent="space-between">
                      {selectedBitacora.envioCorreo && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Estado de Envío de Correo
                          </Typography>
                          <Typography variant="body1">
                            {selectedBitacora.envioCorreo}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedBitacora.timbrado && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Estado de Timbrado
                          </Typography>
                          <Typography variant="body1">
                            {selectedBitacora.timbrado}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {selectedBitacora.proyeccionId && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Proyección Relacionada
                      </Typography>
                      <Button
                        variant="text"
                        onClick={() => navigate(`/proyecciones/${selectedBitacora.proyeccionId}`)}
                      >
                        Ver Proyección #{selectedBitacora.proyeccionId}
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Box>
          </Box>

          {(selectedBitacora.comentario || selectedBitacora.contestacion) && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Comentarios y Respuestas
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={3}>
                  {selectedBitacora.comentario && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Comentario
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ p: 2, bgcolor: 'background.default' }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedBitacora.comentario}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                  {selectedBitacora.contestacion && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Respuesta
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ p: 2, bgcolor: 'background.default' }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedBitacora.contestacion}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Box>
          )}

          <Box>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Creado el {format(new Date(selectedBitacora.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                {selectedBitacora.creadoPor && ` por ${selectedBitacora.creadoPor}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última actualización: {format(new Date(selectedBitacora.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </Typography>
            </Box>
          </Box>
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
            ¿Estás seguro de que deseas eliminar esta entrada de la bitácora? Esta acción no se puede deshacer.
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

export default BitacoraDetailPage;