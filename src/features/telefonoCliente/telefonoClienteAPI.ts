import { privateApi } from '../../services/api';
import type { 
  CreateTelefonoDto, 
  UpdateTelefonoDto, 
  TelefonoCliente
} from './types';

const BASE_URL = '/telefono-cliente';

export const telefonoClienteAPI = {
  // Crear nuevo teléfono
  createTelefono: async (dto: CreateTelefonoDto): Promise<TelefonoCliente> => {
    const response = await privateApi.post(BASE_URL, dto);
    return response.data;
  },

  // Obtener todos los teléfonos
  getAllTelefonos: async (noCliente?: number): Promise<TelefonoCliente[]> => {
    const params = noCliente ? { noCliente } : {};
    const response = await privateApi.get(BASE_URL, { params });
    return response.data;
  },

  // Obtener un teléfono por ID
  getTelefonoById: async (id: number): Promise<TelefonoCliente> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Actualizar un teléfono
  updateTelefono: async (id: number, dto: UpdateTelefonoDto): Promise<TelefonoCliente> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, dto);
    return response.data;
  },

  // Eliminar un teléfono
  deleteTelefono: async (id: number): Promise<{ message: string, telefono: TelefonoCliente }> => {
    const response = await privateApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Obtener teléfonos por cliente
  getTelefonosByCliente: async (noCliente: number): Promise<TelefonoCliente[]> => {
    const response = await privateApi.get(`${BASE_URL}/cliente/${noCliente}`);
    return response.data;
  }
};