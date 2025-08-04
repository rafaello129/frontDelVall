import { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import Button from '../common/Button';

const HomePage = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Puedes añadir efectos para cargar datos iniciales si es necesario
  useEffect(() => {
    // Por ejemplo, cargar estadísticas o datos destacados
  }, []);

  return (
    <div className="space-y-16">
      {/* Sección Hero */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Sistema de Gestión</span>
                  <span className="block text-blue-600">Transportes Del Valle</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Plataforma integral para la gestión financiera y operativa de tu empresa de transporte. 
                  Administra clientes, facturas, cobranzas y proyecciones desde un solo lugar.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {isAuthenticated ? (
                    <div className="rounded-md shadow">
                      <Button
                        as="link"
                        to="/clientes"
                        variant="primary"
                        size="lg"
                      >
                        Ir al sistema
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md shadow">
                        <Button
                          as="link"
                          to="/register"
                          variant="primary"
                          size="lg"
                        >
                          Comenzar ahora
                        </Button>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Button
                          as="link"
                          to="/login"
                          variant="outline"
                          size="lg"
                        >
                          Iniciar sesión
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-blue-500 to-blue-700 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-32 h-32 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <h3 className="text-2xl font-bold">Gestión de Transporte</h3>
              <p className="text-blue-200">Administración financiera integral</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de módulos del sistema */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Módulos del Sistema</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Gestión integral para tu empresa de transporte
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Herramientas especializadas para administrar todos los aspectos de tu negocio.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {systemModules.map((module) => (
                <div key={module.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <module.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{module.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{module.description}</dd>
                  {isAuthenticated && (
                    <dd className="mt-2 ml-16">
                      <Button
                        as="link"
                        to={module.link}
                        variant="outline"
                        size="sm"
                      >
                        Acceder
                      </Button>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Sección de estadísticas */}
      <section className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Sistema en crecimiento constante
            </h2>
            <p className="mt-3 text-xl text-blue-200">
              Datos que respaldan la confiabilidad de nuestro sistema de gestión.
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            {businessStats.map((stat) => (
              <div key={stat.name} className="flex flex-col">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">{stat.name}</dt>
                <dd className="order-1 text-5xl font-extrabold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Sección de testimonios */}
      <section className="py-12 bg-white overflow-hidden md:py-20 lg:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <blockquote className="mt-10">
              <div className="max-w-3xl mx-auto text-center text-2xl leading-9 font-medium text-gray-900">
                <p>
                  &ldquo;El sistema de Transportes Del Valle ha optimizado completamente nuestra gestión financiera. 
                  Ahora tenemos control total sobre facturas, cobranzas y proyecciones en tiempo real.&rdquo;
                </p>
              </div>
              <footer className="mt-8">
                <div className="md:flex md:items-center md:justify-center">
                  <div className="md:flex-shrink-0">
                    <div className="mx-auto h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">CM</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                    <div className="text-base font-medium text-gray-900">Carlos Mendoza</div>
                    <svg className="hidden md:block mx-1 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 0h3L9 20H6l5-20z" />
                    </svg>
                    <div className="text-base font-medium text-gray-500">Gerente Financiero</div>
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">¿Listo para optimizar tu gestión?</span>
            <span className="block text-blue-600">Accede al sistema Transportes Del Valle.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            {isAuthenticated ? (
              <div className="inline-flex rounded-md shadow">
                <Button
                  as="link"
                  to={user?.role === 'admin' ? '/admin' : '/clientes'}
                  variant="primary"
                  size="lg"
                >
                  {user?.role === 'admin' ? 'Panel de administración' : 'Ir al sistema'}
                </Button>
              </div>
            ) : (
              <>
                <div className="inline-flex rounded-md shadow">
                  <Button
                    as="link"
                    to="/register"
                    variant="primary"
                    size="lg"
                  >
                    Solicitar acceso
                  </Button>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Button
                    as="link"
                    to="/login"
                    variant="outline"
                    size="lg"
                  >
                    Iniciar sesión
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// Datos para los módulos del sistema
const systemModules = [
  {
    name: 'Gestión de Clientes',
    description:
      'Administra la información completa de tus clientes, historial de servicios y datos de contacto.',
    link: '/clientes',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'Facturación',
    description:
      'Genera y gestiona facturas de servicios de transporte con control completo de vencimientos y estados.',
    link: '/facturas',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Cobranzas',
    description:
      'Controla el estado de los pagos, gestiona la cartera de clientes y genera reportes de cobranza.',
    link: '/cobranza',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
  {
    name: 'Proyecciones Financieras',
    description:
      'Planifica y proyecta ingresos, analiza tendencias de cobranza y optimiza el flujo de efectivo.',
    link: '/proyecciones',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    name: 'Gestión Bancaria',
    description:
      'Administra cuentas bancarias, reconciliaciones y movimientos financieros de la empresa.',
    link: '/bancos',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
      </svg>
    ),
  },
  {
    name: 'Bitácora del Sistema',
    description:
      'Registra y consulta todas las actividades del sistema para auditoría y control operativo.',
    link: '/bitacora',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

// Datos para la sección de estadísticas del negocio
const businessStats = [
  { name: 'Facturas procesadas', value: '1,500+' },
  { name: 'Clientes activos', value: '250+' },
  { name: 'Tasa de cobranza', value: '94%' },
];

export default HomePage;