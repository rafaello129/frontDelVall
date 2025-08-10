import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Paper,
  Typography,
  Tooltip,

} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  addDays, 
  addMonths, 
  addWeeks, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  isWeekend
} from 'date-fns';
import { FilterList as FilterListIcon, Clear as ClearIcon, Info as InfoIcon } from '@mui/icons-material';
import { EstadoProyeccion } from '../types';

interface ProyeccionCalendarFiltersProps {
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: EstadoProyeccion | '';
  numDias: number;
  onFechaInicioChange: (date: Date | null) => void;
  onFechaFinChange: (date: Date | null) => void;
  onEstadoChange: (estado: EstadoProyeccion | '') => void;
  onNumDiasChange: (numDias: number) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

// Utility function to calculate business end date based on number of days
const calculateBusinessEndDate = (startDate: Date, businessDays: number): Date => {
  let endDate = startDate;
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    endDate = addDays(endDate, 1);
    if (!isWeekend(endDate)) {
      daysAdded++;
    }
  }
  
  return endDate;
};

export const ProyeccionCalendarFilters: React.FC<ProyeccionCalendarFiltersProps> = ({
  fechaInicio,
  fechaFin,
  estado,
  numDias,
  onFechaInicioChange,
  onFechaFinChange,
  onEstadoChange,
  onNumDiasChange,
  onApplyFilters,
  onClearFilters
}) => {
  const handleEstadoChange = (event: SelectChangeEvent<string>) => {
    onEstadoChange(event.target.value as EstadoProyeccion | '');
  };

  const handleNumDiasChange = (event: SelectChangeEvent<number>) => {
    onNumDiasChange(event.target.value as number);
    
    // Update end date based on selected days (only weekdays)
    if (fechaInicio) {
      const newEndDate = calculateBusinessEndDate(fechaInicio, event.target.value as number);
      onFechaFinChange(newEndDate);
    }
  };

  const handleSetSemana = () => {
    const today = new Date();
    // Week starts on Monday (weekStartsOn: 1)
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    
    // For this week, just set the actual week boundaries
    onFechaInicioChange(startOfCurrentWeek);
    
    // Calculate business days in this week - excluding weekends
    const businessDaysInWeek = Math.min(5, numDias); // Max 5 business days in a week
    const endDate = calculateBusinessEndDate(startOfCurrentWeek, businessDaysInWeek - 1); // -1 because start day counts
    onFechaFinChange(endDate);
  };

  const handleSetMes = () => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    
    // Set start of month
    onFechaInicioChange(firstDayOfMonth);
    
    // For displaying a month, we'll show the maximum available business days
    // but cap it at the selected numDias
    const lastDayOfMonth = endOfMonth(today);
    let businessDaysCount = 0;
    let currentDate = firstDayOfMonth;
    
    // Count business days in the month
    while (currentDate <= lastDayOfMonth && businessDaysCount < numDias) {
      if (!isWeekend(currentDate)) {
        businessDaysCount++;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    // Use the last counted business day or the last day of month (whichever comes first)
    onFechaFinChange(currentDate > lastDayOfMonth ? lastDayOfMonth : addDays(currentDate, -1));
  };

  const handleSetProximaSemana = () => {
    const today = new Date();
    const nextWeek = addWeeks(today, 1);
    const startOfNextWeek = startOfWeek(nextWeek, { weekStartsOn: 1 }); // Monday
    
    onFechaInicioChange(startOfNextWeek);
    
    // Calculate business days in next week - excluding weekends
    const businessDaysInWeek = Math.min(5, numDias); // Max 5 business days in a week
    const endDate = calculateBusinessEndDate(startOfNextWeek, businessDaysInWeek - 1); // -1 because start day counts
    onFechaFinChange(endDate);
  };

  const handleSetProximoMes = () => {
    const today = new Date();
    const nextMonth = addMonths(today, 1);
    const firstDayOfNextMonth = startOfMonth(nextMonth);
    
    // Set start of next month
    onFechaInicioChange(firstDayOfNextMonth);
    
    // For displaying next month, we'll show the maximum available business days
    // but cap it at the selected numDias
    const lastDayOfNextMonth = endOfMonth(nextMonth);
    let businessDaysCount = 0;
    let currentDate = firstDayOfNextMonth;
    
    // Count business days in the month
    while (currentDate <= lastDayOfNextMonth && businessDaysCount < numDias) {
      if (!isWeekend(currentDate)) {
        businessDaysCount++;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    // Use the last counted business day or the last day of month (whichever comes first)
    onFechaFinChange(currentDate > lastDayOfNextMonth ? lastDayOfNextMonth : addDays(currentDate, -1));
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack spacing={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle2">Periodo</Typography>
          <Tooltip title="La vista del calendario solo muestra días laborables (lunes a viernes)">
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button size="small" variant="outlined" onClick={handleSetSemana}>Esta Semana</Button>
          <Button size="small" variant="outlined" onClick={handleSetMes}>Este Mes</Button>
          <Button size="small" variant="outlined" onClick={handleSetProximaSemana}>Próxima Semana</Button>
          <Button size="small" variant="outlined" onClick={handleSetProximoMes}>Próximo Mes</Button>
        </Box>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <DatePicker
              label="Fecha Inicio"
              value={fechaInicio}
              onChange={(newDate) => {
                onFechaInicioChange(newDate);
                
                // Update end date based on business days when start date changes
                if (newDate) {
                  const newEndDate = calculateBusinessEndDate(newDate, numDias);
                  onFechaFinChange(newEndDate);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small"
                }
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <DatePicker
              label="Fecha Fin"
              value={fechaFin}
              onChange={onFechaFinChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small"
                }
              }}
            />
          </Box>
        </Box>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={estado}
                onChange={handleEstadoChange}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.values(EstadoProyeccion).map((e) => (
                  <MenuItem key={e} value={e}>
                    {e}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Máximo días laborables</InputLabel>
              <Select
                value={numDias}
                onChange={handleNumDiasChange}
                label="Máximo días laborables"
              >
                <MenuItem value={1}>Unico (1 dia)</MenuItem>
                <MenuItem value={5}>5 días (1 semana)</MenuItem>
                <MenuItem value={10}>10 días (2 semanas)</MenuItem>
                <MenuItem value={15}>15 días (3 semanas)</MenuItem>
                <MenuItem value={20}>20 días (4 semanas)</MenuItem>
                <MenuItem value={40}>40 días (8 semanas)</MenuItem>
                <MenuItem value={60}>60 días (12 semanas)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
          >
            Limpiar
          </Button>
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={onApplyFilters}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};