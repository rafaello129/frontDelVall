import React, { useEffect, useState } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import CobranzasFilter from '../components/cobranzasFilters';
import CobranzasTable from '../../../components/cobranza/CobranzasTable';
import type { FilterCobranzaDto } from '../types';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Pagination,
  Button,
  Container,
  useTheme,
  alpha,
  Chip,

  Stack,
  CircularProgress
} from '@mui/material';
import {
  Payment as PaymentIcon,
  InsertChartOutlinedSharp as InsertChartIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';

const CobranzasPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { 
    cobranzas,
    isLoading,
    error,
    getAllCobranzas,
    removeCobranza
  } = useCobranzas();
  
  const [filters, setFilters] = useState<FilterCobranzaDto>({
    limit: 25,
    skip: 0,
    incluirBanco: true,
    incluirCliente: true,
    incluirFactura: true,
    order: 'desc',
    sortBy: 'fechaPago'
  });
  
  const [filtersVisible, setFiltersVisible] = useState(true);
  
  useEffect(() => {
    getAllCobranzas(filters);
  }, [getAllCobranzas, filters]);

  const handleFilterChange = (newFilters: FilterCobranzaDto) => {
    // Reset pagination when filters change
    setFilters({
      ...newFilters,
      skip: 0, // Reset to first page when filter changes
    });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    const newSkip = (page - 1) * filters.limit;
    setFilters(prevFilters => ({
      ...prevFilters,
      skip: newSkip
    }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este pago?')) {
      try {
        await removeCobranza(id);
        getAllCobranzas(filters);
      } catch (error) {
        console.error('Error al eliminar pago:', error);
      }
    }
  };

  // Calculate current page for pagination
  const currentPage = Math.floor(filters.skip / filters.limit) + 1;
  const totalPages = Math.ceil((cobranzas.length > 0 ? filters.limit * 2 : 0) / filters.limit);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4
        }}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              color="text.primary"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                mb: 0.5
              }}
            >
              <PaymentIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
              Gestión de Cobranza
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administre todos los pagos recibidos de sus clientes
            </Typography>
          </Box>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1.5} 
            sx={{ 
              display: 'flex',
              alignItems: { xs: 'stretch', sm: 'center' }
            }}
          >
            <Button 
              component={Link}
              to="/cobranzas/csv"
              variant="outlined"
              color="secondary"
              startIcon={<FileUploadIcon />}
              sx={{ 
                borderRadius: 2,
                py: 1,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Importar CSV
            </Button>
            
            <Button 
              component={Link}
              to="/cobranza/nueva"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2,
                py: 1,
                px: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Registrar Pago
            </Button>
            
            <Button 
              component={Link} 
              to="/cobranzas/excel" 
              variant="outlined" 
              startIcon={<InsertChartIcon />}
              sx={{ 
                borderRadius: 2,
                py: 1,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Exportar Excel
            </Button>
          </Stack>
        </Box>
        
        {/* Stats & Filter Toggle */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
 
            
            {filters.fechaDesde && (
              <Chip
                label={`Desde: ${new Date(filters.fechaDesde).toLocaleDateString()}`}
                color="primary"
                variant="outlined"
                onDelete={() => setFilters({...filters, fechaDesde: undefined})}
                sx={{ borderRadius: 2 }}
              />
            )}
            
            {filters.fechaHasta && (
              <Chip
                label={`Hasta: ${new Date(filters.fechaHasta).toLocaleDateString()}`}
                color="primary"
                variant="outlined"
                onDelete={() => setFilters({...filters, fechaHasta: undefined})}
                sx={{ borderRadius: 2 }}
              />
            )}
            
            {(filters.bancoId || filters.noCliente || filters.tipoPago) && (
              <Chip
                label="Filtros activos"
                color="secondary"
                variant="outlined"
                onDelete={() => setFilters({
                  ...filters,
                  bancoId: undefined,
                  noCliente: undefined,
                  tipoPago: undefined
                })}
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
          
          <Button
            color="primary"
            startIcon={filtersVisible ? <RefreshIcon /> : <FilterListIcon />}
            onClick={() => setFiltersVisible(!filtersVisible)}
            sx={{ 
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </Box>

        {/* Filter Component */}
        {filtersVisible && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <Typography 
              variant="subtitle1" 
              fontWeight={600}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2
              }}
            >
              <FilterListIcon color="primary" fontSize="small" />
              Filtrar Pagos
            </Typography>
            
            <CobranzasFilter
              initialFilters={filters}
              onFilterChange={handleFilterChange}
            />
          </Paper>
        )}

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Main Content - Table */}
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {isLoading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <CircularProgress size={48} />
                <Typography sx={{ mt: 2, fontWeight: 500 }}>
                  Cargando pagos...
                </Typography>
              </Box>
            </Box>
          )}
          
          <CobranzasTable
            cobranzas={cobranzas}
            onView={(cobranza) => navigate(`/cobranza/${cobranza.id}`)}
            onEdit={(cobranza) => navigate(`/cobranza/editar/${cobranza.id}`)}
            onDelete={handleDelete}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {cobranzas.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              borderTop: 1,
              borderColor: alpha(theme.palette.divider, 0.6)
            }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Mostrando {filters.skip + 1} - {filters.skip + cobranzas.length} de {cobranzas.length + filters.skip} resultados
              </Typography>
              
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 500,
                    borderRadius: 1
                  }
                }}
              />
            </Box>
          )}
          
          {cobranzas.length === 0 && !isLoading && (
            <Box sx={{ 
              py: 6, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              px: 3
            }}>
              <Box sx={{ 
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <PaymentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                No se encontraron pagos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                No hay pagos registrados con los filtros actuales. Intente modificar los filtros o registre un nuevo pago.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                component={Link}
                to="/cobranza/nueva"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3
                }}
              >
                Registrar Nuevo Pago
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default CobranzasPage;