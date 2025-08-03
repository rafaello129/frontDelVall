import { privateApi } from '../../services/api';
import type { 
  Cliente, 
  CreateClienteDto, 
  UpdateClienteDto,
  FilterClienteDto,
  AntiguedadSaldosDto,
  SaldoAntiguedad,
  FacturaPendiente
} from './types';

const BASE_URL = '/cliente';

export const clienteAPI = {
  // Crear nuevo cliente
  createCliente: async (dto: CreateClienteDto): Promise<Cliente> => {
    const response = await privateApi.post(BASE_URL, dto);
    return response.data;
  },
  createBulkClientes: async (clientes: CreateClienteDto[]): Promise<Cliente[]> => {
    const response = await privateApi.post(`${BASE_URL}/bulk`, clientes);
    return response.data;
  },
  // Obtener todos los clientes con filtros, paginación y ordenamiento
  getAllClientes: async (filters: FilterClienteDto): Promise<{ data: Cliente[], total: number }> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    
    return response.data;
  },

  // Obtener un cliente por número
  getClienteById: async (noCliente: number): Promise<Cliente> => {
    const response = await privateApi.get(`${BASE_URL}/${noCliente}`);
    return response.data;
  },

  // Actualizar un cliente
  updateCliente: async (noCliente: number, dto: UpdateClienteDto): Promise<Cliente> => {
    const response = await privateApi.patch(`${BASE_URL}/${noCliente}`, dto);
    return response.data;
  },

  // Eliminar un cliente
  deleteCliente: async (noCliente: number): Promise<{ message: string }> => {
    const response = await privateApi.delete(`${BASE_URL}/${noCliente}`);
    return response.data;
  },

  // Obtener facturas pendientes de un cliente
  getFacturasPendientes: async (noCliente: number): Promise<FacturaPendiente[]> => {
    const response = await privateApi.get(`${BASE_URL}/${noCliente}/facturas`);
    return response.data;
  },

  // Reporte de antigüedad de saldos
  getAntiguedadSaldos: async (params: AntiguedadSaldosDto): Promise<{ data: SaldoAntiguedad[], total: number }> => {
    const response = await privateApi.post(`${BASE_URL}/antiguedad-saldos`, params);
    return response.data;
  },

  // Saldos por cliente (resumen)
  getSaldosPorCliente: async (sucursal?: string, clasificacion?: string): Promise<{ data: SaldoAntiguedad[], total: number }> => {
    const params = { sucursal, clasificacion };
    const response = await privateApi.get(`${BASE_URL}/reportes/saldos-por-cliente`, { params });
    return response.data;
  },

  // Estadísticas de distribución de saldos
  getDistribucionSaldos: async (): Promise<{
    totalClientes: number;
    saldoTotal: number;
    distribucion: Record<string, number>;
    porcentajes: Record<string, number>;
  }> => {
    const response = await privateApi.get(`${BASE_URL}/estadisticas/distribucion-saldos`);
    return response.data;
  },
  getClientesOptions: async (): Promise<{
    noClientes: number[];
    razonSocial: string[];
    comercial: string[];
  }> => {
    const response = await privateApi.get(`${BASE_URL}/opciones-filtro`);
    return response.data;
  },
};