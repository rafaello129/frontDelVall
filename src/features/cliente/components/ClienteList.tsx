import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import type { Cliente, FilterClienteDto } from '../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FaEdit, FaEye, FaTrashAlt } from 'react-icons/fa';

interface ClienteListProps {
  filters?: FilterClienteDto;
  onDelete?: (noCliente: number) => void;
  showActions?: boolean;
}

const ClienteList: React.FC<ClienteListProps> = ({ 
  filters = {}, 
  onDelete, 
  showActions = true 
}) => {
  const { 
    clientes, 
    pagination, 
    isLoading, 
    error, 
    getAllClientes, 
    removeCliente, 
    setPagination 
  } = useCliente();

  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    loadClientes();
  }, [currentPage, filters]);

  const loadClientes = () => {
    const skip = (currentPage - 1) * pagination.limit;
    getAllClientes({ ...filters, skip, limit: pagination.limit });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (noCliente: number) => {
    try {
      await removeCliente(noCliente);
      if (onDelete) onDelete(noCliente);
      loadClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    } finally {
      setConfirmDelete(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (clientes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">No se encontraron clientes con los filtros aplicados.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Razón Social
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Comercial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sucursal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr key={cliente.noCliente} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cliente.noCliente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cliente.razonSocial}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.comercial || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.sucursal || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${cliente.status === 'Activo' ? 'bg-green-100 text-green-800' : 
                      cliente.status === 'Suspendido' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {cliente.status}
                  </span>
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {confirmDelete === cliente.noCliente ? (
                      <div className="flex justify-end items-center space-x-2">
                        <span className="text-gray-500 text-xs">¿Confirmar?</span>
                        <button
                          onClick={() => handleDelete(cliente.noCliente)}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-gray-600 hover:text-gray-900 text-xs"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/clientes/${cliente.noCliente}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/clientes/${cliente.noCliente}/editar`}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(cliente.noCliente)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(currentPage * pagination.limit, pagination.total)}
              </span>{' '}
              de <span className="font-medium">{pagination.total}</span> resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteList;