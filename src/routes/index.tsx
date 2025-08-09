import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { refreshToken, selectIsAuthenticated } from '../features/auth/authSlice';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthGuard from '../features/auth/components/AuthGuard';
import { PagoExternoListPage, PagoExternoDetailPage, PagoExternoCreatePage, PagoExternoEditPage } from '../features/pagoExterno';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale'; // Import the Spanish locale if needed
import ProyeccionDetailPage from '../features/proyeccion/pages/ProyeccionDetailPage';
import TipoCambioDOF from '../test/TipoCambioDOF';
// Lazy loading de las páginas para mejorar el rendimiento
const HomePage = lazy(() => import('../components/pages/HomePage'));
const LoginPage = lazy(() => import('../components/pages/LoginPage'));
const RegisterPage = lazy(() => import('../components/pages/RegisterPage'));
const ProfilePage = lazy(() => import('../components/pages/ProfilePage'));
const AdminPage = lazy(() => import('../components/pages/AdminPage'));
const NotFoundPage = lazy(() => import('../components/pages/NotFoundPage'));
const AccessDeniedPage = lazy(() => import('../components/pages/AccessDeniedPage'));

// Client pages
const ClientesPage = lazy(() => import('../features/cliente/pages/ClientesPage'));
const ClienteDetailPage = lazy(() => import('../features/cliente/pages/ClienteDetailPage'));
const ClienteCreatePage = lazy(() => import('../features/cliente/pages/ClienteCreatePage'));
const ClienteEditPage = lazy(() => import('../features/cliente/pages/ClienteEditPage'));
const ReportesClientePage = lazy(() => import('../features/cliente/pages/ReportesClientePage'));
const SubirCsvClientePage = lazy(() => import('../features/cliente/pages/SubirCsvPage'));
const SubirCsvFacturaPage = lazy(() => import('../features/factura/pages/SubirCsvFacturaPage'));
const ClienteExcelPage = lazy(() => import('../features/cliente/pages/ClienteExcelPage'));
// Banco pages
const BancosPage = lazy(() => import('../features/banco/pages/BancosPage'));

// Factura pages
const FacturasPage = lazy(() => import('../features/factura/pages/FacturasPage'));
const FacturasVencidasPage = lazy(() => import('../features/factura/pages/FacturasVencidasPage'));
const FacturaExcelPage = lazy(() => import('../features/factura/pages/FacturaExcelPage'));
const FacturaViewPage = lazy(() => import('../features/factura/pages/FacturaViewPage'));
const FacturaCreatePage = lazy(() => import('../features/factura/pages/FacturaCreatePage'));
const FacturaEditPage = lazy(() => import('../features/factura/pages/FacturaEditPage'));
// Cobranza pages
const CobranzasPage = lazy(() => import('../features/cobranza/pages/CobranzasPage'));
const CobranzaDetailPage = lazy(() => import('../features/cobranza/pages/CobranzaDetailPage'));
const CobranzaFormPage = lazy(() => import('../features/cobranza/pages/CobranzaFormPage'));
const CobranzasExcelPage = lazy(() => import('../features/cobranza/pages/CobranzasExcelPage'));
const SubirCsvCobranzaPage = lazy(() => import('../features/cobranza/pages/SubirCsvCobranzaPage'));
const ReporteCobranzaPage = lazy(() => import('../features/cobranza/pages/ReporteCobranzaPage'));
const ReporteRegionPage = lazy(() => import('../features/cobranza/pages/ReporteRegionPage'));
const SubirCsvPagoExternoPage = lazy(() => import('../features/pagoExterno/pages/SubirCsvPagosExternosPage'));

const ProyeccionesPage = lazy(() => import('../features/proyeccion/pages/ProyeccionesPage'));
const ProyeccionCreatePage = lazy(() => import('../features/proyeccion/pages/ProyeccionCreatePage'));
const ProyeccionEditPage = lazy(() => import('../features/proyeccion/pages/ProyeccionEditPage'));
const ProyeccionCalendario = lazy(() => import('../features/proyeccion/pages/ProyeccionCalendarPage'));

const BitacoraPage = lazy(() => import('../features/bitacora/pages/BitacoraPage'));
const BitacoraCreatePage = lazy(() => import('../features/bitacora/pages/BitacoraCreatePage'));
const BitacoraEditPage = lazy(() => import('../features/bitacora/pages/BitacoraEditPage'));
const BitacoraDetailPage = lazy(() => import('../features/bitacora/pages/BitacoraDetailPage'));


const ProyeccionEstadisticasPage = lazy(() => import('../features/proyeccion/pages/ProyeccionEstadisticasPage'));
const ProyeccionAnaliticaPage = lazy(() => import('../features/proyeccion/pages/ProyeccionAnaliticaPage'));

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
            
            {/* Rutas de Clientes */}
            <Route path="clientes" element={
              <AuthGuard>
                <ClientesPage />
              </AuthGuard>
            } />
            <Route path="clientes/:noCliente" element={
              <AuthGuard>
                <ClienteDetailPage />
              </AuthGuard>
            } />
            <Route path="clientes/nuevo" element={
              <AuthGuard>
                <ClienteCreatePage />
              </AuthGuard>
            } />

              <Route path="clientes/csv" element={
              <AuthGuard>
                <SubirCsvClientePage />
              </AuthGuard>
            } />
                          <Route path="clientes/excel" element={
              <AuthGuard>
                <ClienteExcelPage />
              </AuthGuard>
            } />
              <Route path="facturas/csv" element={
              <AuthGuard>
                <SubirCsvFacturaPage />
              </AuthGuard>
            } />            
            <Route path="facturas/excel" element={
              <AuthGuard>
                <FacturaExcelPage />
              </AuthGuard>
            } />
               <Route path="facturasView/:id" element={
              <AuthGuard>
                <FacturaViewPage />
              </AuthGuard>
            } />

