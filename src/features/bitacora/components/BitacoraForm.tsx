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
  Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';
import { TipoBitacora } from '../types';
import { Sucursal } from '../../shared/enums';
import { useCliente } from '../../cliente/hooks/useCliente';
import { useProyecciones } from '../../proyeccion/hooks/useProyecciones';
import type { CreateBitacoraPagoDto, UpdateBitacoraPagoDto, BitacoraPago } from '../types';

interface BitacoraFormProps {
  initialData?: BitacoraPago;
  onSubmit: (data: CreateBitacoraPagoDto | UpdateBitacoraPagoDto) => Promise<void>;
  isLoading?: boolean;
  proyeccionId?: number;
  noCliente?: number;
}

export const BitacoraForm: React.FC<BitacoraFormProps> = ({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  proyeccionId,
  noCliente
}) => {
  const navigate = useNavigate();
  const isEditing = !!initialData;
  const { getClienteById } = useCliente();
  const { getProyeccionById } = useProyecciones();

  // Form state
  const [formData, setFormData] = useState<CreateBitacoraPagoDto | UpdateBitacoraPagoDto>({
    fecha: initialData?.fecha || new Date(),
    noCliente: initialData?.noCliente || noCliente || 0,
    razonSocial: initialData?.razonSocial || '',
    comercial: initialData?.comercial || '',
    sucursal: initialData?.sucursal,
    ubicacion: initialData?.ubicacion || '',
    banco: initialData?.banco || '',
    moneda: initialData?.moneda || '',
    envioCorreo: initialData?.envioCorreo || '',
    comentario: initialData?.comentario || '',
    contestacion: initialData?.contestacion || '',
    timbrado: initialData?.timbrado || '',
    proyeccionId: initialData?.proyeccionId || proyeccionId,
    tipo: initialData?.tipo || TipoBitacora.COMENTARIO,
    telefono: initialData?.telefono || '',
    clasificacion: initialData?.clasificacion || '',
    creadoPor: initialData?.creadoPor || ''
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load client data when cliente changes
  useEffect(() => {
    const loadClienteData = async () => {
      if (formData.noCliente && formData.noCliente > 0) {
        try {
          const cliente = await getClienteById(formData.noCliente);
          setFormData(prev => ({
            ...prev,
            razonSocial: cliente.razonSocial,
            comercial: cliente.comercial || cliente.razonSocial,
            sucursal: cliente.sucursal as Sucursal,
            clasificacion: cliente.clasificacion || ''
          }));
        } catch (error) {
          console.error('Error loading cliente data:', error);
        }
      }
    };
    
    // Only load client data if we're creating a new record or the client changed
    if ((!initialData || !initialData.noCliente) && formData.noCliente) {
      loadClienteData();
    }
  }, [formData.noCliente, getClienteById, initialData]);
  
  // Load proyeccion data when proyeccionId changes
  useEffect(() => {
    const loadProyeccionData = async () => {
      if (formData.proyeccionId && formData.proyeccionId > 0) {
        try {
          const proyeccion = await getProyeccionById(formData.proyeccionId);
          // Only update client if not already set
          if (!formData.noCliente) {
            setFormData(prev => ({
              ...prev,
              noCliente: proyeccion.noCliente,
              razonSocial: proyeccion.cliente?.razonSocial || '',
              comercial: proyeccion.cliente?.comercial || proyeccion.cliente?.razonSocial || '',
              sucursal: proyeccion.cliente?.sucursal as Sucursal,
              clasificacion: proyeccion.cliente?.clasificacion || '',
              banco: proyeccion.banco?.nombre || ''
            }));
          }
        } catch (error) {
          console.error('Error loading proyeccion data:', error);
        }
      }
    };
    
    if (formData.proyeccionId && !initialData?.proyeccionId) {
      loadProyeccionData();
    }
  }, [formData.proyeccionId, getProyeccionById, initialData?.proyeccionId, formData.noCliente]);

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

  // Handle Select changes specifically
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
      setFormData(prev => ({ ...prev, fecha: date }));
      if (errors.fecha) {
        setErrors(prev => ({ ...prev, fecha: '' }));
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.noCliente) {
      newErrors.noCliente = 'El cliente es requerido';
    }
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    
    if (!formData.razonSocial) {
      newErrors.razonSocial = 'La razón social es requerida';
    }
    
    if (!formData.comercial) {
      newErrors.comercial = 'El nombre comercial es requerido';
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de registro es requerido';
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
      // If we're in a client detail page or proyeccion detail page, don't navigate away
      if (!noCliente && !proyeccionId) {
        navigate('/bitacora');
      }
    } catch (error) {
      console.error('Error al guardar la bitácora:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Editar Registro en Bitácora' : 'Nuevo Registro en Bitácora'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Cliente */}
            <ClienteAutocomplete
              value={formData.noCliente || ''}
              onChange={handleClienteChange}
              error={!!errors.noCliente}
              helperText={errors.noCliente}
              // Disable if coming from a client page or already editing
              
            />

            {/* Fecha */}
            <DateTimePicker
              label="Fecha"
              value={formData.fecha ? new Date(formData.fecha) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.fecha,
                  helperText: errors.fecha
                }
              }}
            />

            {/* Razón Social */}
            <TextField
              name="razonSocial"
              label="Razón Social"
              fullWidth
              value={formData.razonSocial || ''}
              onChange={handleChange}
              error={!!errors.razonSocial}
              helperText={errors.razonSocial}
            />

            {/* Nombre Comercial */}
            <TextField
              name="comercial"
              label="Nombre Comercial"
              fullWidth
              value={formData.comercial || ''}
              onChange={handleChange}
              error={!!errors.comercial}
              helperText={errors.comercial}
            />

            {/* Tipo de Registro */}
            <FormControl fullWidth error={!!errors.tipo}>
              <InputLabel>Tipo de Registro</InputLabel>
              <Select
                name="tipo"
                value={formData.tipo || ''}
                onChange={handleSelectChange}
                label="Tipo de Registro"
              >
                {Object.values(TipoBitacora).map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
              {errors.tipo && <FormHelperText>{errors.tipo}</FormHelperText>}
            </FormControl>

            {/* Sucursal */}
            <FormControl fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                name="sucursal"
                value={formData.sucursal || ''}
                onChange={handleSelectChange}
                label="Sucursal"
              >
                <MenuItem value="">
                  <em>Ninguna</em>
                </MenuItem>
                {Object.values(Sucursal).map((sucursal) => (
                  <MenuItem key={sucursal} value={sucursal}>
                    {sucursal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Teléfono */}
            <TextField
              name="telefono"
              label="Teléfono"
              fullWidth
              value={formData.telefono || ''}
              onChange={handleChange}
            />

            {/* Clasificación */}
            <TextField
              name="clasificacion"
              label="Clasificación"
              fullWidth
              value={formData.clasificacion || ''}
              onChange={handleChange}
            />

            {/* Banco */}
            <TextField
              name="banco"
              label="Banco"
              fullWidth
              value={formData.banco || ''}
              onChange={handleChange}
            />

            {/* Moneda */}
            <TextField
              name="moneda"
              label="Moneda"
              fullWidth
              value={formData.moneda || ''}
              onChange={handleChange}
            />

            {/* Ubicación */}
            <TextField
              name="ubicacion"
              label="Ubicación"
              fullWidth
              value={formData.ubicacion || ''}
              onChange={handleChange}
            />

            {/* Estado de Envío de Correo */}
            <TextField
              name="envioCorreo"
              label="Estado de Envío de Correo"
              fullWidth
              value={formData.envioCorreo || ''}
              onChange={handleChange}
            />

            {/* Estado de Timbrado */}
            <TextField
              name="timbrado"
              label="Estado de Timbrado"
              fullWidth
              value={formData.timbrado || ''}
              onChange={handleChange}
            />

            {/* Comentario */}
            <TextField
              name="comentario"
              label="Comentario"
              fullWidth
              multiline
              rows={3}
              value={formData.comentario || ''}
              onChange={handleChange}
            />

            {/* Contestación */}
            <TextField
              name="contestacion"
              label="Contestación/Respuesta"
              fullWidth
              multiline
              rows={3}
              value={formData.contestacion || ''}
              onChange={handleChange}
            />

            {/* Creado Por */}
            <TextField
              name="creadoPor"
              label="Registrado Por"
              fullWidth
              value={formData.creadoPor || ''}
              onChange={handleChange}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(noCliente ? `/clientes/${noCliente}` : proyeccionId ? `/proyecciones/${proyeccionId}` : '/bitacora')}
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