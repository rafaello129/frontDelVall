import React, { useEffect, useState } from 'react';
import { useFacturas } from '../../factura/hooks/useFacturas';
import type { FacturaPendiente } from '../types';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface FacturasPendientesTableProps {
  noCliente: number;
}

const FacturasPendientesTable: React.FC<FacturasPendientesTableProps> = ({ noCliente }) => {
  const { getFacturasPendientesPorCliente } = useFacturas();
  const [facturas, setFacturas] = useState<FacturaPendiente[]>([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacturas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getFacturasPendientesPorCliente(noCliente);
        setFacturas(response.data);
        setTotalSaldo(response.totalSaldo);
      } catch (err: any) {
        setError(err.message || 'Error al obtener las facturas pendientes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacturas();
  }, [noCliente, getFacturasPendientesPorCliente]);

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (facturas.length === 0) {
    return (
      <div className="bg-white p-4 rounded-md shadow text-center">
        <p className="text-gray-500">No hay facturas pendientes</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. Factura
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emisión
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Días Transcurridos
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facturas.map((factura) => (
              <tr key={factura.noFactura} className={factura.isVencida ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {factura.noFactura}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(factura.emision)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(factura.fechaVencimiento)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(factura.saldoCalculado)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(factura.saldo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {factura.diasTranscurridos}
                  {factura.isVencida && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Vencida
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${factura.isVencida ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {factura.isVencida ? 'Vencida' : 'Al día'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    to={`/facturas/${factura.noFactura}`} 
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Ver
                  </Link>
                  <Link 
                    to={`/cobranzas/nueva?factura=${factura.noFactura}`} 
                    className="text-green-600 hover:text-green-900"
                  >
                    Registrar pago
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                Total Saldo:
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                {formatCurrency(totalSaldo)}
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default FacturasPendientesTable;