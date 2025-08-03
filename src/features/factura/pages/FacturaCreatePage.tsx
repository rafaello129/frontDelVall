import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFacturas } from '../hooks/useFacturas';
import FacturaForm from '../../../components/factura/FacturaForm';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Fade,
  Paper,
  Divider,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type { CreateFacturaDto, UpdateFacturaDto } from '../types';

const FacturaCreatePage: React.FC = () => {
  const { addFactura, isLoading } = useFacturas();
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (data: CreateFacturaDto | UpdateFacturaDto) => {
    try {
      const factura = await addFactura(data as CreateFacturaDto);
      setSuccess('Factura creada correctamente');
      setTimeout(() => navigate(`/facturas/${factura.noFactura}`), 1000);
    } catch (e) {
      // opcional: agregar manejo de error real
    }
  };

  return (
    <Fade in>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ 
              mb: 3,
              '& .MuiBreadcrumbs-ol': {
                alignItems: 'center'
              },
              px: 1
            }}
          >
            <MuiLink 
              component={Link} 
              to="/" 
              color="inherit" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.primary.dark
                }
              }}
            >
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> Inicio
            </MuiLink>
            <MuiLink 
              component={Link} 
              to="/facturas" 
              color="inherit" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: theme.palette.primary.main,
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.primary.dark
                }
              }}
            >
              <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> Facturas
            </MuiLink>
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
              Nueva factura
            </Typography>
          </Breadcrumbs>
          
          {/* Page Header */}
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 3,
              px: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AddIcon 
                sx={{ 
                  fontSize: 24, 
                  color: theme.palette.primary.main 
                }} 
              />
            </Box>
            Crear Nueva Factura
          </Typography>

          {/* Main Content Card */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 3, md: 4 },
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: 3
            }}>
              <Typography variant="body1" color="text.secondary">
                Complete los siguientes campos para registrar una nueva factura en el sistema.
                Los campos marcados con <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>*</Box> son obligatorios.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                }}
              >
                {success}
              </Alert>
            )}

            <FacturaForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/facturas')}
              isLoading={isLoading}
              isEditing={false}
            />
          </Paper>
        </Box>
      </Container>
    </Fade>
  );
};

export default FacturaCreatePage;