import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link to="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Logo"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">Transportes</span>
            </Link>
          </div>
          
          <div className="mt-8 md:mt-0">
            <div className="flex justify-center md:justify-end space-x-6">
              {/* Enlaces a redes sociales */}

           
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
   
          
          <p className="mt-8 text-sm text-gray-500 md:mt-0">
            &copy; {currentYear} Rafael Ramos. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;