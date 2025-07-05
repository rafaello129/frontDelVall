import { privateApi } from '../../services/api';
import type { 
  BitacoraPago,
  CreateBitacoraPagoDto, 
  UpdateBitacoraPagoDto, 
  FilterBitacoraPagoDto,
  PaginatedBitacoraResponse
} from './types';

const BASE_URL = '/bitacora-pago';

export const bitacoraAPI = {
  // Create a new bitacora entry
  createBitacora: async (dto: CreateBitacoraPagoDto): Promise<BitacoraPago> => {
    const response = await privateApi.post(BASE_URL, dto);
    return response.data;
  },

  // Get all bitacora entries with filters and pagination
  getAllBitacoras: async (filters?: FilterBitacoraPagoDto): Promise<PaginatedBitacoraResponse> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    return response.data;
  },

  // Get a specific bitacora entry by ID
  getBitacoraById: async (id: number): Promise<BitacoraPago> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get bitacora entries by client
  getBitacorasByCliente: async (noCliente: number): Promise<BitacoraPago[]> => {
    const response = await privateApi.get(`${BASE_URL}/cliente/${noCliente}`);
    return response.data;
  },

  // Get bitacora entries by projection
  getBitacorasByProyeccion: async (proyeccionId: number): Promise<BitacoraPago[]> => {
    const response = await privateApi.get(`${BASE_URL}/proyeccion/${proyeccionId}`);
    return response.data;
  },

  // Update a bitacora entry
  updateBitacora: async (id: number, dto: UpdateBitacoraPagoDto): Promise<BitacoraPago> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, dto);
    return response.data;
  },

  // Delete a bitacora entry
  deleteBitacora: async (id: number): Promise<void> => {
    await privateApi.delete(`${BASE_URL}/${id}`);
  }
};