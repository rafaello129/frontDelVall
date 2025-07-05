import { privateApi } from '../../services/api';
import type { 
  ProyeccionPago,
  CreateProyeccionPagoDto, 
  UpdateProyeccionPagoDto, 
  FilterProyeccionPagoDto,
  PaginatedProyeccionPagoResponse,
  EstadisticasGenerales,
  PatronPago,
  AnalisisComportamiento,
  EvaluacionRiesgo,
  AnalisisEstacionalidad,
  ProyeccionAutomaticaDto,
  ProyeccionAutomatica,
  EstadisticasProyeccionFilterDto
} from './types';

const BASE_URL = '/proyeccion-pago';

export const proyeccionPagoAPI = {
  // Existing methods
  createProyeccion: async (dto: CreateProyeccionPagoDto): Promise<ProyeccionPago> => {
    const response = await privateApi.post(BASE_URL, dto);
    return response.data;
  },

  getAllProyecciones: async (filters?: FilterProyeccionPagoDto): Promise<PaginatedProyeccionPagoResponse> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    return response.data;
  },

  getProyeccionById: async (id: number): Promise<ProyeccionPago> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  getProyeccionesByCliente: async (noCliente: number): Promise<ProyeccionPago[]> => {
    const response = await privateApi.get(`${BASE_URL}/cliente/${noCliente}`);
    return response.data;
  },

  getProyeccionesVencidas: async (): Promise<ProyeccionPago[]> => {
    const response = await privateApi.get(`${BASE_URL}/vencidas`);
    return response.data;
  },

  updateProyeccion: async (id: number, dto: UpdateProyeccionPagoDto): Promise<ProyeccionPago> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, dto);
    return response.data;
  },

  marcarNotificacionEnviada: async (id: number): Promise<ProyeccionPago> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}/notificacion-enviada`, {});
    return response.data;
  },

  deleteProyeccion: async (id: number): Promise<void> => {
    await privateApi.delete(`${BASE_URL}/${id}`);
  },

  // NEW METHODS FOR ADVANCED ANALYTICS AND AI FEATURES

  // Comprehensive system statistics
  getEstadisticasGenerales: async (filters?: EstadisticasProyeccionFilterDto): Promise<EstadisticasGenerales> => {
    const response = await privateApi.get(`${BASE_URL}/estadisticas/general`, { params: filters });
    return response.data;
  },

  // Individual client pattern analysis
  getPatronPagoCliente: async (noCliente: number): Promise<PatronPago> => {
    const response = await privateApi.get(`${BASE_URL}/analisis/patron-pago/${noCliente}`);
    return response.data;
  },

  // Complete behavior assessment with risk evaluation
  getComportamientoCliente: async (noCliente: number): Promise<AnalisisComportamiento> => {
    const response = await privateApi.get(`${BASE_URL}/analisis/comportamiento/${noCliente}`);
    return response.data;
  },

  // Advanced credit risk evaluation
  getRiesgoCliente: async (noCliente: number): Promise<EvaluacionRiesgo> => {
    const response = await privateApi.get(`${BASE_URL}/analisis/riesgo/${noCliente}`);
    return response.data;
  },

  // System-wide seasonal pattern analysis
  getAnalisisEstacionalidad: async (params?: { fechaDesde?: string, fechaHasta?: string, sucursal?: string }): Promise<AnalisisEstacionalidad> => {
    const response = await privateApi.get(`${BASE_URL}/analisis/estacionalidad`, { params });
    return response.data;
  },

  // AI-powered automatic projection generation
  generarProyeccionesAutomaticas: async (config: ProyeccionAutomaticaDto): Promise<ProyeccionAutomatica[]> => {
    const response = await privateApi.post(`${BASE_URL}/automatica/generar`, config);
    return response.data;
  },

  // Create real projections from analysis
  crearProyeccionesDesdeAnalisis: async (config: ProyeccionAutomaticaDto): Promise<{
    proyeccionesCreadas: number;
    proyeccionesGeneradas: number;
    detalles: ProyeccionPago[];
  }> => {
    const response = await privateApi.post(`${BASE_URL}/automatica/crear-desde-analisis`, config);
    return response.data;
  }
};