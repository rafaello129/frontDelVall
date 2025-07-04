import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchPagoExternoById,
  deletePagoExterno,
  selectSelectedPagoExterno,
  selectPagosExternosLoading,
  selectPagosExternosError,
} from '../pagoExternoSlice';
import { PagoExternoDetail } from '../components/PagoExternoDetail';
import { toast } from 'react-toastify';

export const PagoExternoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pagoExterno = useAppSelector(selectSelectedPagoExterno);
  const isLoading = useAppSelector(selectPagosExternosLoading);
  const error = useAppSelector(selectPagosExternosError);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPagoExternoById(parseInt(id)))
        .unwrap()
        .catch(error => {
          toast.error('Error al cargar los detalles del pago externo');
          navigate('/pagos-externos');
        });
    }
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEdit = () => {
    if (id) {
      navigate(`/pagos-externos/editar/${id}`);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (id) {
      dispatch(deletePagoExterno(parseInt(id)))
        .unwrap()
        .then(() => {
          toast.success('Pago externo eliminado exitosamente');
          navigate('/pagos-externos');
        })
        .catch(error => {
          toast.error('Error al eliminar el pago externo');
          setDeleteDialogOpen(false);
        });
    }
  };

  const handleBack = () => {
    navigate('/pagos-externos');
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!pagoExterno && !isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 3, mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h2">
            Pago externo no encontrado
          </Typography>
          <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Detalle del Pago Externo
          </Typography>
         
        </Box>

        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/">
            Inicio
          </Link>
          <Link color="inherit" href="/pagos-externos">
            Pagos Externos
          </Link>
          <Typography color="text.primary">Detalle</Typography>
        </Breadcrumbs>

        {pagoExterno && (
          <PagoExternoDetail
            pagoExterno={pagoExterno}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBack={handleBack}
          />
        )}
      </Box>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este pago externo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};