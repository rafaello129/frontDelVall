import { useEffect, useState } from "react";
import { useFacturas } from "../hooks/useFacturas";
import {
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Container,
  useTheme,
  alpha,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  CircularProgress,
  Tooltip,
  Stack
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import type { Factura } from "../types";
import { useExportFacturasExcel } from "../../../hooks/useExportFacturaExcel";
import {
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  NavigateNext as NavigateNextIcon,
  InsertChartOutlinedSharp as ChartIcon,
  ArrowBack as ArrowBackIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  EventNote as EventNoteIcon,
  ExpandLess as ExpandLessIcon
} from "@mui/icons-material";

type Filters = {
  noFactura?: string;
  noCliente?: string;
  estado?: string;
  emisionDesde?: Date | null;
  emisionHasta?: Date | null;
  vencimientoDesde?: Date | null;
  vencimientoHasta?: Date | null;
  saldoMinimo?: number;
  soloVencidas?: boolean;
};

const estados = ["Pendiente", "Pagada", "Vencida", "Cancelada"];

const FacturaExcelPage = () => {
  const theme = useTheme();
  const { facturas, getAllFacturas, isLoading } = useFacturas();
  const [filters, setFilters] = useState<Filters>({
    emisionDesde: null,
    emisionHasta: null,
    vencimientoDesde: null,
    vencimientoHasta: null,
    saldoMinimo: undefined,
    soloVencidas: false,
  });
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Usa el hook de exportación
  const { exportFacturasExcel } = useExportFacturasExcel();

  useEffect(() => {
    getAllFacturas({ limit: 1000000, incluirCliente: true });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Filtrado en el front
    let result = facturas as Factura[];

    if (filters.noFactura) {
      result = result.filter((f) =>
        f.noFactura
          .toLowerCase()
          .includes(filters.noFactura?.toLowerCase() || "")
      );
    }
    if (filters.noCliente) {
      result = result.filter(
        (f) => String(f.noCliente) === String(filters.noCliente)
      );
    }
    if (filters.estado) {
      result = result.filter((f) => f.estado === filters.estado);
    }
    if (filters.emisionDesde) {
      result = result.filter(
        (f) => new Date(f.emision) >= new Date(filters.emisionDesde!)
      );
    }
    if (filters.emisionHasta) {
      result = result.filter(
        (f) => new Date(f.emision) <= new Date(filters.emisionHasta!)
      );
    }
    if (filters.vencimientoDesde) {
      result = result.filter(
        (f) => new Date(f.fechaVencimiento) >= new Date(filters.vencimientoDesde!)
      );
    }
    if (filters.vencimientoHasta) {
      result = result.filter(
        (f) => new Date(f.fechaVencimiento) <= new Date(filters.vencimientoHasta!)
      );
    }
    if (filters.saldoMinimo !== undefined && filters.saldoMinimo !== null) {
      result = result.filter((f) => f.saldo >= filters.saldoMinimo!);
    }
    if (filters.soloVencidas) {
      result = result.filter((f) => f.isVencida === true);
    }
    setFilteredFacturas(result);
  }, [facturas, filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFilters({
      emisionDesde: null,
      emisionHasta: null,
      vencimientoDesde: null,
      vencimientoHasta: null,
      saldoMinimo: undefined,
      soloVencidas: false,
      noFactura: "",
      noCliente: "",
      estado: "",
    });
  };

  const handleExportExcel = async () => {
    if (filteredFacturas.length === 0) return;
    
    try {
      setIsExporting(true);
      await exportFacturasExcel(filteredFacturas);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 3 }}
          >
            <MuiLink 
              component={Link} 
              to="/" 
              underline="hover" 
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
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> 
              Inicio
            </MuiLink>
            <MuiLink 
              component={Link} 
              to="/facturas" 
              underline="hover" 
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
              <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} /> 
              Facturas
            </MuiLink>
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <ChartIcon fontSize="small" sx={{ mr: 0.5 }} />
              Exportar a Excel
            </Typography>
          </Breadcrumbs>
          
          {/* Header */}
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
                Exportar Facturas a Excel
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Configure los filtros para generar un reporte personalizado de facturas
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                component={Link}
                to="/facturas"
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
                Volver a facturas
              </Button>
              
              {filteredFacturas.length > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isExporting ? 
                    <CircularProgress size={20} color="inherit" /> : 
                    <FileDownloadIcon />
                  }
                  onClick={handleExportExcel}
                  disabled={isExporting || filteredFacturas.length === 0}
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
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 4,
          }}>
            {/* Estado de Facturas Card */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              flex: '1 1 auto',
              width: { xs: '100%', md: 'calc(50% - 12px)' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
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
                  <PlaylistAddCheckIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Estado de Facturas
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                El reporte incluye información detallada sobre el estado de todas las facturas, mostrando los importes totales, pagos recibidos y saldos pendientes.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" fontWeight={500}>
                <strong>Campos incluidos:</strong> Número de factura, Cliente, Fecha de emisión, Fecha de vencimiento, Monto total, Saldo pendiente, Estado de pago
              </Typography>
            </Paper>
            
            {/* Vencimientos Card */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              flex: '1 1 auto',
              width: { xs: '100%', md: 'calc(50% - 12px)' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EventNoteIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.warning.main 
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Vencimientos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Analice las facturas por fecha de vencimiento para planificar el seguimiento de pagos y gestionar su flujo de caja de manera efectiva.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" fontWeight={500}>
                <strong>Información destacada:</strong> Días vencidos, Prioridad de cobro, Análisis de antigüedad de saldos
              </Typography>
            </Paper>
          </Box>

          {/* Filter Button */}
          <Button
            variant="text"
            startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              mb: 2,
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
          
          {/* Filters Section */}
          <Collapse in={showFilters}>
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Filtros del Reporte
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  onClick={limpiarFiltros}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Limpiar filtros
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Filter controls - replaced Grid with Flexbox */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                mb: 2
              }}>
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <TextField
                    label="No. Factura"
                    value={filters.noFactura || ""}
                    onChange={(e) =>
                      handleFilterChange("noFactura", e.target.value)
                    }
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <TextField
                    label="No. Cliente"
                    value={filters.noCliente || ""}
                    onChange={(e) =>
                      handleFilterChange("noCliente", e.target.value)
                    }
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      label="Estado"
                      value={filters.estado || ""}
                      onChange={(e) =>
                        handleFilterChange("estado", e.target.value)
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {estados.map((estado) => (
                        <MenuItem key={estado} value={estado}>
                          {estado}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' }, display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!filters.soloVencidas}
                        onChange={(e) =>
                          handleFilterChange("soloVencidas", e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Solo Facturas Vencidas"
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <DatePicker
                    label="Emisión Desde"
                    value={filters.emisionDesde}
                    onChange={(date) =>
                      handleFilterChange("emisionDesde", date)
                    }
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { mb: 2 }
                      } 
                    }}
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <DatePicker
                    label="Emisión Hasta"
                    value={filters.emisionHasta}
                    onChange={(date) =>
                      handleFilterChange("emisionHasta", date)
                    }
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { mb: 2 }
                      } 
                    }}
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <DatePicker
                    label="Vencimiento Desde"
                    value={filters.vencimientoDesde}
                    onChange={(date) =>
                      handleFilterChange("vencimientoDesde", date)
                    }
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { mb: 2 }
                      } 
                    }}
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <DatePicker
                    label="Vencimiento Hasta"
                    value={filters.vencimientoHasta}
                    onChange={(date) =>
                      handleFilterChange("vencimientoHasta", date)
                    }
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { mb: 2 }
                      } 
                    }}
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 12px)' } }}>
                  <TextField
                    label="Saldo mínimo"
                    type="number"
                    value={filters.saldoMinimo ?? ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "saldoMinimo",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ mb: 2 }}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 1,
                mb: 2
              }}>
                {filters.estado && (
                  <Chip 
                    label={`Estado: ${filters.estado}`}
                    color="primary"
                    variant="outlined"
                    onDelete={() => handleFilterChange('estado', '')}
                    sx={{ borderRadius: 2 }}
                  />
                )}
                
                {filters.soloVencidas && (
                  <Chip 
                    label="Solo vencidas"
                    color="error"
                    variant="outlined"
                    onDelete={() => handleFilterChange('soloVencidas', false)}
                    sx={{ borderRadius: 2 }}
                  />
                )}
                
                {filters.emisionDesde && (
                  <Chip 
                    label={`Emisión desde: ${filters.emisionDesde.toLocaleDateString()}`}
                    color="primary"
                    variant="outlined"
                    onDelete={() => handleFilterChange('emisionDesde', null)}
                    sx={{ borderRadius: 2 }}
                  />
                )}
                
                {filters.emisionHasta && (
                  <Chip 
                    label={`Emisión hasta: ${filters.emisionHasta.toLocaleDateString()}`}
                    color="primary"
                    variant="outlined"
                    onDelete={() => handleFilterChange('emisionHasta', null)}
                    sx={{ borderRadius: 2 }}
                  />
                )}
              </Box>
            </Paper>
          </Collapse>
          
          {/* Results Summary */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Resultados
              </Typography>
              <Chip 
                label={`${filteredFacturas.length} facturas`}
                color="primary"
                sx={{ 
                  borderRadius: 10, 
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            {filteredFacturas.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={isExporting ? 
                  <CircularProgress size={20} color="inherit" /> : 
                  <FileDownloadIcon />
                }
                onClick={handleExportExcel}
                disabled={isExporting}
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
          </Box>
          
          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: 200
            }}>
              <CircularProgress size={60} />
            </Box>
          ) : filteredFacturas.length === 0 ? (
            <Alert 
              severity="info" 
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              No se encontraron facturas con los filtros seleccionados. Ajuste los filtros para ver resultados.
            </Alert>
          ) : (
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                mb: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Resumen de facturas a exportar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Los siguientes datos serán incluidos en el archivo Excel:
                </Typography>
              </Box>
              
              {/* Status Summary Cards - replaced Grid with Flexbox */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                mb: 3
              }}>
                <Box sx={{ 
                  flex: '1 1 auto',
                  width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  minWidth: '170px'
                }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Facturas pendientes
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {filteredFacturas.filter(f => f.estado === "Pendiente").length}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  flex: '1 1 auto',
                  width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  minWidth: '170px'
                }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Facturas pagadas
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      {filteredFacturas.filter(f => f.estado === "Pagada").length}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  flex: '1 1 auto',
                  width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  minWidth: '170px'
                }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Facturas vencidas
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">
                      {filteredFacturas.filter(f => f.estado === "Vencida").length}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  flex: '1 1 auto',
                  width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  minWidth: '170px'
                }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Facturas canceladas
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="text.secondary">
                      {filteredFacturas.filter(f => f.estado === "Cancelada").length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Tooltip title="El archivo Excel contendrá todas las facturas que cumplen con los criterios de filtrado">
                <Typography variant="body2" color="text.secondary">
                  Total de registros a exportar: <strong>{filteredFacturas.length}</strong>
                </Typography>
              </Tooltip>
            </Paper>
          )}
          
          {/* Info Alert */}
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
                  El archivo Excel generado incluirá información detallada de cada factura, incluyendo datos del cliente, 
                  fechas, montos y estados. Use los filtros para personalizar su reporte según sus necesidades específicas.
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default FacturaExcelPage;