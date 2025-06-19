import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectIsAuthenticated, selectAuth, refreshToken } from './features/auth/authSlice';
import { setupAuthInterceptors } from './features/auth/authAPI';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Componente principal de la aplicación
 * Configura el tema, toasts y realiza inicializaciones globales
 */
const App = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { token } = useAppSelector(selectAuth);

  // Configurar interceptores de axios cuando el token cambie
  useEffect(() => {
    setupAuthInterceptors(token);
  }, [token]);

  // Intentar refrescar el token cuando se inicia la app si hay un usuario autenticado
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(refreshToken());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      {/* Componente principal de rutas */}
      <AppRoutes />

      {/* Configuración global de toasts */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default App;