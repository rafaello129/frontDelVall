import React, { useState, useEffect } from 'react';
import { useCliente } from '../hooks/useCliente';
import { useCorreoCliente } from '../../correoCliente/hooks/useCorreoCliente';
import { useTelefonoCliente } from '../../telefonoCliente/hooks/useTelefonoCliente';
import type { Cliente, CreateClienteDto, UpdateClienteDto } from '../types';
import type { CreateCorreoDto } from '../../correoCliente/types';
import type { CreateTelefonoDto } from '../../telefonoCliente/types';
import { FaPlus, FaTrash } from 'react-icons/fa';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { privateApi } from '../../../services/api';

// Define enum values for sucursal and clasificacion
const SUCURSALES = [
  'QUINTANA_ROO',
  'PTO_VALLARTA',
  'HIDALGO',
  'ACAPULCO',
  'CABOS',
  'COACH_LINE',
  'YUCATAN',
  'PACIFICO',
  'NORTE'
];

const CLASIFICACIONES = ['AAA', 'AA', 'A', 'B', 'C', 'D'];

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (cliente: CreateClienteDto | UpdateClienteDto, correos: CreateCorreoDto[], telefonos: CreateTelefonoDto[]) => Promise<void>;
  isEdit?: boolean;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onSubmit, isEdit = false }) => {
  const { isLoading: clienteLoading } = useCliente();
  const { validateCorreo } = useCorreoCliente();
  
  const [formData, setFormData] = useState<CreateClienteDto | UpdateClienteDto>({
    noCliente: 0,
    razonSocial: '',
    comercial: '',
    diasCredito: 0,
    sucursal: SUCURSALES[0],
    clasificacion: CLASIFICACIONES[0],
    status: 'Activo'
  });
  
  const [correos, setCorreos] = useState<CreateCorreoDto[]>([]);
  const [telefonos, setTelefonos] = useState<CreateTelefonoDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});
  const [enumLoaded, setEnumLoaded] = useState(false);

  useEffect(() => {
    // Attempt to fetch enum values from the backend if available
    const fetchEnumValues = async () => {
      try {
       // const response = await privateApi.get('/cliente/enums');
        // If backend provides enum values, use them instead of hardcoded ones
        setEnumLoaded(true);
      } catch (error) {
        console.log('Using default enum values');
        setEnumLoaded(true);
      }
    };

    fetchEnumValues();
  }, []);
  
  useEffect(() => {
    if (cliente) {
      setFormData({
        noCliente: cliente.noCliente,
        razonSocial: cliente.razonSocial,
        comercial: cliente.comercial || '',
        diasCredito: cliente.diasCredito,
        clasificacion: cliente.clasificacion || CLASIFICACIONES[0],
        sucursal: cliente.sucursal || SUCURSALES[0],
        status: cliente.status
      });
      
      // Initialize correos
      if (cliente.correos && cliente.correos.length > 0) {
        setCorreos(cliente.correos.map(c => ({
          noCliente: c.noCliente,
          correo: c.correo
        })));
      }
      
      // Initialize telefonos
      if (cliente.telefonos && cliente.telefonos.length > 0) {
        setTelefonos(cliente.telefonos.map(t => ({
          noCliente: t.noCliente,
          telefono: t.telefono
        })));
      }
    }
  }, [cliente]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };
  
  const handleAddCorreo = () => {
    setCorreos([...correos, { noCliente: cliente?.noCliente || 0, correo: '' }]);
  };
  
  const handleCorreoChange = async (index: number, value: string) => {
    const newCorreos = [...correos];
    newCorreos[index].correo = value;
    setCorreos(newCorreos);
    
    // Validate email
    try {
      if (value) {
        const result = await validateCorreo(value);
        if (!result.isValid) {
          setEmailErrors(prev => ({ ...prev, [index]: 'Formato de correo inválido' }));
        } else {
          setEmailErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      } else {
        setEmailErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error validando email:', error);
    }
  };
  
  const handleRemoveCorreo = (index: number) => {
    const newCorreos = [...correos];
    newCorreos.splice(index, 1);
    setCorreos(newCorreos);
    
    setEmailErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };
  
  const handleAddTelefono = () => {
    setTelefonos([...telefonos, { noCliente: cliente?.noCliente || 0, telefono: '' }]);
  };
  
  const handleTelefonoChange = (index: number, value: string) => {
    const newTelefonos = [...telefonos];
    newTelefonos[index].telefono = value;
    setTelefonos(newTelefonos);
  };
  
  const handleRemoveTelefono = (index: number) => {
    const newTelefonos = [...telefonos];
    newTelefonos.splice(index, 1);
    setTelefonos(newTelefonos);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for email validation errors
    if (Object.keys(emailErrors).length > 0) {
      return;
    }

    // Remove fields that shouldn't be included in create (as per error messages)
    const cleanedFormData = { ...formData };
    if (!isEdit) {
      // Only remove for create, not for update
      delete (cleanedFormData as any).rfc;
      delete (cleanedFormData as any).limiteCredito;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(cleanedFormData, correos, telefonos);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (clienteLoading || !enumLoaded) return <LoadingSpinner />;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="noCliente" className="block text-sm font-medium text-gray-700">
            No. Cliente *
          </label>
          <input
            type="number"
            name="noCliente"
            id="noCliente"
            required
            disabled={isEdit} // No editable en modo edición
            value={formData.noCliente || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="razonSocial" className="block text-sm font-medium text-gray-700">
            Razón Social *
          </label>
          <input
            type="text"
            name="razonSocial"
            id="razonSocial"
            required
            value={formData.razonSocial || ''}
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
            value={formData.comercial || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="diasCredito" className="block text-sm font-medium text-gray-700">
            Días de Crédito *
          </label>
          <input
            type="number"
            name="diasCredito"
            id="diasCredito"
            required
            min={0}
            value={formData.diasCredito || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="clasificacion" className="block text-sm font-medium text-gray-700">
            Clasificación *
          </label>
          <select
            name="clasificacion"
            id="clasificacion"
            required
            value={formData.clasificacion || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {CLASIFICACIONES.map(clasificacion => (
              <option key={clasificacion} value={clasificacion}>
                {clasificacion}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Debe ser uno de los siguientes: AAA, AA, A, B, C, D
          </p>
        </div>
        
        <div>
          <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700">
            Sucursal *
          </label>
          <select
            name="sucursal"
            id="sucursal"
            required
            value={formData.sucursal || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {SUCURSALES.map(sucursal => (
              <option key={sucursal} value={sucursal}>
                {sucursal.replace('_', ' ')}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Debe ser una sucursal válida
          </p>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado *
          </label>
          <select
            name="status"
            id="status"
            required
            value={formData.status || 'Activo'}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Suspendido">Suspendido</option>
          </select>
        </div>
      </div>
      
      {/* Correos electrónicos */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Correos Electrónicos</h3>
          <button
            type="button"
            onClick={handleAddCorreo}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-1" /> Agregar
          </button>
        </div>
        <div className="space-y-3">
          {correos.map((correo, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="email"
                value={correo.correo}
                onChange={(e) => handleCorreoChange(index, e.target.value)}
                placeholder="ejemplo@dominio.com"
                className={`flex-grow border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                  ${emailErrors[index] ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveCorreo(index)}
                className="inline-flex items-center p-1 border border-transparent text-red-600 rounded-md hover:bg-red-50"
              >
                <FaTrash />
              </button>
              {emailErrors[index] && (
                <p className="mt-1 text-sm text-red-600 absolute">{emailErrors[index]}</p>
              )}
            </div>
          ))}
          {correos.length === 0 && (
            <p className="text-sm text-gray-500">No hay correos registrados</p>
          )}
        </div>
      </div>
      
      {/* Teléfonos */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Teléfonos</h3>
          <button
            type="button"
            onClick={handleAddTelefono}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-1" /> Agregar
          </button>
        </div>
        <div className="space-y-3">
          {telefonos.map((telefono, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="tel"
                value={telefono.telefono}
                onChange={(e) => handleTelefonoChange(index, e.target.value)}
                placeholder="(999) 123-4567"
                className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemoveTelefono(index)}
                className="inline-flex items-center p-1 border border-transparent text-red-600 rounded-md hover:bg-red-50"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {telefonos.length === 0 && (
            <p className="text-sm text-gray-500">No hay teléfonos registrados</p>
          )}
        </div>
      </div>
      
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(emailErrors).length > 0}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
              ${isSubmitting || Object.keys(emailErrors).length > 0
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
          >
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClienteForm;