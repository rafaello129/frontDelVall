import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  createPagoExterno,
  selectPagosExternosLoading,
} from '../pagoExternoSlice';
import { PagoExternoForm } from '../components/PagoExternoForm';
import type { CreatePagoExternoDto, UpdatePagoExternoDto } from '../types';
import { toast } from 'react-toastify';

export const PagoExternoCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectPagosExternosLoading);

  // Change the function to accept the union type
  const handleSubmit = (data: CreatePagoExternoDto | UpdatePagoExternoDto) => {
    // Since we're in the create page, we can safely cast it to CreatePagoExternoDto
    dispatch(createPagoExterno(data as CreatePagoExternoDto))
      .unwrap()
      .then(() => {
        toast.success('Pago externo creado exitosamente');
        navigate('/pagos-externos');
      })
      .catch(error => {
        toast.error('Error al crear el pago externo');
      });
  };

  const handleCancel = () => {
    navigate('/pagos-externos');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Nuevo Pago Externo
        </Typography>

        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/">
            Inicio
          </Link>
          <Link color="inherit" href="/pagos-externos">
            Pagos Externos
          </Link>
          <Typography color="text.primary">Nuevo</Typography>
        </Breadcrumbs>

        <PagoExternoForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </Box>
    </Container>
  );
};