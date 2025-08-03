import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ProyeccionForm } from '../components/ProyeccionForm';
import { useProyecciones } from '../hooks/useProyecciones';
import type { UpdateProyeccionPagoDto } from '../types';

const ProyeccionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedProyeccion, getProyeccionById, editProyeccion, isLoading, error } = useProyecciones();
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadProyeccion = async () => {
      try {
        if (id) {
          await getProyeccionById(parseInt(id, 10));
        }
      } catch (error) {
        console.error('Error loading proyeccion:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadProyeccion();
  }, [id, getProyeccionById]);

  const handleSubmit = async (data: UpdateProyeccionPagoDto) => {
    try {
      if (id) {
        await editProyeccion(parseInt(id, 10), data);
        navigate(`/proyecciones/${id}`);
      }
    } catch (error) {
      console.error('Error al actualizar proyección de pago:', error);
    }
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
        No se encontró la proyección solicitada o no tiene permisos para editarla.
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Proyección de Pago
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Actualiza la información esencial de esta proyección de pago.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {selectedProyeccion && (
          <ProyeccionForm 
            initialData={selectedProyeccion} 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
          />
        )}
      </Box>
    </Container>
  );
};

export default ProyeccionEditPage;