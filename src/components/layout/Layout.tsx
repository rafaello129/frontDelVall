import { Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectAuth, refreshToken } from '../../features/auth/authSlice';
import { setupAuthInterceptors } from '../../features/auth/authAPI';
import Navbar from './Navbar';
import Footer from './Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector(selectAuth);

  // Configurar interceptores de axios cuando el token cambie
  useEffect(() => {
    setupAuthInterceptors(token);
  }, [token]);

  // Intentar refrescar el token al cargar la aplicación si el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(refreshToken());
    }
  }, [dispatch, isAuthenticated, token]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      
      <Footer />
      
      {/* Contenedor de notificaciones toast */}
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
    </div>
  );
};

export default Layout;