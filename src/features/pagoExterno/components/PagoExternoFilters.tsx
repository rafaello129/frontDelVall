import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  Paper,
  Tooltip,
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  FilterAlt, 
  Clear, 
  ExpandMore, 
  ExpandLess, 
  CalendarMonth, 
  AttachMoney,
  BusinessCenter,
  Category,
  AccountBalance
} from '@mui/icons-material';
import type { FilterPagoExternoDto } from '../types';
import { Sucursal, TipoPago, TipoPagoExterno } from '../../shared/enums';
import { BancoSelector } from '../../shared/components/BancoSelector';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';

interface PagoExternoFiltersProps {
  onFilter: (filters: FilterPagoExternoDto) => void;
  initialFilters?: Partial<FilterPagoExternoDto>;
}

export const PagoExternoFilters: React.FC<PagoExternoFiltersProps> = ({
  onFilter,
  initialFilters = {}
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<Partial<FilterPagoExternoDto>>({
    ...initialFilters
  });
  const [expanded, setExpanded] = useState(false);

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof FilterPagoExternoDto] !== undefined && 
    filters[key as keyof FilterPagoExternoDto] !== ''
  ).length;

  const handleChange = (field: keyof FilterPagoExternoDto, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'fechaDesde' | 'fechaHasta', date: Date | null) => {
    setFilters(prev => ({ ...prev, [field]: date }));
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterAlt 
              color="primary" 
              sx={{ mr: 1.5, opacity: 0.8 }} 
            />
            <Typography variant="h6" component="div">
              Filtros
              {activeFilterCount > 0 && (
                <Chip 
                  size="small" 
                  label={activeFilterCount}
                  color="primary"
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Typography>
          </Box>
          <Tooltip title={expanded ? "Ocultar filtros" : "Mostrar filtros"}>
            <IconButton 
              onClick={toggleExpand} 
              size="small"
              color="primary"
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mb: 3 }}>
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                borderColor: alpha(theme.palette.divider, 0.5)
              }}
            >
              {/* Sección de Fecha y Tipo */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                flexWrap: 'wrap',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonth fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Período y Tipo
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  width: '100%', 
                  gap: 2
                }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <DatePicker
                      label="Fecha Desde"
                      value={filters.fechaDesde ? new Date(filters.fechaDesde) : null}
                      onChange={(date) => handleDateChange('fechaDesde', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          variant: "outlined"
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <DatePicker
                      label="Fecha Hasta"
                      value={filters.fechaHasta ? new Date(filters.fechaHasta) : null}
                      onChange={(date) => handleDateChange('fechaHasta', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          variant: "outlined"
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de Pago Externo</InputLabel>
                      <Select
                        value={filters.tipo || ''}
                        onChange={(e) => handleChange('tipo', e.target.value)}
                        label="Tipo de Pago Externo"
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {Object.values(TipoPagoExterno).map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo.replace(/_/g, ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sucursal</InputLabel>
                      <Select
                        value={filters.sucursal || ''}
                        onChange={(e) => handleChange('sucursal', e.target.value)}
                        label="Sucursal"
                      >
                        <MenuItem value="">
                          <em>Todas</em>
                        </MenuItem>
                        {Object.values(Sucursal).map((sucursal) => (
                          <MenuItem key={sucursal} value={sucursal}>
                            {sucursal}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />

              {/* Sección de Montos y Pago */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                flexWrap: 'wrap',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Montos y Método de Pago
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  width: '100%', 
                  gap: 2
                }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <TextField
                      fullWidth
                      label="Monto Mínimo"
                      type="number"
                      size="small"
                      value={filters.montoMinimo || ''}
                      onChange={(e) => handleChange('montoMinimo', e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <TextField
                      fullWidth
                      label="Monto Máximo"
                      type="number"
                      size="small"
                      value={filters.montoMaximo || ''}
                      onChange={(e) => handleChange('montoMaximo', e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de Pago</InputLabel>
                      <Select
                        value={filters.tipoPago || ''}
                        onChange={(e) => handleChange('tipoPago', e.target.value)}
                        label="Tipo de Pago"
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {Object.values(TipoPago).map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <BancoSelector
                      value={filters.bancoId || ''}
                      onChange={(bancoId) => handleChange('bancoId', bancoId)}
                      showEmpty
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />

              {/* Sección de Entidad y Concepto */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessCenter fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Cliente y Concepto
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  width: '100%', 
                  gap: 2
                }}>
                  <Box sx={{ flex: '1 1 280px', minWidth: '200px' }}>
                    <ClienteAutocomplete
                      value={filters.noCliente || ''}
                      onChange={(clienteId) => handleChange('noCliente', clienteId)}
                      showEmpty
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 280px', minWidth: '200px' }}>
                    <TextField
                      fullWidth
                      label="Nombre del Pagador"
                      size="small"
                      value={filters.nombrePagador || ''}
                      onChange={(e) => handleChange('nombrePagador', e.target.value)}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 280px', minWidth: '200px' }}>
                    <TextField
                      fullWidth
                      label="Concepto"
                      size="small"
                      value={filters.concepto || ''}
                      onChange={(e) => handleChange('concepto', e.target.value)}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Collapse>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-end', 
          gap: 2
        }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            sx={{ 
              borderRadius: 1.5,
              flexGrow: { xs: 1, sm: 0 },
              order: { xs: 2, sm: 1 }
            }}
            disabled={activeFilterCount === 0}
          >
            Limpiar Filtros
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterAlt />}
            onClick={handleApplyFilters}
            sx={{ 
              borderRadius: 1.5,
              flexGrow: { xs: 1, sm: 0 },
              order: { xs: 1, sm: 2 }
            }}
          >
            Aplicar Filtros
            {activeFilterCount > 0 && (
              <Chip 
                size="small" 
                label={activeFilterCount}
                color="info"
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};