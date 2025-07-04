import { privateApi } from '../../services/api';
import type { 
  PagoExterno, 
  CreatePagoExternoDto, 
  UpdatePagoExternoDto, 
  FilterPagoExternoDto, 
  PaginatedPagoExternoResponse,
  TotalPorTipoResponse,
  TotalPorSucursalResponse,
  EstadisticasOptions,
  EstadisticasResponse
} from './types';

const BASE_URL = '/pago-externo';

export const pagoExternoAPI = {
  // Obtener todos los pagos externos con filtros opcionales
  getAllPagosExternos: async (filters?: FilterPagoExternoDto): Promise<PaginatedPagoExternoResponse> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    return response.data;
  },

  // Obtener un pago externo por ID
  getPagoExternoById: async (id: number): Promise<PagoExterno> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Crear un nuevo pago externo (solo admin)
  createPagoExterno: async (pagoExternoData: CreatePagoExternoDto): Promise<PagoExterno> => {
    const response = await privateApi.post(BASE_URL, pagoExternoData);
    return response.data;
  },

  // Actualizar un pago externo por ID
  updatePagoExterno: async (id: number, pagoExternoData: UpdatePagoExternoDto): Promise<PagoExterno> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, pagoExternoData);
    return response.data;
  },

  // Eliminar un pago externo
  deletePagoExterno: async (id: number): Promise<{ message: string }> => {
    const response = await privateApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Obtener pagos por cliente
  getPagosPorCliente: async (noCliente: number, filters?: FilterPagoExternoDto): Promise<{
    data: PagoExterno[];
    total: number;
  }> => {
    const params = { ...filters, noCliente };
    const response = await privateApi.get(BASE_URL, { params });
    return response.data;
  },

  getTotalPorTipo: async (options?: EstadisticasOptions): Promise<EstadisticasResponse> => {
    const response = await privateApi.get(`${BASE_URL}/estadisticas/por-tipo`, { 
      params: options,
      // Handle Date objects properly in query params
      paramsSerializer: params => {
        const serialized = { ...params };
        Object.keys(serialized).forEach(key => {
          if (serialized[key] instanceof Date) {
            serialized[key] = serialized[key].toISOString();
          }
        });
        return new URLSearchParams(serialized).toString();
      }
    });
    return response.data;
  },

  // Obtener estadísticas por sucursal
  getTotalPorSucursal: async (options?: EstadisticasOptions): Promise<EstadisticasResponse> => {
    const response = await privateApi.get(`${BASE_URL}/estadisticas/por-sucursal`, { 
      params: options,
      // Handle Date objects properly in query params
      paramsSerializer: params => {
        const serialized = { ...params };
        Object.keys(serialized).forEach(key => {
          if (serialized[key] instanceof Date) {
            serialized[key] = serialized[key].toISOString();
          }
        });
        return new URLSearchParams(serialized).toString();
      }
    });
    return response.data;
  }
};