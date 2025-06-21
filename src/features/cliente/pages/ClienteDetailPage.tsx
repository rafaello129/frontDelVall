import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import ClienteDetail from '../components/ClienteDetail';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

const ClienteDetailPage: React.FC = () => {
  const { noCliente } = useParams<{ noCliente: string }>();
  const navigate = useNavigate();
  const { 
    selectedCliente,
    isLoading,
    error,
    getClienteById,
    removeCliente,
    clearCliente
  } = useCliente();

  useEffect(() => {
    if (noCliente) {
      getClienteById(Number(noCliente));
    }

    return () => {
      clearCliente();
    };
  }, [noCliente, getClienteById, clearCliente]);

  const handleDelete = async () => {
    if (!selectedCliente) return;
    
    if (window.confirm(`¿Está seguro que desea eliminar al cliente ${selectedCliente.razonSocial}?`)) {
      try {
        await removeCliente(selectedCliente.noCliente);
        navigate('/clientes');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            to="/clientes"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista de clientes
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedCliente) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Cliente no encontrado</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            to="/clientes"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista de clientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            to="/clientes"
            className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaArrowLeft className="mr-2" /> Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Cliente: {selectedCliente.noCliente} - {selectedCliente.razonSocial}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/clientes/${selectedCliente.noCliente}/editar`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <FaEdit className="mr-2" /> Editar
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <FaTrash className="mr-2" /> Eliminar
          </button>
        </div>
      </div>

      <ClienteDetail cliente={selectedCliente} showActions={false} />
    </div>
  );
};

export default ClienteDetailPage;