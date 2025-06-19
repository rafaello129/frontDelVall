import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectIsAuthenticated, selectUser, selectIsLoading, clearError } from '../../features/auth/authSlice';
import { getRedirectAfterLogin } from '../../utils/redirects';
import RegisterForm from '../../features/auth/components/RegisterForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectIsLoading);

  // Limpiar errores cuando se monta o desmonta el componente
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const redirectTo = getRedirectAfterLogin(user, location);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, location]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        {/* Logo o branding */}
        <div className="text-center mb-8">
          <img
            src="/logo.svg"
            alt="Logo"
            className="mx-auto h-12 w-auto"
          />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Únete a nuestra plataforma
          </p>
        </div>

        {/* Formulario de registro */}
        <RegisterForm />
        
        {/* Enlaces adicionales */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
              state={location.state} // Preservar el estado para redirecciones
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        
        {/* Información adicional opcional */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Al registrarte, aceptas nuestros{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;