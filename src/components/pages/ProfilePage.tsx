import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../app/hooks';
import { selectUser, selectIsLoading as selectAuthLoading } from '../../features/auth/authSlice';
import { useUsers } from '../../features/users/hooks/useUsers';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { z } from 'zod';
import { format } from 'date-fns';

// Esquemas de validación
const updateProfileSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  image: z.string().optional().nullable()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmNewPassword: z.string().min(6, 'La confirmación debe tener al menos 6 caracteres')
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword']
});

type UpdateProfileInputs = z.infer<typeof updateProfileSchema>;
type ChangePasswordInputs = z.infer<typeof changePasswordSchema>;

const ProfilePage = () => {
  const user = useAppSelector(selectUser);
  const authLoading = useAppSelector(selectAuthLoading);
  const { updateUser, isLoading } = useUsers();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulario para actualizar perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    watch
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

  // Observar cambios en la URL de la imagen para actualizar la vista previa
  const imageUrl = watch('image');
  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

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
  }, []);
  
  let inProgress = false;
  // Manejar actualización de perfil
  const onUpdateProfile = async (data: UpdateProfileInputs) => {
    if (!user) return;
    if( inProgress) return; // Evitar múltiples envíos simultáneos
    try {
      inProgress = true;
      await updateUser(user.id, {
        name: data.name,
        email: data.email,
        image: data.image as string | undefined 
      });
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    } finally{
  
      inProgress = false;
    }
  };

  // Manejar cambio de contraseña
  const onChangePassword = async (data: ChangePasswordInputs) => {
    if (!user) return;
    
    try {
      await updateUser(user.id, {
        password: data.newPassword,
        passwordconf: data.confirmNewPassword,
      });
      
      toast.success('¡Contraseña actualizada correctamente!');
      resetPassword();
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      toast.error('Error al cambiar la contraseña. La contraseña actual podría ser incorrecta.');
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

      // En una implementación real, aquí subiríamos la imagen a un servicio como Cloudinary
      // y luego actualizaríamos el campo 'image' con la URL resultante
      
      // Para esta implementación, simplemente usamos la vista previa local
      // y simulamos que tenemos una URL para guardar en el perfil
      const simulatedImageUrl = URL.createObjectURL(file);
      setProfileValue('image', simulatedImageUrl);
      
      toast.info('En una implementación real, la imagen se subiría a un servidor');
    }
  };

  // Abrir el selector de archivos cuando se hace clic en el botón de cambiar foto
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (e) {
      return 'Fecha inválida';
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
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                  >
                    Cambiar foto
                  </Button>
                  
                  {/* Campo oculto para almacenar la URL de la imagen */}
                  <input type="hidden" {...registerProfile('image')} />
                </div>
                
                {/* Campos del formulario */}
                <FormInput
                  label="Nombre"
                  type="text"
                  {...registerProfile('name')}
                  error={profileErrors.name?.message}
                  required
                  disabled={isLoading || authLoading}
                />
                
                <FormInput
                  label="Correo Electrónico"
                  type="email"
                  {...registerProfile('email')}
                  error={profileErrors.email?.message}
                  required
                  disabled={isLoading || authLoading}
                />
                
                <div className="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading || authLoading}
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
                  disabled={isLoading || authLoading}
                />
                
                <FormInput
                  label="Nueva Contraseña"
                  type="password"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                  helperText="Mínimo 6 caracteres con letras y números"
                  required
                  disabled={isLoading || authLoading}
                />
                
                <FormInput
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  {...registerPassword('confirmNewPassword')}
                  error={passwordErrors.confirmNewPassword?.message}
                  required
                  disabled={isLoading || authLoading}
                />
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading || authLoading}
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