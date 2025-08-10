import React, { useEffect, useState } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import CobranzasFilter from '../components/cobranzasFilters';
import CobranzasTable from '../../../components/cobranza/CobranzasTable';
import type { FilterCobranzaDto } from '../types';
import { useFacturas } from '../../factura/hooks/useFacturas';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Button,
  CircularProgress,
  Stack,
  Container,
  useTheme,
  alpha,
  Tooltip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  ArrowBack as ArrowBackIcon,
  TableChart as TableChartIcon,
  InsertDriveFile as InsertDriveFileIcon
} from '@mui/icons-material';
import { useExportCobranzasExcel } from '../../../hooks/useExcelExportCobranza';
import { Link } from 'react-router-dom';

const CobranzasExcelPage: React.FC = () => {
  const theme = useTheme();
  const { 
    cobranzas,
    isLoading,
    error,
    getAllCobranzas,
  } = useCobranzas();
  
  const { exportCobranzasExcel } = useExportCobranzasExcel();
  const { clearFactura } = useFacturas();
  const isFormOpen = false;
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
              sx={{ mb: 1 }}
            >
              Exportar Cobranzas a Excel
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure los filtros para generar un reporte detallado de cobranzas
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              component={Link}
              to="/cobranza"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                py: 1,
                px: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Volver a cobranzas
            </Button>
            
            {cobranzas.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={isExporting ? 
                  <CircularProgress size={20} color="inherit" /> : 
                  <FileDownloadIcon />
                }
                onClick={handleExportExcel}
                disabled={isExporting || cobranzas.length === 0}
                sx={{ 
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {isExporting ? 'Generando...' : 'Exportar a Excel'}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Report Cards */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 3,
          mb: 4
        }}>
          <Card sx={{ 
            flex: '1 1 300px', 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TableChartIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Cobranzas por Banco
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                El reporte incluye los totales agrupados por banco y tipo de pago, facilitando la conciliación bancaria.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" fontWeight={500}>
                <strong>Campos incluidos:</strong> Banco, Tipo de pago, Monto total, Cantidad de operaciones
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: '1 1 300px', 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <InsertDriveFileIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.success.main 
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Cobranzas por Día
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Detalle cronológico de todas las operaciones de cobranza, ideal para análisis de flujo de caja diario.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" fontWeight={500}>
                <strong>Campos incluidos:</strong> Fecha, Cliente, Factura, Monto, Tipo de pago, Referencia
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filter Component */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Filtros del Reporte
            </Typography>
          </Box>
          
          <CobranzasFilter
            initialFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </Paper>
        
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Data Preview */}
        <Typography 
          variant="h5" 
          fontWeight={600} 
          sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
        >
          <TableChartIcon sx={{ mr: 1 }} />
          Vista Previa de Datos
          <Typography 
            component="span" 
            variant="body2" 
            sx={{ 
              ml: 2,
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              fontWeight: 'bold'
            }}
          >
            {cobranzas.length} registros
          </Typography>
        </Typography>

        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: 200
          }}>
            <CircularProgress size={60} />
          </Box>
        ) : cobranzas.length > 0 ? (
          <Paper 
            elevation={1}
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              position: 'relative',
              mb: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <CobranzasTable
              cobranzas={cobranzas.slice(0, 10)}
              isLoading={isLoading}
            />

            <Box sx={{ 
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando primeros 10 de {cobranzas.length} registros
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Tooltip title="El reporte completo se generará al exportar">
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Total registros: {cobranzas.length}
                  </Typography>
                </Tooltip>
              </Stack>
            </Box>
          </Paper>
        ) : (
          <Alert 
            severity="info" 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            No se encontraron datos con los filtros seleccionados. Ajuste los filtros para ver resultados.
          </Alert>
        )}
        
        {/* Mensaje informativo */}
        {cobranzas.length > 0 && (
          <Alert 
            severity="info"
            variant="outlined"
            icon={false}
            sx={{ 
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FileDownloadIcon color="info" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Sobre el reporte Excel
                </Typography>
                <Typography variant="body2">
                  El reporte Excel generará dos hojas: "Cobranzas por Banco" con totales agrupados por banco y tipo de pago, 
                  y "Cobranzas por Día" con el detalle diario de operaciones. Use los filtros para ajustar los datos a exportar.
                </Typography>
              </Box>
            </Box>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default CobranzasExcelPage;