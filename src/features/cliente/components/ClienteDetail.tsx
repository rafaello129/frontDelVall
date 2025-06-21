import React from 'react';
import { Link } from 'react-router-dom';
import type { Cliente } from '../types';
import { FaPhone, FaEnvelope, FaEdit } from 'react-icons/fa';
import FacturasPendientesTable from './FacturasPendientesTable';

interface ClienteDetailProps {
  cliente: Cliente;
  showActions?: boolean;
}

const ClienteDetail: React.FC<ClienteDetailProps> = ({ cliente, showActions = true }) => {
  const formatDateTime = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información del Cliente
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalles completos y contacto
          </p>
        </div>
        {showActions && (
          <Link
            to={`/clientes/${cliente.noCliente}/editar`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaEdit className="mr-2" /> Editar
          </Link>
        )}
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">No. Cliente</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.noCliente}</dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Razón Social</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.razonSocial}</dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Nombre Comercial</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.comercial || '-'}</dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">RFC</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.rfc || '-'}</dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Días de Crédito</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.diasCredito}</dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Límite de Crédito</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {cliente.limiteCredito ? `$${cliente.limiteCredito.toFixed(2)}` : '-'}
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Clasificación</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.clasificacion || '-'}</dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Sucursal</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{cliente.sucursal || '-'}</dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span 
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${cliente.status === 'Activo' ? 'bg-green-100 text-green-800' : 
                    cliente.status === 'Suspendido' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}
              >
                {cliente.status}
              </span>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDateTime(cliente.createdAt)}
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDateTime(cliente.updatedAt)}
            </dd>
          </div>
          
          {/* Correos electrónicos */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              <div className="flex items-center">
                <FaEnvelope className="mr-2" /> Correos Electrónicos
              </div>
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {cliente.correos && cliente.correos.length > 0 ? (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {cliente.correos.map((correo) => (
                    <li key={correo.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">{correo.correo}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a 
                          href={`mailto:${correo.correo}`} 
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Enviar correo
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay correos registrados</p>
              )}
            </dd>
          </div>
          
          {/* Teléfonos */}
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              <div className="flex items-center">
                <FaPhone className="mr-2" /> Teléfonos
              </div>
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {cliente.telefonos && cliente.telefonos.length > 0 ? (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {cliente.telefonos.map((telefono) => (
                    <li key={telefono.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">{telefono.telefono}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a 
                          href={`tel:${telefono.telefono}`} 
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Llamar
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay teléfonos registrados</p>
              )}
            </dd>
          </div>
        </dl>
      </div>
      
      {/* Sección de facturas pendientes */}
      <div className="px-4 py-5 sm:px-6 mt-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Facturas Pendientes
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Listado de facturas con saldo pendiente
        </p>
        
        <div className="mt-4">
          <FacturasPendientesTable noCliente={cliente.noCliente} />
        </div>
      </div>
    </div>
  );
};

export default ClienteDetail;