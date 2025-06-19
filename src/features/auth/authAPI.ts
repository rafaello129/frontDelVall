import axios from 'axios';
import type { LoginUserDto, RegisterUserDto, LoginResponse } from './types';

// Configuración base de axios con la URL de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_AUTH_URL = `${API_URL}/auth`;

// Cliente axios para peticiones sin token
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cliente axios para peticiones que requieren autenticación
const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token a las peticiones autenticadas
export const setupAuthInterceptors = (token: string | null) => {
  authClient.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Funciones para interactuar con la API de autenticación

/**
 * Registra un nuevo usuario
 */
export const register = async (userData: RegisterUserDto): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(`${BASE_AUTH_URL}/register`, userData);
  return response.data;
};

/**
 * Inicia sesión con email y password
 */
export const login = async (credentials: LoginUserDto): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(`${BASE_AUTH_URL}/login`, credentials);
  return response.data;
};

/**
 * Refresca el token de autenticación
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  try {
    const response = await authClient.get<LoginResponse>(`${BASE_AUTH_URL}/refresh-token`);
    return response.data;
  } catch (error) {
    // Si hay un error al refrescar el token, limpiar la sesión
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }
};
/**
 * Verifica si el token actual es válido
 * Esta función es útil para verificar la autenticación al iniciar la aplicación
 */
export const verifyAuth = async (): Promise<boolean> => {
  try {
    await authClient.get(`${BASE_AUTH_URL}/refresh-token`);
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  register,
  login,
  refreshToken,
  verifyAuth,
  setupAuthInterceptors
};