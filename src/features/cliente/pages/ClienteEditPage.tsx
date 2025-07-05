import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import ClienteForm from '../components/ClienteForm';
import type { UpdateClienteDto } from '../types';
import type { CreateCorreoDto } from '../../correoCliente/types';
import type { CreateTelefonoDto } from '../../telefonoCliente/types';
import { useCorreoCliente } from '../../correoCliente/hooks/useCorreoCliente';
import { useTelefonoCliente } from '../../telefonoCliente/hooks/useTelefonoCliente';
import { motion } from 'framer-motion';
import { 
  Box, Typography, Breadcrumbs, Link as MuiLink,
  Button, CircularProgress, Alert, Paper, Divider,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const ClienteEditPage: React.FC = () => {
  const { noCliente } = useParams<{ noCliente: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  
  const { 
    selectedCliente,
    isLoading,
    error,
    getClienteById,
    editCliente,
    clearCliente
  } = useCliente();
  
  const { getCorreosByCliente, addCorreo, removeCorreo } = useCorreoCliente();
  const { getTelefonosByCliente, addTelefono, removeTelefono } = useTelefonoCliente();

  useEffect(() => {
    if (noCliente) {
      getClienteById(Number(noCliente));
    }

    return () => {
      clearCliente();
    };
  }, [noCliente, getClienteById, clearCliente]);

  const handleSubmit = async (
    clienteData: UpdateClienteDto,
    correos: CreateCorreoDto[],
    telefonos: CreateTelefonoDto[]
  ) => {
    if (!noCliente || !selectedCliente) return;
    
    setSaving(true);
    try {
      // Actualizar datos del cliente
      delete clienteData.noCliente; // Asegurarse de no enviar el noCliente en la actualización
      await editCliente(Number(noCliente), clienteData);
      
      // Gestionar correos
      // 1. Eliminar antiguos correos que no están en el nuevo arreglo
      if (selectedCliente.correos) {
        const correosExistentes = selectedCliente.correos;
        const nuevosCorreos = correos.map(c => c.correo.toLowerCase());
        
        // Eliminar correos que ya no están en la lista
        for (const correoExistente of correosExistentes) {
          if (!nuevosCorreos.includes(correoExistente.correo.toLowerCase())) {
            await removeCorreo(correoExistente.id);
          }
        }
        
        // Añadir nuevos correos
        const correosExistentesEmails = correosExistentes.map(c => c.correo.toLowerCase());
        for (const nuevoCorreo of correos) {
          if (!correosExistentesEmails.includes(nuevoCorreo.correo.toLowerCase())) {
            await addCorreo({ 
              noCliente: Number(noCliente), 
              correo: nuevoCorreo.correo 
            });
          }
        }
      } else {
        // Si no había correos antes, agregar todos los nuevos
        for (const nuevoCorreo of correos) {
          await addCorreo({ 
            noCliente: Number(noCliente), 
            correo: nuevoCorreo.correo 
          });
        }
      }
      
      // Gestionar teléfonos (similar a correos)
      if (selectedCliente.telefonos) {
        const telefonosExistentes = selectedCliente.telefonos;
        const nuevosTelefonos = telefonos.map(t => t.telefono);
        
        // Eliminar teléfonos que ya no están en la lista
        for (const telExistente of telefonosExistentes) {
          if (!nuevosTelefonos.includes(telExistente.telefono)) {
            await removeTelefono(telExistente.id);
          }
        }
        
        // Añadir nuevos teléfonos
        const telefonosExistentesNums = telefonosExistentes.map(t => t.telefono);
        for (const nuevoTel of telefonos) {
          if (!telefonosExistentesNums.includes(nuevoTel.telefono)) {
            await addTelefono({ 
              noCliente: Number(noCliente), 
              telefono: nuevoTel.telefono 
            });
          }
        }
      } else {
        // Si no había teléfonos antes, agregar todos los nuevos
        for (const nuevoTel of telefonos) {
          await addTelefono({ 
            noCliente: Number(noCliente), 
            telefono: nuevoTel.telefono 
          });
        }
      }
      
      navigate(`/clientes/${noCliente}`);
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} maxWidth="lg" mx="auto">
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          variant="filled"
        >
          {error}
        </Alert>
        
        <Box display="flex" justifyContent="center">
          <Button
            component={Link}
            to="/clientes"
            startIcon={<ArrowBackIcon />}
            variant="contained"
            color="primary"
          >
            Volver a la lista de clientes
          </Button>
        </Box>
      </Box>
    );
  }

  if (!selectedCliente) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

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
          <MuiLink
            component={Link}
            to={`/clientes/${noCliente}`}
            underline="hover"
            color="inherit"
          >
            {selectedCliente.noCliente} - {selectedCliente.razonSocial}
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
            Editar
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
            to={`/clientes/${noCliente}`}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Volver
          </Button>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Editar Cliente: {selectedCliente.noCliente} - {selectedCliente.razonSocial}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ position: 'relative' }}>
          <ClienteForm 
            cliente={selectedCliente} 
            onSubmit={handleSubmit} 
            isEdit={true}
            isSaving={saving}
          />
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

export default ClienteEditPage;