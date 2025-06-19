import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { refreshToken, selectIsAuthenticated } from '../features/auth/authSlice';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthGuard from '../features/auth/components/AuthGuard';

// Lazy loading de las páginas para mejorar el rendimiento
const HomePage = lazy(() => import('../components/pages/HomePage'));
const LoginPage = lazy(() => import('../components/pages/LoginPage'));
const RegisterPage = lazy(() => import('../components/pages/RegisterPage'));
const ProfilePage = lazy(() => import('../components/pages/ProfilePage'));

const NotFoundPage = lazy(() => import('../components/pages/NotFoundPage'));


const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Intenta refrescar el token cuando la aplicación se inicia
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(refreshToken());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Rutas públicas con layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={
              isAuthenticated ? <Navigate to="/profile" replace /> : <LoginPage />
            } />
            <Route path="register" element={
              isAuthenticated ? <Navigate to="/profile" replace /> : <RegisterPage />
            } />
           
            
            {/* Rutas protegidas para usuarios autenticados */}
            <Route path="profile" element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            } />
            

            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;