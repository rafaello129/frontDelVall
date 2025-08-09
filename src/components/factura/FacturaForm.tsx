import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import type { Factura, CreateFacturaDto, UpdateFacturaDto } from '../../features/factura/types';
import { EstadoFactura } from '../../features/shared/enums';
import ClienteFilterSelect from '../cliente/ClienteFilterSelect';
import { addDays, format } from 'date-fns';
import { useCliente } from '../../features/cliente/hooks/useCliente';
import {
  Box,
  Paper,
  Typography,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  useTheme
} from '@mui/material';

// Schema de validación para el formulario
const facturaSchema = z.object({
  noFactura: z.string().min(1,'El número de factura es requerido'),
  emision: z.string(), // Se convertirá a Date
  noCliente: z.number().int().positive('El número de cliente es requerido'),
  estado: z.string().min(1, 'El estado es requerido'),
  saldo: z.number().min(0, 'El saldo no puede ser negativo'),
  concepto: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  fechaVencimiento: z.string() // Se convertirá a Date
});

interface FacturaFormProps {
  factura?: Factura; // Si se proporciona, es una edición
  onSubmit: (data: CreateFacturaDto | UpdateFacturaDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean; // Para diferenciar entre crear y editar
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  factura,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  const theme = useTheme();
  const today = new Date();
  const in30Days = addDays(today, 30);
  const { clientes } = useCliente();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<any>({
    resolver: zodResolver(facturaSchema),
    defaultValues: factura ? {
      noFactura: factura.noFactura,
      emision: format(new Date(factura.emision), 'yyyy-MM-dd'),
      noCliente: factura.noCliente,
      estado: factura.estado,
      saldo: factura.montoTotal,
      concepto: factura.concepto,
      fechaVencimiento: format(new Date(factura.fechaVencimiento), 'yyyy-MM-dd')
    } : {
      noFactura: '',
      emision: format(today, 'yyyy-MM-dd'),
      noCliente: '',
      estado: EstadoFactura.PENDIENTE,
      saldo: 0,
      concepto: '',
      fechaVencimiento: format(in30Days, 'yyyy-MM-dd')
    }
  });

  const emisionDate = watch('emision');
  
  // Actualizar fecha de vencimiento cuando cambia la fecha de emisión
  useEffect(() => {
    if (emisionDate && !isEditing) {
      const value = watch('noCliente'); // Asegurarse de que se actualice el valor
      if(value != undefined) {
        const selectedCliente = clientes.find(cliente => cliente.noCliente === value);
        if (selectedCliente) {
          if(emisionDate && !isEditing) {
            const newVencimiento = addDays(new Date(emisionDate), selectedCliente.diasCredito || 30);
            setValue('fechaVencimiento', format(newVencimiento, 'yyyy-MM-dd'));
          }
        }
      }
    }
  }, [emisionDate, setValue, isEditing, watch, clientes]);

  const handleClienteChange = (value: number | undefined) => {
    setValue('noCliente', value);
    if(value != undefined) {
      const selectedCliente = clientes.find(cliente => cliente.noCliente === value);
      if (selectedCliente) {
        setValue('concepto', `Factura para ${selectedCliente.comercial || selectedCliente.razonSocial}`);

        if(emisionDate && !isEditing) {
          const newVencimiento = addDays(new Date(emisionDate), selectedCliente.diasCredito || 30);
          setValue('fechaVencimiento', format(newVencimiento, 'yyyy-MM-dd'));
        }
      } else {
        setValue('concepto', '');
      }
    }
    
  };

  // Transforma datos antes de enviar
  const onFormSubmit = (data: any) => {
    // Convertir strings de fecha a objetos Date para el backend
    const formattedData = {
      ...data,
      emision: new Date(data.emision),
      fechaVencimiento: new Date(data.fechaVencimiento),
      noFactura: data.noFactura.trim(), // Asegurarse de que no tenga espacios
      noCliente: Number(data.noCliente),
      saldo: Number(data.saldo)
    };
    
    onSubmit(formattedData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} sx={{ 
      '& > * + *': { mt: 3 }
    }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Número de Factura"
            type="text"
            {...register('noFactura')}
            error={errors.noFactura?.message as string}
            required
            disabled={isLoading || isEditing}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Fecha de Emisión"
            type="date"
            {...register('emision')}
            error={errors.emision?.message as string}
            required
            disabled={isLoading || isEditing}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
          <ClienteFilterSelect
            label="Cliente"
            value={watch('noCliente')}
            onChange={handleClienteChange}
            type="noCliente"
            placeholder="Selecciona un cliente"
            required
            disabled={isLoading || isEditing}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
          <FormControl fullWidth error={!!errors.estado}>
            <InputLabel id="estado-label">
              Estado <span style={{ color: theme.palette.error.main }}>*</span>
            </InputLabel>
            <Select
              labelId="estado-label"
              label="Estado *"
              {...register('estado')}
              disabled={isLoading}
              defaultValue={watch('estado')}
            >
              {Object.values(EstadoFactura).map(estado => (
                <MenuItem key={estado} value={estado}>{estado}</MenuItem>
              ))}
            </Select>
            {errors.estado && (
              <FormHelperText>{errors.estado.message as string}</FormHelperText>
            )}
          </FormControl>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Saldo"
            type="number"
            step="0.01"
            {...register('saldo', { valueAsNumber: true })}
            error={errors.saldo?.message as string}
            required
            disabled={isLoading}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Fecha de Vencimiento"
            type="date"
            {...register('fechaVencimiento')}
            error={errors.fechaVencimiento?.message as string}
            required
            disabled={isLoading}
          />
        </Box>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <FormInput
          label="Concepto"
          {...register('concepto')}
          error={errors.concepto?.message as string}
          required
          disabled={isLoading}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {isEditing ? 'Actualizar' : 'Crear'} Factura
        </Button>
      </Box>
    </Box>
  );
};

export default FacturaForm;