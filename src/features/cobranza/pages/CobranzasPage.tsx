import React, { useEffect, useState } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import CobranzasFilter from '../components/cobranzasFilters';
import CobranzasTable from '../../../components/cobranza/CobranzasTable';
import CobranzaForm from '../../../components/cobranza/CobranzaForm';
import Button from '../../../components/common/Button';
import type { Cobranza, CreateCobranzaDto, FilterCobranzaDto, UpdateCobranzaDto } from '../types';
import { useFacturas } from '../../factura/hooks/useFacturas';

const CobranzasPage: React.FC = () => {
  const { 
    cobranzas,
    isLoading,
    error,
    getAllCobranzas,
    addCobranza,
    updateCobranzaById,
    removeCobranza
  } = useCobranzas();
  const { clearFactura } = useFacturas();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCobranza, setSelectedCobranza] = useState<Cobranza | null>(null);
  const [filters, setFilters] = useState<FilterCobranzaDto>({
    limit: 25,
    skip: 0,
    incluirBanco: true,
    incluirCliente: true,
    incluirFactura: true,
    order: 'desc',
    sortBy: 'fechaPago'
  });
  
  useEffect(() => {
    clearFactura();
  }, [isFormOpen, clearFactura]);
  
  useEffect(() => {
    getAllCobranzas(filters);
  }, [getAllCobranzas, filters]);

  const handleFilterChange = (newFilters: FilterCobranzaDto) => {
    // Reset pagination when filters change
    setFilters({
      ...newFilters,
      skip: 0, // Reset to first page when filter changes
    });
  };

  const handlePageChange = (newSkip: number) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      skip: newSkip
    }));
  };

  const handleOpenCreateForm = () => {
    setSelectedCobranza(null);
    setIsFormOpen(true);
    setIsViewOpen(false);
  };

  const handleOpenEditForm = (cobranza: Cobranza) => {
    setSelectedCobranza(cobranza);
    setIsFormOpen(true);
    setIsViewOpen(false);
  };

  const handleOpenViewDetails = (cobranza: Cobranza) => {
    setSelectedCobranza(cobranza);
    setIsViewOpen(true);
    setIsFormOpen(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCobranza(null);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedCobranza(null);
  };

  const handleSubmit = async (data: CreateCobranzaDto | UpdateCobranzaDto) => {
    try {
      if (selectedCobranza) {
        // Actualización
        await updateCobranzaById(selectedCobranza.id, data as UpdateCobranzaDto);
      } else {
        // Creación
        await addCobranza(data as CreateCobranzaDto);
      }
      handleCloseForm();
      // Reset to first page and reload with current filters
      setFilters(prev => ({...prev, skip: 0}));
      getAllCobranzas({...filters, skip: 0});
    } catch (error) {
      console.error('Error al guardar pago:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este pago?')) {
      try {
        await removeCobranza(id);
        getAllCobranzas(filters);
      } catch (error) {
        console.error('Error al eliminar pago:', error);
      }
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Cobranza</h1>
        <Button 
          variant="primary"
          onClick={handleOpenCreateForm}
        >
          Registrar Nuevo Pago
        </Button>
      </div>

      {/* Filter Component */}
      <CobranzasFilter
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Modal para formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedCobranza ? 'Editar' : 'Registrar'} Pago
            </h2>
            <CobranzaForm
              cobranza={selectedCobranza || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {isViewOpen && selectedCobranza && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              Detalles del Pago #{selectedCobranza.id}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Fecha de Pago</p>
                <p className="font-medium">{new Date(selectedCobranza.fechaPago).toLocaleString()}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Factura</p>
                <p className="font-medium">#{selectedCobranza.noFactura}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">#{selectedCobranza.noCliente} - {selectedCobranza.nombreComercial}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Monto</p>
                <p className="font-medium">{formatCurrency(selectedCobranza.total)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Tipo de Cambio</p>
                <p className="font-medium">{selectedCobranza.tipoCambio}</p>
              </div>
              
              {selectedCobranza.montoDolares && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Monto en USD</p>
                  <p className="font-medium">${selectedCobranza.montoDolares.toFixed(2)}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Tipo de Pago</p>
                <p className="font-medium">{selectedCobranza.tipoPago}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Banco</p>
                <p className="font-medium">{selectedCobranza.banco?.nombre || `Banco #${selectedCobranza.bancoId}`}</p>
              </div>
              
              {selectedCobranza.referenciaPago && (
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500">Referencia de Pago</p>
                  <p className="font-medium">{selectedCobranza.referenciaPago}</p>
                </div>
              )}
              
              {selectedCobranza.notas && (
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="font-medium">{selectedCobranza.notas}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCloseView}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleCloseView();
                  handleOpenEditForm(selectedCobranza);
                }}
              >
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      <CobranzasTable
        cobranzas={cobranzas}
        onView={handleOpenViewDetails}
        onEdit={handleOpenEditForm}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      
      {/* Paginación mejorada */}
      {cobranzas.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Mostrando {filters.skip + 1} - {filters.skip + cobranzas.length} resultados
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(0, filters.skip - filters.limit))}
              disabled={filters.skip === 0 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.skip + filters.limit)}
              disabled={cobranzas.length < filters.limit || isLoading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CobranzasPage;