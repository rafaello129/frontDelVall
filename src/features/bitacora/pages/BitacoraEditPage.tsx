import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { BitacoraForm } from '../components/BitacoraForm';
import { useBitacora } from '../hooks/useBitacora';
import type { UpdateBitacoraPagoDto } from '../types';

const BitacoraEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedBitacora, getBitacoraById, editBitacora, isLoading, error } = useBitacora();
  const [loadingData, setLoadingData] = useState(true);

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

  const handleSubmit = async (data: UpdateBitacoraPagoDto) => {
    try {
      if (id) {
        await editBitacora(parseInt(id, 10), data);
        
        // Navigate based on where the record came from
        if (selectedBitacora?.noCliente) {
          navigate(`/clientes/${selectedBitacora.noCliente}`);
        } else if (selectedBitacora?.proyeccionId) {
          navigate(`/proyecciones/${selectedBitacora.proyeccionId}`);
        } else {
          navigate('/bitacora');
        }
      }
    } catch (error) {
      console.error('Error al actualizar entrada en bitácora:', error);
    }
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

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Registro en Bitácora
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Edita la información del registro en la bitácora de pagos.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {selectedBitacora && (
          <BitacoraForm 
            initialData={selectedBitacora} 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
          />
        )}
      </Box>
    </Container>
  );
};

export default BitacoraEditPage;