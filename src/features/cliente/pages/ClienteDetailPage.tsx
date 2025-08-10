import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import ClienteDetail from '../components/ClienteDetail';
import { 
  Box, Typography, Breadcrumbs, Link as MuiLink,
  Button, CircularProgress, Alert, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle,
  Fade, Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ClienteDetailPage: React.FC = () => {
  const { noCliente } = useParams<{ noCliente: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { 
    selectedCliente,
    isLoading,
    error,
    getClienteById,
    removeCliente,
    clearCliente
  } = useCliente();

  useEffect(() => {
    if (noCliente) {
      getClienteById(Number(noCliente));
    }

    return () => {
      clearCliente();
    };
  }, [noCliente, getClienteById, clearCliente]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCliente) return;
    
    try {
      await removeCliente(selectedCliente.noCliente);
      setDeleteDialogOpen(false);
      navigate('/clientes');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
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
      <Fade in timeout={500}>
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
      </Fade>
    );
  }

  if (!selectedCliente) {
    return (
      <Fade in timeout={500}>
        <Box p={3} maxWidth="lg" mx="auto">
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            variant="filled"
          >
            Cliente no encontrado
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
      </Fade>
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
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            {selectedCliente.noCliente} - {selectedCliente.razonSocial}
          </Typography>
        </Breadcrumbs>

        {/* Header with back button and actions */}
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={Link}
              to="/clientes"
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              Volver
            </Button>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {selectedCliente.noCliente} - {selectedCliente.razonSocial}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              to={`/clientes/${selectedCliente.noCliente}/editar`}
              startIcon={<EditIcon />}
              variant="outlined"
              color="primary"
            >
              Editar
            </Button>
            <Button
              onClick={handleDeleteClick}
              startIcon={<DeleteIcon />}
              variant="contained"
              color="error"
            >
              Eliminar
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Client details */}
        <ClienteDetail cliente={selectedCliente} showActions={false} />

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Está seguro que desea eliminar al cliente <strong>{selectedCliente.razonSocial}</strong>? 
              Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default ClienteDetailPage;