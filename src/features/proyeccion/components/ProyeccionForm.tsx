import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  useTheme,
  alpha,
  FormHelperText,
  Divider,
  Paper
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';
import { EstadoProyeccion } from '../types';
import type { CreateProyeccionPagoDto, UpdateProyeccionPagoDto, ProyeccionPago } from '../types';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

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
  const theme = useTheme();
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name]: true }));
      if (errors[name]) {
        validateField(name, value);
      }
    }
  };

  // Handle Select changes
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name as string]: true }));
      if (errors[name as string]) {
        validateField(name as string, value);
      }
    }
  };

  const handleClienteChange = (clienteId: number | null) => {
    setFormData(prev => ({ ...prev, noCliente: clienteId || 0 }));
    setTouched(prev => ({ ...prev, noCliente: true }));
    if (errors.noCliente) {
      validateField('noCliente', clienteId || 0);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, fechaProyectada: date }));
      setTouched(prev => ({ ...prev, fechaProyectada: true }));
      if (errors.fechaProyectada) {
        validateField('fechaProyectada', date);
      }
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName as keyof typeof formData]);
  };

  // Validate a single field
  const validateField = (fieldName: string, value: any): boolean => {
    let error = '';

    switch (fieldName) {
      case 'noCliente':
        if (!value || value === 0) {
          error = 'El cliente es requerido';
        }
        break;
      
      case 'fechaProyectada':
        if (!value) {
          error = 'La fecha proyectada es requerida';
        }
        break;
      
      case 'monto':
        if (!value || value <= 0) {
          error = 'El monto debe ser mayor a cero';
        }
        break;
      
      case 'estado':
        if (!value) {
          error = 'El estado es requerido';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  // Validate form
  const validateForm = (): boolean => {
    const fieldNames = ['noCliente', 'fechaProyectada', 'monto', 'estado'];
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fieldNames.forEach(fieldName => {
      const value = formData[fieldName as keyof typeof formData];
      if (!validateField(fieldName, value)) {
        newErrors[fieldName] = errors[fieldName] || 'Este campo es requerido';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    ['noCliente', 'fechaProyectada', 'monto', 'estado'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar la proyección:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            borderColor: alpha(theme.palette.primary.main, 0.2),
            backgroundColor: alpha(theme.palette.primary.main, 0.03)
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} color="primary.main" gutterBottom>
            Información importante
          </Typography>
          <Typography variant="body2">
            Complete los datos para {isEditing ? 'actualizar' : 'crear'} una proyección de pago. 
            Todos los campos con <Box component="span" color="error.main">*</Box> son obligatorios.
          </Typography>
        </Paper>
      </Box>

      <Stack spacing={3}>
        {/* Cliente */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            gap: 1
          }}>
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Información del Cliente <Box component="span" color="error.main">*</Box>
            </Typography>
          </Box>
          
          <ClienteAutocomplete
            value={formData.noCliente || ''}
            onChange={handleClienteChange}
            error={touched.noCliente && !!errors.noCliente}
            helperText={touched.noCliente && errors.noCliente ? errors.noCliente : ''}
          />
        </Box>

        {/* Fecha Proyectada */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            gap: 1
          }}>
            <EventIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Fecha Proyectada <Box component="span" color="error.main">*</Box>
            </Typography>
          </Box>
          
          <DatePicker
            label="Seleccione una fecha"
            value={formData.fechaProyectada ? new Date(formData.fechaProyectada) : null}
            onChange={handleDateChange}
            onClose={() => handleBlur('fechaProyectada')}
            disabled={isLoading}
            slotProps={{
              textField: {
                fullWidth: true,
                error: touched.fechaProyectada && !!errors.fechaProyectada,
                helperText: touched.fechaProyectada && errors.fechaProyectada ? errors.fechaProyectada : '',
                variant: "outlined"
              }
            }}
          />
        </Box>

        {/* Monto */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            gap: 1
          }}>
            <AttachMoneyIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Información del Pago <Box component="span" color="error.main">*</Box>
            </Typography>
          </Box>
          
          <TextField
            name="monto"
            label="Monto proyectado"
            type="number"
            fullWidth
            value={formData.monto || ''}
            onChange={handleChange}
            onBlur={() => handleBlur('monto')}
            error={touched.monto && !!errors.monto}
            helperText={touched.monto && errors.monto ? errors.monto : ''}
            inputProps={{ step: '0.01', min: '0.01' }}
            disabled={isLoading}
            variant="outlined"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </Box>

        {/* Estado */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            gap: 1
          }}>
            <AssignmentIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Estado <Box component="span" color="error.main">*</Box>
            </Typography>
          </Box>
          
          <FormControl 
            fullWidth 
            error={touched.estado && !!errors.estado}
            disabled={isLoading}
          >
            <InputLabel>Estado de la proyección</InputLabel>
            <Select
              name="estado"
              value={formData.estado || ''}
              onChange={handleSelectChange}
              onBlur={() => handleBlur('estado')}
              label="Estado de la proyección"
            >
              {Object.values(EstadoProyeccion).map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </Select>
            {touched.estado && errors.estado && (
              <FormHelperText>{errors.estado}</FormHelperText>
            )}
          </FormControl>
        </Box>
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* Action Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          mt: 2
        }}
      >
        <Button 
          variant="outlined" 
          onClick={() => navigate('/proyecciones')}
          disabled={isLoading}
          startIcon={<CancelIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancelar
        </Button>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={isLoading}
          startIcon={isLoading ? <></> : <SaveIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            position: 'relative',
          }}
        >
          {isLoading ? (
            <>
              <Box sx={{ 
                display: 'inline-block', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: '#fff',
                animation: 'spin 0.8s linear infinite',
                mr: 1,
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }} /> 
              Guardando...
            </>
          ) : (
            isEditing ? 'Actualizar Proyección' : 'Crear Proyección'
          )}
        </Button>
      </Box>
    </form>
  );
};