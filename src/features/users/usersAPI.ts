import { privateApi } from '../../services/api';
import type { CreateUserDto, UpdateUserDto, UserProfile } from './types';

const BASE_URL = '/users';

export const usersAPI = {
  // Obtener todos los usuarios (solo admin)
  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await privateApi.get(BASE_URL);
    return response.data;
  },

  // Obtener un usuario por ID
  getUserById: async (id: string): Promise<UserProfile> => {
    const response = await privateApi.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Obtener un usuario por email
  getUserByEmail: async (email: string): Promise<UserProfile> => {
    const response = await privateApi.get(`${BASE_URL}/email/${email}`);
    return response.data;
  },

  // Crear un nuevo usuario (solo admin)
  createUser: async (userData: CreateUserDto): Promise<UserProfile> => {
    const response = await privateApi.post(BASE_URL, userData);
    return response.data;
  },

  // Actualizar un usuario por ID
  updateUserById: async (id: string, userData: UpdateUserDto): Promise<UserProfile> => {
    const response = await privateApi.patch(`${BASE_URL}/${id}`, userData);
    return response.data;
  },

  // Actualizar un usuario por email
  updateUserByEmail: async (email: string, userData: UpdateUserDto): Promise<UserProfile> => {
    const response = await privateApi.patch(`${BASE_URL}/email/${email}`, userData);
    return response.data;
  },

  // Eliminar un usuario por ID
  deleteUserById: async (id: string): Promise<{ message: string }> => {
    const response = await privateApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Eliminar un usuario por email
  deleteUserByEmail: async (email: string): Promise<{ message: string }> => {
    const response = await privateApi.delete(`${BASE_URL}/email/${email}`);
    return response.data;
  }
};