import React, { use, useEffect, useState } from 'react';
import { useFacturas } from '../hooks/useFacturas';
import { useCliente } from '../../cliente/hooks/useCliente';
import FacturasTable from '../../../components/factura/FacturasTable';
import  Button from '../../../components/common/Button';
import  LoadingSpinner  from '../../../components/common/LoadingSpinner';

import  type{ Factura } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ClienteFilterSelect from '../../../components/cliente/ClienteFilterSelect';

const FacturasVencidasPage: React.FC = () => {
  const { 
    facturasVencidas,
    isLoading,
    error,
    getFacturasVencidas, // Cambio aquí
    actualizarVencidas,
    cambiarEstado
  } = useFacturas();

  const { isLoading: clientesLoading } = useCliente();

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [filtroCliente, setFiltroCliente] = useState<number | undefined>(undefined);
  
  // Facturas filtradas
  const facturasFiltradas = filtroCliente 
    ? facturasVencidas.filter(f => f.noCliente === filtroCliente)
    : facturasVencidas;

  useEffect(() => {
    getFacturasVencidas();
  }, [getFacturasVencidas]);

  const handleOpenViewDetails = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedFactura(null);
  };

  const handleActualizarVencidas = async () => {
    try {
      await actualizarVencidas();
      // Recargar después de actualizar
      actualizarVencidas();
    } catch (error) {
      console.error('Error al actualizar facturas vencidas:', error);
    }
  };

  const handleCambiarEstado = async (noFactura: string, estado: string) => {
    try {
      await cambiarEstado(noFactura, estado);
      actualizarVencidas(); // Recargar la lista
      if (selectedFactura?.noFactura === noFactura) {
        handleCloseView();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Calcular total de saldo vencido
  const totalVencido = facturasFiltradas.reduce((sum, factura) => sum + factura.saldo, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facturas Vencidas</h1>
          {!clientesLoading && !isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              {facturasFiltradas.length} facturas vencidas con un total de {formatCurrency(totalVencido)}
            </p>
          )}
        </div>
        <Button 
          variant="primary"
          onClick={handleActualizarVencidas}
          isLoading={isLoading}
        >
          Actualizar Facturas Vencidas
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtro por cliente */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Filtrar por cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ClienteFilterSelect
            label="Cliente"
            value={filtroCliente}
            onChange={(value) => setFiltroCliente(value as number)}
            type="noCliente"
            placeholder="Todos los clientes"
          />
          
          <div className="flex items-end">
            <Button
              onClick={() => setFiltroCliente(undefined)}
              variant="outline"
              className="mb-4"
            >
              Limpiar Filtro
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para ver detalles */}
      {isViewOpen && selectedFactura && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              Detalles de Factura Vencida #{selectedFactura.noFactura}
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
                <p className="font-medium">
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                    {selectedFactura.estado}
                  </span>
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Saldo Pendiente</p>
                <p className="font-medium text-red-600">{formatCurrency(selectedFactura.saldo)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                <p className="font-medium">{format(new Date(selectedFactura.fechaVencimiento), 'PPP', { locale: es })}</p>
                <p className="text-xs text-red-600 font-medium">
                  Venció hace {selectedFactura.diasVencimiento || selectedFactura.diasRestantes ? Math.abs(selectedFactura.diasRestantes || 0) : '-'} días
                </p>
              </div>
              
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-gray-500">Concepto</p>
                <p className="font-medium">{selectedFactura.concepto}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-end space-x-2 space-y-2 sm:space-y-0">
              <Button
                variant="success"
                onClick={() => handleCambiarEstado(selectedFactura.noFactura, 'Pagada')}
                size="sm"
              >
                Marcar como Pagada
              </Button>
              
              <Button
                variant="warning"
                onClick={() => handleCambiarEstado(selectedFactura.noFactura, 'Pendiente')}
                size="sm"
              >
                Marcar como Pendiente
              </Button>
              
              <Button
                variant="danger"
                onClick={() => handleCambiarEstado(selectedFactura.noFactura, 'Cancelada')}
                size="sm"
              >
                Cancelar Factura
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCloseView}
                size="sm"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Cargando facturas vencidas..." />
      ) : facturasFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          {filtroCliente ? 
            'Este cliente no tiene facturas vencidas' : 
            'No hay facturas vencidas en el sistema'
          }
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default FacturasVencidasPage;