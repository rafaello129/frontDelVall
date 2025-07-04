import React from 'react';
import type { Cobranza } from '../../features/cobranza/types';
import  Button  from '../common/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CobranzasTableProps {
  cobranzas: Cobranza[];
  onView: (cobranza: Cobranza) => void;
  onEdit?: (cobranza: Cobranza) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  showFactura?: boolean;
  showCliente?: boolean;
}

const CobranzasTable: React.FC<CobranzasTableProps> = ({
  cobranzas,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  showFactura = true,
  showCliente = true
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (cobranzas.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center text-gray-500">
        No hay pagos registrados
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Pago
            </th>
            {showFactura && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Factura
              </th>
            )}
            {showCliente && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
            )}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo de Pago
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Banco
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cobranzas.map((cobranza) => (
            <tr key={cobranza.id}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {cobranza.id}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(cobranza.fechaPago), 'dd-MM-yyyy HH:mm', { locale: es })}
              </td>
              {showFactura && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {cobranza.noFactura}
                </td>
              )}
              {showCliente && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {cobranza.noCliente} - {cobranza.nombreComercial}
                </td>
              )}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(cobranza.total)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {cobranza.tipoPago}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {cobranza.banco?.nombre || `Banco ${cobranza.bancoId}`}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => onView(cobranza)}
                  >
                    Ver
                  </Button>
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onEdit(cobranza)}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(cobranza.id)}
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

export default CobranzasTable;