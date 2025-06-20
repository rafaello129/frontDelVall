import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUsers } from '../../../features/users/hooks/useUsers';
import { createUserSchema } from '../../../utils/validationSchemas';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import type { z } from 'zod';

type CreateUserDto = z.infer<typeof createUserSchema>;

interface UserFormCreateProps {
  onClose: () => void;
}

const UserFormCreate = ({ onClose }: UserFormCreateProps) => {
  const { addUser, isLoading } = useUsers();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordconf: '',
      role: 'user'
    }
  });

  const handleCreateUser = async (data: CreateUserDto) => {
    try {
      await addUser(data);
      reset();
      onClose();
    } catch (err) {
      console.error('Error al crear usuario:', err);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Usuario</h3>
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
      <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nombre"
            {...register("name")}
            error={errors.name?.message}
            required
          />
          <FormInput
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            required
          />
          <FormInput
            label="Contraseña"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            required
          />
          <FormInput
            label="Confirmar Contraseña"
            type="password"
            {...register("passwordconf")}
            error={errors.passwordconf?.message}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Rol
          </label>
          <select 
            {...register("role")}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
            Crear Usuario
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserFormCreate;