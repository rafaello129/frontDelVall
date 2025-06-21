import React, { useEffect, useState } from 'react';
import { useCliente } from '../hooks/useCliente';
import type { SaldoAntiguedad, AntiguedadSaldosDto } from '../types';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FaEye } from 'react-icons/fa';

interface AntiguedadSaldosTableProps {
  params: AntiguedadSaldosDto;
}

const AntiguedadSaldosTable: React.FC<AntiguedadSaldosTableProps> = ({ params }) => {
  const { getAntiguedadSaldos, isLoading, error } = useCliente();
  const [saldos, setSaldos] = useState<SaldoAntiguedad[]>([]);
  const [totales, setTotales] = useState({
    total: 0,
    saldo0a30: 0,
    saldo31a60: 0,
    saldo61a90: 0,
    saldoMas90: 0,
  });

  useEffect(() => {
    const fetchSaldos = async () => {
      try {
        const response = await getAntiguedadSaldos(params);
        setSaldos(response.data);
        
        // Calcular totales
        const totalSaldos = response.data.reduce(
          (acc, curr) => {
            return {
              total: acc.total + curr.saldoTotal,
              saldo0a30: acc.saldo0a30 + curr.saldo0a30,
              saldo31a60: acc.saldo31a60 + curr.saldo31a60,
              saldo61a90: acc.saldo61a90 + curr.saldo61a90,
              saldoMas90: acc.saldoMas90 + curr.saldoMas90,
            };
          },
          { total: 0, saldo0a30: 0, saldo31a60: 0, saldo61a90: 0, saldoMas90: 0 }
        );
        
        setTotales(totalSaldos);
      } catch (error) {
        console.error('Error al obtener antigüedad de saldos:', error);
      }
    };

    fetchSaldos();
  }, [params, getAntiguedadSaldos]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (saldos.length === 0) {
    return (
      <div className="bg-white p-4 rounded-md shadow text-center">
        <p className="text-gray-500">No hay saldos que mostrar con los parámetros seleccionados</p>
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
                No. Cliente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Razón Social
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Días Crédito
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                0-30 días
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                31-60 días
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                61-90 días
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                +90 días
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {saldos.map((saldo) => (
              <tr key={saldo.noCliente} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {saldo.noCliente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {saldo.razonSocial}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {saldo.diasCredito}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(saldo.saldoTotal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(saldo.saldo0a30)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(saldo.saldo31a60)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(saldo.saldo61a90)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(saldo.saldoMas90)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    to={`/clientes/${saldo.noCliente}`} 
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver detalles del cliente"
                  >
                    <FaEye />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                TOTALES:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(totales.total)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(totales.saldo0a30)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(totales.saldo31a60)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(totales.saldo61a90)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(totales.saldoMas90)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AntiguedadSaldosTable;