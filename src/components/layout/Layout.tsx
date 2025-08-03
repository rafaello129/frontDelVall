import { Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectAuth, refreshToken } from '../../features/auth/authSlice';
import { setupAuthInterceptors } from '../../features/auth/authAPI';
import { Box, Container, Fade } from '@mui/material';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Navbar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 3, md: 4 },
          mt: '64px', // Account for AppBar height
        }}
      >
        <Container maxWidth="xl">
          <Fade in timeout={300}>
            <Box>
              <Suspense fallback={<LoadingSpinner variant="pulse" />}>
                <Outlet />
              </Suspense>
            </Box>
          </Fade>
        </Container>
      </Box>
      
      <Footer />
      
      {/* Contenedor de notificaciones toast con estilo moderno */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
        }}
      />
    </Box>
  );
};

export default Layout;