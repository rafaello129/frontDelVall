import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import  Button from '../common/Button';
import FormInput  from '../common/FormInput';

import type { Banco, CreateBancoDto, UpdateBancoDto } from '../../features/banco/types';

// Schema de validación para el formulario
const bancoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder los 100 caracteres'),
  codigoBancario: z.string().max(20, 'El código bancario no puede exceder los 20 caracteres').optional(),
  activo: z.boolean().optional().default(true)
});

interface BancoFormProps {
  banco?: Banco; // Si se proporciona, es una edición
  onSubmit: (data: CreateBancoDto | UpdateBancoDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const BancoForm: React.FC<BancoFormProps> = ({
  banco,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateBancoDto>({
    resolver: zodResolver(bancoSchema),
    defaultValues: banco ? {
      nombre: banco.nombre,
      codigoBancario: banco.codigoBancario,
      activo: banco.activo
    } : {
      nombre: '',
      codigoBancario: '',
      activo: true
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Nombre del banco"
        {...register('nombre')}
        error={errors.nombre?.message}
        required
        disabled={isLoading}
      />
      
      <FormInput
        label="Código bancario"
        {...register('codigoBancario')}
        error={errors.codigoBancario?.message}
        disabled={isLoading}
      />
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...register('activo')}
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-gray-700">Activo</span>
        </label>
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
          {banco ? 'Actualizar' : 'Crear'} Banco
        </Button>
      </div>
    </form>
  );
};

export default BancoForm;