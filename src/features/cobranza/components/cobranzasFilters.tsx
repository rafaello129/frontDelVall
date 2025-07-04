import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from '../../../components/common/Button';
import FormInput from '../../../components/common/FormInput';
import { TipoPago, Sucursal } from '../../shared/enums';
import type { FilterCobranzaDto } from '../types';
import { useBancos } from '../../banco/hooks/useBancos';
import ClienteFilterSelect from '../../../components/cliente/ClienteFilterSelect';
import FacturaFilterSelect from '../../../components/factura/FacturaFilterSelect';

interface CobranzasFilterProps {
  initialFilters: FilterCobranzaDto;
  onFilterChange: (filters: FilterCobranzaDto) => void;
  className?: string;
}

const CobranzasFilter: React.FC<CobranzasFilterProps> = ({
  initialFilters,
  onFilterChange,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { bancos, getAllBancos, isLoading: bancosLoading } = useBancos();
  const { control, register, handleSubmit, reset, setValue, watch } = useForm<FilterCobranzaDto>({
    defaultValues: initialFilters,
  });

  // Selected client and invoice states for the filter selects
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>(
    initialFilters.noCliente
  );
  const [selectedFacturaId, setSelectedFacturaId] = useState<string | undefined>(
    initialFilters.noFactura?.toString()
  );

  // Load banks for the dropdown
  useEffect(() => {
    getAllBancos({ limit: 100, activo: true });
  }, [getAllBancos]);

  // Format dates for display in inputs
  useEffect(() => {
    if (initialFilters.fechaDesde) {
      setValue('fechaDesde', new Date(initialFilters.fechaDesde));
    }
    if (initialFilters.fechaHasta) {
      setValue('fechaHasta', new Date(initialFilters.fechaHasta));
    }
  }, [initialFilters, setValue]);

  const onSubmit = (data: FilterCobranzaDto) => {
    // Remove empty values to avoid validation errors
    const cleanedData: FilterCobranzaDto = {
      limit: 25,
      skip: 0
    };
    
    // Only add pagination and include flags
    cleanedData.limit = data.limit || 25;
    cleanedData.skip = data.skip || 0;
    cleanedData.incluirBanco = data.incluirBanco;
    cleanedData.incluirCliente = data.incluirCliente;
    cleanedData.incluirFactura = data.incluirFactura;
    
    // Only add sorting if specified
    if (data.sortBy && data.sortBy !== '') {
      cleanedData.sortBy = data.sortBy;
    }
    
    if (data.order) {
      cleanedData.order = data.order;
    }
    
    // Only add filters with actual values
    if (data.fechaDesde) {
      cleanedData.fechaDesde = new Date(data.fechaDesde);
    }
    
    if (data.fechaHasta) {
      cleanedData.fechaHasta = new Date(data.fechaHasta);
    }
    
    if (data.noFactura && data.noFactura.toString() !== '') {
      cleanedData.noFactura = Number(data.noFactura);
    }
    
    if (data.noCliente) {
      cleanedData.noCliente = data.noCliente;
    }
    
    if (data.razonSocial && data.razonSocial.trim() !== '') {
      cleanedData.razonSocial = data.razonSocial.trim();
    }
    
    if (data.sucursal ) {
      cleanedData.sucursal = data.sucursal;
    }
    
    if (data.montoMinimo !== undefined && data.montoMinimo !== null) {
      cleanedData.montoMinimo = data.montoMinimo;
    }
    
    if (data.montoMaximo !== undefined && data.montoMaximo !== null) {
      cleanedData.montoMaximo = data.montoMaximo;
    }
    
    if (data.tipoPago) {
      cleanedData.tipoPago = data.tipoPago;
    }
    
    if (data.bancoId) {
      cleanedData.bancoId = data.bancoId;
    }
    
    onFilterChange(cleanedData);
  };

  const handleReset = () => {
    // Reset to initial default filters
    const defaultFilters: FilterCobranzaDto = {
      limit: 25,
      skip: 0,
      incluirBanco: true,
      incluirCliente: true,
      incluirFactura: true,
      sortBy: 'fechaPago',
      order: 'desc'
    };
    
    // Reset the local state for selects
    setSelectedClienteId(undefined);
    setSelectedFacturaId(undefined);
    
    reset(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const handleClienteChange = (clienteId: number | undefined) => {
    setSelectedClienteId(clienteId);
    setValue('noCliente', clienteId);
    
    // Clear factura when client changes
    setSelectedFacturaId(undefined);
    setValue('noFactura', undefined);
  };

  const handleFacturaChange = (facturaId: string | undefined) => {
    setSelectedFacturaId(facturaId);
    setValue('noFactura', facturaId ? Number(facturaId) : undefined);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-6 ${className}`}>
      <div 
        className="px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-700">Filtros de Búsqueda</h3>
        <Button 
          variant="light"
          size="sm"
          rightIcon={
            <svg 
              className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          }
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fecha Rango */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Pago
                </label>
                <div className="flex space-x-2">
                  <Controller
                    name="fechaDesde"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        type="date"
                        placeholder="Desde"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        containerClassName="w-full"
                        inputClassName="text-sm"
                      />
                    )}
                  />
                  <Controller
                    name="fechaHasta"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        type="date"
                        placeholder="Hasta"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        containerClassName="w-full"
                        inputClassName="text-sm"
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Cliente Selector */}
              <div className="col-span-1">
                <ClienteFilterSelect
                  label="Cliente"
                  value={selectedClienteId}
                  onChange={handleClienteChange}
                  type="noCliente"
                  placeholder="Buscar por nombre o número"
                />
              </div>
              
              {/* Factura Selector */}
              <div className="col-span-1">
                <FacturaFilterSelect
                  label="Factura"
                  value={selectedFacturaId}
                  onChange={handleFacturaChange}
                  noCliente={selectedClienteId}
                  showOnlyPendientes={false}
                  placeholder="Buscar factura"
                />
              </div>
              
              {/* Tipo de Pago */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pago
                </label>
                <select 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  {...register('tipoPago')}
                >
                  <option value="">Todos</option>
                  {Object.values(TipoPago).map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              {/* Sucursal */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursal
                </label>
                <select 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  {...register('sucursal')}
                >
                  <option value="">Todas</option>
                  {Object.values(Sucursal).map((sucursal) => (
                    <option key={sucursal} value={sucursal}>{sucursal.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              
              {/* Banco */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco
                </label>
                <select 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  {...register('bancoId')}
                  disabled={bancosLoading}
                >
                  <option value="">Todos</option>
                  {bancos.map((banco) => (
                    <option key={banco.id} value={banco.id}>{banco.nombre}</option>
                  ))}
                </select>
              </div>
              
              {/* Monto Rango */}
              <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <div className="flex space-x-2">
                  <Controller
                    name="montoMinimo"
                    control={control}
                    defaultValue={undefined}
                    render={({ field }) => (
                      <FormInput
                        type="number"
                        step="0.01"
                        placeholder="Mínimo"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseFloat(value));
                        }}
                        containerClassName="w-full"
                        inputClassName="text-sm"
                        leftIcon={<span>$</span>}
                      />
                    )}
                  />
                  <Controller
                    name="montoMaximo"
                    control={control}
                    defaultValue={undefined}
                    render={({ field }) => (
                      <FormInput
                        type="number"
                        step="0.01"
                        placeholder="Máximo"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseFloat(value));
                        }}
                        containerClassName="w-full"
                        inputClassName="text-sm"
                        leftIcon={<span>$</span>}
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Opciones de Ordenamiento */}
              <div className="col-span-1 flex space-x-2">
                <div className="w-2/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordenar por
                  </label>
                  <select 
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register('sortBy')}
                  >
                    <option value="fechaPago">Fecha de Pago</option>
                    <option value="id">ID</option>
                    <option value="noFactura">Núm. Factura</option>
                    <option value="noCliente">Núm. Cliente</option>
                    <option value="total">Monto</option>
                    <option value="tipoPago">Tipo de Pago</option>
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <select 
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register('order')}
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
              </div>
              
              {/* Registros por página */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registros por página
                </label>
                <select 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  {...register('limit', {
                    valueAsNumber: true
                  })}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              {/* Include related data checkboxes */}

            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <Button 
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Limpiar Filtros
              </Button>
              <Button 
                type="submit"
                variant="primary"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              >
                Filtrar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CobranzasFilter;