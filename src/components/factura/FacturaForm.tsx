import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import  Button from '../common/Button';
import FormInput  from '../common/FormInput';
import type { Factura, CreateFacturaDto, UpdateFacturaDto } from '../../features/factura/types';
import { EstadoFactura } from '../../features/shared/enums';
import ClienteFilterSelect from '../cliente/ClienteFilterSelect';
import { addDays, format } from 'date-fns';
import { useCliente } from '../../features/cliente/hooks/useCliente';

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
      const value= watch('noCliente'); // Asegurarse de que se actualice el valor
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
  }, [emisionDate, setValue, isEditing]);

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
    
    console.log('Cliente seleccionado:', value);
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Número de Factura"
          type="text"
          {...register('noFactura')}
          error={errors.noFactura?.message as string}
          required
          disabled={isLoading || isEditing}
        />
        
        <FormInput
          label="Fecha de Emisión"
          type="date"
          {...register('emision')}
          error={errors.emision?.message as string}
          required
          disabled={isLoading || isEditing}
        />
        
         <ClienteFilterSelect
          label="Cliente"
          value={watch('noCliente')}
          onChange={handleClienteChange}
          type="noCliente"
          placeholder="Selecciona un cliente"
          required
          disabled={isLoading || isEditing}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado <span className="text-red-600">*</span>
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...register('estado')}
            disabled={isLoading}
          >
            {Object.values(EstadoFactura).map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          {errors.estado && (
            <p className="mt-1 text-sm text-red-600">{errors.estado.message as string}</p>
          )}
        </div>
        
        <FormInput
          label="Saldo"
          type="number"
          step="0.01"
          {...register('saldo', { valueAsNumber: true })}
          error={errors.saldo?.message as string}
          required
          disabled={isLoading}
        />
        
        <FormInput
          label="Fecha de Vencimiento"
          type="date"
          {...register('fechaVencimiento')}
          error={errors.fechaVencimiento?.message as string}
          required
          disabled={isLoading}
        />
      </div>
      
      <FormInput
        label="Concepto"
        {...register('concepto')}
        error={errors.concepto?.message as string}
        required
        disabled={isLoading}
      />
      
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
          {isEditing ? 'Actualizar' : 'Crear'} Factura
        </Button>
      </div>
    </form>
  );
};

export default FacturaForm;