import React, { useEffect, useState } from 'react';
import { clienteAPI } from '../clienteAPI';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];

const ClienteStats: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalClientes: number;
    saldoTotal: number;
    distribucion: Record<string, number>;
    porcentajes: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await clienteAPI.getDistribucionSaldos();
        setStats(response);
      } catch (err: any) {
        setError(err.message || 'Error al obtener estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return null;

  // Preparar datos para gráficos
  const pieData = Object.entries(stats.distribucion).map(([name, value]) => ({
    name,
    value,
    percentage: stats.porcentajes[name]
  }));

  const barData = Object.entries(stats.distribucion)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      amount: value
    }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Total de Clientes</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalClientes}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Saldo Total</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.saldoTotal)}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribución de Saldos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Rangos</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Montos por Rango</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value: number | bigint) => 
                      new Intl.NumberFormat('es-MX', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value as number)} />
                  <Bar dataKey="amount" fill="#8884d8">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Desglose de Saldos</h2>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Rango
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Monto
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Object.entries(stats.distribucion).map(([name, amount]) => (
                <tr key={name}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                    {formatCurrency(amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                    {stats.porcentajes[name].toFixed(2)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-gray-900 sm:pl-6">
                  TOTAL
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-right text-gray-900">
                  {formatCurrency(stats.saldoTotal)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-right text-gray-900">
                  100.00%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClienteStats;