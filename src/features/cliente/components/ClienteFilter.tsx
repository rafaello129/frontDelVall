import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper, Typography, Box, TextField, Autocomplete, MenuItem,
  FormControl, InputLabel, Select, Button, Chip,
  InputAdornment, Divider, useTheme, alpha, Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  BusinessCenter as BusinessIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useClienteFilters } from '../hooks/useClienteFilters';
import { clienteEnumsService } from '../clienteEnumsService';
import type { FilterClienteDto } from '../types';

interface ClienteFilterProps {
  onFilter: (filters: FilterClienteDto) => void;
  initialFilters?: FilterClienteDto;
}

const ClienteFilter: React.FC<ClienteFilterProps> = ({ onFilter, initialFilters = {} }) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<FilterClienteDto>(initialFilters);
  const [expanded, setExpanded] = useState(true);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [clasificaciones, setClasificaciones] = useState<string[]>([]);
  const [enumsLoading, setEnumsLoading] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Use the hook to get filter options
  const { filterOptions, isLoading, reloadFilterOptions } = useClienteFilters();

  // Type-safe access to filter options
  const safeFilterOptions = {
    noClientes: (filterOptions.noClientes || []) as number[],
    razonSocial: (filterOptions.razonSocial || []) as string[],
    comercial: (filterOptions.comercial || []) as string[]
  };

  // Fetch enum values from the service
  useEffect(() => {
    const fetchEnumValues = async () => {
      setEnumsLoading(true);
      try {
        const enums = await clienteEnumsService.getEnums();
        setSucursales(enums.sucursales);
        setClasificaciones(enums.clasificaciones);
      } catch (error) {
        console.log('Error fetching enum values:', error);
      } finally {
        setEnumsLoading(false);
      }
    };
    
    fetchEnumValues();
  }, []);

  // Count active filters for badge
  useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
    setActiveFilterCount(count);
  }, [filters]);

  const handleChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterClienteDto = {};
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const isFilterActive = (key: string) => {
    return filters[key as keyof FilterClienteDto] !== undefined && 
           filters[key as keyof FilterClienteDto] !== null &&
           filters[key as keyof FilterClienteDto] !== '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(to right bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
          }
        }}
      >
    
        {/* Filter Form */}
        {expanded && (
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 3
            }}>
              {/* No. Cliente */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' } }}>
                <Autocomplete
                  id="noCliente"
                  options={safeFilterOptions.noClientes}
                  freeSolo
                  value={filters.noCliente || null}
                  onChange={(_, newValue) => handleChange('noCliente', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="No. Cliente"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color={isFilterActive('noCliente') ? 'primary' : 'action'} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Box>

              {/* Razón Social */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' } }}>
                <Autocomplete
                  id="razonSocial"
                  options={safeFilterOptions.razonSocial}
                  freeSolo
                  value={filters.razonSocial || null}
                  onChange={(_, newValue) => handleChange('razonSocial', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Razón Social"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon color={isFilterActive('razonSocial') ? 'primary' : 'action'} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Box>

              {/* Nombre Comercial */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' } }}>
                <Autocomplete
                  id="comercial"
                  options={safeFilterOptions.comercial}
                  freeSolo
                  value={filters.comercial || null}
                  onChange={(_, newValue) => handleChange('comercial', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nombre Comercial"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon color={isFilterActive('comercial') ? 'primary' : 'action'} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Box>

              {/* Sucursal */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' } }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="sucursal-label">Sucursal</InputLabel>
                  <Select
                    labelId="sucursal-label"
                    id="sucursal"
                    value={filters.sucursal || ''}
                    onChange={(e) => handleChange('sucursal', e.target.value)}
                    label="Sucursal"
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationIcon color={isFilterActive('sucursal') ? 'primary' : 'action'} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Todas</em>
                    </MenuItem>
                    {sucursales.map(sucursal => (
                      <MenuItem key={sucursal} value={sucursal}>
                        {sucursal.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Estado */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' } }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    label="Estado"
                    startAdornment={
                      <InputAdornment position="start">
                        <VerifiedUserIcon color={isFilterActive('status') ? 'primary' : 'action'} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Todos</em>
                    </MenuItem>
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                    <MenuItem value="Suspendido">Suspendido</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Clasificación */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' } }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="clasificacion-label">Clasificación</InputLabel>
                  <Select
                    labelId="clasificacion-label"
                    id="clasificacion"
                    value={filters.clasificacion || ''}
                    onChange={(e) => handleChange('clasificacion', e.target.value)}
                    label="Clasificación"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon color={isFilterActive('clasificacion') ? 'primary' : 'action'} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Todas</em>
                    </MenuItem>
                    {clasificaciones.map(clasificacion => (
                      <MenuItem key={clasificacion} value={clasificacion}>
                        {clasificacion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <Box mt={3} display="flex" flexWrap="wrap" gap={1}>
                {Object.entries(filters).map(([key, value]) => {
                  if (value !== undefined && value !== null && value !== '') {
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Chip
                          label={`${key}: ${value}`}
                          onDelete={() => handleChange(key, '')}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ m: 0.5 }}
                        />
                      </motion.div>
                    );
                  }
                  return null;
                })}
              </Box>
            )}

            {/* Action Buttons */}
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="flex-end" 
              mt={3}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<CloseIcon />}
                disabled={isLoading || enumsLoading}
              >
                Limpiar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                disabled={isLoading || enumsLoading}
              >
                {isLoading || enumsLoading ? 'Cargando...' : 'Buscar'}
              </Button>
            </Stack>
          </motion.form>
        )}
      </Paper>
    </motion.div>
  );
};

export default ClienteFilter;