import { privateApi } from '../../services/api';
import type { 
  CreateCorreoDto, 
  UpdateCorreoDto, 
  CorreoCliente,
  EmailValidationResult
} from './types';

const BASE_URL = '/correo-cliente';

export const correoClienteAPI = {
  // Crear nuevo correo
  createCorreo: async (dto: CreateCorreoDto): Promise<CorreoCliente> => {
    const response = await privateApi.post(BASE_URL, dto);
    return response.data;
  },

  // Obtener todos los correos
  getAllCorreos: async (noCliente?: number): Promise<CorreoCliente[]> => {
    const params = noCliente ? { noCliente } : {};
    const response = await privateApi.get(BASE_URL, { params });
    return response.data;
  },

  // Obtener un correo por ID
  getCorreoById: async (id: number): Promise<CorreoCliente> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Actualizar un correo
  updateCorreo: async (id: number, dto: UpdateCorreoDto): Promise<CorreoCliente> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, dto);
    return response.data;
  },

  // Eliminar un correo
  deleteCorreo: async (id: number): Promise<{ message: string, correo: CorreoCliente }> => {
    const response = await privateApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Obtener correos por cliente
  getCorreosByCliente: async (noCliente: number): Promise<CorreoCliente[]> => {
    const response = await privateApi.get(`${BASE_URL}/cliente/${noCliente}`);
    return response.data;
  },

  // Validar dirección de correo
  validateEmail: async (correo: string): Promise<EmailValidationResult> => {
    const response = await privateApi.get(`${BASE_URL}/validar/${correo}`);
    return response.data;
  }
};