import React, { useEffect, useState } from 'react';
import { useFacturas } from '../hooks/useFacturas';
import FacturasTable from '../../../components/factura/FacturasTable';

import { Box, Typography, Paper, Button, Collapse, Alert, Breadcrumbs, Link as MuiLink, CircularProgress } from '@mui/material';
import { Add as AddIcon, FilterList as FilterListIcon, Refresh as RefreshIcon, ExpandLess as ExpandLessIcon, BarChart, InsertChartOutlinedSharp, Home as HomeIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FacturaFilter from '../components/FacturaFilter';

const FacturasPage: React.FC = () => {
  const { isLoading, error, getAllFacturas } = useFacturas();
  const [filters, setFilters] = useState({ limit: 10, skip: 0, incluirCliente: true });
  const [showFilters, setShowFilters] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { getAllFacturas(filters); }, [getAllFacturas, filters]);
  useEffect(() => { if (successMessage) { const timer = setTimeout(() => setSuccessMessage(null), 5000); return () => clearTimeout(timer); } }, [successMessage]);

  const handleFilterChange = (key: any, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, skip: 0 }));
    setPage(0);
  };
  const handleResetFilters = () => {
    setFilters({ limit: 25, skip: 0, incluirCliente: true });
    setPage(0);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> Inicio
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> Facturas
          </Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Facturas
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />} onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Ocultar filtros' : 'Filtros'}
            </Button>
            <Button component={Link} to="/facturas/csv" variant="outlined" color="secondary" startIcon={<BarChart />} sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'flex' } }}>
              Subir CSV
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/facturas/nueva')}>
              Nueva Factura
            </Button>
            <Button component={Link} to="/facturas/excel" variant="outlined" startIcon={<InsertChartOutlinedSharp />} sx={{ whiteSpace: 'nowrap' }}>
              Exportar Excel
            </Button>
          </Box>
        </Box>
        {successMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Collapse in={showFilters}>
          <FacturaFilter filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} onApply={() => getAllFacturas(filters)} isLoading={isLoading} />
        </Collapse>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          <FacturasTable
            page={page}
            setPage={setPage}
            filters={filters}
            isLoading={isLoading}
            onView={factura => navigate(`/facturasView/${factura.noFactura}`)}
            onEdit={factura => navigate(`/facturas/${factura.noFactura}/editar`)}
            onDelete={() => { /* tu lógica de borrado aquí, o modal global */ }}
          />
          {isLoading && (
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
        </Paper>
      </Box>
    </motion.div>
  );
};
export default FacturasPage;  