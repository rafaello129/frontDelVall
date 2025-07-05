import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { BitacoraForm } from '../components/BitacoraForm';
import { useBitacora } from '../hooks/useBitacora';
import type { CreateBitacoraPagoDto, UpdateBitacoraPagoDto } from '../types';

const BitacoraCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addBitacora, isLoading } = useBitacora();
  const location = useLocation();
  
  // Get query parameters for proyeccionId and noCliente
  const queryParams = new URLSearchParams(location.search);
  const proyeccionId = queryParams.get('proyeccionId') ? Number(queryParams.get('proyeccionId')) : undefined;
  const noCliente = queryParams.get('noCliente') ? Number(queryParams.get('noCliente')) : undefined;

  // Fix the type to match what BitacoraForm expects
  const handleSubmit = async (data: CreateBitacoraPagoDto | UpdateBitacoraPagoDto) => {
    try {
      // Since we're creating, we know the data should be valid for CreateBitacoraPagoDto
      await addBitacora(data as CreateBitacoraPagoDto);
      // Navigate based on where we came from
      if (noCliente) {
        navigate(`/clientes/${noCliente}`);
      } else if (proyeccionId) {
        navigate(`/proyecciones/${proyeccionId}`);
      } else {
        navigate('/bitacora');
      }
    } catch (error) {
      console.error('Error al crear entrada en bitácora:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nuevo Registro en Bitácora
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Añade un nuevo registro en la bitácora de pagos.
        </Typography>
        
        <BitacoraForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          proyeccionId={proyeccionId}
          noCliente={noCliente}
        />
      </Box>
    </Container>
  );
};

export default BitacoraCreatePage;