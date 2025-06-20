import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useUsers } from '../../../features/users/hooks/useUsers';
import { updateUserSchemaAdmin } from '../../../utils/validationSchemas';
import type { UserProfile } from '../../../features/users/types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import type { z } from 'zod';

type UpdateUserDto = z.infer<typeof updateUserSchemaAdmin>;

interface UserFormEditProps {
  user: UserProfile;
  currentUserId: string;
  onClose: () => void;
}

const UserFormEdit = ({ user, currentUserId, onClose }: UserFormEditProps) => {
  const { updateUser, isLoading } = useUsers();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<UpdateUserDto>({
    resolver: zodResolver(updateUserSchemaAdmin),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      passwordconf: ''
    }
  });

  // Establecer valores iniciales
  useEffect(() => {
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
  }, [user, setValue]);

  const handleEditUser = async (data: UpdateUserDto) => {
    // Solo enviar campos que no estén vacíos
    const updateData: Partial<UpdateUserDto> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    
    // Solo incluir contraseña si se proporcionó
    if (data.password) {
      updateData.password = data.password;
      updateData.passwordconf = data.passwordconf;
    }

    try {
      await updateUser(user.id, updateData);
      onClose();
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Editar Usuario</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
          onClick={onClose}
        >
          <span className="sr-only">Cerrar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit(handleEditUser)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nombre"
            {...register("name")}
            error={errors.name?.message}
          />
          <FormInput
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm text-gray-500 mb-2">
              Deja en blanco los campos de contraseña si no deseas cambiarla
            </p>
          </div>
          <FormInput
            label="Nueva Contraseña"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
          <FormInput
            label="Confirmar Nueva Contraseña"
            type="password"
            {...register("passwordconf")}
            error={errors.passwordconf?.message}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Rol
          </label>
          <select 
            {...register("role")}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={user.id === currentUserId}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          {errors.role?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserFormEdit;