import React, { useEffect, useState } from 'react';
import { useFacturas } from '../hooks/useFacturas';
import FacturasTable from '../../../components/factura/FacturasTable';

import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Collapse, 
  Alert, 
  Breadcrumbs, 
  Link as MuiLink, 
  CircularProgress, 
  Container,
  useTheme,
  alpha,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterListIcon, 
  ExpandLess as ExpandLessIcon, 
  BarChart, 
  InsertChartOutlinedSharp, 
  Home as HomeIcon, 
  Receipt as ReceiptIcon,
  Search as SearchIcon
} from '@mui/icons-material';
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
  const theme = useTheme();

  useEffect(() => { getAllFacturas(filters); }, [getAllFacturas, filters]);
  useEffect(() => { 
    if (successMessage) { 
      const timer = setTimeout(() => setSuccessMessage(null), 5000); 
      return () => clearTimeout(timer); 
    } 
  }, [successMessage]);

  const handleFilterChange = (key: any, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, skip: 0 }));
    setPage(0);
  };
  
  const handleResetFilters = () => {
    setFilters({ limit: 25, skip: 0, incluirCliente: true });
    setPage(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            sx={{ 
              mb: 3,
              '& .MuiBreadcrumbs-ol': {
                alignItems: 'center'
              }
            }}
          >
            <MuiLink 
              component={Link} 
              to="/" 
              underline="hover" 
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
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> Facturas
            </Typography>
          </Breadcrumbs>
          
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3, 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold"
                color="text.primary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5
                }}
              >
                <ReceiptIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
                Gestión de Facturas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Administre todas las facturas emitidas a sus clientes
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1.5, 
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
              <Button 
                variant="outlined" 
                startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />} 
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
              
              <Button 
                component={Link} 
                to="/facturas/csv" 
                variant="outlined" 
                color="secondary" 
                startIcon={<BarChart />} 
                sx={{ 
                  whiteSpace: 'nowrap', 
                  display: { xs: 'none', sm: 'flex' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Subir CSV
              </Button>
              
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => navigate('/facturas/nueva')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2
                }}
              >
                Nueva Factura
              </Button>
              
              <Button 
                component={Link} 
                to="/facturas/excel" 
                variant="outlined" 
                startIcon={<InsertChartOutlinedSharp />} 
                sx={{ 
                  whiteSpace: 'nowrap',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Exportar Excel
              </Button>
            </Box>
          </Box>
          
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }} 
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Filter Section */}
          <Collapse in={showFilters}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                mb: 3, 
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2
              }}>
                <SearchIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Buscar Facturas
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <FacturaFilter 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onReset={handleResetFilters} 
                onApply={() => getAllFacturas(filters)} 
                isLoading={isLoading} 
              />
            </Paper>
          </Collapse>
          
          {/* Main Table */}
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden', 
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
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
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                zIndex: 2
              }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                  Cargando facturas...
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Tips Section */}
          <Box sx={{ mt: 3 }}>
            <Tooltip title="Consejos para gestionar sus facturas">
              <Chip 
                icon={<ReceiptIcon fontSize="small" />} 
                label="Tips para gestión de facturas" 
                color="default"
                variant="outlined"
                sx={{ 
                  borderRadius: 2, 
                  px: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }}
              />
            </Tooltip>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Puede filtrar las facturas por cliente, estado o fecha. Use la función de exportación a Excel para generar reportes personalizados.
            </Typography>
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
};

export default FacturasPage;