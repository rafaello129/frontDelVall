import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Switch,
  FormControlLabel,
  Stack
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';
import { BancoSelector } from '../../shared/components/BancoSelector';
import { EstadoProyeccion } from '../types';
import { TipoPago } from '../../shared/enums';
import type { CreateProyeccionPagoDto, UpdateProyeccionPagoDto, ProyeccionPago } from '../types';
import { format } from 'date-fns';

interface ProyeccionFormProps {
  initialData?: ProyeccionPago;
  initialNoCliente?: number;
  onSubmit: (data: CreateProyeccionPagoDto | UpdateProyeccionPagoDto) => Promise<void>;
  isLoading?: boolean;
}

export const ProyeccionForm: React.FC<ProyeccionFormProps> = ({ 
  initialData, 
  initialNoCliente, 
  onSubmit, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const isEditing = !!initialData;

  // Form state
  const [formData, setFormData] = useState<CreateProyeccionPagoDto | UpdateProyeccionPagoDto>({
    noCliente: initialData?.noCliente || initialNoCliente || 0,
    fechaProyectada: initialData?.fechaProyectada || new Date(),
    monto: initialData?.monto || 0,
    estado: initialData?.estado || EstadoProyeccion.PENDIENTE,
    noFactura: initialData?.noFactura || '',
    tipoCambio: initialData?.tipoCambio || 0,
    montoDolares: initialData?.montoDolares || 0,
    bancoId: initialData?.bancoId || 0,
    tipoPago: initialData?.tipoPago || undefined,
    conceptoPago: initialData?.conceptoPago || '',
    notificacionEnviada: initialData?.notificacionEnviada || false
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Handle Select changes
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name as string]) {
        setErrors(prev => ({ ...prev, [name as string]: '' }));
      }
    }
  };

  const handleClienteChange = (clienteId: number | null) => {
    setFormData(prev => ({ ...prev, noCliente: clienteId || 0 }));
    if (errors.noCliente) {
      setErrors(prev => ({ ...prev, noCliente: '' }));
    }
  };

  const handleBancoChange = (bancoId: number) => {
    setFormData(prev => ({ ...prev, bancoId }));
    if (errors.bancoId) {
      setErrors(prev => ({ ...prev, bancoId: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, fechaProyectada: date }));
      if (errors.fechaProyectada) {
        setErrors(prev => ({ ...prev, fechaProyectada: '' }));
      }
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.noCliente) {
      newErrors.noCliente = 'El cliente es requerido';
    }
    
    if (!formData.fechaProyectada) {
      newErrors.fechaProyectada = 'La fecha proyectada es requerida';
    }
    
    if (!formData.monto || formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a cero';
    }
    
    if (formData.montoDolares && formData.montoDolares < 0) {
      newErrors.montoDolares = 'El monto en dólares no puede ser negativo';
    }
    
    if (formData.tipoCambio && formData.tipoCambio < 1) {
      newErrors.tipoCambio = 'El tipo de cambio debe ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
      navigate('/proyecciones');
    } catch (error) {
      console.error('Error al guardar la proyección:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Editar Proyección de Pago' : 'Nueva Proyección de Pago'}
          </Typography>
          
          <Stack spacing={3} mt={2}>
            {/* Cliente */}
            <ClienteAutocomplete
              value={formData.noCliente || ''}
              onChange={handleClienteChange}
              error={!!errors.noCliente}
              helperText={errors.noCliente}
            />

            {/* Fecha Proyectada */}
            <DatePicker
              label="Fecha Proyectada"
              value={formData.fechaProyectada ? new Date(formData.fechaProyectada) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.fechaProyectada,
                  helperText: errors.fechaProyectada
                }
              }}
            />

            {/* Monto, Tipo de Cambio y Monto Dólares en una fila */}
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: '180px' }}>
                <TextField
                  name="monto"
                  label="Monto"
                  type="number"
                  fullWidth
                  value={formData.monto || ''}
                  onChange={handleChange}
                  error={!!errors.monto}
                  helperText={errors.monto}
                  inputProps={{ step: '0.01', min: '0.01' }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: '180px' }}>
                <TextField
                  name="tipoCambio"
                  label="Tipo de Cambio"
                  type="number"
                  fullWidth
                  value={formData.tipoCambio || ''}
                  onChange={handleChange}
                  error={!!errors.tipoCambio}
                  helperText={errors.tipoCambio}
                  inputProps={{ step: '0.01', min: '1' }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: '180px' }}>
                <TextField
                  name="montoDolares"
                  label="Monto en Dólares"
                  type="number"
                  fullWidth
                  value={formData.montoDolares || ''}
                  onChange={handleChange}
                  error={!!errors.montoDolares}
                  helperText={errors.montoDolares}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Box>
            </Box>

            {/* Estado y No Factura en una fila */}
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: '180px' }}>
                <FormControl fullWidth error={!!errors.estado}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleSelectChange}
                    label="Estado"
                  >
                    {Object.values(EstadoProyeccion).map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.estado && <FormHelperText>{errors.estado}</FormHelperText>}
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: '180px' }}>
                <TextField
                  name="noFactura"
                  label="Número de Factura"
                  fullWidth
                  value={formData.noFactura || ''}
                  onChange={handleChange}
                />
              </Box>
            </Box>

            {/* Banco y Tipo Pago en una fila */}
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: '180px' }}>
                <BancoSelector
                  value={formData.bancoId || ''}
                  onChange={handleBancoChange}
                  error={!!errors.bancoId}
                  helperText={errors.bancoId}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: '180px' }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Pago</InputLabel>
                  <Select
                    name="tipoPago"
                    value={formData.tipoPago || ''}
                    onChange={handleSelectChange}
                    label="Tipo de Pago"
                  >
                    <MenuItem value="">
                      <em>Seleccionar</em>
                    </MenuItem>
                    {Object.values(TipoPago).map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Concepto Pago */}
            <TextField
              name="conceptoPago"
              label="Concepto de Pago"
              fullWidth
              multiline
              rows={3}
              value={formData.conceptoPago || ''}
              onChange={handleChange}
            />

            {/* Notificación Enviada */}
            <FormControlLabel
              control={
                <Switch
                  name="notificacionEnviada"
                  checked={Boolean(formData.notificacionEnviada)}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Notificación Enviada"
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/proyecciones')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};