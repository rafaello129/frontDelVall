import React, { useEffect, useState } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import CobranzasFilter from '../components/cobranzasFilters';
import CobranzasTable from '../../../components/cobranza/CobranzasTable';
import type { Cobranza, FilterCobranzaDto } from '../types';
import { useFacturas } from '../../factura/hooks/useFacturas';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Button,
  CircularProgress,
  Stack
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useExportCobranzasExcel } from '../../../hooks/useExcelExportCobranza';

const CobranzasPage: React.FC = () => {
  const { 
    cobranzas,
    isLoading,
    error,
    getAllCobranzas,
  } = useCobranzas();
  
  const { exportCobranzasExcel } = useExportCobranzasExcel();
  const { clearFactura } = useFacturas();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<FilterCobranzaDto>({
    limit: 1000000,
    skip: 0,
    incluirBanco: true,
    incluirCliente: true,
    incluirFactura: true,
    order: 'desc',
    sortBy: 'fechaPago'
  });
  
  useEffect(() => {
    clearFactura();
  }, [isFormOpen, clearFactura]);
  
  useEffect(() => {
    getAllCobranzas(filters);
  }, [getAllCobranzas, filters]);
  
  useEffect(() => {
    console.log(cobranzas);
  }, [cobranzas]);
  
  const handleFilterChange = (newFilters: FilterCobranzaDto) => {
    // Reset pagination when filters change
    setFilters({
      ...newFilters,
      skip: 0, // Reset to first page when filter changes
    });
  };

  const handleExportExcel = async () => {
    if (cobranzas.length === 0) return;
    
    try {
      setIsExporting(true);
      await exportCobranzasExcel(cobranzas);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Generar Excel de Cobranza
        </Typography>
        
        {cobranzas.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExportExcel}
            disabled={isExporting}
            sx={{ borderRadius: 2 }}
          >
            {isExporting ? 'Generando...' : 'Exportar a Excel'}
          </Button>
        )}
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
          position: 'relative',
          mb: 3
        }}
      >
        <CobranzasTable
          cobranzas={cobranzas}
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
            
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                Total registros: {cobranzas.length}
              </Typography>
            </Stack>
          </Box>
        )}
      </Paper>
      
      {/* Mensaje para explicar la funcionalidad */}
      {cobranzas.length > 0 && (
        <Alert severity="info">
          El reporte Excel generará dos hojas: "Cobranzas por Banco" con totales agrupados por banco y tipo de pago, 
          y "Cobranzas por Día" con el detalle diario de operaciones. Use los filtros para ajustar los datos a exportar.
        </Alert>
      )}
    </Box>
  );
};

export default CobranzasPage;