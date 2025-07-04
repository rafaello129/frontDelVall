import React, { useState, useEffect } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Divider,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { addDays, format, isAfter } from 'date-fns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import HeightIcon from '@mui/icons-material/Height';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import { useExcelExport } from '../../../hooks/useExcelExport';
import FileSaver from 'file-saver';
const formatoMoneda = (valor: number): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);

// Card de resumen visual y moderna
const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, subtitle, icon, color }) => {
  const theme = useTheme();
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        flex: '1 1 250px',
        minWidth: 220,
        m: 1,
        boxShadow: 3,
        borderRadius: 3,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.015)',
          boxShadow: 8,
        },
        background: `linear-gradient(120deg, ${alpha(
          color || theme.palette.primary.main,
          0.08
        )} 0%, ${alpha(color || theme.palette.primary.main, 0.02)} 100%)`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color || theme.palette.primary.main, 0.15),
              color: color || theme.palette.primary.main,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const ReporteRegionPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { reporteRegion, getReportePorRegion, isLoading, error } = useCobranzas();
  const [fechaDesde, setFechaDesde] = useState<Date | null>(addDays(new Date(), -30));
  const [fechaHasta, setFechaHasta] = useState<Date | null>(new Date());
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandirTabla, setExpandirTabla] = useState(false);
  const { exportReporteRegion } = useExcelExport();
  // auto-buscar al cargar componente
  useEffect(() => {
    if (fechaDesde && fechaHasta) handleBuscar();
    // eslint-disable-next-line
  }, []);

  const handleBuscar = async () => {
    if (fechaDesde && fechaHasta) {
      if (isAfter(fechaDesde, fechaHasta)) {
        toast.error('La fecha desde no puede ser mayor que la fecha hasta');
        return;
      }
      setIsSearching(true);
      setHasSearched(true);
      await getReportePorRegion({ fechaDesde, fechaHasta });
      setIsSearching(false);
    }
  };
  const handleExportarExcel = async () => {
    if (!reporteRegion || !fechaDesde || !fechaHasta) {
      toast.error('Datos insuficientes para exportar');
      return;
    }
    
    try {
      await exportReporteRegion(reporteRegion, fechaDesde, fechaHasta);
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar el reporte');
      console.error('Error al exportar:', error);
    }
  };
  const toggleExpandirTabla = () => {
    setExpandirTabla(!expandirTabla);
  };

  // ---- Tabla de reporte visual, sticky y colorida
  const renderTablaReporte = () => {
    if (!reporteRegion) return null;
    const regiones = Object.keys(reporteRegion.regionesTotales);
  
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title={expandirTabla ? "Mostrar vista compacta" : "Expandir para ver toda la tabla"}>
            <Button
              variant="outlined"
              size="small"
              onClick={toggleExpandirTabla}
              startIcon={expandirTabla ? <HeightIcon /> : <AspectRatioIcon />}
              sx={{ borderRadius: 8, textTransform: 'none' }}
            >
              {expandirTabla ? "Vista compacta" : "Ver tabla completa"}
            </Button>
          </Tooltip>
        </Box>
        
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: expandirTabla ? 'none' : 430,
            boxShadow: 3,
            borderRadius: 3,
            overflowX: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.background.paper, 0.1),
            },
            transition: 'max-height 0.3s ease-in-out',
          }}
        >
          {!expandirTabla && reporteRegion.cobranzasPorFechaRegion.length > 8 && (
            <Box 
              sx={{
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                height: '40px',
                background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, ${theme.palette.background.paper} 100%)`,
                pointerEvents: 'none',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Chip 
                size="small" 
                icon={<InfoOutlinedIcon fontSize="small" />} 
                label="Desplaza para ver más o expande la tabla" 
                sx={{ opacity: 0.7, pointerEvents: 'all' }}
                onClick={toggleExpandirTabla}
              />
            </Box>
          )}
          
          <Table stickyHeader aria-label="reporte de cobranza por región">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    zIndex: 3,
                    minWidth: '120px',
                  }}
                >
                  FECHA
                </TableCell>
                {regiones.map(region => (
                  <TableCell
                    key={region}
                    align="right"
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      position: 'sticky',
                      top: 0,
                      zIndex: 3,
                      minWidth: '150px',
                    }}
                  >
                    {region.replace('_', ' ')}
                  </TableCell>
                ))}
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 3,
                    minWidth: '150px',
                  }}
                >
                  TOTAL
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reporteRegion.cobranzasPorFechaRegion.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    bgcolor: index % 2 === 0 ? alpha(theme.palette.primary.light, 0.025) : 'transparent',
                    transition: 'background-color 0.18s',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.light, 0.12) },
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontWeight: 500,
                      position: 'sticky',
                      left: 0,
                      bgcolor: index % 2 === 0 ? alpha(theme.palette.primary.light, 0.025) : 'white',
                      zIndex: 1,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.light, 0.12) },
                    }}
                  >
                    {format(new Date(item.fecha), 'dd/MM/yyyy')}
                  </TableCell>
                  {regiones.map(region => {
                    const valor = item.porRegion[region] ? Number(item.porRegion[region]) : 0;
                    return (
                      <TableCell key={region} align="right">
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            fontFamily: 'monospace',
                            color: valor === 0 ? 'text.disabled' : 'text.primary',
                            fontWeight: valor > 0 ? 500 : 400,
                          }}
                        >
                          {formatoMoneda(valor)}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.secondary.main,
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatoMoneda(Number(item.total))}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                sx={{
                  '& td, & th': {
                    fontWeight: 'bold',
                    fontSize: '1.05em',
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderTop: `2px solid ${theme.palette.primary.main}`,
                  },
                  '& th': {
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                  }
                }}
              >
                <TableCell component="th" scope="row">
                  <Typography fontWeight="bold">Total Bancos</Typography>
                </TableCell>
                {regiones.map(region => {
                  const valor = reporteRegion.regionesTotales[region]
                    ? Number(reporteRegion.regionesTotales[region])
                    : 0;
                  return (
                    <TableCell key={region} align="right">
                      <Typography fontWeight="bold" color="primary.dark">
                        {formatoMoneda(valor)}
                      </Typography>
                    </TableCell>
                  );
                })}
                <TableCell align="right">
                  <Typography fontWeight="bold" color="primary.dark" fontSize="1.1em">
                    {formatoMoneda(Number(reporteRegion.totalBancos))}
                  </Typography>
                </TableCell>
              </TableRow>
  
              {/* NUEVA PARTE: Mostrar pagos externos por tipo */}
              {reporteRegion.pagoExternosPorTipo && Object.entries(reporteRegion.pagoExternosPorTipo).map(([tipo, data], index) => (
                <TableRow
                  key={`ext-${tipo}`}
                  sx={{
                    backgroundColor: alpha(theme.palette.warning.light, 0.1),
                    '&:hover': { backgroundColor: alpha(theme.palette.warning.light, 0.2) },
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontWeight: 500,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: alpha(theme.palette.warning.light, 0.1),
                      zIndex: 1,
                      '&:hover': { backgroundColor: alpha(theme.palette.warning.light, 0.2) },
                    }}
                  >
                    {tipo.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </TableCell>
                  
                  {regiones.map(region => {
                    const valor = data.porRegion[region] ? Number(data.porRegion[region]) : 0;
                    return (
                      <TableCell key={region} align="right">
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            fontFamily: 'monospace',
                            color: valor === 0 ? 'text.disabled' : 'text.primary',
                            fontWeight: valor > 0 ? 500 : 400,
                          }}
                        >
                          {formatoMoneda(valor)}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        fontWeight: 600,
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatoMoneda(Number(data.total))}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
  
              {/* TOTAL FINAL */}
              <TableRow
                sx={{
                  '& td, & th': {
                    fontWeight: 'bold',
                    fontSize: '1.05em',
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    borderTop: `2px solid ${theme.palette.success.main}`,
                    borderBottom: `2px solid ${theme.palette.success.main}`,
                  },
                  '& th': {
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                  }
                }}
              >
                <TableCell component="th" scope="row">
                  <Typography fontWeight="bold">Total Cobranza</Typography>
                </TableCell>
                {regiones.map(region => {
                  // Calcular total por región incluyendo pagos externos
                  let totalRegion = reporteRegion.regionesTotales[region] || 0;
                  
                  Object.values(reporteRegion.pagoExternosPorTipo).forEach(tipo => {
                    totalRegion += tipo.porRegion[region] || 0;
                  });
                  
                  return (
                    <TableCell key={region} align="right">
                      <Typography fontWeight="bold" color="success.dark">
                        {formatoMoneda(totalRegion)}
                      </Typography>
                    </TableCell>
                  );
                })}
                <TableCell align="right">
                  <Typography fontWeight="bold" color="success.dark" fontSize="1.1em">
                    {formatoMoneda(Number(reporteRegion.totalFinal))}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  // --- info para tarjetas resumen
  const getSummaryData = () => {
    if (!reporteRegion) return null;
    const regiones = Object.keys(reporteRegion.regionesTotales);
    const regionMasAlta = regiones.reduce((a, b) =>
      reporteRegion.regionesTotales[a] > reporteRegion.regionesTotales[b] ? a : b
    );
    return {
      totalGeneral: formatoMoneda(Number(reporteRegion.totalGeneral)),
      regionMasAlta: {
        nombre: regionMasAlta.replace('_', ' '),
        valor: formatoMoneda(Number(reporteRegion.regionesTotales[regionMasAlta])),
      },
      totalRegiones: regiones.length,
    };
  };

  const summaryData = getSummaryData();

  return (
    <Container
      maxWidth="xl"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
      }}
    >
      <Fade in timeout={800}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AccountBalanceIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="500">
              Reporte de Cobranza por Región
            </Typography>
          </Box>

          {/* Filtros y acciones */}
          <Card
            elevation={3}
            sx={{
              mb: 4,
              overflow: 'visible',
              borderRadius: 3,
              background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(
                theme.palette.primary.light,
                0.05
              )} 100%)`,
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 2,
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha Desde"
                      value={fechaDesde}
                      onChange={setFechaDesde}
                      sx={{
                        minWidth: 180,
                        flex: isMobile ? '1 1 100%' : '1 1 auto',
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          background: theme.palette.background.paper,
                        },
                      }}
                      slots={{
                        openPickerIcon: CalendarTodayIcon,
                      }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha Hasta"
                      value={fechaHasta}
                      onChange={setFechaHasta}
                      sx={{
                        minWidth: 180,
                        flex: isMobile ? '1 1 100%' : '1 1 auto',
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          background: theme.palette.background.paper,
                        },
                      }}
                      slots={{
                        openPickerIcon: CalendarTodayIcon,
                      }}
                    />
                  </LocalizationProvider>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleBuscar}
                    startIcon={isSearching ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                    disabled={isLoading || isSearching || !fechaDesde || !fechaHasta}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      boxShadow: 2,
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    {isSearching ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={handleExportarExcel} // Ignorada según tu nota
                    startIcon={<FileDownloadIcon />}
                    disabled={isLoading || isSearching || !reporteRegion}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    Exportar Excel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Estado de carga, error o resultados */}
          {isLoading || isSearching ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                minHeight: 350,
              }}
            >
              <CircularProgress size={56} thickness={4} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
                Cargando información...
              </Typography>
            </Box>
          ) : error ? (
            <Card
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.14),
                p: 3,
                borderRadius: 3,
                borderLeft: `6px solid ${theme.palette.error.main}`,
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoOutlinedIcon color="error" sx={{ mr: 2 }} />
                <Typography color="error.main" fontWeight={500}>
                  {error}
                </Typography>
              </Box>
            </Card>
          ) : reporteRegion ? (
            <Zoom in timeout={500}>
              <Box>
                {/* Tarjetas de resumen */}
                {summaryData && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      mb: 4,
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    <SummaryCard
                      title="TOTAL GENERAL"
                      value={summaryData.totalGeneral}
                      icon={<AccountBalanceIcon />}
                      color={theme.palette.primary.main}
                    />
                    <SummaryCard
                      title="REGIÓN DESTACADA"
                      value={summaryData.regionMasAlta.valor}
                      subtitle={`Región: ${summaryData.regionMasAlta.nombre}`}
                      icon={<TrendingUpIcon />}
                      color={theme.palette.success.main}
                    />
                    <SummaryCard
                      title="PERÍODO"
                      value={`${fechaDesde && format(fechaDesde, 'dd/MM/yyyy')} - ${fechaHasta && format(fechaHasta, 'dd/MM/yyyy')}`}
                      subtitle={`${summaryData.totalRegiones} regiones`}
                      icon={<CalendarTodayIcon />}
                      color={theme.palette.info.main}
                    />
                  </Box>
                )}

                <Card
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: 'visible',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="500"
                        color="primary.main"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        <TrendingUpIcon sx={{ mr: 1 }} />
                        Cobranza por Región
                        <Tooltip title="Detalles de cobranza clasificados por fecha y región">
                          <IconButton size="small" sx={{ ml: 1, opacity: 0.6 }}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fechaDesde && fechaHasta &&
                          `Periodo: ${format(fechaDesde, 'dd/MM/yyyy')} - ${format(fechaHasta, 'dd/MM/yyyy')}`}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {renderTablaReporte()}
                    <Box
                      sx={{
                        mt: 3,
                        pt: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
                      }}
                    >
                      <Card
                        elevation={2}
                        sx={{
                          px: 3,
                          py: 1.5,
                          bgcolor: alpha(theme.palette.primary.main, 0.09),
                          borderRadius: 10,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          Total General: {formatoMoneda(Number(reporteRegion.totalGeneral))}
                        </Typography>
                      </Card>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Zoom>
          ) : (
            <Fade in timeout={500}>
              <Card
                sx={{
                  py: 8,
                  px: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 3,
                  minHeight: 300,
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.7, mb: 2 }} />
                <Typography
                  color="text.secondary"
                  align="center"
                  variant="h6"
                  sx={{ mb: 2, maxWidth: 500 }}
                >
                  {hasSearched
                    ? 'No se encontraron registros para el periodo seleccionado'
                    : 'Seleccione un rango de fechas y haga clic en Actualizar para generar el reporte'}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleBuscar}
                  startIcon={<RefreshIcon />}
                  disabled={!fechaDesde || !fechaHasta}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Generar Reporte
                </Button>
              </Card>
            </Fade>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default ReporteRegionPage;