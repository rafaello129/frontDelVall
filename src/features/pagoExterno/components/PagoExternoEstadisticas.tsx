import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Paper,
  Avatar,
  alpha,
  Chip,
  Fade,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  AttachMoney,
  TrendingUp,
  PieChart,
  BarChart,
  People,
  FilterAlt,
  CalendarToday,
  CompareArrows,
  Refresh,
  DateRange,
  ShowChart,
  TrendingDown
} from '@mui/icons-material';
import type { EstadisticaAgrupada, EstadisticasOptions } from '../types';
import { formatCurrency } from '../../../utils/format';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
);

interface PagoExternoEstadisticasProps {
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
  onOptionsChange: (options: EstadisticasOptions) => void;
  isLoading: boolean;
}

export const PagoExternoEstadisticas: React.FC<PagoExternoEstadisticasProps> = ({
  estadisticasPorTipo,
  estadisticasPorSucursal,
  estadisticasMetadata,
  options,
  onOptionsChange,
  isLoading
}) => {
  const theme = useTheme();
  const [animate, setAnimate] = useState(false);
  const [tempOptions, setTempOptions] = useState<EstadisticasOptions>(options);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  // Actualizar tempOptions cuando cambian las opciones principales
  useEffect(() => {
    setTempOptions(options);
  }, [options]);

  // Preparar datos para gráficos por tipo
  const tipoLabels = estadisticasPorTipo.map(item => item.categoria.replace(/_/g, ' '));
  const tipoData = estadisticasPorTipo.map(item => item.total);
  const tipoCantidades = estadisticasPorTipo.map(item => item.cantidad);
  const tipoColores = [
    '#3f51b5', // Indigo
    '#f50057', // Pink
    '#2196f3', // Blue
    '#4caf50', // Green
    '#ff9800', // Orange
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#f44336', // Red
    '#8bc34a', // Light Green
    '#ffeb3b', // Yellow
  ];

  // Preparar datos para gráficos por sucursal
  const sucursalLabels = estadisticasPorSucursal.map(item => item.categoria);
  const sucursalData = estadisticasPorSucursal.map(item => item.total);
  const sucursalColores = sucursalLabels.map((_, index) => {
    return alpha(theme.palette.primary.main, 0.7 - (index * 0.1));
  });

  // Preparar datos de línea temporal si hay detalles por periodo
  const timeSeriesData = React.useMemo(() => {
    const allPeriods = new Set<string>();
    const seriesData: Record<string, { [period: string]: number }> = {};
    
    // Primero, recopilamos todos los períodos únicos
    estadisticasPorTipo.forEach(item => {
      if (item.detallesPorPeriodo) {
        item.detallesPorPeriodo.forEach(detail => {
          allPeriods.add(detail.periodo);
        });
      }
    });

    // Luego, organizamos los datos por tipo y período
    estadisticasPorTipo.forEach(item => {
      seriesData[item.categoria] = {};
      if (item.detallesPorPeriodo) {
        item.detallesPorPeriodo.forEach(detail => {
          seriesData[item.categoria][detail.periodo] = detail.total;
        });
      }
    });

    // Ordenamos los períodos cronológicamente
    const sortedPeriods = Array.from(allPeriods).sort();

    return {
      labels: sortedPeriods,
      datasets: estadisticasPorTipo.map((item, index) => {
        const data = sortedPeriods.map(period => 
          seriesData[item.categoria][period] || 0
        );

        return {
          label: item.categoria.replace(/_/g, ' '),
          data: data,
          borderColor: tipoColores[index % tipoColores.length],
          backgroundColor: alpha(tipoColores[index % tipoColores.length], 0.1),
          fill: true,
          tension: 0.4,
          pointRadius: 3
        };
      })
    };
  }, [estadisticasPorTipo, tipoColores]);

  // Configuración para gráfico de donut
  const donutData = {
    labels: tipoLabels,
    datasets: [
      {
        data: tipoData,
        backgroundColor: tipoColores,
        borderColor: tipoColores.map(color => color),
        borderWidth: 1,
        hoverOffset: 15
      }
    ]
  };

  // Configuración para gráfico de barras de sucursal
  const barData = {
    labels: sucursalLabels,
    datasets: [
      {
        label: 'Total por Sucursal',
        data: sucursalData,
        backgroundColor: sucursalColores,
        borderColor: theme.palette.primary.dark,
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  };

  // Calcular totales (usamos los datos de metadata)
  const totalMonto = estadisticasMetadata.total;
  const totalTransacciones = estadisticasMetadata.cantidad;
  const promedioTransaccion = estadisticasMetadata.promedio;

  const handleApplyFilters = () => {
    onOptionsChange(tempOptions);
  };

  const handleOptionChange = (field: keyof EstadisticasOptions, value: any) => {
    setTempOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleCompareToggle = (enabled: boolean) => {
    if (enabled) {
      handleOptionChange('compararConPeriodoAnterior', 30);
    } else {
      handleOptionChange('compararConPeriodoAnterior', undefined);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (date?: Date) => {
    if (!date || !isValid(date)) return 'N/A';
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  // Comparar fechas para mostrar período
  const getPeriodoText = () => {
    const { periodoActual } = estadisticasMetadata;
    if (!periodoActual) return 'Período no especificado';
    
    return `${formatDate(periodoActual.fechaDesde)} - ${formatDate(periodoActual.fechaHasta)}`;
  };

  // Obtener texto de comparación
  const getComparacionText = () => {
    const { periodoComparacion } = estadisticasMetadata;
    if (!periodoComparacion) return '';
    
    return `Comparado con: ${formatDate(periodoComparacion.fechaDesde)} - ${formatDate(periodoComparacion.fechaHasta)}`;
  };

  return (
    <Box sx={{ animation: animate ? 'fadeIn 0.5s ease-in-out' : 'none' }}>
      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterAlt color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="h6">Opciones de Análisis</Typography>
            </Box>
            <Button 
              size="small" 
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              endIcon={filtersExpanded ? <BarChart /> : <FilterAlt />}
            >
              {filtersExpanded ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </Box>

          <Collapse in={filtersExpanded}>
            <Box sx={{ mb: 3 }}>
              {/* Fecha y periodo filters - first row */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                mb: 2 
              }}>
                <Box sx={{ 
                  flex: '1 1 200px', 
                  minWidth: { xs: '100%', sm: '180px' } 
                }}>
                  <DatePicker
                    label="Fecha Desde"
                    value={tempOptions.fechaDesde}
                    onChange={(date) => handleOptionChange('fechaDesde', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        helperText: "Inicio del período"
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  flex: '1 1 200px',
                  minWidth: { xs: '100%', sm: '180px' } 
                }}>
                  <DatePicker
                    label="Fecha Hasta"
                    value={tempOptions.fechaHasta}
                    onChange={(date) => handleOptionChange('fechaHasta', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        helperText: "Fin del período"
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  flex: '1 1 200px',
                  minWidth: { xs: '100%', sm: '180px' } 
                }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Agrupar Por</InputLabel>
                    <Select
                      value={tempOptions.agruparPor || 'mes'}
                      onChange={(e) => handleOptionChange('agruparPor', e.target.value)}
                      label="Agrupar Por"
                    >
                      <MenuItem value="dia">Día</MenuItem>
                      <MenuItem value="semana">Semana</MenuItem>
                      <MenuItem value="mes">Mes</MenuItem>
                      <MenuItem value="trimestre">Trimestre</MenuItem>
                      <MenuItem value="año">Año</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ 
                  flex: '1 1 200px',
                  minWidth: { xs: '100%', sm: '180px' } 
                }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Moneda</InputLabel>
                    <Select
                      value={tempOptions.moneda || 'MXN'}
                      onChange={(e) => handleOptionChange('moneda', e.target.value)}
                      label="Moneda"
                    >
                      <MenuItem value="MXN">Pesos (MXN)</MenuItem>
                      <MenuItem value="USD">Dólares (USD)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Options - second row */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3,
                mb: 2,
                justifyContent: 'space-between'
              }}>
                <Box sx={{ 
                  flex: '1 1 auto',
                  display: 'flex', 
                  gap: 3,
                  flexWrap: 'wrap'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!tempOptions.incluirDetalle}
                        onChange={(e) => handleOptionChange('incluirDetalle', e.target.checked)}
                      />
                    }
                    label="Incluir detalles por período"
                  />
                
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!tempOptions.compararConPeriodoAnterior}
                        onChange={(e) => handleCompareToggle(e.target.checked)}
                      />
                    }
                    label="Comparar con período anterior"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Estadísticas'}
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* Periodo seleccionado */}
          {estadisticasMetadata.total > 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              mt: filtersExpanded ? 0 : 0,
              bgcolor: alpha(theme.palette.primary.light, 0.05),
              p: 1.5,
              borderRadius: 1,
              gap: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRange sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle1" fontWeight="500">
                  {getPeriodoText()}
                </Typography>
              </Box>
              
              {estadisticasMetadata.periodoComparacion && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CompareArrows sx={{ mr: 1, color: theme.palette.info.main }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    {getComparacionText()}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : estadisticasMetadata.total > 0 ? (
        <>
          {/* KPI Cards Section */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Fade in={animate} timeout={500}>
              <Card sx={{ 
                flex: '1 1 250px',
                minWidth: { xs: '100%', sm: '220px' },
                boxShadow: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.success.main, 0.1), 
                        color: theme.palette.success.main,
                        mr: 2
                      }}
                    >
                      <AttachMoney />
                    </Avatar>
                    <Typography variant="h6" color="textSecondary">
                      Total de Pagos
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totalMonto)}
                  </Typography>
                  
                  {options.compararConPeriodoAnterior && estadisticasPorTipo.length > 0 && estadisticasPorTipo[0].comparacion && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.diferencia || 0), 0) > 0 ? (
                        <TrendingUp fontSize="small" color="success" sx={{ mr: 0.5 }} />
                      ) : (
                        <TrendingDown fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      )}
                      <Typography variant="body2" sx={{ 
                        color: estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.diferencia || 0), 0) > 0 ? 
                          theme.palette.success.main : theme.palette.error.main 
                      }}>
                        {estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.porcentaje || 0), 0).toFixed(1)}% vs. período anterior
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>

            <Fade in={animate} timeout={700}>
              <Card sx={{ 
                flex: '1 1 250px',
                minWidth: { xs: '100%', sm: '220px' },
                boxShadow: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.info.main, 0.1), 
                        color: theme.palette.info.main,
                        mr: 2
                      }}
                    >
                      <People />
                    </Avatar>
                    <Typography variant="h6" color="textSecondary">
                      Transacciones
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {totalTransacciones.toLocaleString()}
                  </Typography>
                  
                  {options.compararConPeriodoAnterior && estadisticasPorTipo.length > 0 && estadisticasPorTipo[0].comparacion && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.cantidad || 0) - item.cantidad, 0) > 0 ? (
                        <TrendingUp fontSize="small" color="success" sx={{ mr: 0.5 }} />
                      ) : (
                        <TrendingDown fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      )}
                      <Typography variant="body2" sx={{ 
                        color: estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.cantidad || 0) - item.cantidad, 0) > 0 ? 
                          theme.palette.success.main : theme.palette.error.main 
                      }}>
                        {Math.abs(estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.cantidad || 0) - item.cantidad, 0))} 
                        {estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.cantidad || 0) - item.cantidad, 0) > 0 ? 
                          ' más' : ' menos'} que el período anterior
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>

            <Fade in={animate} timeout={900}>
              <Card sx={{ 
                flex: '1 1 250px',
                minWidth: { xs: '100%', sm: '220px' },
                boxShadow: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.warning.main, 0.1), 
                        color: theme.palette.warning.main,
                        mr: 2
                      }}
                    >
                      <TrendingUp />
                    </Avatar>
                    <Typography variant="h6" color="textSecondary">
                      Promedio
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(promedioTransaccion)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Por transacción
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Box>

          {/* Charts Section */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Fade in={animate} timeout={1100}>
              <Card sx={{ 
                flex: '1 1 400px',
                minWidth: { xs: '100%', sm: '400px' },
                boxShadow: 3, 
                borderRadius: 2
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PieChart color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="medium">Distribución por Tipo de Pago Externo</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1 }}>
                    <Doughnut 
                      data={donutData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              boxWidth: 15,
                              padding: 15,
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            titleColor: theme.palette.text.primary,
                            bodyColor: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                              label: function(context) {
                                let label = context.label || '';
                                let value = context.raw as number;
                                let percentage = (value / totalMonto * 100).toFixed(1);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>

            <Fade in={animate} timeout={1300}>
              <Card sx={{ 
                flex: '1 1 400px',
                minWidth: { xs: '100%', sm: '400px' },
                boxShadow: 3, 
                borderRadius: 2
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BarChart color="info" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="medium">Pagos por Sucursal</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Box sx={{ height: 350, p: 1 }}>
                    <Bar 
                      data={barData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            titleColor: theme.palette.text.primary,
                            bodyColor: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                              label: function(context) {
                                let value = context.raw as number;
                                return `Total: ${formatCurrency(value)}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value as number);
                              }
                            },
                            grid: {
                              display: true,
                              color: alpha(theme.palette.divider, 0.1)
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Box>

          {/* Time Series Chart - only show if we have period details */}
          {options.incluirDetalle && timeSeriesData.labels.length > 0 && (
            <Fade in={animate} timeout={1400}>
              <Card sx={{ 
                mb: 3,
                boxShadow: 3, 
                borderRadius: 2
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShowChart color="success" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="medium">Evolución Temporal por Tipo de Pago</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Box sx={{ height: 400, p: 1 }}>
                    <Line 
                      data={timeSeriesData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: 'index',
                          intersect: false,
                        },
                        plugins: {
                          tooltip: {
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            titleColor: theme.palette.text.primary,
                            bodyColor: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                              label: function(context) {
                                let label = context.dataset.label || '';
                                let value = context.parsed.y;
                                return `${label}: ${formatCurrency(value)}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value as number);
                              }
                            },
                            grid: {
                              color: alpha(theme.palette.divider, 0.1)
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Table Section */}
          <Fade in={animate} timeout={1500}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2 }}>
                    <AttachMoney />
                  </Avatar>
                  <Typography variant="h6" fontWeight="medium">Detalles por Tipo de Pago Externo</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ 
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: 8
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: 4
                  }
                }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr>
                        <th style={{ 
                          textAlign: 'left', 
                          padding: '12px 16px', 
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          borderTopLeftRadius: 8,
                          borderBottomLeftRadius: 8,
                          color: theme.palette.text.secondary
                        }}>
                          Tipo
                        </th>
                        <th style={{ 
                          textAlign: 'right', 
                          padding: '12px 16px', 
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          color: theme.palette.text.secondary
                        }}>
                          Monto
                        </th>
                        <th style={{ 
                          textAlign: 'center', 
                          padding: '12px 16px', 
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          color: theme.palette.text.secondary
                        }}>
                          Transacciones
                        </th>
                        <th style={{ 
                          textAlign: 'right', 
                          padding: '12px 16px', 
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          color: theme.palette.text.secondary
                        }}>
                          Promedio
                        </th>
                        <th style={{ 
                          textAlign: 'right', 
                          padding: '12px 16px', 
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          color: theme.palette.text.secondary
                        }}>
                          % del Total
                        </th>
                        {options.compararConPeriodoAnterior && (
                          <th style={{ 
                            textAlign: 'right', 
                            padding: '12px 16px', 
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                            color: theme.palette.text.secondary
                          }}>
                            Tendencia
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {estadisticasPorTipo.map((item, index) => (
                        <tr key={index} style={{ 
                          backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.background.default, 0.5),
                          transition: 'background-color 0.3s',
                        }}>
                          <td style={{ 
                            padding: '12px 16px',
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  mr: 2, 
                                  backgroundColor: tipoColores[index % tipoColores.length]
                                }} 
                              />
                              {item.categoria.replace(/_/g, ' ')}
                            </Box>
                          </td>
                          <td style={{ 
                            textAlign: 'right', 
                            padding: '12px 16px',
                            fontWeight: 'bold',
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            {formatCurrency(item.total)}
                          </td>
                          <td style={{ 
                            textAlign: 'center', 
                            padding: '12px 16px',
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            {item.cantidad.toLocaleString()}
                          </td>
                          <td style={{ 
                            textAlign: 'right', 
                            padding: '12px 16px',
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            {formatCurrency(item.promedio)}
                          </td>
                          <td style={{ 
                            textAlign: 'right', 
                            padding: '12px 16px',
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            <Chip
                              label={`${(item.porcentaje || 0).toFixed(1)}%`}
                              size="small"
                              sx={{ 
                                backgroundColor: alpha(tipoColores[index % tipoColores.length], 0.1),
                                color: tipoColores[index % tipoColores.length],
                                fontWeight: 'bold'
                              }}
                            />
                          </td>
                          {options.compararConPeriodoAnterior && (
                            <td style={{ 
                              textAlign: 'right', 
                              padding: '12px 16px',
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}>
                              {item.comparacion && (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  {item.comparacion.porcentaje > 0 ? (
                                    <TrendingUp fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                                  ) : (
                                    <TrendingDown fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                                  )}
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 'bold', 
                                      color: item.comparacion.porcentaje > 0 ? 
                                        theme.palette.success.main : theme.palette.error.main 
                                    }}
                                  >
                                    {item.comparacion.porcentaje > 0 ? '+' : ''}
                                    {item.comparacion.porcentaje.toFixed(1)}%
                                  </Typography>
                                </Box>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={options.compararConPeriodoAnterior ? 6 : 5} style={{ padding: '8px' }}></td>
                      </tr>
                      <tr style={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                        <td style={{ 
                          padding: '12px 16px',
                          fontWeight: 'bold',
                          borderTopLeftRadius: 8,
                          borderBottomLeftRadius: 8
                        }}>
                          Total
                        </td>
                        <td style={{ 
                          textAlign: 'right', 
                          padding: '12px 16px',
                          fontWeight: 'bold',
                        }}>
                          {formatCurrency(totalMonto)}
                        </td>
                        <td style={{ 
                          textAlign: 'center', 
                          padding: '12px 16px',
                          fontWeight: 'bold',
                        }}>
                          {totalTransacciones.toLocaleString()}
                        </td>
                        <td style={{ 
                          textAlign: 'right', 
                          padding: '12px 16px',
                          fontWeight: 'bold',
                        }}>
                          {formatCurrency(promedioTransaccion)}
                        </td>
                        <td style={{ 
                          textAlign: 'right', 
                          padding: '12px 16px',
                          fontWeight: 'bold',
                          ...(options.compararConPeriodoAnterior ? {} : {
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8
                          })
                        }}>
                          <Chip
                            label="100%"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </td>
                        {options.compararConPeriodoAnterior && (
                          <td style={{ 
                            textAlign: 'right', 
                            padding: '12px 16px',
                            fontWeight: 'bold',
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8
                          }}>
                            {estadisticasPorTipo.length > 0 && estadisticasPorTipo[0].comparacion && (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                {estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.diferencia || 0), 0) > 0 ? (
                                  <TrendingUp fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                                ) : (
                                  <TrendingDown fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                                )}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 'bold', 
                                    color: estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.diferencia || 0), 0) > 0 ? 
                                      theme.palette.success.main : theme.palette.error.main 
                                  }}
                                >
                                  {estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.porcentaje || 0), 0) > 0 ? '+' : ''}
                                  {estadisticasPorTipo.reduce((sum, item) => sum + (item.comparacion?.porcentaje || 0), 0).toFixed(1)}%
                                </Typography>
                              </Box>
                            )}
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 400, 
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderRadius: 2,
          p: 4
        }}>
          <CalendarToday sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No hay datos para mostrar
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2, maxWidth: 500 }}>
            Seleccione un rango de fechas y configure las opciones para visualizar estadísticas de pagos externos.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
            startIcon={<Refresh />}
          >
            Cargar Estadísticas
          </Button>
        </Box>
      )}
    </Box>
  );
};