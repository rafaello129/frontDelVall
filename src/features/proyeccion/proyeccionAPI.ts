import { privateApi } from '../../services/api';
import type { 
  ProyeccionPago,
  CreateProyeccionPagoDto, 
  UpdateProyeccionPagoDto, 
  FilterProyeccionPagoDto,
  PaginatedProyeccionPagoResponse
} from './types';

const BASE_URL = '/proyeccion-pago';

export const proyeccionPagoAPI = {
  // Create a new payment projection
  createProyeccion: async (dto: CreateProyeccionPagoDto): Promise<ProyeccionPago> => {
    const response = await privateApi.post(BASE_URL, dto);
    return response.data;
  },

  // Get all payment projections with filters and pagination
  getAllProyecciones: async (filters?: FilterProyeccionPagoDto): Promise<PaginatedProyeccionPagoResponse> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    return response.data;
  },

  // Get a specific payment projection by ID
  getProyeccionById: async (id: number): Promise<ProyeccionPago> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get projections by client
  getProyeccionesByCliente: async (noCliente: number): Promise<ProyeccionPago[]> => {
    const response = await privateApi.get(`${BASE_URL}/cliente/${noCliente}`);
    return response.data;
  },

  // Get overdue projections
  getProyeccionesVencidas: async (): Promise<ProyeccionPago[]> => {
    const response = await privateApi.get(`${BASE_URL}/vencidas`);
    return response.data;
  },

  // Update a payment projection
  updateProyeccion: async (id: number, dto: UpdateProyeccionPagoDto): Promise<ProyeccionPago> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, dto);
    return response.data;
  },

  // Mark notification as sent
  marcarNotificacionEnviada: async (id: number): Promise<ProyeccionPago> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}/notificacion-enviada`, {});
    return response.data;
  },

  // Delete a payment projection
  deleteProyeccion: async (id: number): Promise<void> => {
    await privateApi.delete(`${BASE_URL}/${id}`);
  }
};