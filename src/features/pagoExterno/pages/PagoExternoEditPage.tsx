import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
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

export const PagoExternoEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pagoExterno = useAppSelector(selectSelectedPagoExterno);
  const isLoading = useAppSelector(selectPagosExternosLoading);
  const error = useAppSelector(selectPagosExternosError);

  useEffect(() => {
    if (id) {
      dispatch(fetchPagoExternoById(parseInt(id)))
        .unwrap()
        .catch(error => {
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
        .catch(error => {
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!pagoExterno && !isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 3, mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h2">
            Pago externo no encontrado
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Editar Pago Externo
        </Typography>

        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/">
            Inicio
          </Link>
          <Link color="inherit" href="/pagos-externos">
            Pagos Externos
          </Link>
          <Link color="inherit" href={`/pagos-externos/${id}`}>
            Detalle
          </Link>
          <Typography color="text.primary">Editar</Typography>
        </Breadcrumbs>

        {pagoExterno && (
          <PagoExternoForm
            initialData={pagoExterno}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            isEditing={true}
          />
        )}
      </Box>
    </Container>
  );
};