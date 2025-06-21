import { privateApi } from '../../services/api';
import type { Banco, CreateBancoDto, UpdateBancoDto, FilterBancoDto, PaginatedBancosResponse } from './types';

const BASE_URL = '/banco';

export const bancoAPI = {
  // Obtener todos los bancos con filtros opcional
  getAllBancos: async (filters?: FilterBancoDto): Promise<PaginatedBancosResponse> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    return response.data;
  },

  // Obtener un banco por ID
  getBancoById: async (id: number): Promise<Banco> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Crear un nuevo banco (solo admin)
  createBanco: async (bancoData: CreateBancoDto): Promise<Banco> => {
    const response = await privateApi.post(BASE_URL, bancoData);
    return response.data;
  },

  // Actualizar un banco por ID
  updateBanco: async (id: number, bancoData: UpdateBancoDto): Promise<Banco> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, bancoData);
    return response.data;
  },

  // Eliminar un banco
  deleteBanco: async (id: number): Promise<{ message: string }> => {
    const response = await privateApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  }
};