<Route path="facturas/:id/editar" element={
              <AuthGuard>
                <FacturaEditPage />
              </AuthGuard>
            } />

<Route path="facturas/nueva" element={
              <AuthGuard>
                <FacturaCreatePage />
              </AuthGuard>
            } />

            <Route path="clientes/:noCliente/editar" element={
              <AuthGuard>
                <ClienteEditPage />
              </AuthGuard>
            } />
            <Route path="reportes/clientes" element={
              <AuthGuard>
                <ReportesClientePage />
              </AuthGuard>
            } />
            
            {/* Rutas de Bancos */}
            <Route path="bancos" element={
              <AuthGuard>
                <BancosPage />
              </AuthGuard>
            } />
            
            {/* Rutas de Facturas */}
            <Route path="facturas" element={
              <AuthGuard>
                <FacturasPage />
              </AuthGuard>
            } />
            <Route path="facturas/vencidas" element={
              <AuthGuard>
                <FacturasVencidasPage />
              </AuthGuard>
            } />
            
            {/* Rutas de Cobranza */}
            <Route path="cobranza" element={
              <AuthGuard>
                <CobranzasPage />
              </AuthGuard>
            } />

            <Route path="cobranza/nueva" element={
              <AuthGuard>
                <CobranzaFormPage />
              </AuthGuard>
            } />
            <Route path="cobranza/:id" element={
              <AuthGuard>
                <CobranzaDetailPage />
              </AuthGuard>
            } />
            <Route path="cobranza/editar/:id" element={
              <AuthGuard>
                <CobranzaFormPage />
              </AuthGuard>
            } />

            <Route path="cobranza/reportes" element={
              <AuthGuard>
                <ReporteCobranzaPage />
              </AuthGuard>
            } />
            <Route path="cobranzas/csv" element={
              <AuthGuard>
                <SubirCsvCobranzaPage />
              </AuthGuard>
            } />
            <Route path="cobranza/reportes/region" element={
              <AuthGuard>
                <ReporteRegionPage />
              </AuthGuard>
            } />
                  <Route path="cobranzas/excel" element={
              <AuthGuard>
                <CobranzasExcelPage></CobranzasExcelPage>
              </AuthGuard>
            } />
              <Route path="/pagos-externos" element={<PagoExternoListPage />} />
              <Route path="/pagos-externos/:id" element={<PagoExternoDetailPage />} />
              <Route path="/pagos-externos/nuevo" element={<PagoExternoCreatePage />} />
              <Route path="/pagos-externos/editar/:id" element={<PagoExternoEditPage />} />
            {/* Redirección a la página de inicio si no está autenticado */}
            <Route path="/pagos-externos/csv/" element={<SubirCsvPagoExternoPage />} />         
            {/* Rutas protegidas solo para administradores */}
            <Route path="admin" element={
              <AuthGuard requiredRole="admin">
                <AdminPage />
              </AuthGuard>
            } />
            {/* Rutas de Proyecciones */}
<Route path="proyecciones" element={
  <AuthGuard>
    <ProyeccionesPage />
  </AuthGuard>
} />
<Route path="proyecciones/nueva" element={
  <AuthGuard>
    <ProyeccionCreatePage />
  </AuthGuard>
} />
<Route path="proyecciones/:id" element={
  <AuthGuard>
    <ProyeccionDetailPage />
  </AuthGuard>
} />
<Route path="proyecciones/:id/editar" element={
  <AuthGuard>
    <ProyeccionEditPage />
  </AuthGuard>
} />
 <Route path="proyecciones/estadisticas" element={
  <AuthGuard>
    <ProyeccionEstadisticasPage />
  </AuthGuard>
} />
 <Route path="proyecciones/calendario" element={
  <AuthGuard>
    <ProyeccionCalendario />
  </AuthGuard>
} />
<Route path="proyecciones/analitica" element={
  <AuthGuard>
    <ProyeccionAnaliticaPage />
  </AuthGuard>
} />

<Route path="proyecciones/analitica/:clienteId" element={
  <AuthGuard>
    <ProyeccionAnaliticaPage />
  </AuthGuard>
} />
{/* Rutas de Bitácora */}
<Route path="bitacora" element={
  <AuthGuard>
    <BitacoraPage />
  </AuthGuard>
} />
<Route path="bitacora/nuevo" element={
  <AuthGuard>
    <BitacoraCreatePage />
  </AuthGuard>
} />
<Route path="bitacora/:id" element={
  <AuthGuard>
    <BitacoraDetailPage />
  </AuthGuard>
} />
<Route path="bitacora/:id/editar" element={
  <AuthGuard>
    <BitacoraEditPage />
  </AuthGuard>
} />

            {/* Rutas de Test */}
            <Route path='test' element={<TipoCambioDOF></TipoCambioDOF>} />
            <Route path="access-denied" element={<AccessDeniedPage />} />
            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
    </LocalizationProvider>
  );
};

export default AppRoutes;