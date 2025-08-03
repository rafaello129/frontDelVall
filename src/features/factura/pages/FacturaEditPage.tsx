import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFacturas } from '../hooks/useFacturas';
import FacturaForm from '../../../components/factura/FacturaForm';
import { Box, Typography, Breadcrumbs, Link as MuiLink, CircularProgress, Alert, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import type { UpdateFacturaDto } from '../types';

const FacturaEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFacturaById, selectedFactura, updateFacturaById, isLoading, error } = useFacturas();
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) getFacturaById(id);
  }, [id, getFacturaById]);

  const handleSubmit = async (data: UpdateFacturaDto) => {
    try {
      await updateFacturaById(id!, data);
      setSuccess('Factura actualizada correctamente');
      setTimeout(() => navigate(`/facturas/${id}`), 1000);
    } catch (e) { /* manejar error */ }
  };

  if (isLoading) return <Box textAlign="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!selectedFactura) return <Alert severity="warning">No se encontró la factura.</Alert>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> Inicio
        </MuiLink>
        <MuiLink component={Link} to="/facturas" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> Facturas
        </MuiLink>
        <MuiLink component={Link} to={`/facturasView/${id}`} underline="hover" color="inherit">
          Ver factura
        </MuiLink>
        <Typography color="text.primary">Editar factura</Typography>
      </Breadcrumbs>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" mb={2}>Editar Factura</Typography>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <FacturaForm
          factura={selectedFactura}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/facturasView/${id}`)}
          isLoading={isLoading}
          isEditing
        />
      </Paper>
    </Box>
  );
};

export default FacturaEditPage;