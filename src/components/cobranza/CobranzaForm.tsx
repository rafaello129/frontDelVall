import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import type { CreateCobranzaDto, UpdateCobranzaDto, Cobranza } from '../../features/cobranza/types';
import { TipoPago } from '../../features/shared/enums';
import { useBancos } from '../../features/banco/hooks/useBancos';
import ClienteFilterSelect from '../cliente/ClienteFilterSelect';
import FacturaFilterSelect from '../factura/FacturaFilterSelect';
import { useFacturas } from '../../features/factura/hooks/useFacturas';
import { format } from 'date-fns';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  TextField,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Notes as NotesIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useTipoCambioDOF } from '../../hooks/useTipoCambioDOF';

// Schema de validación para el formulario
const cobranzaSchema = z.object({
  fechaPago: z.string().min(1, 'La fecha de pago es requerida'),
  noFactura: z.string().min(1, 'El número de factura es requerido'),
  noCliente: z.number().int().positive('El número de cliente es requerido'),
  total: z.number().min(0.01, 'El total debe ser mayor a cero'),
  tipoCambio: z.number().min(1, 'El tipo de cambio debe ser al menos 1'),
  montoDolares: z.number().optional(),
  referenciaPago: z.string().optional(),
  tipoPago: z.nativeEnum(TipoPago),
  bancoId: z.number().int().positive('El banco es requerido'),
  notas: z.string().optional()
});

// Tipo de datos para el formulario
type CobranzaFormData = {
  fechaPago: string;
  noFactura: string;
  noCliente: number;
  total: number;
  tipoCambio: number;
  montoDolares?: number;
  referenciaPago?: string;
  tipoPago: TipoPago;
  bancoId: number;
  notas?: string;
};

