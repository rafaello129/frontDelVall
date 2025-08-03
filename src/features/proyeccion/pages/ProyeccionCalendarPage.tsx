import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Snackbar,
  Button
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon, 
  Add as AddIcon,
  FileDownload as DownloadIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProyecciones } from '../hooks/useProyecciones';
import { ProyeccionCalendarTable } from '../components/ProyeccionCalendarTable';
import { ProyeccionCalendarFilters } from '../components/ProyeccionCalendarFilters';
import { EstadoProyeccion } from '../types';
import {
  format,
  eachDayOfInterval,
  startOfDay,
  addDays,
  isWithinInterval,
  isSaturday,
  isSunday
} from 'date-fns';
import type { ProyeccionPago } from '../types';
import { useExportProyeccionesExcel } from '../../../hooks/useExcelExportProyeccion';

// Interface for client projections
interface ClienteProyecciones {
  noCliente: number;
  nombreCliente: string;
  proyecciones: ProyeccionPago[];
}

const ProyeccionCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { proyecciones: apiProyecciones, getAllProyecciones, isLoading, error } = useProyecciones();
  const { exportCalendarioProyecciones } = useExportProyeccionesExcel();
  const [exportingExcel, setExportingExcel] = useState(false);
  
  // Local state for proyecciones to avoid reloading
  const [proyecciones, setProyecciones] = useState<ProyeccionPago[]>([]);
  
  // State for filters
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [fechaFin, setFechaFin] = useState<Date | null>(addDays(new Date(), 14));
  const [estado, setEstado] = useState<EstadoProyeccion | ''>('');
  const [numDias, setNumDias] = useState<number>(14);
  
  // Memoize fechas to avoid unnecessary recomputation and filter out weekends
  const fechas = useMemo(() => {
    if (fechaInicio && fechaFin) {
      const daysArray = eachDayOfInterval({
        start: startOfDay(fechaInicio),
        end: startOfDay(fechaFin)
      });
      
      // Filter out weekends (Saturday and Sunday)
      const workdaysArray = daysArray.filter(date => 
        !isSaturday(date) && !isSunday(date)
      );
      
      // We might need more days if we filtered out weekends
      const extendedEnd = addDays(fechaFin, 10); // Add extra days to compensate for filtered weekends
      
      // If we need more days after filtering, get additional days
      if (workdaysArray.length < numDias) {
        const additionalDays = eachDayOfInterval({
          start: addDays(fechaFin, 1),
          end: extendedEnd
        }).filter(date => !isSaturday(date) && !isSunday(date));
        
        // Add enough additional days to reach the requested number of days
        const neededDays = numDias - workdaysArray.length;
        workdaysArray.push(...additionalDays.slice(0, neededDays));
      }
      
      // Limit to numDias
      return workdaysArray.slice(0, numDias);
    }
    return [];
  }, [fechaInicio, fechaFin, numDias]);
  
  // Derived state - computed from proyecciones and fechas
  const {
    clientesProyecciones,
    totalesPorFecha,
    totalesPorCliente,
    totalGeneral
  } = useMemo(() => {
    // Create a map of clients with their projections
    const clientesMap = new Map<number, ClienteProyecciones>();
    const totalesPorFechaTemp: Record<string, number> = {};
    const totalesPorClienteTemp: Record<number, number> = {};
    let totalGeneralTemp = 0;
    
    // Filter proyecciones by dates in range (including weekend proyecciones if they exist)
    const filteredProyecciones = proyecciones.filter(p => {
      if (!fechaInicio || !fechaFin) return true;
      
      const proyeccionDate = startOfDay(new Date(p.fechaProyectada));
      
      // Check if the date is within our filtered range (by checking each date in fechas)
      return fechas.some(fecha => isEqual(startOfDay(fecha), proyeccionDate));
    });
    
    // Process each proyeccion
    filteredProyecciones.forEach(proyeccion => {
      const { noCliente, monto, fechaProyectada } = proyeccion;
      const nombreCliente = proyeccion.cliente?.comercial || 
                            proyeccion.cliente?.razonSocial || 
                            `Cliente #${noCliente}`;
      
      // Add client if not exists
      if (!clientesMap.has(noCliente)) {
        clientesMap.set(noCliente, {
          noCliente,
          nombreCliente,
          proyecciones: []
        });
      }
      
      // Add proyeccion to client
      clientesMap.get(noCliente)?.proyecciones.push(proyeccion);
      
      // Update totals
      const dateKey = format(new Date(fechaProyectada), 'yyyy-MM-dd');
      totalesPorFechaTemp[dateKey] = (totalesPorFechaTemp[dateKey] || 0) + monto;
      totalesPorClienteTemp[noCliente] = (totalesPorClienteTemp[noCliente] || 0) + monto;
      totalGeneralTemp += monto;
    });
    
    // Convert map to array and sort by client name
    const clientesArray = Array.from(clientesMap.values())
      .sort((a, b) => a.nombreCliente.localeCompare(b.nombreCliente));
    
    return {
      clientesProyecciones: clientesArray,
      totalesPorFecha: totalesPorFechaTemp,
      totalesPorCliente: totalesPorClienteTemp,
      totalGeneral: totalGeneralTemp
    };
  }, [proyecciones, fechas, fechaInicio, fechaFin]);
  
  // Need to import isEqual for the date comparison
  function isEqual(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: ''
  });
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, []);
  
  // Update local state when API data changes
  useEffect(() => {
    setProyecciones(apiProyecciones);
  }, [apiProyecciones]);
  
  const loadData = useCallback(async () => {
    try {
      const filters = {
        fechaDesde: fechaInicio || undefined,
        fechaHasta: fechaFin || undefined,
        estado: estado || undefined,
      };
      
      await getAllProyecciones(filters);
    } catch (error) {
      console.error('Error loading proyecciones:', error);
      setNotification({
        open: true,
        message: 'Error al cargar las proyecciones'
      });
    }
  }, [fechaInicio, fechaFin, estado, getAllProyecciones]);
  
  const handleApplyFilters = useCallback(() => {
    loadData();
  }, [loadData]);
  
  const handleClearFilters = useCallback(() => {
    const today = new Date();
    setFechaInicio(today);
    setFechaFin(addDays(today, 14));
    setEstado('');
    setNumDias(14);
  }, []);
  
  const handleAddProyeccion = useCallback(() => {
    navigate('/proyecciones/nueva');
  }, [navigate]);
  
  // Handle notification close
  const handleCloseNotification = useCallback(() => {
    setNotification({
      open: false,
      message: ''
    });
  }, []);

  // Handle data changes (edits or new proyecciones) without reloading
  const handleDataChange = useCallback((updatedProyeccion?: ProyeccionPago, isNew = false) => {
    if (!updatedProyeccion) return;

    setProyecciones(prevProyecciones => {
      if (isNew) {
        // Add new proyeccion
        setNotification({
          open: true,
          message: 'Proyección creada correctamente'
        });
        return [...prevProyecciones, updatedProyeccion];
      } else {
        // Update existing proyeccion
        setNotification({
          open: true,
          message: 'Proyección actualizada correctamente'
        });
        return prevProyecciones.map(p => 
          p.id === updatedProyeccion.id ? updatedProyeccion : p
        );
      }
    });
  }, []);
  
  // Handle Excel export
  const handleExportExcel = useCallback(async () => {
    if (clientesProyecciones.length === 0) {
      setNotification({
        open: true,
        message: 'No hay datos para exportar'
      });
      return;
    }
    
    try {
      setExportingExcel(true);
      
      await exportCalendarioProyecciones(
        fechas,
        clientesProyecciones,
        totalesPorFecha,
        totalesPorCliente,
        totalGeneral
      );
      
      setNotification({
        open: true,
        message: 'Calendario exportado correctamente'
      });
    } catch (error) {
      console.error('Error exportando calendario:', error);
      setNotification({
        open: true,
        message: 'Error al exportar el calendario'
      });
    } finally {
      setExportingExcel(false);
    }
  }, [fechas, clientesProyecciones, totalesPorFecha, totalesPorCliente, totalGeneral, exportCalendarioProyecciones]);
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <CalendarIcon sx={{ mr: 1 }} />
          <Typography variant="h4" component="h1">
            Calendario de Proyecciones
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            disabled={exportingExcel || isLoading || clientesProyecciones.length === 0}
            sx={{ mr: 1 }}
          >
            {exportingExcel ? 'Exportando...' : 'Exportar Excel'}
          </Button>
          <Tooltip title="Nueva Proyección">
            <IconButton 
              color="primary" 
              onClick={handleAddProyeccion}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <ProyeccionCalendarFilters 
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        estado={estado}
        numDias={numDias}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        onEstadoChange={setEstado}
        onNumDiasChange={setNumDias}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : clientesProyecciones.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay proyecciones de pago en el periodo seleccionado.
        </Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <ProyeccionCalendarTable
              fechas={fechas}
              clientesProyecciones={clientesProyecciones}
              totalesPorFecha={totalesPorFecha}
              totalesPorCliente={totalesPorCliente}
              totalGeneral={totalGeneral}
              onDataChange={handleDataChange}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        message={notification.message}
      />
    </Box>
  );
};

export default ProyeccionCalendarPage;