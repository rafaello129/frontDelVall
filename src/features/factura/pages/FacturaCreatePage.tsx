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
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import type { CreateFacturaDto, UpdateFacturaDto } from '../types';

const FacturaCreatePage: React.FC = () => {
  const { addFactura, isLoading } = useFacturas();
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

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
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f7f9fc',
          py: { xs: 4, md: 6 },
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
            separator="›"
          >
            <MuiLink
              component={Link}
              to="/"
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <HomeIcon fontSize="small" />
              Inicio
            </MuiLink>
            <MuiLink
              component={Link}
              to="/facturas"
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ReceiptIcon fontSize="small" />
              Facturas
            </MuiLink>
            <Typography color="primary" fontWeight={600}>
              Nueva factura
            </Typography>
          </Breadcrumbs>

          {/* Card */}
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 4, md: 5 },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
              },
              bgcolor: '#fff',
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mb: 1, color: 'text.primary' }}
            >
              Crear nueva factura
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Completa los siguientes campos para registrar una nueva factura en el sistema.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
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
      </Box>
    </Fade>
  );
};

export default FacturaCreatePage;
