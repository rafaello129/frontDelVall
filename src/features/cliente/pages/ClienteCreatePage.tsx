import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import { useTelefonoCliente } from '../../telefonoCliente/hooks/useTelefonoCliente';
import { useCorreoCliente } from '../../correoCliente/hooks/useCorreoCliente';
import ClienteForm from '../components/ClienteForm';
import type { CreateClienteDto, UpdateClienteDto } from '../types';
import type { CreateCorreoDto } from '../../correoCliente/types';
import type { CreateTelefonoDto } from '../../telefonoCliente/types';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClienteCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addCliente } = useCliente();
  const { addCorreo } = useCorreoCliente();
  const { addTelefono } = useTelefonoCliente();

  // Updated the parameter type to match what ClienteForm expects
  const handleSubmit = async (
    clienteData: CreateClienteDto | UpdateClienteDto,
    correos: CreateCorreoDto[],
    telefonos: CreateTelefonoDto[]
  ) => {
    try {
      // We know this is a create operation, so we can cast it
      // The form will clean the data before sending it
      const createData = clienteData as CreateClienteDto;
      
      // Remove any properties that shouldn't be sent to the API
      const { rfc, limiteCredito, ...cleanData } = createData as any;
      
      // Crear cliente
      const nuevoCliente = await addCliente(cleanData);
      
      // Crear correos si hay
      if (correos.length > 0) {
        const correosPromises = correos.map(correo => 
          addCorreo({ ...correo, noCliente: nuevoCliente.noCliente })
        );
        await Promise.all(correosPromises);
      }
      
      // Crear teléfonos si hay
      if (telefonos.length > 0) {
        const telefonosPromises = telefonos.map(telefono => 
          addTelefono({ ...telefono, noCliente: nuevoCliente.noCliente })
        );
        await Promise.all(telefonosPromises);
      }
      
      navigate(`/clientes/${nuevoCliente.noCliente}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        // Check if it's an array of validation errors
        if (Array.isArray(error.response.data.message)) {
          const errorMessages = error.response.data.message;
          errorMessages.forEach((msg: string) => toast.error(msg));
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(`Error al crear cliente: ${error.message || 'Error desconocido'}`);
      }
      console.error('Error al crear cliente:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Link
          to="/clientes"
          className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaArrowLeft className="mr-2" /> Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Cliente</h1>
      </div>

      <ClienteForm onSubmit={handleSubmit} />
    </div>
  );
};

export default ClienteCreatePage;