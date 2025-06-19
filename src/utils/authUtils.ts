import { jwtDecode} from 'jwt-decode';
import type { JwtPayload } from '../features/auth/types';

/**
 * Decodifica un token JWT y devuelve su payload
 * @param token El token JWT a decodificar
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT ha expirado
 * @param token El token JWT a verificar
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // La fecha de expiración viene en segundos, convertir a milisegundos
  const expirationDate = new Date(decoded.exp * 1000);
  const currentDate = new Date();
  
  // Considerar el token expirado 60 segundos antes para dar margen
  return expirationDate.getTime() - 60000 < currentDate.getTime();
};

/**
 * Verifica si un token JWT expirará pronto (en los próximos 5 minutos)
 * Útil para determinar si se debe refrescar el token
 * @param token El token JWT a verificar
 */
export const willTokenExpireSoon = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationDate = new Date(decoded.exp * 1000);
  const currentDate = new Date();
  
  // Verificar si expirará en los próximos 5 minutos (300000 ms)
  return expirationDate.getTime() - currentDate.getTime() < 300000;
};

/**
 * Extrae el ID de usuario de un token JWT
 * @param token El token JWT
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded?.id || null;
};

/**
 * Configura un temporizador para refrescar el token antes de que expire
 * @param token El token JWT actual
 * @param refreshCallback Función para refrescar el token
 */
export const setupTokenRefreshTimer = (
  token: string,
  refreshCallback: () => void
): NodeJS.Timeout | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  const expirationDate = new Date(decoded.exp * 1000);
  const currentDate = new Date();
  
  // Calcular tiempo hasta 5 minutos antes de expiración
  const timeUntilRefresh = Math.max(
    0,
    expirationDate.getTime() - currentDate.getTime() - 300000
  );
  
  // Configurar el temporizador
  return setTimeout(refreshCallback, timeUntilRefresh);
};

/**
 * Función para limpiar el temporizador de refresh
 */
export const clearTokenRefreshTimer = (timer: NodeJS.Timeout | null): void => {
  if (timer) {
    clearTimeout(timer);
  }
};