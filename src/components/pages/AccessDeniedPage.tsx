import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import Button from '../common/Button';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
            <svg
              className="h-12 w-12 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Lo sentimos, no tienes permisos para acceder a esta página.
          </p>
          {user && (
            <div className="mt-2 text-md text-gray-500">
              Estás conectado como <span className="font-semibold">{user.name}</span> con rol de <span className="font-semibold">{user.role}</span>.
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Volver Atrás
          </Button>
          
          <Button
            as="link"
            to="/"
            variant="primary"
          >
            Ir al Inicio
          </Button>
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Si crees que deberías tener acceso a esta página, por favor
            <Link to="/contact" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
              contacta con el administrador
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;