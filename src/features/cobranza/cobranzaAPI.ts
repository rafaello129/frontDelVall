import { privateApi } from '../../services/api';
import type { 
  Cobranza, 
  CreateCobranzaDto, 
  UpdateCobranzaDto, 
  FilterCobranzaDto, 
  PaginatedCobranzasResponse,
  ReporteCobranza, 
  ReporteCobranzaPorRegion
} from './types';

const BASE_URL = '/cobranza';

export const cobranzaAPI = {
  // Obtener todas las cobranzas con filtros opcional
  getAllCobranzas: async (filters?: FilterCobranzaDto): Promise<PaginatedCobranzasResponse> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    return response.data;
  },

  // Obtener una cobranza por ID
  getCobranzaById: async (id: number): Promise<Cobranza> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Crear una nueva cobranza (solo admin)
  createCobranza: async (cobranzaData: CreateCobranzaDto): Promise<Cobranza> => {
    const response = await privateApi.post(BASE_URL, cobranzaData);
    return response.data;
  },

  // Actualizar una cobranza por ID
  updateCobranza: async (id: number, cobranzaData: UpdateCobranzaDto): Promise<Cobranza> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, cobranzaData);
    return response.data;
  },

  // Eliminar una cobranza
  deleteCobranza: async (id: number): Promise<{ message: string }> => {
    const response = await privateApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Obtener pagos por factura
  getPagosPorFactura: async (noFactura: number): Promise<{
    data: Cobranza[];
    total: number;
    montoTotal: number;
  }> => {
    const response = await privateApi.get(`${BASE_URL}/factura/${noFactura}`);
    return response.data;
  },

  // Obtener pagos por cliente
  getPagosPorCliente: async (noCliente: number, filters?: FilterCobranzaDto): Promise<{
    data: Cobranza[];
    total: number;
    montoTotal: number;
  }> => {
    const response = await privateApi.get(`${BASE_URL}/cliente/${noCliente}`, { params: filters });
    return response.data;
  },

  // Obtener reporte de cobranza por periodo
  getReporteCobranza: async (fechaDesde: Date, fechaHasta: Date): Promise<ReporteCobranza> => {
    const response = await privateApi.get(`${BASE_URL}/reportes/por-periodo`, {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  },
  getReportePorRegion: async (fechaDesde?: Date, fechaHasta?: Date): Promise<ReporteCobranzaPorRegion> => {
    const params: any = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    
    const response = await privateApi.get(`${BASE_URL}/reportes/por-region`, { params });
    return response.data;
  }
};