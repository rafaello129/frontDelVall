import { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                  <span className="block">Plataforma de</span>
                  <span className="block text-blue-600">Gestión Segura</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Gestiona tus datos de forma segura y eficiente. Nuestra plataforma
                  te brinda todas las herramientas que necesitas en un solo lugar.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {isAuthenticated ? (
                    <div className="rounded-md shadow">
                      <Button
                        as="link"
                        to="/profile"
                        variant="primary"
                        size="large"
                      >
                        Ir a mi perfil
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md shadow">
                        <Button
                          as="link"
                          to="/register"
                          variant="primary"
                          size="large"
                        >
                          Comenzar ahora
                        </Button>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Button
                          as="link"
                          to="/login"
                          variant="outline"
                          size="large"
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
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="Ilustración de la plataforma"
          />
        </div>
      </section>

      {/* Sección de características */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Una mejor manera de gestionar tus datos
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Descubre por qué nuestra plataforma es la elección de miles de usuarios.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
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
              Confiado por usuarios en todo el mundo
            </h2>
            <p className="mt-3 text-xl text-blue-200">
              Nuestra plataforma ha ayudado a miles de usuarios a gestionar sus datos de forma segura.
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            {stats.map((stat) => (
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
                  &ldquo;Esta plataforma ha revolucionado la forma en que gestionamos nuestra información. La seguridad y facilidad de uso son incomparables.&rdquo;
                </p>
              </div>
              <footer className="mt-8">
                <div className="md:flex md:items-center md:justify-center">
                  <div className="md:flex-shrink-0">
                    <img
                      className="mx-auto h-10 w-10 rounded-full"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </div>
                  <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                    <div className="text-base font-medium text-gray-900">María González</div>
                    <svg className="hidden md:block mx-1 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 0h3L9 20H6l5-20z" />
                    </svg>
                    <div className="text-base font-medium text-gray-500">CEO, TechCompany</div>
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
            <span className="block">¿Listo para comenzar?</span>
            <span className="block text-blue-600">Únete a nuestra plataforma hoy.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            {isAuthenticated ? (
              <div className="inline-flex rounded-md shadow">
                <Button
                  as="link"
                  to="/dashboard"
                  variant="primary"
                  size="large"
                >
                  {user?.role === 'admin' ? 'Ir al panel admin' : 'Ir a mi dashboard'}
                </Button>
              </div>
            ) : (
              <>
                <div className="inline-flex rounded-md shadow">
                  <Button
                    as="link"
                    to="/register"
                    variant="primary"
                    size="large"
                  >
                    Registrarse gratis
                  </Button>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Button
                    as="link"
                    to="/login"
                    variant="outline"
                    size="large"
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

// Datos para la sección de características
const features = [
  {
    name: 'Seguridad avanzada',
    description:
      'Toda tu información está protegida con los más altos estándares de seguridad. Utilizamos encriptación de extremo a extremo.',
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    name: 'Acceso desde cualquier lugar',
    description:
      'Accede a tus datos desde cualquier dispositivo y en cualquier momento. Nuestra plataforma es totalmente responsive.',
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    name: 'Interfaz intuitiva',
    description:
      'Nuestra interfaz ha sido diseñada pensando en la facilidad de uso. No necesitas ser un experto para utilizarla.',
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    name: 'Soporte 24/7',
    description:
      'Nuestro equipo de soporte está disponible las 24 horas para ayudarte con cualquier problema que puedas tener.',
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

// Datos para la sección de estadísticas
const stats = [
  { name: 'Usuarios activos', value: '10K+' },
  { name: 'Países', value: '30+' },
  { name: 'Satisfacción', value: '99%' },
];

export default HomePage;