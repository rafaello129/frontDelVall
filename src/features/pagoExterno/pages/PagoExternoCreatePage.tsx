import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  useTheme,
  alpha,
  Divider,
  Stack
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  createPagoExterno,
  selectPagosExternosLoading,
} from '../pagoExternoSlice';
import { PagoExternoForm } from '../components/PagoExternoForm';
import type { CreatePagoExternoDto, UpdatePagoExternoDto } from '../types';
import { toast } from 'react-toastify';
import {
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

export const PagoExternoCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
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
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Stack spacing={3} mb={4}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link 
              color="inherit" 
              href="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                '&:hover': { color: theme.palette.primary.dark },
                fontWeight: 500,
              }}
            >
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Inicio
            </Link>
            <Link 
              color="inherit" 
              href="/pagos-externos"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                '&:hover': { color: theme.palette.primary.dark },
                fontWeight: 500,
              }}
            >
              <MoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
              Pagos Externos
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
              }}
            >
              <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
              Nuevo Pago
            </Typography>
          </Breadcrumbs>
          
          {/* Page Title */}
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
              Nuevo Pago Externo
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Complete el formulario para registrar un nuevo pago externo en el sistema
            </Typography>
          </Box>
        </Stack>

        {/* Form Section */}
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ 
            p: 3, 
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AddIcon 
                sx={{ 
                  fontSize: 24, 
                  color: theme.palette.primary.main 
                }} 
              />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Formulario de Registro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los campos marcados con <Box component="span" sx={{ color: 'error.main' }}>*</Box> son obligatorios
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <PagoExternoForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};