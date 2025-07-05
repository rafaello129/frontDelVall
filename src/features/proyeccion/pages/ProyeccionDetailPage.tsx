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
  List,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProyecciones } from '../hooks/useProyecciones';
import { EstadoProyeccion } from '../types';
import { TipoPago } from '../../shared/enums';
import { ProyeccionEstadoChip } from '../components/ProyeccionEstadoChip';
import { TipoPagoChip } from '../../shared/components/TipoPagoChip';
import { useBitacora } from '../../bitacora/hooks/useBitacora';
import { BitacoraListItem } from '../../bitacora/components/BitacoraListItem';

const ProyeccionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedProyeccion, 
    getProyeccionById, 
    removeProyeccion, 
    markNotificacionEnviada,
    isLoading, 
    error 
  } = useProyecciones();
  
  const { 
    proyeccionBitacoras,
    getBitacorasByProyeccion,
    isLoading: bitacoraLoading
  } = useBitacora();
  
  const [loadingData, setLoadingData] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          const proyeccionId = parseInt(id, 10);
          await getProyeccionById(proyeccionId);
          await getBitacorasByProyeccion(proyeccionId);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, getProyeccionById, getBitacorasByProyeccion]);

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

  const handleMarkNotificacion = async () => {
    try {
      if (id && selectedProyeccion && !selectedProyeccion.notificacionEnviada) {
        await markNotificacionEnviada(parseInt(id, 10));
      }
    } catch (error) {
      console.error('Error al marcar notificación como enviada:', error);
    }
  };
  
  const handleAddBitacora = () => {
    navigate(`/bitacora/nuevo?proyeccionId=${id}`);
  };
  
  const handleEditBitacora = (bitacoraId: number) => {
    navigate(`/bitacora/${bitacoraId}/editar`);
  };
  
  const handleDeleteBitacora = (bitacoraId: number) => {
    navigate(`/bitacora/${bitacoraId}`);
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
          {!selectedProyeccion.notificacionEnviada && (
            <Button
              variant="outlined"
              startIcon={<NotificationsIcon />}
              onClick={handleMarkNotificacion}
              sx={{ mr: 1 }}
            >
              Marcar Notificación Enviada
            </Button>
          )}
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

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        <Box sx={{ flex: 2 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  Estado:
                </Typography>
                <ProyeccionEstadoChip estado={selectedProyeccion.estado} />
                {selectedProyeccion.notificacionEnviada && (
                  <Chip 
                    label="Notificación Enviada" 
                    color="success" 
                    size="small"
                    icon={<NotificationsIcon />}
                  />
                )}
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

                  {/* Información de Pago */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Información de Pago
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                          <Box sx={{ minWidth: '48%' }}>
                            <Typography variant="body2" color="text.secondary">
                              Fecha Proyectada
                            </Typography>
                            <Typography variant="body1">
                              {format(new Date(selectedProyeccion.fechaProyectada), 'dd/MM/yyyy', { locale: es })}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ minWidth: '48%' }}>
                            <Typography variant="body2" color="text.secondary">
                              Monto
                            </Typography>
                            <Typography variant="body1">
                              ${selectedProyeccion.monto.toLocaleString('es-MX')}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {(selectedProyeccion.tipoCambio && selectedProyeccion.tipoCambio > 0) || 
                         (selectedProyeccion.montoDolares && selectedProyeccion.montoDolares > 0) ? (
                          <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                            {selectedProyeccion.tipoCambio && selectedProyeccion.tipoCambio > 0 && (
                              <Box sx={{ minWidth: '48%' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Tipo de Cambio
                                </Typography>
                                <Typography variant="body1">
                                  ${selectedProyeccion.tipoCambio.toLocaleString('es-MX')}
                                </Typography>
                              </Box>
                            )}
                            
                            {selectedProyeccion.montoDolares && selectedProyeccion.montoDolares > 0 && (
                              <Box sx={{ minWidth: '48%' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Monto en Dólares
                                </Typography>
                                <Typography variant="body1">
                                  USD ${selectedProyeccion.montoDolares.toLocaleString('es-MX')}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ) : null}
                        
                        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                          {selectedProyeccion.tipoPago && (
                            <Box sx={{ minWidth: '48%' }}>
                              <Typography variant="body2" color="text.secondary">
                                Tipo de Pago
                              </Typography>
                              <Box mt={0.5}>
                                <TipoPagoChip tipoPago={selectedProyeccion.tipoPago} />
                              </Box>
                            </Box>
                          )}
                          
                          {selectedProyeccion.banco && (
                            <Box sx={{ minWidth: '48%' }}>
                              <Typography variant="body2" color="text.secondary">
                                Banco
                              </Typography>
                              <Typography variant="body1">
                                {selectedProyeccion.banco.nombre}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        {selectedProyeccion.noFactura && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Número de Factura
                            </Typography>
                            <Typography variant="body1">
                              {selectedProyeccion.noFactura}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Box>
                </Box>

                {selectedProyeccion.conceptoPago && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Concepto de Pago
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedProyeccion.conceptoPago}
                      </Typography>
                    </Paper>
                  </Box>
                )}

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
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Bitácora de Seguimiento
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddBitacora}
                  size="small"
                >
                  Añadir
                </Button>
              </Box>

              {bitacoraLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress size={30} />
                </Box>
              ) : proyeccionBitacoras.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                  <Typography color="text.secondary">
                    No hay registros de bitácora para esta proyección.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddBitacora}
                    sx={{ mt: 1 }}
                    size="small"
                  >
                    Crear Primer Registro
                  </Button>
                </Paper>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {proyeccionBitacoras.map((bitacora) => (
                    <BitacoraListItem 
                      key={bitacora.id}
                      bitacora={bitacora}
                      onEdit={handleEditBitacora}
                      onDelete={handleDeleteBitacora}
                    />
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

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