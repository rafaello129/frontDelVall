import React, { useState } from 'react';
import { 
  Button, 
  Tooltip, 
  Snackbar, 
  Alert, 
  useTheme,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
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
  const theme = useTheme();
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
      <Tooltip 
        title={disabled || estadisticasMetadata.total === 0 ? 
          "No hay datos disponibles para exportar" : 
          "Exportar datos a Excel"
        }
        arrow
      >
        <Box>
          <Button
            variant="contained"
            color="success"
            startIcon={exporting ? 
              <CircularProgress size={20} color="inherit" /> : 
              <ExportIcon />
            }
            onClick={handleExport}
            disabled={disabled || exporting || estadisticasMetadata.total === 0}
            sx={{ 
              px: 2.5,
              py: 1.25,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[3],
              '&:hover': {
                boxShadow: theme.shadows[5]
              }
            }}
          >
            {exporting ? 'Exportando...' : 'Exportar a Excel'}
          </Button>
        </Box>
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
          sx={{ 
            width: '100%',
            borderRadius: 2,
            alignItems: 'center',
            boxShadow: theme.shadows[6]
          }}
          icon={snackbar.severity === 'success' ? <CheckIcon /> : <ErrorIcon />}
        >
          <Typography variant="body2" fontWeight={500}>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};