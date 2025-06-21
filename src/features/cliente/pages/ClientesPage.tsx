import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import ClienteList from '../components/ClienteList';
import ClienteFilter from '../components/ClienteFilter';
import type { FilterClienteDto } from '../types';
import { FaPlus, FaChartBar, FaFileAlt } from 'react-icons/fa';

const ClientesPage: React.FC = () => {
  const { getAllClientes, resetError } = useCliente();
  const [filters, setFilters] = useState<FilterClienteDto>({});

  useEffect(() => {
    resetError();
    getAllClientes(filters);
  }, []);

  const handleFilter = (newFilters: FilterClienteDto) => {
    setFilters(newFilters);
    getAllClientes(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <div className="flex space-x-2">
          <Link
            to="/reportes/clientes"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaChartBar className="mr-2" /> Reportes
          </Link>
          <Link
            to="/clientes/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2" /> Nuevo Cliente
          </Link>
        </div>
      </div>

      <ClienteFilter onFilter={handleFilter} initialFilters={filters} />
      <ClienteList filters={filters} />
    </div>
  );
};

export default ClientesPage;