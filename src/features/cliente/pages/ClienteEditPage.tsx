import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import ClienteForm from '../components/ClienteForm';
import type { UpdateClienteDto } from '../types';
import type { CreateCorreoDto } from '../../correoCliente/types';
import type { CreateTelefonoDto } from '../../telefonoCliente/types';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useCorreoCliente } from '../../correoCliente/hooks/useCorreoCliente';
import { useTelefonoCliente } from '../../telefonoCliente/hooks/useTelefonoCliente';
import { toast } from 'react-toastify';

const ClienteEditPage: React.FC = () => {
  const { noCliente } = useParams<{ noCliente: string }>();
  const navigate = useNavigate();
  const { 
    selectedCliente,
    isLoading,
    error,
    getClienteById,
    editCliente,
    clearCliente
  } = useCliente();
  
  const { getCorreosByCliente, addCorreo, removeCorreo } = useCorreoCliente();
  const { getTelefonosByCliente, addTelefono, removeTelefono } = useTelefonoCliente();

  useEffect(() => {
    if (noCliente) {
      getClienteById(Number(noCliente));
    }

    return () => {
      clearCliente();
    };
  }, [noCliente, getClienteById, clearCliente]);

  const handleSubmit = async (
    clienteData: UpdateClienteDto,
    correos: CreateCorreoDto[],
    telefonos: CreateTelefonoDto[]
  ) => {
    if (!noCliente || !selectedCliente) return;
    
    try {
      // Actualizar datos del cliente
        delete clienteData.noCliente; // Asegurarse de no enviar el noCliente en la actualización
      await editCliente(Number(noCliente), clienteData);
      
      // Gestionar correos
      // 1. Eliminar antiguos correos que no están en el nuevo arreglo
      if (selectedCliente.correos) {
        const correosExistentes = selectedCliente.correos;
        const nuevosCorreos = correos.map(c => c.correo.toLowerCase());
        
        // Eliminar correos que ya no están en la lista
        for (const correoExistente of correosExistentes) {
          if (!nuevosCorreos.includes(correoExistente.correo.toLowerCase())) {
            await removeCorreo(correoExistente.id);
          }
        }
        
        // Añadir nuevos correos
        const correosExistentesEmails = correosExistentes.map(c => c.correo.toLowerCase());
        for (const nuevoCorreo of correos) {
          if (!correosExistentesEmails.includes(nuevoCorreo.correo.toLowerCase())) {
            await addCorreo({ 
              noCliente: Number(noCliente), 
              correo: nuevoCorreo.correo 
            });
          }
        }
      } else {
        // Si no había correos antes, agregar todos los nuevos
        for (const nuevoCorreo of correos) {
          await addCorreo({ 
            noCliente: Number(noCliente), 
            correo: nuevoCorreo.correo 
          });
        }
      }
      
      // Gestionar teléfonos (similar a correos)
      if (selectedCliente.telefonos) {
        const telefonosExistentes = selectedCliente.telefonos;
        const nuevosTelefonos = telefonos.map(t => t.telefono);
        
        // Eliminar teléfonos que ya no están en la lista
        for (const telExistente of telefonosExistentes) {
          if (!nuevosTelefonos.includes(telExistente.telefono)) {
            await removeTelefono(telExistente.id);
          }
        }
        
        // Añadir nuevos teléfonos
        const telefonosExistentesNums = telefonosExistentes.map(t => t.telefono);
        for (const nuevoTel of telefonos) {
          if (!telefonosExistentesNums.includes(nuevoTel.telefono)) {
            await addTelefono({ 
              noCliente: Number(noCliente), 
              telefono: nuevoTel.telefono 
            });
          }
        }
      } else {
        // Si no había teléfonos antes, agregar todos los nuevos
        for (const nuevoTel of telefonos) {
          await addTelefono({ 
            noCliente: Number(noCliente), 
            telefono: nuevoTel.telefono 
          });
        }
      }
      
      navigate(`/clientes/${noCliente}`);
    } catch (error: any) {
      toast.error(`Error al actualizar cliente: ${error.message || 'Error desconocido'}`);
      console.error('Error al actualizar cliente:', error);
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
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Link
          to={`/clientes/${noCliente}`}
          className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaArrowLeft className="mr-2" /> Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Editar Cliente: {selectedCliente.noCliente} - {selectedCliente.razonSocial}
        </h1>
      </div>

      <ClienteForm cliente={selectedCliente} onSubmit={handleSubmit} isEdit={true} />
    </div>
  );
};

export default ClienteEditPage;