import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AntiguedadSaldosDto } from '../types';
import AntiguedadSaldosTable from '../components/AntiguedadSaldosTable';
import ClienteStats from '../components/ClienteStats';
import { FaArrowLeft, FaChartBar, FaTable } from 'react-icons/fa';

const ReportesClientePage: React.FC = () => {
  const [reportType, setReportType] = useState<'antiguedad' | 'stats'>('antiguedad');
  const [antiguedadParams, setAntiguedadParams] = useState<AntiguedadSaldosDto>({
    fechaCorte: new Date(),
    soloActivos: true,
    incluirFacturas: false,
    saldoMinimo: 0,
    limit: 50
  });

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAntiguedadParams(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'date') {
      setAntiguedadParams(prev => ({ ...prev, [name]: new Date(value) }));
    } else if (type === 'number') {
      setAntiguedadParams(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setAntiguedadParams(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            to="/clientes"
            className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaArrowLeft className="mr-2" /> Volver a Clientes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Clientes</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setReportType('antiguedad')}
            className={`inline-flex items-center px-4 py-2 border ${
              reportType === 'antiguedad' 
                ? 'border-blue-500 bg-blue-100 text-blue-700' 
                : 'border-gray-300 bg-white text-gray-700'
            } text-sm font-medium rounded-md`}
          >
            <FaTable className="mr-2" /> Antigüedad de Saldos
          </button>
          <button
            onClick={() => setReportType('stats')}
            className={`inline-flex items-center px-4 py-2 border ${
              reportType === 'stats' 
                ? 'border-blue-500 bg-blue-100 text-blue-700' 
                : 'border-gray-300 bg-white text-gray-700'
            } text-sm font-medium rounded-md`}
          >
            <FaChartBar className="mr-2" /> Estadísticas
          </button>
        </div>
      </div>

      {reportType === 'antiguedad' && (
        <div>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Parámetros del Reporte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="fechaCorte" className="block text-sm font-medium text-gray-700">
                  Fecha de Corte
                </label>
                <input
                  type="date"
                  name="fechaCorte"
                  id="fechaCorte"
                  value={antiguedadParams.fechaCorte.toISOString().split('T')[0]}
                  onChange={handleParamChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700">
                  Sucursal
                </label>
                <input
                  type="text"
                  name="sucursal"
                  id="sucursal"
                  value={antiguedadParams.sucursal || ''}
                  onChange={handleParamChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Todas las sucursales"
                />
              </div>
              
              <div>
                <label htmlFor="clasificacion" className="block text-sm font-medium text-gray-700">
                  Clasificación
                </label>
                <input
                  type="text"
                  name="clasificacion"
                  id="clasificacion"
                  value={antiguedadParams.clasificacion || ''}
                  onChange={handleParamChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Todas las clasificaciones"
                />
              </div>
              
              <div>
                <label htmlFor="saldoMinimo" className="block text-sm font-medium text-gray-700">
                  Saldo Mínimo
                </label>
                <input
                  type="number"
                  name="saldoMinimo"
                  id="saldoMinimo"
                  min="0"
                  step="0.01"
                  value={antiguedadParams.saldoMinimo || 0}
                  onChange={handleParamChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="soloActivos"
                  id="soloActivos"
                  checked={antiguedadParams.soloActivos}
                  onChange={handleParamChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="soloActivos" className="ml-2 block text-sm text-gray-900">
                  Solo clientes activos
                </label>
              </div>
              
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="incluirFacturas"
                  id="incluirFacturas"
                  checked={antiguedadParams.incluirFacturas}
                  onChange={handleParamChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="incluirFacturas" className="ml-2 block text-sm text-gray-900">
                  Incluir detalle de facturas
                </label>
              </div>
            </div>
          </div>
          
          <AntiguedadSaldosTable params={antiguedadParams} />
        </div>
      )}

      {reportType === 'stats' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <ClienteStats />
        </div>
      )}
    </div>
  );
};

export default ReportesClientePage;