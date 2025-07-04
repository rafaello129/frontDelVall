import React, { useEffect, useState } from 'react';
import { useFacturas } from '../hooks/useFacturas';
import FacturasTable from '../../../components/factura/FacturasTable';
import FacturaForm from '../../../components/factura/FacturaForm';
import  Button  from '../../../components/common/Button';
import type { Factura, CreateFacturaDto, FilterFacturaDto, UpdateFacturaDto } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ClienteFilterSelect from '../../../components/cliente/ClienteFilterSelect';

const FacturasPage: React.FC = () => {
  const { 
    facturas,
    isLoading,
    error,
    getAllFacturas,
    addFactura,
    updateFacturaById,
    removeFactura,
    cambiarEstado
  } = useFacturas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [filters, setFilters] = useState<FilterFacturaDto>({
    limit: 25,
    skip: 0,
    incluirCliente: true
  });

  useEffect(() => {
    getAllFacturas(filters);
    console.log('FacturasPage mounted with filters:', facturas);
  }, [getAllFacturas, filters]);

  const handleOpenCreateForm = () => {
    setSelectedFactura(null);
    setIsFormOpen(true);
    setIsViewOpen(false);
  };

  const handleOpenEditForm = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsFormOpen(true);
    setIsViewOpen(false);
  };

  const handleOpenViewDetails = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsViewOpen(true);
    setIsFormOpen(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFactura(null);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedFactura(null);
  };

  const handleSubmit = async (data: CreateFacturaDto | UpdateFacturaDto) => {
    try {
      if (selectedFactura) {
        // Actualización
        await updateFacturaById(selectedFactura.noFactura, data as UpdateFacturaDto);
      } else {
        // Creación
        await addFactura(data as CreateFacturaDto);
      }
      handleCloseForm();
      getAllFacturas(filters); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar factura:', error);
    }
  };

  const handleDelete = async (noFactura: string) => {
    if (window.confirm('¿Está seguro de eliminar esta factura?')) {
      try {
        await removeFactura(noFactura);
        getAllFacturas(filters); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar factura:', error);
      }
    }
  };

  const handleCambiarEstado = async (noFactura: string, estado: string) => {
    try {
      await cambiarEstado(noFactura, estado);
      if (selectedFactura?.noFactura === noFactura) {
        setSelectedFactura(prev => prev ? { ...prev, estado } : null);
      }
      getAllFacturas(filters); // Recargar la lista
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterFacturaDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Facturas</h1>
        <Button 
          variant="primary"
          onClick={handleOpenCreateForm}
        >
          Nueva Factura
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros simples */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <ClienteFilterSelect
            label="Cliente"
            value={filters.noCliente}
            onChange={(value) => handleFilterChange('noCliente', value)}
            type="noCliente"
            placeholder="Todos los clientes"
          /> 
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Vencida">Vencida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => getAllFacturas(filters)}
              variant="outline"
              className="mb-4"
              isLoading={isLoading}
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedFactura ? 'Editar' : 'Crear'} Factura
            </h2>
            <FacturaForm
              factura={selectedFactura || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isLoading={isLoading}
              isEditing={!!selectedFactura}
            />
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {isViewOpen && selectedFactura && (
        <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              Detalles de Factura #{selectedFactura.noFactura}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Fecha de Emisión</p>
                <p className="font-medium">{format(new Date(selectedFactura.emision), 'PPP', { locale: es })}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">#{selectedFactura.noCliente} {selectedFactura.cliente?.razonSocial}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Estado</p>
                <p className="font-medium">{selectedFactura.estado}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Factura</p>
                <p className="font-medium">{formatCurrency(selectedFactura.montoTotal)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                <p className="font-medium">{format(new Date(selectedFactura.fechaVencimiento), 'PPP', { locale: es })}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(selectedFactura.fechaVencimiento), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Saldo Pendiente</p>
                <p className="font-medium">{formatCurrency(selectedFactura.saldo)}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-gray-500">Concepto</p>
                <p className="font-medium">{selectedFactura.concepto}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-end space-x-2 space-y-2 sm:space-y-0">
              {selectedFactura.estado !== 'Pagada' && (
                <Button
                  variant="success"
                  onClick={() => {
                    handleCambiarEstado(selectedFactura.noFactura, 'Pagada');
                    handleCloseView();
                  }}
                  size="sm"
                >
                  Marcar como Pagada
                </Button>
              )}
              
              {selectedFactura.estado !== 'Vencida' && (
                <Button
                  variant="warning"
                  onClick={() => {
                    handleCambiarEstado(selectedFactura.noFactura, 'Vencida');
                    handleCloseView();
                  }}
                  size="sm"
                >
                  Marcar como Vencida
                </Button>
              )}
              
              {selectedFactura.estado !== 'Cancelada' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    handleCambiarEstado(selectedFactura.noFactura, 'Cancelada');
                    handleCloseView();
                  }}
                  size="sm"
                >
                  Cancelar Factura
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleCloseView}
                size="sm"
              >
                Cerrar
              </Button>
              
              <Button
                variant="primary"
                onClick={() => {
                  handleCloseView();
                  if (selectedFactura.estado !== 'Pagada' && selectedFactura.estado !== 'Cancelada') {
                    handleOpenEditForm(selectedFactura);
                  }
                }}
                disabled={selectedFactura.estado === 'Pagada' || selectedFactura.estado === 'Cancelada'}
                size="sm"
              >
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      <FacturasTable
        facturas={facturas}
        onView={handleOpenViewDetails}
        onEdit={handleOpenEditForm}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default FacturasPage;