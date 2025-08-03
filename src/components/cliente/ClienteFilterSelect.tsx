import React, { useEffect, useState } from 'react';
import { useCliente } from '../../features/cliente/hooks/useCliente';

interface ClienteFilterSelectProps {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  type?: 'noCliente' | 'razonSocial';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const ClienteFilterSelect: React.FC<ClienteFilterSelectProps> = ({
  label,
  value,
  onChange,
  type = 'noCliente',
  placeholder = 'Seleccione un cliente',
  disabled = false,
  required = false,
  error
}) => {
  const { clientes, getAllClientes, isLoading } = useCliente();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    getAllClientes({limit: 1000});
  }, [getAllClientes]);

  // Filtrar clientes según el término de búsqueda
const filteredClientes = clientes.filter(cliente => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
        cliente.noCliente.toString().includes(searchTerm) ||
        (cliente.razonSocial && cliente.razonSocial.toLowerCase().includes(searchTermLower)) ||
        (cliente.comercial && cliente.comercial.toLowerCase().includes(searchTermLower))
    );
});

  // Formatear el texto mostrado para el cliente seleccionado
  const getSelectedClienteText = () => {
    if (value === undefined) return '';
    
    const selectedCliente = clientes.find(c => c.noCliente === value);
    if (!selectedCliente) return `Cliente ${value}`;
    
    return type === 'noCliente' 
      ? `#${selectedCliente.noCliente} - ${selectedCliente.comercial}` 
      : selectedCliente.razonSocial;
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          className={`block w-full px-3 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          placeholder={placeholder}
          value={searchTerm || getSelectedClienteText()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            if (!e.target.value) onChange(undefined);
          }}
          onClick={() => setShowDropdown(true)}
          disabled={disabled}
          autoComplete="off"
        />
        
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
        >
          <svg
            className="h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm0 14a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3A1 1 0 0110 17z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      
      {showDropdown && (
        <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500">Cargando clientes...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="p-2 text-center text-gray-500">No se encontraron clientes</div>
          ) : (
            filteredClientes.map(cliente => (
              <div
                key={cliente.noCliente}
                className="cursor-pointer hover:bg-blue-50 p-2"
                onClick={() => {
                  onChange(cliente.noCliente);
                  setSearchTerm('');
                  setShowDropdown(false);
                }}
              >
                <div className="font-medium">#{cliente.noCliente} - {cliente.comercial}</div>
                <div className="text-xs text-gray-500">{cliente.razonSocial}</div>
              </div>
            ))
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ClienteFilterSelect;