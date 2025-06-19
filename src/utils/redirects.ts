import type { Location } from 'react-router-dom';
import type { User } from '../features/auth/types';

/**
 * Determina la ruta a la que redirigir después de un inicio de sesión exitoso
 * @param user Usuario autenticado
 * @param location Ubicación actual (para redirigir a la página que se intentaba acceder)
 */
export const getRedirectAfterLogin = (
  user: User,
  location?: Location
): string => {
  // Si hay una ubicación previa guardada, redirigir allí
  const from = location?.state?.from?.pathname;
  if (from && from !== '/login' && from !== '/register') {
    return from;
  }

  // Lógica de redirección basada en el rol del usuario
  if (user.role === 'admin') {
    return '/admin';  // Los administradores van al panel de administración
  }

  // Por defecto, ir al perfil del usuario
  return '/profile';
};

/**
 * Determina la ruta a la que redirigir después de cerrar sesión
 * @param currentPath Ruta actual (para evitar redirigir a rutas protegidas)
 */
export const getRedirectAfterLogout = (currentPath: string): string => {
  // Lista de rutas a las que no se debe redirigir después de cerrar sesión
  const protectedRoutes = ['/profile', '/admin', '/settings'];
  
  // Si la ruta actual es protegida, redirigir a la página principal
  if (protectedRoutes.some(route => currentPath.startsWith(route))) {
    return '/';
  }
  
  // Si no, quedarse en la misma página
  return currentPath;
};

/**
 * Determina si el usuario tiene acceso a una ruta específica basado en su rol
 * @param user Usuario autenticado o null
 * @param requiredRole Rol requerido para acceder a la ruta (opcional)
 */
export const canAccessRoute = (
  user: User | null,
  requiredRole?: 'admin' | 'user'
): boolean => {
  // Si no hay usuario, no puede acceder a rutas protegidas
  if (!user) return false;
  
  // Si no se requiere un rol específico, cualquier usuario autenticado puede acceder
  if (!requiredRole) return true;
  
  // Para rutas de admin, verificar que el usuario tenga rol de admin
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  
  // Para rutas de usuario normal, cualquier rol es válido
  return true;
};

/**
 * Determina la ruta a la que redirigir cuando un usuario no tiene acceso a una página
 * @param user Usuario autenticado o null
 */
export const getAccessDeniedRedirect = (user: User | null): string => {
  // Si el usuario está autenticado pero no tiene acceso, ir a página de acceso denegado
  if (user) {
    return '/access-denied';
  }
  
  // Si no está autenticado, ir a login
  return '/login';
};