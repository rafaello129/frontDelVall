import React from 'react';
import type { Factura } from '../../features/factura/types';
import  Button  from '../common/Button';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface FacturasTableProps {
  facturas: Factura[];
  onView: (factura: Factura) => void;
  onEdit?: (factura: Factura) => void;
  onDelete?: (noFactura: string) => void;
  isLoading?: boolean;
  showCliente?: boolean;
}

const FacturasTable: React.FC<FacturasTableProps> = ({
  facturas,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  showCliente = true
}) => {
  const today = new Date();
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (facturas.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center text-gray-500">
        No hay facturas registradas
      </div>
    );
  }

  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Obtener clase de color según estado
  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case 'Pagada':
        return 'bg-green-100 text-green-800';
      case 'Vencida':
        return 'bg-red-100 text-red-800';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800';
      default: // Pendiente
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Calcular días restantes para vencimiento
  const calcularDiasRestantes = (fechaVencimiento: Date | string): number => {
    return differenceInDays(new Date(fechaVencimiento), today);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No. Factura
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Emisión
            </th>
            {showCliente && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pendiente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vencimiento
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {facturas.map((factura) => (
            <tr key={factura.noFactura}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {factura.noFactura}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(factura.emision), 'dd-MM-yyyy', { locale: es })}
              </td>
              {showCliente && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {factura.noCliente} 
                  {factura.cliente && ` - ${factura.cliente.razonSocial}`}
                </td>
              )}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(factura.estado)}`}>
                  {factura.estado}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(factura.montoTotal)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(factura.saldo)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <div>
                  {format(new Date(factura.fechaVencimiento), 'dd-MM-yyyy', { locale: es })}
                </div>
                <div className={`text-xs ${
                  calcularDiasRestantes(factura.fechaVencimiento) < 0 
                    ? 'text-red-600' 
                    : calcularDiasRestantes(factura.fechaVencimiento) < 5 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                }`}>
                  {calcularDiasRestantes(factura.fechaVencimiento) < 0 
                    ? `Vencida hace ${Math.abs(calcularDiasRestantes(factura.fechaVencimiento))} días` 
                    : `${calcularDiasRestantes(factura.fechaVencimiento)} días restantes`}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => onView(factura)}
                  >
                    Ver
                  </Button>
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onEdit(factura)}
                      disabled={factura.estado === 'Pagada' || factura.estado === 'Cancelada'}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(factura.noFactura)}
                      disabled={factura.estado !== 'Pendiente'}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacturasTable;