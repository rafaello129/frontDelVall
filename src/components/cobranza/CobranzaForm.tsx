import React, { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import axios from 'axios';
import type { CreateCobranzaDto, UpdateCobranzaDto, Cobranza } from '../../features/cobranza/types';
import { TipoPago } from '../../features/shared/enums'; // Asegúrate de importar desde shared/enums
import { useBancos } from '../../features/banco/hooks/useBancos';
import ClienteFilterSelect from '../cliente/ClienteFilterSelect';
import FacturaFilterSelect from '../factura/FacturaFilterSelect';
import { useFacturas } from '../../features/factura/hooks/useFacturas';

// Schema de validación para el formulario
const cobranzaSchema = z.object({
  fechaPago: z.date(),
  noFactura: z.string().min(1, 'El número de factura es requerido'),
  noCliente: z.number().int().positive('El número de cliente es requerido'),
  total: z.number().min(0.01, 'El total debe ser mayor a cero'),
  tipoCambio: z.number().min(1, 'El tipo de cambio debe ser al menos 1'),
  montoDolares: z.number().optional(),
  referenciaPago: z.string().optional(),
  tipoPago: z.nativeEnum(TipoPago), // Usar nativeEnum para mejor compatibilidad
  bancoId: z.number().int().positive('El banco es requerido'),
  notas: z.string().optional()
});

// Tipo de datos para el formulario (para evitar conflictos con CreateCobranzaDto)
type CobranzaFormData = {
  fechaPago: Date;
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
}

const CobranzaForm: React.FC<CobranzaFormProps> = ({
  cobranza,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { bancos, getAllBancos } = useBancos();
  const { getFacturaById, selectedFactura, clearFactura } = useFacturas();
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>(cobranza?.noCliente);

  useEffect(() => {
    getAllBancos({ activo: true });
  }, [getAllBancos]);

  useEffect(() => {
    if (cobranza?.noFactura) {
      getFacturaById(cobranza.noFactura);
    }
  }, [cobranza, getFacturaById]);



  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch
  } = useForm<CobranzaFormData>({
    resolver: zodResolver(cobranzaSchema),
    defaultValues: cobranza ? {
      fechaPago: new Date(cobranza.fechaPago),
      noFactura: String(cobranza.noFactura), // Convertir a string
      noCliente: cobranza.noCliente,
      total: cobranza.total,
      tipoCambio: cobranza.tipoCambio,
      montoDolares: cobranza.montoDolares,
      referenciaPago: cobranza.referenciaPago,
      tipoPago: cobranza.tipoPago,
      bancoId: cobranza.bancoId,
      notas: cobranza.notas
    } : {
      fechaPago: new Date(),
      noFactura: '',
      noCliente: undefined as unknown as number,
      total: undefined as unknown as number,
      tipoCambio: 19.5,
      tipoPago: TipoPago.TRANSFERENCIA,
      bancoId: undefined as unknown as number,
    }
  });
  useEffect(() => {
    const fetchDollarPrice = async () => {
      if(!cobranza) return; // No hacer la petición si ya hay una cobranza cargada
      try {
        const response = await axios.get('https://mx.dolarapi.com/v1/cotizaciones/usd');
        console.log('Precio del dólar:', response.data);
       
        setValue('tipoCambio', Math.floor(response.data.compra * 100) / 100); // Asignar el precio del dólar al campo tipoCambio
      } catch (err) {
        console.error('Error fetching dollar price:', err);
      }
    };

    fetchDollarPrice();
  }, []);

  // Cuando se selecciona una factura, cargar sus datos
  useEffect(() => {
    if(cobranza){
      if (selectedFactura) {
        setValue('noFactura', String(selectedFactura.noFactura)); // Convertir a string
        setValue('tipoCambio', cobranza.tipoCambio);
          setValue('montoDolares', cobranza.montoDolares || 0);
        
      }
      
    }else
    if (selectedFactura) {
      setValue('noFactura', String(selectedFactura.noFactura)); // Convertir a string
      const currentTotal = getValues('total');
      if (!currentTotal || selectedFactura.saldo > currentTotal) {
        setValue('total', selectedFactura.saldo);
        const usd = Math.floor((selectedFactura.saldo / tipoCambio) * 100) / 100;
        setValue('montoDolares', usd);
      }
    }
  }, [selectedFactura, setValue, getValues]);

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
  }, [montoDolares]);
  
  useEffect(() => {
    if (lastEdited === 'total' && totalAmount && tipoCambio) {
      const usd = Math.floor((totalAmount / tipoCambio) * 100) / 100;
      setValue('montoDolares', usd);
    }
  }, [totalAmount]);
  
  useEffect(() => {
    if (lastEdited === 'tipoCambio' && montoDolares && tipoCambio) {
      const mxn = Math.floor((montoDolares * tipoCambio) * 100) / 100;
      setValue('total', mxn);
    }
  }, [tipoCambio]);
  
  const handleClienteChange = (value: number | undefined) => {
    setSelectedClienteId(value);
    setValue('noCliente', value as number);
    setValue('noFactura', ''); // Limpiar como string vacío
  };

  const handleFacturaChange = (value: string | undefined) => {
    setValue('noFactura', value || '');
    if (value) {
      getFacturaById(value); // Convertir a número para la API
    }
  };

  // Convertir el formulario al tipo esperado por el backend
  const convertFormToDto = (data: CobranzaFormData): CreateCobranzaDto => {

    return {
      ...data,
      // Solo conversiones específicas si son necesarias
      noFactura: data.noFactura,
      tipoPago: data.tipoPago
    };
  };

  return (
    <form onSubmit={handleSubmit(data => onSubmit(convertFormToDto(data)))} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Fecha de pago"
          type="datetime-local"
          {...register('fechaPago', { 
            valueAsDate: true 
          })}
          error={errors.fechaPago?.message}
          required
          disabled={isLoading}
        />
        
        <ClienteFilterSelect
          label="Cliente"
          value={selectedClienteId}
          onChange={handleClienteChange}
          type="noCliente"
          placeholder="Selecciona un cliente"
          required
          disabled={isLoading || !!cobranza}
        />

<FacturaFilterSelect
          label="Factura"
          value={getValues('noFactura')}
          onChange={handleFacturaChange}
          noCliente={selectedClienteId}
          showOnlyPendientes={true}
          placeholder="Selecciona una factura"
          required
          error={errors.noFactura?.message}
          disabled={isLoading || !!cobranza || !selectedClienteId}
        />
        
        <FormInput
          label="Monto total (MXN)"
          type="number"
          step="0.01"
          {...register('total', { 
            valueAsNumber: true ,
            onChange: () => setLastEdited('total'),
          })}
          error={errors.total?.message}
          required
          disabled={isLoading}
        />
        
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
        />
        
        <FormInput
          label="Referencia de pago"
          {...register('referenciaPago')}
          error={errors.referenciaPago?.message}
          disabled={isLoading}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de pago <span className="text-red-600">*</span>
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...register('tipoPago')}
            disabled={isLoading}
          >
            {Object.values(TipoPago).map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          {errors.tipoPago && (
            <p className="mt-1 text-sm text-red-600">{errors.tipoPago.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banco <span className="text-red-600">*</span>
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...register('bancoId', { 
              valueAsNumber: true 
            })}
            disabled={isLoading}
          >
            <option value="">Selecciona un banco</option>
            {bancos.map(banco => (
              <option key={banco.id} value={banco.id}>{banco.nombre}</option>
            ))}
          </select>
          {errors.bancoId && (
            <p className="mt-1 text-sm text-red-600">{errors.bancoId.message}</p>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          {...register('notas')}
          disabled={isLoading}
        ></textarea>
        {errors.notas && (
          <p className="mt-1 text-sm text-red-600">{errors.notas.message}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
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
          {cobranza ? 'Actualizar' : 'Registrar'} Pago
        </Button>
      </div>
    </form>
  );
};

export default CobranzaForm;