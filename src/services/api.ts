import axios, { AxiosError} from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

import { store } from '../app/store';
import { logout, refreshToken } from '../features/auth/authSlice';
import { isTokenExpired, willTokenExpireSoon } from '../utils/authUtils';

// URL base de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Cliente axios para peticiones sin autenticación
 */
export const publicApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Cliente axios para peticiones autenticadas
 */
export const privateApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Refresh token en proceso
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Procesa la cola de peticiones fallidas
 */
const processQueue = (error: any, token = '') => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Interceptor para añadir el token JWT a las peticiones autenticadas
 */
privateApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    let { token } = state.auth;
    
    // Si no hay token, no se añade nada
    if (!token) {
      return config;
    }
    
    // Si el token está próximo a expirar, intenta refrescarlo
    if (token && willTokenExpireSoon(token) && !isRefreshing) {
      try {
        isRefreshing = true;
        await store.dispatch(refreshToken());
        isRefreshing = false;
        
        // Obtiene el nuevo token
        const newState = store.getState();
        token = newState.auth.token;
      } catch (error) {
        isRefreshing = false;
        // Si falla el refresh, no se añade token (se manejará en el interceptor de respuesta)
        return config;
      }
    }
    
    // Añadir el token al header de autorización
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor para manejar errores de autenticación en respuestas
 */
privateApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // Si es un error 401 (no autorizado)
    if (status === 401 && originalRequest) {
      const state = store.getState();
      const { token } = state.auth;
      
      // Si no hay token o está expirado definitivamente, logout
      if (!token || isTokenExpired(token)) {
        store.dispatch(logout());
        return Promise.reject(error);
      }
      
      // Si ya está refrescando, añadir a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      // Intentar refrescar el token
      isRefreshing = true;
      
      try {
        await store.dispatch(refreshToken());
        const newState = store.getState();
        const newToken = newState.auth.token;
        
        if (!newToken) {
          throw new Error('No se pudo obtener un nuevo token');
        }
        
        isRefreshing = false;
        processQueue(null, newToken);
        
        // Reintentar la petición original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    // Si es un error 403 (prohibido)
    if (status === 403) {
      // El usuario está autenticado pero no tiene permisos
      // Aquí podrías redirigir a una página de acceso denegado
      console.error('Acceso denegado:', error.response?.data);
    }
    
    // Para otros errores, simplemente rechazar la promesa
    return Promise.reject(error);
  }
);

// Exportar una API genérica (para compatibilidad con código existente)
const api = {
  // Métodos autenticados
  get: privateApi.get.bind(privateApi),
  post: privateApi.post.bind(privateApi),
  put: privateApi.put.bind(privateApi),
  patch: privateApi.patch.bind(privateApi),
  delete: privateApi.delete.bind(privateApi),
  
  // Métodos públicos (sin autenticación)
  public: {
    get: publicApi.get.bind(publicApi),
    post: publicApi.post.bind(publicApi),
    put: publicApi.put.bind(publicApi),
    patch: publicApi.patch.bind(publicApi),
    delete: publicApi.delete.bind(publicApi),
  }
};

export default api;