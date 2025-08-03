import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProyeccionForm } from '../components/ProyeccionForm';
import { useProyecciones } from '../hooks/useProyecciones';
import type { CreateProyeccionPagoDto, UpdateProyeccionPagoDto } from '../types';

const ProyeccionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProyeccion, isLoading } = useProyecciones();
  
  // Get query parameters if coming from client page
  const queryParams = new URLSearchParams(location.search);
  const noCliente = queryParams.get('noCliente') ? Number(queryParams.get('noCliente')) : undefined;

  const handleSubmit = async (data: CreateProyeccionPagoDto | UpdateProyeccionPagoDto) => {
    try {
      // Since we're creating, we know it's a CreateProyeccionPagoDto
      const result = await addProyeccion(data as CreateProyeccionPagoDto);
      navigate(`/proyecciones/${result.id}`);
    } catch (error) {
      console.error('Error al crear proyección de pago:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nueva Proyección de Pago
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Registra una nueva proyección de pago con los datos esenciales.
        </Typography>
        
        <ProyeccionForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          initialNoCliente={noCliente}
        />
      </Box>
    </Container>
  );
};

export default ProyeccionCreatePage;