import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectUser, selectIsLoading, /*updateUserProfile*/} from '../../features/auth/authSlice';
import { updateProfileSchema, changePasswordSchema } from '../../utils/validationSchemas';
import type { UpdateProfileInputs, ChangePasswordInputs } from '../../utils/validationSchemas';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectIsLoading);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Formulario para actualizar perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue
  } = useForm<UpdateProfileInputs>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      image: user?.image || ''
    }
  });

  // Formulario para cambiar contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm<ChangePasswordInputs>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  // Actualizar valores del formulario cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setProfileValue('name', user.name);
      setProfileValue('email', user.email);
      if (user.image) {
        setProfileValue('image', user.image);
        setImagePreview(user.image);
      }
    }
  }, [user, setProfileValue]);

  // Manejar actualización de perfil
  const onUpdateProfile = async (data: UpdateProfileInputs) => {
    try {
      //await dispatch(updateUserProfile(data)).unwrap();
      toast.success('¡Perfil actualizado correctamente!');
    } catch (error) {
      toast.error('Error al actualizar el perfil. Por favor, intenta de nuevo.');
    }
  };

  // Manejar cambio de contraseña
  const onChangePassword = async (data: ChangePasswordInputs) => {
    try {
      // Aquí llamaríamos a una acción para cambiar la contraseña
      // await dispatch(changePassword(data)).unwrap();
      
      toast.success('¡Contraseña actualizada correctamente!');
      resetPassword();
    } catch (error) {
      toast.error('Error al cambiar la contraseña. Por favor, verifica tus datos e intenta de nuevo.');
    }
  };

  // Manejar carga de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Aquí se podría implementar la carga a un servicio como Cloudinary
      // Por ahora, solo usamos la vista previa local
    }
  };

  // Si no hay usuario (no debería suceder debido a AuthGuard, pero por seguridad)
  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Cabecera del perfil */}
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mi Perfil
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra tu información personal y configuración de seguridad
              </p>
            </div>
            <div className="flex-shrink-0">
              {user?.role === 'admin' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Información Personal
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Seguridad
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="px-4 py-5 sm:p-6">
          {/* Tab: Información Personal */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile(onUpdateProfile)}>
              <div className="grid grid-cols-1 gap-6">
                {/* Foto de perfil */}
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    Cambiar foto
                  </label>
                </div>
                
                {/* Campos del formulario */}
                <FormInput
                  label="Nombre"
                  type="text"
                  {...registerProfile('name')}
                  error={profileErrors.name?.message}
                  required
                  disabled={isLoading}
                />
                
                <FormInput
                  label="Correo Electrónico"
                  type="email"
                  {...registerProfile('email')}
                  error={profileErrors.email?.message}
                  required
                  disabled={isLoading}
                />
                
                <div className="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          )}
          
          {/* Tab: Seguridad */}
          {activeTab === 'security' && (
            <form onSubmit={handleSubmitPassword(onChangePassword)}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Cambiar Contraseña</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Actualiza tu contraseña regularmente para mantener tu cuenta segura.
                  </p>
                </div>
                
                <FormInput
                  label="Contraseña Actual"
                  type="password"
                  {...registerPassword('currentPassword')}
                  error={passwordErrors.currentPassword?.message}
                  required
                  disabled={isLoading}
                />
                
                <FormInput
                  label="Nueva Contraseña"
                  type="password"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                  helperText="Mínimo 6 caracteres con letras y números"
                  required
                  disabled={isLoading}
                />
                
                <FormInput
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  {...registerPassword('confirmNewPassword')}
                  error={passwordErrors.confirmNewPassword?.message}
                  required
                  disabled={isLoading}
                />
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                  >
                    Actualizar Contraseña
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;