interface CobranzaFormProps {
  cobranza?: Cobranza;
  onSubmit: (data: CreateCobranzaDto | UpdateCobranzaDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialFacturaId?: string | number; // Nueva prop para recibir el ID de factura inicial
  initialClienteId?: number; // Nueva prop para recibir el ID de cliente inicial
}

const CobranzaForm: React.FC<CobranzaFormProps> = ({
  cobranza,
  onSubmit,
  onCancel,
  isLoading = false,
  initialFacturaId,
  initialClienteId
}) => {
  const { bancos, getAllBancos } = useBancos();
  const { getFacturaById, selectedFactura } = useFacturas();
  
  // Usar initialClienteId si está disponible
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>(
    cobranza?.noCliente || initialClienteId
  );

  // Format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  useEffect(() => {
    getAllBancos({ activo: true });
  }, [getAllBancos]);

  useEffect(() => {
    // Cargar la factura desde cobranza existente o desde initialFacturaId
    if (cobranza?.noFactura) {
      getFacturaById(cobranza.noFactura);
    } else if (initialFacturaId) {
      getFacturaById(String(initialFacturaId));
    }
  }, [cobranza, initialFacturaId, getFacturaById]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    control
  } = useForm<CobranzaFormData>({
    resolver: zodResolver(cobranzaSchema),
    defaultValues: cobranza ? {
      fechaPago: formatDateForInput(new Date(cobranza.fechaPago)),
      noFactura: String(cobranza.noFactura),
      noCliente: cobranza.noCliente,
      total: cobranza.total,
      tipoCambio: cobranza.tipoCambio,
      montoDolares: cobranza.montoDolares,
      referenciaPago: cobranza.referenciaPago,
      tipoPago: cobranza.tipoPago,
      bancoId: cobranza.bancoId,
      notas: cobranza.notas
    } : {
      fechaPago: formatDateForInput(new Date()),
      noFactura: initialFacturaId ? String(initialFacturaId) : undefined,
      noCliente: initialClienteId || undefined as unknown as number,
      total: undefined as unknown as number,
      tipoCambio: undefined,
      tipoPago: TipoPago.TRANSFERENCIA,
      bancoId: undefined,
    }
  });
  
  const hoy = format(new Date(), "dd/MM/yyyy");
  const { data: tipoCambioData } = useTipoCambioDOF(hoy);
      
  useEffect(() => {
    if (!cobranza && tipoCambioData && tipoCambioData.valor) {
      setValue('tipoCambio', Number(tipoCambioData.valor));
    }
  }, [cobranza, tipoCambioData, setValue]);

  // Cuando se selecciona una factura, cargar sus datos
  useEffect(() => {
    if (cobranza) {
      if (selectedFactura) {
        setValue('noFactura', String(selectedFactura.noFactura));
        setValue('tipoCambio', cobranza.tipoCambio);
        setValue('montoDolares', cobranza.montoDolares || 0);
      }
    } else if (selectedFactura) {
      setValue('noFactura', String(selectedFactura.noFactura));
      setValue('noCliente', selectedFactura.noCliente);
      setSelectedClienteId(selectedFactura.noCliente);
      
      const currentTotal = getValues('total');
      if (!currentTotal || selectedFactura.saldo > currentTotal) {
        setValue('total', selectedFactura.saldo);
        const tipoCambio = getValues('tipoCambio');
        if (tipoCambio) {
          const usd = Math.floor((selectedFactura.saldo / tipoCambio) * 100) / 100;
          setValue('montoDolares', usd);
        }
      }
    }
  }, [selectedFactura, setValue, getValues, cobranza, setSelectedClienteId]);

  // Vigilar el valor del monto total y tipo de cambio para calcular USD automáticamente
  const totalAmount = watch('total');
  const tipoCambio = watch('tipoCambio');
  const montoDolares = watch('montoDolares');
  const [lastEdited, setLastEdited] = useState<'total' | 'montoDolares' | 'tipoCambio' | null>(null);

  useEffect(() => {
    if (lastEdited === 'montoDolares' && montoDolares && tipoCambio) {
      const mxn = Math.floor((montoDolares * tipoCambio) * 100) / 100;
      setValue('total', mxn);
    }
  }, [montoDolares, setValue, lastEdited, tipoCambio]);
  
  useEffect(() => {
    if (lastEdited === 'total' && totalAmount && tipoCambio) {
      const usd = Math.floor((totalAmount / tipoCambio) * 100) / 100;
      setValue('montoDolares', usd);
    }
  }, [totalAmount, setValue, lastEdited, tipoCambio]);
  
  useEffect(() => {
    if (lastEdited === 'tipoCambio' && montoDolares && tipoCambio) {
      const mxn = Math.floor((montoDolares * tipoCambio) * 100) / 100;
      setValue('total', mxn);
    }
  }, [tipoCambio, setValue, lastEdited, montoDolares]);
  
  const handleClienteChange = (value: number | undefined) => {
    setSelectedClienteId(value);
    setValue('noCliente', value as number);
    setValue('noFactura', '');
  };

  const handleFacturaChange = (value: string | undefined) => {
    setValue('noFactura', value || '');
    if (value) {
      getFacturaById(value);
    }
  };

  // Convertir el formulario al tipo esperado por el backend
  const convertFormToDto = (data: CobranzaFormData): CreateCobranzaDto => {
    return {
      ...data,
      // Convert string date to Date object for backend
      fechaPago: new Date(data.fechaPago),
      noFactura: data.noFactura,
      tipoPago: data.tipoPago
    };
  };

  return (
    <Box component="form" onSubmit={handleSubmit(data => onSubmit(convertFormToDto(data)))}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {/* Fixed datetime-local input using Controller */}
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <Controller
            name="fechaPago"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.fechaPago}>
                <TextField
                  label="Fecha de pago"
                  type="datetime-local"
                  fullWidth
                  required
                  disabled={isLoading}
                  error={!!errors.fechaPago}
                  helperText={errors.fechaPago?.message}
                  InputProps={{
                    startAdornment: <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                  }}
                  InputLabelProps={{ shrink: true }}
                  {...field}
                />
              </FormControl>
            )}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <ClienteFilterSelect
            label="Cliente"
            value={selectedClienteId}
            onChange={handleClienteChange}
            type="noCliente"
            placeholder="Selecciona un cliente"
            required
            disabled={isLoading || !!cobranza || !!initialFacturaId}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <FacturaFilterSelect
            label="Factura"
            value={getValues('noFactura')}
            onChange={handleFacturaChange}
            noCliente={selectedClienteId}
            showOnlyPendientes={true}
            placeholder="Selecciona una factura"
            required
            error={errors.noFactura?.message}
            disabled={!!initialFacturaId}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Monto total (MXN)"
            type="number"
            step="0.01"
            {...register('total', { 
              valueAsNumber: true,
              onChange: () => setLastEdited('total'),
            })}
            error={errors.total?.message}
            required
            disabled={isLoading}
            leftIcon={<MoneyIcon color="action" fontSize="small" />}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Tipo de cambio"
            type="number"
            step="0.01"
            {...register('tipoCambio', { 
              valueAsNumber: true,
              onChange: () => setLastEdited('tipoCambio'),
            })}
            error={errors.tipoCambio?.message}
            required
            disabled={isLoading}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Monto en dólares (USD)"
            type="number"
            step="0.01"
            {...register('montoDolares', { 
              valueAsNumber: true,
              onChange: () => setLastEdited('montoDolares'),
            })}
            error={errors.montoDolares?.message}
            disabled={isLoading}
            leftIcon={<MoneyIcon color="action" fontSize="small" />}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <FormInput
            label="Referencia de pago"
            {...register('referenciaPago')}
            error={errors.referenciaPago?.message}
            disabled={isLoading}
          />
        </Box>
        
        {/* Fixed Select for tipoPago using Controller */}
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <Controller
            name="tipoPago"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipoPago}>
                <InputLabel id="tipo-pago-label">Tipo de pago *</InputLabel>
                <Select
                  labelId="tipo-pago-label"
                  label="Tipo de pago *"
                  {...field}
                  disabled={isLoading}
                >
                  {Object.values(TipoPago).map(tipo => (
                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                  ))}
                </Select>
                {errors.tipoPago && (
                  <FormHelperText>{errors.tipoPago.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Box>
        
        {/* Fixed Select for bancoId using Controller */}
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <Controller
            name="bancoId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.bancoId}>
                <InputLabel id="banco-label">Banco *</InputLabel>
                <Select
                  labelId="banco-label"
                  label="Banco *"
                  {...field}
                  value={field.value ?? ''}
                  disabled={isLoading}
                >
                  <MenuItem value="">Selecciona un banco</MenuItem>
                  {bancos.map(banco => (
                    <MenuItem key={banco.id} value={banco.id}>{banco.nombre}</MenuItem>
                  ))}
                </Select>
                {errors.bancoId && (
                  <FormHelperText>{errors.bancoId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <FormInput
            label="Notas"
            {...register('notas')}
            error={errors.notas?.message}
            disabled={isLoading}
            leftIcon={<NotesIcon color="action" fontSize="small" />}
          />
        </FormControl>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          leftIcon={<CloseIcon />}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<SaveIcon />}
        >
          {cobranza ? 'Actualizar' : 'Registrar'} Pago
        </Button>
      </Box>
    </Box>
  );
};

export default CobranzaForm;