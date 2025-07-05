import React, { useState } from 'react';
import { Button, Tooltip, Snackbar, Alert } from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { useExcelExportPagosExternos } from '../../../hooks/useExcelExportPagosExternos';
import type { EstadisticaAgrupada, EstadisticasOptions } from '../types';

interface PagoExternoExcelExportProps {
  estadisticasPorTipo: EstadisticaAgrupada[];
  estadisticasPorSucursal: EstadisticaAgrupada[];
  estadisticasMetadata: {
    total: number;
    cantidad: number;
    promedio: number;
    periodoActual?: { fechaDesde: Date; fechaHasta: Date };
    periodoComparacion?: { fechaDesde: Date; fechaHasta: Date };
  };
  options: EstadisticasOptions;
  disabled?: boolean;
}

export const PagoExternoExcelExport: React.FC<PagoExternoExcelExportProps> = ({
  estadisticasPorTipo,
  estadisticasPorSucursal,
  estadisticasMetadata,
  options,
  disabled = false
}) => {
  const { exportEstadisticas } = useExcelExportPagosExternos();
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleExport = async () => {
    if (estadisticasPorTipo.length === 0 || estadisticasMetadata.total === 0) {
      setSnackbar({
        open: true,
        message: 'No hay datos para exportar',
        severity: 'error'
      });
      return;
    }

    setExporting(true);
    try {
      await exportEstadisticas(
        estadisticasPorTipo,
        estadisticasPorSucursal,
        estadisticasMetadata,
        options
      );
      
      setSnackbar({
        open: true,
        message: 'Reporte exportado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting statistics:', error);
      setSnackbar({
        open: true,
        message: 'Error al exportar el reporte',
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <>
      <Tooltip title="Exportar a Excel">
        <span>
          <Button
            variant="contained"
            color="success"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            disabled={disabled || exporting || estadisticasMetadata.total === 0}
            sx={{ 
              px: 2,
              py: 1,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            {exporting ? 'Exportando...' : 'Exportar a Excel'}
          </Button>
        </span>
      </Tooltip>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};