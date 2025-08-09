import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Tabs,
  Tab,
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  Analytics, 
  Person, 
  ShowChart, 
  CalendarMonth, 
  TrendingUp,
  AutoAwesome
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';
import { useProyecciones } from '../hooks/useProyecciones';
import { ComportamientoClienteCard } from '../components/analytics/ComportamientoClienteCard';
import { RiesgoClienteCard } from '../components/analytics/RiesgoClienteCard';
import { EstacionalidadChart } from '../components/analytics/EstacionalidadChart';
import { ProyeccionesAutomaticasList } from '../components/analytics/ProyeccionesAutomaticasList';
import { ProyeccionAutomaticaForm } from '../components/analytics/ProyeccionAutomaticaForm';
import { PatronPagoCard } from '../components/analytics/PatronPagoCard';
import type { ProyeccionAutomaticaDto, ProyeccionAutomatica } from '../types';

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
      id={`analitica-tabpanel-${index}`}
      aria-labelledby={`analitica-tab-${index}`}
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

const ProyeccionAnaliticaPage: React.FC = () => {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(
    clienteId ? parseInt(clienteId) : null
  );

  // Get data and methods from hook
  const { 
    getComportamientoCliente,
    getRiesgoCliente,
    getAnalisisEstacionalidad,
    getPatronPagoCliente,
    generarProyecciones,
    crearProyecciones,
    comportamientoCliente,
    riesgoCliente,
    analisisEstacionalidad,
    patronPago,
    proyeccionesAutomaticas,
    error,
    loadingComportamiento,
    loadingRiesgo,
    loadingEstacionalidad,
    loadingPatron,
    loadingAutomaticas,
    clearAnalyticsData
  } = useProyecciones();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle cliente selection
  const handleClienteChange = (clienteId: number | null) => {
    setSelectedCliente(clienteId);
    if (clienteId !== null) {
      // Update URL to reflect cliente selection
      navigate(`/proyecciones/analitica/${clienteId}`);
    } else {
      navigate('/proyecciones/analitica');
    }
  };

  // Load cliente data when selectedCliente changes or tab changes
  useEffect(() => {
    if (selectedCliente) {
      loadClienteData();

    } else if (tabValue === 2) {
      // Load estacionalidad data for the system
      loadEstacionalidadData();
    }
    
    // Cleanup when component unmounts
    return () => {
      clearAnalyticsData();
    };
  }, [selectedCliente, tabValue]);

  // Load cliente data based on active tab
  const loadClienteData = async () => {
    if (!selectedCliente) return;
    
    try {
      // Based on active tab, load different data
      if (tabValue === 0) {
        console.log('Loading comportamiento cliente data...');

        await getComportamientoCliente(selectedCliente);
           // console.log(comportamientoCliente)
    } else if (tabValue === 1) {
        await getRiesgoCliente(selectedCliente);
      } else if (tabValue === 3) {
        await getPatronPagoCliente(selectedCliente);
      } else if (tabValue === 4) {
        await generarProyecciones({ noCliente: selectedCliente });
      }
    } catch (error) {
      console.error('Error loading cliente data:', error);
    }
  };

  // Load estacionalidad data
  const loadEstacionalidadData = async () => {
    try {
      await getAnalisisEstacionalidad({});
    } catch (error) {
      console.error('Error loading estacionalidad data:', error);
    }
  };

  // Handle generate proyecciones
  const handleGenerateProyecciones = async (config: ProyeccionAutomaticaDto) => {
    try {
      await generarProyecciones(config);
    } catch (error) {
      console.error('Error generating proyecciones:', error);
    }
  };

  // Handle create selected proyeccion
  const handleCreateSelected = async (proyeccion: ProyeccionAutomatica) => {
    try {
      // Create a single proyeccion
      await crearProyecciones({
        proyecciones: [proyeccion]
      } as any);  // Using 'as any' to bypass TypeScript error for this example
    } catch (error) {
      console.error('Error creating proyeccion:', error);
    }
  };

  // Handle create all proyecciones
  const handleCreateAll = async () => {
    try {
      // Create all proyecciones
      await crearProyecciones({
        proyecciones: proyeccionesAutomaticas
      } as any);  // Using 'as any' to bypass TypeScript error for this example
    } catch (error) {
      console.error('Error creating proyecciones:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Analytics fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Analítica de Proyecciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Análisis avanzado y predicciones para optimizar proyecciones de pago
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Cliente selector */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Person color="primary" />
            <Box flexGrow={1} maxWidth={500}>
              <ClienteAutocomplete
                value={selectedCliente || ''}
                onChange={handleClienteChange}
              />
            </Box>
            {selectedCliente && tabValue !== 2 && (
              <Button 
                variant="outlined" 
                onClick={loadClienteData}
              >
                Actualizar Análisis
              </Button>
            )}
            {tabValue === 2 && (
              <Button 
                variant="outlined" 
                onClick={loadEstacionalidadData}
                disabled={loadingEstacionalidad}
              >
                Actualizar Estacionalidad
              </Button>
            )}
          </Box>
        </Paper>

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ShowChart />} label="COMPORTAMIENTO" />
            <Tab icon={<TrendingUp />} label="RIESGO" />
            <Tab icon={<CalendarMonth />} label="ESTACIONALIDAD" />
            <Tab icon={<Person />} label="PATRÓN DE PAGO" />
            <Tab icon={<AutoAwesome />} label="PROYECCIÓN AUTOMÁTICA" />
          </Tabs>

          {/* Comportamiento tab */}
           <TabPanel value={tabValue} index={0}>
            {(selectedCliente && comportamientoCliente ) ? (
              <ComportamientoClienteCard 
                comportamiento={comportamientoCliente} 
                loading={loadingComportamiento}
              />
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  Seleccione un cliente para ver su análisis de comportamiento
                </Typography>
              </Box>
            )}
          </TabPanel> 
          
          {/* Riesgo tab */}
          <TabPanel value={tabValue} index={1}>
            {selectedCliente && riesgoCliente ? (
              <RiesgoClienteCard 
                evaluacionRiesgo={riesgoCliente}
                loading={loadingRiesgo}
              />
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  Seleccione un cliente para ver su evaluación de riesgo
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Estacionalidad tab */}
          <TabPanel value={tabValue} index={2}>
            {analisisEstacionalidad ? (
              <EstacionalidadChart
                analisisEstacionalidad={analisisEstacionalidad}
                loading={loadingEstacionalidad}
              />
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  {loadingEstacionalidad ? 
                    'Cargando análisis de estacionalidad...' : 
                    'Haga clic en "Actualizar Estacionalidad" para cargar los datos'}
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Patrón de Pago tab */}
          <TabPanel value={tabValue} index={3}>
            {selectedCliente&& patronPago ? (
              <PatronPagoCard 
                patronPago={patronPago} 
                loading={loadingPatron}
              />
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  Seleccione un cliente para ver su patrón de pago
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Proyección Automática tab */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid >
                <ProyeccionAutomaticaForm 
                  onGenerate={handleGenerateProyecciones}
                  loading={loadingAutomaticas}
                  initialValues={selectedCliente ? { noCliente: selectedCliente } : undefined}
                />
              </Grid>
              <Grid >
                <ProyeccionesAutomaticasList 
                  proyeccionesAutomaticas={proyeccionesAutomaticas}
                  onCreateSelected={handleCreateSelected}
                  onCreateAll={handleCreateAll}
                  loading={loadingAutomaticas}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProyeccionAnaliticaPage;