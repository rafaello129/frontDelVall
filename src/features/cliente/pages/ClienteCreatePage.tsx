import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import { useTelefonoCliente } from '../../telefonoCliente/hooks/useTelefonoCliente';
import { useCorreoCliente } from '../../correoCliente/hooks/useCorreoCliente';
import ClienteForm from '../components/ClienteForm';
import type { CreateClienteDto, UpdateClienteDto } from '../types';
import type { CreateCorreoDto } from '../../correoCliente/types';
import type { CreateTelefonoDto } from '../../telefonoCliente/types';
import { motion } from 'framer-motion';
import { 
  Box, Typography, Breadcrumbs, Link as MuiLink,
  Button, Alert, Divider, Snackbar, useTheme, CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ClienteCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { addCliente } = useCliente();
  const { addCorreo } = useCorreoCliente();
  const { addTelefono } = useTelefonoCliente();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    clienteData: CreateClienteDto | UpdateClienteDto,
    correos: CreateCorreoDto[],
    telefonos: CreateTelefonoDto[]
  ) => {
    setSaving(true);
    setError(null);
    
    try {
      // We know this is a create operation, so we can cast it
      // The form will clean the data before sending it
      const createData = clienteData as CreateClienteDto;
      
      // Remove any properties that shouldn't be sent to the API
      const { rfc, limiteCredito, ...cleanData } = createData as any;
      
      // Crear cliente
      const nuevoCliente = await addCliente(cleanData);
      
      // Crear correos si hay
      if (correos.length > 0) {
        const correosPromises = correos.map(correo => 
          addCorreo({ ...correo, noCliente: nuevoCliente.noCliente })
        );
        await Promise.all(correosPromises);
      }
      
      // Crear teléfonos si hay
      if (telefonos.length > 0) {
        const telefonosPromises = telefonos.map(telefono => 
          addTelefono({ ...telefono, noCliente: nuevoCliente.noCliente })
        );
        await Promise.all(telefonosPromises);
      }
      
      navigate(`/clientes/${nuevoCliente.noCliente}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        // Check if it's an array of validation errors
        if (Array.isArray(error.response.data.message)) {
          const errorMessages = error.response.data.message.join(', ');
          setError(errorMessages);
        } else {
          setError(error.response.data.message);
        }
      } else {
        setError(`Error al crear cliente: ${error.message || 'Error desconocido'}`);
      }
      console.error('Error al crear cliente:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box p={3} maxWidth="lg" mx="auto">
        {/* Breadcrumbs navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <MuiLink 
            component={Link} 
            to="/" 
            underline="hover" 
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Inicio
          </MuiLink>
          <MuiLink
            component={Link}
            to="/clientes"
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
            Clientes
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonAddIcon fontSize="small" sx={{ mr: 0.5 }} />
            Crear Nuevo Cliente
          </Typography>
        </Breadcrumbs>

        {/* Header with back button */}
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Button
            component={Link}
            to="/clientes"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Volver
          </Button>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Crear Nuevo Cliente
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Error message if exists */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative' }}>
          <ClienteForm onSubmit={handleSubmit} isSaving={saving} />
          {saving && (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1
              }}
            >
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default ClienteCreatePage;