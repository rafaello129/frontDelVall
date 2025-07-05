import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  Paper,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  InsertChartOutlined,
  BarChart,
  PieChart,
  Timeline,
  FilterList,
  Clear,
  Search,
  FileDownload,
  Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useProyecciones } from '../hooks/useProyecciones';
import { ProyeccionEstadisticasCard } from '../components/analytics/ProyeccionEstadisticasCard';
import { EstadoProyeccion } from '../types';
import { format } from 'date-fns';

// Type for tab value
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel Component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`estadisticas-tabpanel-${index}`}
      aria-labelledby={`estadisticas-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProyeccionEstadisticasPage: React.FC = () => {
  // State for tab value
  const [tabValue, setTabValue] = useState(0);

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fechaDesde: null as Date | null,
    fechaHasta: null as Date | null,
    estado: '' as EstadoProyeccion | '',
    searchTerm: '',
    incluirDetalle: true,
    agruparPor: 'mes' as 'dia' | 'semana' | 'mes' | 'trimestre' | 'año',
    moneda: 'MXN' as 'MXN' | 'USD'
  });

  // Get data from hook
  const { 
    estadisticasGenerales, 
    getEstadisticasGenerales, 
    clearAnalyticsData, 
    isLoading, 
    error,
    loadingEstadisticas
  } = useProyecciones();

  // Load initial data
  useEffect(() => {
    loadEstadisticas();
  }, []);

  // Function to load estadisticas
  const loadEstadisticas = async () => {
    await getEstadisticasGenerales({
      fechaDesde: filters.fechaDesde || undefined,
      fechaHasta: filters.fechaHasta || undefined,
      estado: filters.estado || undefined,
      incluirDetalle: filters.incluirDetalle,
      agruparPor: filters.agruparPor,
      moneda: filters.moneda
    });
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    loadEstadisticas();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      fechaDesde: null,
      fechaHasta: null,
      estado: '',
      searchTerm: '',
      incluirDetalle: true,
      agruparPor: 'mes',
      moneda: 'MXN'
    });
  };

  // Export data
  const handleExportData = () => {
    // Implementation for exporting data (could be CSV, Excel, etc.)
    alert('Función de exportación a implementar');
  };

  // Calculate summary values
  const getTotalProyecciones = () => estadisticasGenerales?.resumen.totalProyecciones || 0;
  const getMontoTotal = () => estadisticasGenerales?.resumen.montoTotal || 0;
  const getTasaExito = () => estadisticasGenerales?.resumen.tasaExito || 0;

  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <InsertChartOutlined fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Estadísticas de Proyecciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Análisis y métricas de las proyecciones de pago
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton 
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? "primary" : "default"}
            >
              <FilterList />
            </IconButton>
            <Button 
              startIcon={<Refresh />}
              onClick={loadEstadisticas}
              disabled={loadingEstadisticas}
            >
              Actualizar
            </Button>
            <Button 
              startIcon={<FileDownload />}
              onClick={handleExportData}
              disabled={loadingEstadisticas}
            >
              Exportar
            </Button>
          </Box>
        </Box>
        
        {/* Filter section */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Filtros</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <DatePicker 
                  label="Fecha desde"
                  value={filters.fechaDesde}
                  onChange={(date) => handleFilterChange('fechaDesde', date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker 
                  label="Fecha hasta"
                  value={filters.fechaHasta}
                  onChange={(date) => handleFilterChange('fechaHasta', date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    label="Estado"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {Object.values(EstadoProyeccion).map((estado) => (
                      <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Agrupar por</InputLabel>
                  <Select
                    value={filters.agruparPor}
                    onChange={(e) => handleFilterChange('agruparPor', e.target.value)}
                    label="Agrupar por"
                  >
                    <MenuItem value="dia">Día</MenuItem>
                    <MenuItem value="semana">Semana</MenuItem>
                    <MenuItem value="mes">Mes</MenuItem>
                    <MenuItem value="trimestre">Trimestre</MenuItem>
                    <MenuItem value="año">Año</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Moneda</InputLabel>
                  <Select
                    value={filters.moneda}
                    onChange={(e) => handleFilterChange('moneda', e.target.value)}
                    label="Moneda"
                  >
                    <MenuItem value="MXN">MXN</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button 
                startIcon={<Clear />}
                onClick={handleClearFilters}
                sx={{ mr: 1 }}
              >
                Limpiar
              </Button>
              <Button 
                variant="contained"
                onClick={handleApplyFilters}
                disabled={loadingEstadisticas}
              >
                Aplicar Filtros
              </Button>
            </Box>
          </Paper>
        )}

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loadingEstadisticas && <LinearProgress sx={{ mb: 3 }} />}

        {/* Summary cards */}
        {estadisticasGenerales && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" color="text.secondary">Total de Proyecciones</Typography>
                <Typography variant="h4" sx={{ my: 2 }}>{getTotalProyecciones().toLocaleString()}</Typography>
                <Box display="flex" justifyContent="space-between">
                  <Chip 
                    label={`Pendientes: ${estadisticasGenerales.resumen.porEstado.pendientes}`} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={`Cumplidas: ${estadisticasGenerales.resumen.porEstado.pagadas}`} 
                    size="small" 
                    color="success"
                  />
                  <Chip 
                    label={`Vencidas: ${estadisticasGenerales.resumen.porEstado.vencidas}`} 
                    size="small" 
                    color="error"
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" color="text.secondary">Monto Total Proyectado</Typography>
                <Typography variant="h4" sx={{ my: 2 }}>
                  ${getMontoTotal().toLocaleString('es-MX')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Promedio por proyección: ${estadisticasGenerales.resumen.montoPromedio.toLocaleString('es-MX')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" color="text.secondary">Tasa de Éxito</Typography>
                <Typography variant="h4" sx={{ my: 2 }}>{getTasaExito().toFixed(1)}%</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getTasaExito()} 
                  sx={{ 
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'background.default',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getTasaExito() > 75 ? 'success.main' : 
                              getTasaExito() > 50 ? 'warning.main' : 'error.main'
                    }
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tabs for different charts */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<BarChart />} label="POR ESTADO" />
            <Tab icon={<PieChart />} label="POR CLIENTE" />
            <Tab icon={<Timeline />} label="POR BANCO" />
            <Tab icon={<BarChart />} label="POR TIPO DE PAGO" />
            {estadisticasGenerales?.tendenciaTemporal && (
              <Tab icon={<Timeline />} label="TENDENCIA TEMPORAL" />
            )}
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>Proyecciones por Estado</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Distribución de proyecciones y montos por estado
              </Typography>
              {estadisticasGenerales && (
                <ProyeccionEstadisticasCard 
                  data={estadisticasGenerales.porEstado} 
                  loading={loadingEstadisticas}
                  title="Estadísticas por Estado"
                  groupByField="estado"
                />
              )}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>Proyecciones por Cliente</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Top 10 clientes con mayor volumen de proyecciones
              </Typography>
              {estadisticasGenerales && (
                <ProyeccionEstadisticasCard 
                  data={estadisticasGenerales.porCliente.slice(0, 10)} 
                  loading={loadingEstadisticas}
                  title="Top 10 Clientes"
                  groupByField="cliente"
                />
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>Proyecciones por Banco</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Distribución de proyecciones por institución bancaria
              </Typography>
              {estadisticasGenerales && (
                <ProyeccionEstadisticasCard 
                  data={estadisticasGenerales.porBanco} 
                  loading={loadingEstadisticas}
                  title="Estadísticas por Banco"
                  groupByField="banco"
                />
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>Proyecciones por Tipo de Pago</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Distribución de proyecciones según método de pago
              </Typography>
              {estadisticasGenerales && (
                <ProyeccionEstadisticasCard 
                  data={estadisticasGenerales.porTipoPago} 
                  loading={loadingEstadisticas}
                  title="Estadísticas por Tipo de Pago"
                  groupByField="tipoPago"
                />
              )}
            </Box>
          </TabPanel>

          {estadisticasGenerales?.tendenciaTemporal && (
            <TabPanel value={tabValue} index={4}>
              <Box p={2}>
                <Typography variant="h6" gutterBottom>Tendencia Temporal</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Evolución de proyecciones en el tiempo
                </Typography>
                <ProyeccionEstadisticasCard 
                  data={estadisticasGenerales.tendenciaTemporal} 
                  loading={loadingEstadisticas}
                  title="Tendencia Temporal"
                  groupByField="periodo"
                  chartType="line"
                />
              </Box>
            </TabPanel>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ProyeccionEstadisticasPage;