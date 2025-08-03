import React, { useState } from 'react';
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
  Typography,
  Stack
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';
import { EstadoProyeccion } from '../types';
import type { CreateProyeccionPagoDto, UpdateProyeccionPagoDto, ProyeccionPago } from '../types';

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

  // Form state - with essential fields plus estado
  const [formData, setFormData] = useState<CreateProyeccionPagoDto | UpdateProyeccionPagoDto>({
    noCliente: initialData?.noCliente || initialNoCliente || 0,
    fechaProyectada: initialData?.fechaProyectada || new Date(),
    monto: initialData?.monto || 0,
    estado: initialData?.estado || EstadoProyeccion.PENDIENTE,
    // Default values for other fields if coming from existing data
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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, fechaProyectada: date }));
      if (errors.fechaProyectada) {
        setErrors(prev => ({ ...prev, fechaProyectada: '' }));
      }
    }
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
    
    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
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
            {/* Cliente - essential field */}
            <ClienteAutocomplete
              value={formData.noCliente || ''}
              onChange={handleClienteChange}
              error={!!errors.noCliente}
              helperText={errors.noCliente}
            />

            {/* Fecha Proyectada - essential field */}
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

            {/* Monto - essential field */}
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

            {/* Estado - added back for editing */}
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
            </FormControl>
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