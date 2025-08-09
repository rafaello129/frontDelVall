import React, { useEffect, useState } from 'react';
import { useFacturas } from '../../features/factura/hooks/useFacturas';
import type { Factura } from '../../features/factura/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FacturaFilterSelectProps {
  label: string;
  value?: string; // Tipo string
  onChange: (value: string | undefined) => void;
  noCliente?: number;
  showOnlyPendientes?: boolean;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const FacturaFilterSelect: React.FC<FacturaFilterSelectProps> = ({
  label,
  value,
  onChange,
  noCliente,
  showOnlyPendientes = true,
  placeholder = 'Seleccione una factura',
  disabled = false,
  required = false,
  error
}) => {
  const { facturas, facturasPendientes, getAllFacturas, getFacturasPendientesPorCliente, isLoading } = useFacturas();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [facturasDisponibles, setFacturasDisponibles] = useState<Factura[]>([]);
useEffect(() => {
  onChange(undefined); // Reset value when noCliente changes
},[])
  // Cargar facturas según las props
  useEffect(() => {
    if (noCliente) {
      if (showOnlyPendientes) {
        getFacturasPendientesPorCliente(noCliente);
      } else {
        getAllFacturas({ noCliente });
      }
    }else{
      setFacturasDisponibles([]);
    }
  }, [noCliente, showOnlyPendientes, getAllFacturas, getFacturasPendientesPorCliente]);

  // Actualizar facturas disponibles cuando cambian los datos
  useEffect(() => {
    if (noCliente) {
      if (showOnlyPendientes ) {
        setFacturasDisponibles(facturasPendientes);
      } else {
        setFacturasDisponibles(facturas);
      }
    } else {
      setFacturasDisponibles([]);
    }
  }, [noCliente, showOnlyPendientes, facturas, facturasPendientes]);



  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Filtrar facturas según el término de búsqueda
  const filteredFacturas = facturasDisponibles.filter(factura => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    const facturaStr = String(factura.noFactura);
    const conceptoStr = factura.concepto?.toLowerCase() || '';
    
    return (
      facturaStr.includes(searchTerm) ||
      conceptoStr.includes(searchTermLower)
    );
  });

  // Obtener el texto a mostrar cuando hay una factura seleccionada
  const getSelectedFacturaText = () => {
    if (!value) return '';
    
    const selectedFactura = facturasDisponibles.find(f => String(f.noFactura) === value);
    if (!selectedFactura) return `Factura #${value}`;
    
    return `#${selectedFactura.noFactura} - ${formatCurrency(selectedFactura.saldo)}`;
  };

  // Manejador para selección de factura en el dropdown
  const handleSelectFactura = (factura: Factura) => {
    const facturaId = String(factura.noFactura);
    onChange(facturaId);
    setSearchTerm('');
    setShowDropdown(false);
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
          placeholder={noCliente ? placeholder : "Primero seleccione un cliente"}
          value={searchTerm || getSelectedFacturaText()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            if (!e.target.value) onChange(undefined);
          }}
          onClick={() => noCliente && setShowDropdown(true)}
          disabled={disabled || !noCliente}
          autoComplete="off"
        />
        
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => noCliente && setShowDropdown(!showDropdown)}
          disabled={disabled || !noCliente}
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
      
      {showDropdown && noCliente && (
        <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500">Cargando facturas...</div>
          ) : filteredFacturas.length === 0 ? (
            <div className="p-2 text-center text-gray-500">
              {noCliente 
                ? "No se encontraron facturas pendientes para este cliente" 
                : "Seleccione un cliente primero"}
            </div>
          ) : (
            filteredFacturas.map(factura => (
              <div
                key={factura.noFactura}
                className="cursor-pointer hover:bg-blue-50 p-2 border-b border-gray-100"
                onClick={() => handleSelectFactura(factura)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">#{factura.noFactura}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{factura.concepto}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-700">{formatCurrency(factura.saldo)}</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(factura.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  </div>
                </div>
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

export default FacturaFilterSelect;