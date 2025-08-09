import React, { useState, useEffect } from 'react';
import { useCobranzas } from '../hooks/useCobranzas';
import  Button from '../../../components/common/Button';
import FormInput from '../../../components/common/FormInput';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReporteCobranzaPage: React.FC = () => {
  const { reporte, isLoading, error, getReporteCobranza } = useCobranzas();
  
  // Estado para fechas de filtro
  const [fechaDesde, setFechaDesde] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [fechaHasta, setFechaHasta] = useState<string>(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  // Obtener reporte al cargar la página con fechas predeterminadas
  useEffect(() => {
    handleGenerarReporte();
  }, []);

  const handleGenerarReporte = () => {
    if (fechaDesde && fechaHasta) {
      getReporteCobranza({
        fechaDesde: new Date(fechaDesde),
        fechaHasta: new Date(fechaHasta)
      });
    }
  };

  // Configurar periodos predefinidos
  const setUltimos7Dias = () => {
    const hoy = new Date();
    setFechaHasta(format(hoy, 'yyyy-MM-dd'));
    setFechaDesde(format(subDays(hoy, 7), 'yyyy-MM-dd'));
  };

  const setUltimos30Dias = () => {
    const hoy = new Date();
    setFechaHasta(format(hoy, 'yyyy-MM-dd'));
    setFechaDesde(format(subDays(hoy, 30), 'yyyy-MM-dd'));
  };

  const setMesActual = () => {
    const hoy = new Date();
    setFechaDesde(format(startOfMonth(hoy), 'yyyy-MM-dd'));
    setFechaHasta(format(endOfMonth(hoy), 'yyyy-MM-dd'));
  };

  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Datos para gráficos
  const generateTipoPagoChartData = () => {
    if (!reporte?.porTipoPago) return null;
    
    const labels = Object.keys(reporte.porTipoPago);
    const data = Object.values(reporte.porTipoPago);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const generateSucursalChartData = () => {
    if (!reporte?.porSucursal) return null;
    
    const labels = Object.keys(reporte.porSucursal);
    const data = Object.values(reporte.porSucursal);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const generateDailyChartData = () => {
    if (!reporte?.cobranzasDiarias || reporte.cobranzasDiarias.length === 0) return null;
    
    const labels = reporte.cobranzasDiarias.map(item => format(new Date(item.fecha), 'dd/MM'));
    const data = reporte.cobranzasDiarias.map(item => item.total);
    
    return {
      labels,
      datasets: [
        {
          label: 'Cobranza Diaria',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Opciones para gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Cobranza</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Filtros de fecha */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Periodo del Reporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormInput
            label="Desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            required
          />
          
          <FormInput
            label="Hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            required
          />
          
          <div className="flex items-end mb-4">
            <Button
              onClick={handleGenerarReporte}
              variant="primary"
              isLoading={isLoading}
            >
              Generar Reporte
            </Button>
          </div>
          
          <div className="flex items-end space-x-2 mb-4">
            <Button variant="outline" size="sm" onClick={setUltimos7Dias}>7 días</Button>
            <Button variant="outline" size="sm" onClick={setUltimos30Dias}>30 días</Button>
            <Button variant="outline" size="sm" onClick={setMesActual}>Mes actual</Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Generando reporte..." />
      ) : reporte ? (
        <div className="space-y-6">
          {/* Resumen general */}
          {/* <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen de Cobranza</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-800">Total Cobranza</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(reporte.totalCobranza)}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-800">Promedio por Transacción</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(reporte.totalCobranza / 
                    Math.max(1, reporte.cobranzasDiarias.reduce((sum, day) => sum + (day.count || 0), 0)))}
                </div>
              </div>
            </div>
          </div> */}

          {/* Distribución por tipo de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Por Tipo de Pago</h2>
              <div style={{ height: "250px" }}>
                {generateTipoPagoChartData() && (
                  <Doughnut data={generateTipoPagoChartData()!} options={chartOptions} />
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {reporte.porTipoPago && Object.entries(reporte.porTipoPago).map(([tipo, valor]) => (
                  <div key={tipo} className="flex justify-between">
                    <span className="text-sm text-gray-600">{tipo}:</span>
                    <span className="text-sm font-medium">{formatCurrency(valor)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribución por sucursal */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Por Sucursal</h2>
              <div style={{ height: "250px" }}>
                {generateSucursalChartData() && (
                  <Doughnut data={generateSucursalChartData()!} options={chartOptions} />
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {reporte.porSucursal && Object.entries(reporte.porSucursal).map(([sucursal, valor]) => (
                  <div key={sucursal} className="flex justify-between">
                    <span className="text-sm text-gray-600">{sucursal}:</span>
                    <span className="text-sm font-medium">{formatCurrency(valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráfico de cobranza diaria */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Cobranza Diaria</h2>
            <div style={{ height: "300px" }}>
              {generateDailyChartData() && (
                <Bar 
                  data={generateDailyChartData()!} 
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatCurrency(Number(value))
                        }
                      }
                    }
                  }} 
                />
              )}
            </div>
          </div>

          {/* Top bancos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Top Bancos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banco</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reporte.porBanco && Object.entries(reporte.porBanco)
                    .sort((a, b) => b[1] - a[1])
                    .map(([banco, valor]) => (
                      <tr key={banco}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{banco}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(valor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {((valor / reporte.totalCobranza) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Selecciona un rango de fechas y genera el reporte para ver los resultados.</p>
        </div>
      )}
    </div>
  );
};

export default ReporteCobranzaPage;