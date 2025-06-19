import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
          <img
            src="/404-illustration.svg"
            alt="Página no encontrada"
            className="h-64 w-auto mx-auto my-6"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Página no encontrada
          </h2>
          <p className="text-lg text-gray-600">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
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
            onClick={() => navigate('/')}
            variant="primary"
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            }
          >
            Ir al Inicio
          </Button>
        </div>
        
        {/* Enlaces adicionales opcionales */}
        <div className="mt-10">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
              Contacta con nosotros
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;