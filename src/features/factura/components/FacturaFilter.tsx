  import React from 'react';
  import { Box, Button, Divider, Paper, Typography } from '@mui/material';
  import RefreshIcon from '@mui/icons-material/Refresh';
  import type { FilterFacturaDto } from '../types';
  import ClienteFilterSelect from '../../../components/cliente/ClienteFilterSelect';
import { DatePicker, DateRangeIcon, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';


  interface FacturaFilterProps {
    filters: FilterFacturaDto;
    onFilterChange: (key: keyof FilterFacturaDto, value: any) => void;
    onReset: () => void;
    onApply: () => void;
    isLoading?: boolean;
  }

  const FacturaFilter: React.FC<FacturaFilterProps> = ({
    filters,
    onFilterChange,
    onReset,
    onApply,
    isLoading,
  }) => (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        borderTop: (theme) => `4px solid ${theme.palette.primary.main}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Filtros</Typography>
        <Button size="small" onClick={onReset}>
          Limpiar filtros
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: '31%' }, flexGrow: 1 }}>
          <ClienteFilterSelect
            label="Cliente"
            value={filters.noCliente}
            onChange={(value) => onFilterChange('noCliente', value)}
            type="noCliente"
            placeholder="Todos los clientes"
          />
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', md: '31%' }, flexGrow: 1 }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado || ''}
              onChange={(e) => onFilterChange('estado', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Vencida">Vencida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </Box>

            {/* Segunda fila: Fecha de Emisión */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <DateRangeIcon fontSize="small" /> Fecha de Emisión
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ flexBasis: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
            <DatePicker
              label="Emisión desde"
              value={filters.emisionDesde || null}
              onChange={(date) => onFilterChange('emisionDesde', date)}
              slotProps={{ textField: { fullWidth: true, size: 'medium' } }}
            />
          </Box>
          <Box sx={{ flexBasis: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
            <DatePicker
              label="Emisión hasta"
              value={filters.emisionHasta || null}
              onChange={(date) => onFilterChange('emisionHasta', date)}
              slotProps={{ textField: { fullWidth: true, size: 'medium' } }}
            />
          </Box>
        </LocalizationProvider>
      </Box>
      </Box>
      
        <Box
          sx={{
            flexBasis: { xs: '100%', md: '31%' },
            flexGrow: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onApply}
            disabled={isLoading}
            
          >
            {isLoading ? 'Cargando...' : 'Aplicar Filtros'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  export default FacturaFilter;