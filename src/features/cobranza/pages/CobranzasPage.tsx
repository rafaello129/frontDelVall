import React, { useEffect, useState } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import CobranzasFilter from '../components/cobranzasFilters';
import CobranzasTable from '../../../components/cobranza/CobranzasTable';
import { Button } from '@mui/material';
import type { FilterCobranzaDto } from '../types';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Pagination
} from '@mui/material';
import {
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart,
  InsertChartOutlinedSharp
} from '@mui/icons-material';

const CobranzasPage: React.FC = () => {
  const navigate = useNavigate();
  
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2 
      }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PaymentIcon sx={{ mr: 1 }} />
          Gestión de Cobranza
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          <Button 
            component={Link}
            to="/cobranzas/csv"
            variant="outlined"
            color="secondary"
            startIcon={<BarChart />}
            sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'flex' } }}
          >
            Subir CSV
          </Button>
          <Button 
            component={Link}
            to="/cobranza/nueva"
            variant="outlined"
            startIcon={<AttachMoneyIcon />}
          >
            Registrar Nuevo Pago
          </Button>
          <Button 
            component={Link} 
            to="/cobranzas/excel" 
            variant="outlined" 
            startIcon={<InsertChartOutlinedSharp />} 
            sx={{ whiteSpace: 'nowrap' }}
          >
            Exportar Excel
          </Button>
        </Box>
      </Box>

      {/* Filter Component */}
      <CobranzasFilter
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content - Table */}
      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
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
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {filters.skip + 1} - {filters.skip + cobranzas.length} resultados
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="medium"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CobranzasPage;