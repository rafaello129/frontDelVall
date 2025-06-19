import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { selectIsAuthenticated, selectUser, refreshToken } from '../authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

/**
 * Componente de guarda para proteger rutas que requieren autenticación
 * Redirecciona a login si el usuario no está autenticado
 * Opcionalmente verifica el rol del usuario
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // Intentar refrescar el token si el usuario está autenticado
    // pero el token podría estar cerca de expirar
    if (isAuthenticated) {
      dispatch(refreshToken());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    // Redirigir a la página de login y guardar la ubicación original
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si el rol del usuario cumple con el rol requerido (si se especificó)
  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === 'admin') {
      // Si se requiere ser admin y el usuario no lo es, redirigir a una página de acceso denegado
      return <Navigate to="/access-denied" replace />;
    }
    // Para otros roles, simplemente redirigir al home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;