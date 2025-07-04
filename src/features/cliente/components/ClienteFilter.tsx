import React, { useState, useEffect } from 'react';
import type { FilterClienteDto } from '../types';
import { privateApi } from '../../../services/api';

// Define default enum values in case API fails
const DEFAULT_SUCURSALES = [
 "ACAPULCO", 
  "BLUELINE",
  "CABOS",
  "CANCUN",
 "TEPAPULCO",
  "VALLARTA",
   "YUCATAN",
];

const DEFAULT_CLASIFICACIONES = ['AAA', 'AA', 'A', 'B', 'C', 'D'];

interface ClienteFilterProps {
  onFilter: (filters: FilterClienteDto) => void;
  initialFilters?: FilterClienteDto;
}

const ClienteFilter: React.FC<ClienteFilterProps> = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState<FilterClienteDto>(initialFilters);
  const [sucursales, setSucursales] = useState<string[]>(DEFAULT_SUCURSALES);
  const [clasificaciones, setClasificaciones] = useState<string[]>(DEFAULT_CLASIFICACIONES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEnumValues = async () => {
      setLoading(true);
      try {
        // Try to fetch enum values from backend
        const response = await privateApi.get('/cliente/enums');
        if (response.data) {
          if (response.data.sucursales) setSucursales(response.data.sucursales);
          if (response.data.clasificaciones) setClasificaciones(response.data.clasificaciones);
        }
      } catch (error) {
        console.log('Using default enum values for filters');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnumValues();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterClienteDto = {};
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="noCliente" className="block text-sm font-medium text-gray-700">
              No. Cliente
            </label>
            <input
              type="number"
              name="noCliente"
              id="noCliente"
              value={filters.noCliente || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="razonSocial" className="block text-sm font-medium text-gray-700">
              Razón Social
            </label>
            <input
              type="text"
              name="razonSocial"
              id="razonSocial"
              value={filters.razonSocial || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="comercial" className="block text-sm font-medium text-gray-700">
              Nombre Comercial
            </label>
            <input
              type="text"
              name="comercial"
              id="comercial"
              value={filters.comercial || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700">
              Sucursal
            </label>
            <select
              name="sucursal"
              id="sucursal"
              value={filters.sucursal || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todas</option>
              {sucursales.map(sucursal => (
                <option key={sucursal} value={sucursal}>
                  {sucursal.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="status"
              id="status"
              value={filters.status || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>

          <div>
            <label htmlFor="clasificacion" className="block text-sm font-medium text-gray-700">
              Clasificación
            </label>
            <select
              name="clasificacion"
              id="clasificacion"
              value={filters.clasificacion || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todas</option>
              {clasificaciones.map(clasificacion => (
                <option key={clasificacion} value={clasificacion}>
                  {clasificacion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Cargando...' : 'Filtrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteFilter;