interface LoadingSpinnerProps {
    fullScreen?: boolean;
    size?: 'small' | 'medium' | 'large';
    message?: string;
  }
  
  const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    fullScreen = false, 
    size = 'medium', 
    message = 'Cargando...' 
  }) => {
    const sizeClasses = {
      small: 'w-5 h-5',
      medium: 'w-8 h-8',
      large: 'w-12 h-12'
    };
  
    const spinnerSize = sizeClasses[size];
    
    // Si es pantalla completa, centrar en la página
    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-12 w-12"></div>
            {message && <p className="mt-3 font-medium text-gray-700">{message}</p>}
          </div>
        </div>
      );
    }
    
    // Si no es pantalla completa, renderizar en línea
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div 
          className={`${spinnerSize} inline-block animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}
        ></div>
        {message && <p className="mt-2 text-gray-600">{message}</p>}
      </div>
    );
  };
  
  export default LoadingSpinner;