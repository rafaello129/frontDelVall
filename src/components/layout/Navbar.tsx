import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import AuthStatus from '../../features/auth/components/AuthStatus';
import { FaUsers, FaChartBar, FaFileInvoiceDollar } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Función para determinar si un link está activo
  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? 'font-medium text-blue-600' : 'text-gray-600 hover:text-blue-600';
  };

  // Links de navegación basados en el estado de autenticación
  const navigationLinks = [
    { name: 'Inicio', path: '/', show: true },
    { 
      name: 'Clientes', 
      path: '/clientes', 
      show: isAuthenticated,
      icon: <FaUsers className="mr-2" />
    },
    { 
      name: 'Reportes', 
      path: '/reportes/clientes', 
      show: isAuthenticated,
      icon: <FaChartBar className="mr-2" /> 
    },
    { 
      name: 'Cobranza', 
      path: '/cobranza', 
      show: isAuthenticated,
      icon: <FaFileInvoiceDollar className="mr-2" /> 
    },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y links de navegación para desktop */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg" // Ajusta la ruta a tu logo
                  alt="Logo"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">Del Valle</span>
              </Link>
            </div>
            
            {/* Links de navegación para desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationLinks
                .filter(link => link.show)
                .map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive(link.path)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } text-sm font-medium`}
                  >
                    {link.icon && <span className="hidden md:inline-block">{link.icon}</span>}
                    {link.name}
                  </Link>
                ))}
            </div>
          </div>
          
          {/* Botones de autenticación y menú para desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <AuthStatus />
          </div>
          
          {/* Botón de hamburguesa para mobile */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú principal</span>
              {/* Icono de menú */}
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1">
          {navigationLinks
            .filter(link => link.show)
            .map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.name}
              </Link>
            ))}
        </div>
        
        {/* AuthStatus para mobile */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <AuthStatus className="w-full" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;