
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TipoPago, Sucursal } from '../../shared/enums';
import type { FilterCobranzaDto } from '../types';
import { useBancos } from '../../banco/hooks/useBancos';
import ClienteFilterSelect from '../../../components/cliente/ClienteFilterSelect';
import FacturaFilterSelect from '../../../components/factura/FacturaFilterSelect';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Collapse,
  IconButton,
  Divider,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import Button from '../../../components/common/Button';
import FormInput from '../../../components/common/FormInput';

interface CobranzasFilterProps {
  initialFilters: FilterCobranzaDto;
  onFilterChange: (filters: FilterCobranzaDto) => void;
  className?: string;
}

const CobranzasFilter: React.FC<CobranzasFilterProps> = ({
  initialFilters,
  onFilterChange,
  className = '',
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const { bancos, getAllBancos, isLoading: bancosLoading } = useBancos();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    
  } = useForm<FilterCobranzaDto>({
    defaultValues: {
      ...initialFilters,
      tipoPago: initialFilters.tipoPago ?? undefined,
      sucursal: initialFilters.sucursal ?? undefined,
      bancoId: initialFilters.bancoId ??undefined,
      sortBy: initialFilters.sortBy ?? 'fechaPago',
      order: initialFilters.order ?? 'desc',
      limit: initialFilters.limit ?? 25
    },
  });

  // Selected client and invoice states for the filter selects
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>(
    initialFilters.noCliente
  );
  const [selectedFacturaId, setSelectedFacturaId] = useState<string | undefined>(
    initialFilters.noFactura?.toString()
  );

  // Load banks for the dropdown
  useEffect(() => {
    getAllBancos({ limit: 100, activo: true });
  }, [getAllBancos]);

  // Format dates for display in inputs
  useEffect(() => {
    if (initialFilters.fechaDesde) {
      setValue('fechaDesde', new Date(initialFilters.fechaDesde));
    }
    if (initialFilters.fechaHasta) {
      setValue('fechaHasta', new Date(initialFilters.fechaHasta));
    }
  }, [initialFilters, setValue]);

  const onSubmit = (data: FilterCobranzaDto) => {
    // Remove empty values to avoid validation errors
    const cleanedData: FilterCobranzaDto = {
      limit: 25,
      skip: 0
    };
    // Only add pagination and include flags
    cleanedData.limit = data.limit || 25;
    cleanedData.skip = data.skip || 0;
    cleanedData.incluirBanco = data.incluirBanco;
    cleanedData.incluirCliente = data.incluirCliente;
    cleanedData.incluirFactura = data.incluirFactura;
    // Only add sorting if specified
    if (data.sortBy && data.sortBy !== '') {
      cleanedData.sortBy = data.sortBy;
    }
    if (data.order) {
      cleanedData.order = data.order;
    }
    // Only add filters with actual values
    if (data.fechaDesde) {
      cleanedData.fechaDesde = new Date(data.fechaDesde);
    }
    if (data.fechaHasta) {
      cleanedData.fechaHasta = new Date(data.fechaHasta);
    }
    if (data.noFactura && data.noFactura.toString() !== '') {
      cleanedData.noFactura = data.noFactura;
    }
    if (data.noCliente) {
      cleanedData.noCliente = data.noCliente;
    }
    if (data.razonSocial && data.razonSocial.trim() !== '') {
      cleanedData.razonSocial = data.razonSocial.trim();
    }
    if (data.sucursal && data.sucursal !== undefined) {
      cleanedData.sucursal = data.sucursal;
    }
    if (data.montoMinimo !== undefined && data.montoMinimo !== null) {
      cleanedData.montoMinimo = data.montoMinimo;
    }
    if (data.montoMaximo !== undefined && data.montoMaximo !== null) {
      cleanedData.montoMaximo = data.montoMaximo;
    }
    if (data.tipoPago && data.tipoPago !== undefined) {
      cleanedData.tipoPago = data.tipoPago;
    }
    if (data.bancoId && data.bancoId !== undefined) {
      cleanedData.bancoId = data.bancoId;
    }
    onFilterChange(cleanedData);
  };

  const handleReset = () => {
    // Reset to initial default filters
    const defaultFilters: FilterCobranzaDto = {
      limit: 25,
      skip: 0,
      incluirBanco: true,
      incluirCliente: true,
      incluirFactura: true,
      sortBy: 'fechaPago',
      order: 'desc',
      tipoPago: undefined,
      sucursal: undefined,
      bancoId: undefined
    };
    setSelectedClienteId(undefined);
    setSelectedFacturaId(undefined);
    reset(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const handleClienteChange = (clienteId: number | undefined) => {
    setSelectedClienteId(clienteId);
    setValue('noCliente', clienteId);
    setSelectedFacturaId(undefined);
    setValue('noFactura', undefined);
  };

  const handleFacturaChange = (facturaId: string | undefined) => {
    setSelectedFacturaId(facturaId);
    setValue('noFactura', facturaId ? facturaId : undefined);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
      className={className}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'background.paper',
          cursor: 'pointer',
          borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight="medium" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <FilterListIcon sx={{ mr: 1 }} />
          Filtros de Búsqueda
        </Typography>
        <IconButton size="small">
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Fecha Rango */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <Typography variant="body2" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                Fecha de Pago
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Controller
                  name="fechaDesde"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      type="date"
                      placeholder="Desde"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      containerClassName="w-full"
                      inputClassName="text-sm"
                    />
                  )}
                />
                <Controller
                  name="fechaHasta"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      type="date"
                      placeholder="Hasta"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      containerClassName="w-full"
                      inputClassName="text-sm"
                    />
                  )}
                />
              </Box>
            </Box>
            
            {/* Cliente Selector */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <ClienteFilterSelect
                label="Cliente"
                value={selectedClienteId}
                onChange={handleClienteChange}
                type="noCliente"
                placeholder="Buscar por nombre o número"
              />
            </Box>
            
            {/* Factura Selector */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <FacturaFilterSelect
                label="Factura"
                value={selectedFacturaId}
                onChange={handleFacturaChange}
                noCliente={selectedClienteId}
                showOnlyPendientes={false}
                placeholder="Buscar factura"
              />
            </Box>
            
            {/* Tipo de Pago */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="tipo-pago-label">Tipo de Pago</InputLabel>
                <Controller
                  name="tipoPago"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="tipo-pago-label"
                      label="Tipo de Pago"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {Object.values(TipoPago).map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            
            {/* Sucursal */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="sucursal-label">Sucursal</InputLabel>
                <Controller
                  name="sucursal"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="sucursal-label"
                      label="Sucursal"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {Object.values(Sucursal).map((sucursal) => (
                        <MenuItem key={sucursal} value={sucursal}>
                          {sucursal.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            
            {/* Banco */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="banco-label">Banco</InputLabel>
                <Controller
                  name="bancoId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="banco-label"
                      label="Banco"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={bancosLoading}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {bancos.map((banco) => (
                        <MenuItem key={banco.id} value={banco.id}>
                          {banco.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            
            {/* Monto Rango */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <Typography variant="body2" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                Monto
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Controller
                  name="montoMinimo"
                  control={control}
                  defaultValue={undefined}
                  render={({ field }) => (
                    <TextField
                      placeholder="Mínimo"
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : parseFloat(value));
                      }}
                    />
                  )}
                />
                <Controller
                  name="montoMaximo"
                  control={control}
                  defaultValue={undefined}
                  render={({ field }) => (
                    <TextField
                      placeholder="Máximo"
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : parseFloat(value));
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
            
            {/* Opciones de Ordenamiento */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' }, display: 'flex', gap: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-by-label">Ordenar por</InputLabel>
                <Controller
                  name="sortBy"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="sort-by-label"
                      label="Ordenar por"
                      {...field}
                      value={field.value === undefined ? 'fechaPago' : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="fechaPago">Fecha de Pago</MenuItem>
                      <MenuItem value="id">ID</MenuItem>
                      <MenuItem value="noFactura">Núm. Factura</MenuItem>
                      <MenuItem value="noCliente">Núm. Cliente</MenuItem>
                      <MenuItem value="total">Monto</MenuItem>
                      <MenuItem value="tipoPago">Tipo de Pago</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel id="order-label">Orden</InputLabel>
                <Controller
                  name="order"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="order-label"
                      label="Orden"
                      {...field}
                      value={field.value === undefined ? 'desc' : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="desc">Descendente</MenuItem>
                      <MenuItem value="asc">Ascendente</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            
            {/* Registros por página */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="limit-label">Registros por página</InputLabel>
                <Controller
                  name="limit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="limit-label"
                      label="Registros por página"
                      {...field}
                      value={field.value === undefined ? 25 : field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={1000}>1000</MenuItem>
                      <MenuItem value={1000000}>1000000</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              type="button"
              variant="outline"
              onClick={handleReset}
              leftIcon={<ClearIcon />}
            >
              Limpiar Filtros
            </Button>
            <Button 
              type="submit"
              variant="primary"
              leftIcon={<SearchIcon />}
            >
              Filtrar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CobranzasFilter;