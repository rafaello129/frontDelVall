import { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { Box, Container, Typography, Stack, Chip } from '@mui/material';
import { Security, Cloud, Dashboard, Support } from '@mui/icons-material';
import Button from '../common/Button';
import Card from '../common/Card';

const HomePage = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // Por ejemplo, cargar estadísticas o datos destacados
  }, []);

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      pt: 4 
    }}>
      {/* Hero Section */}
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 8,
            alignItems: 'center',
            mb: 12,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
            <Chip 
              label="✨ Plataforma Profesional" 
              variant="outlined"
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'primary.main',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                fontWeight: 600,
              }}
            />
            <Typography 
              variant="h1" 
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                lineHeight: 1.1,
              }}
            >
              Plataforma de
              <br />
              <Box component="span" sx={{ color: 'primary.main' }}>
                Gestión Segura
              </Box>
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                mb: 4, 
                maxWidth: 600,
                mx: { xs: 'auto', lg: 0 },
                lineHeight: 1.5,
                fontWeight: 400,
              }}
            >
              Gestiona tus datos de forma segura y eficiente. Nuestra plataforma
              te brinda todas las herramientas que necesitas en un solo lugar.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              sx={{ justifyContent: { xs: 'center', lg: 'flex-start' } }}
            >
              {isAuthenticated ? (
                <Button
                  as="link"
                  to="/profile"
                  variant="primary"
                  size="large"
                  gradient
                >
                  Ir a mi perfil
                </Button>
              ) : (
                <>
                  <Button
                    as="link"
                    to="/register"
                    variant="primary"
                    size="large"
                    gradient
                  >
                    Comenzar ahora
                  </Button>
                  <Button
                    as="link"
                    to="/login"
                    variant="outline"
                    size="large"
                  >
                    Iniciar sesión
                  </Button>
                </>
              )}
            </Stack>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <Card
              variant="glass"
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transform: 'rotate(2deg)',
                '&:hover': {
                  transform: 'rotate(0deg) scale(1.02)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <img
                src="https://via.placeholder.com/600x400/3b82f6/ffffff?text=Del+Valle+Dashboard"
                alt="Ilustración de la plataforma"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.75rem',
                }}
              />
            </Card>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 12 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip 
              label="Características" 
              variant="outlined"
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'primary.main',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                fontWeight: 600,
              }}
            />
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              Una mejor manera de gestionar tus datos
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Descubre por qué nuestra plataforma es la elección de miles de usuarios.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {features.map((feature, index) => (
              <Card
                key={feature.name}
                variant="elevated"
                hover
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '1rem',
                      background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                    }}
                  >
                    <feature.icon sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {feature.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Stats Section */}
        <Card
          variant="gradient"
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            p: 6,
            mb: 12,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Confiado por usuarios en todo el mundo
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, opacity: 0.9 }}>
            Nuestra plataforma ha ayudado a miles de usuarios a gestionar sus datos de forma segura.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {stats.map((stat) => (
              <Box key={stat.name}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {stat.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Testimonial Section */}
        <Card
          variant="glass"
          sx={{
            p: 6,
            mb: 12,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4,
              fontStyle: 'italic',
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            "Esta plataforma ha revolucionado la forma en que gestionamos nuestra información. 
            La seguridad y facilidad de uso son incomparables."
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box
              component="img"
              src="https://via.placeholder.com/48x48/3b82f6/ffffff?text=MG"
              alt="María González"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
              }}
            />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                María González
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CEO, TechCompany
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* CTA Section */}
        <Card
          variant="outlined"
          sx={{
            p: 6,
            textAlign: 'center',
            mb: 8,
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)',
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            ¿Listo para comenzar?
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 4,
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Únete a nuestra plataforma hoy.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            {isAuthenticated ? (
              <Button
                as="link"
                to="/dashboard"
                variant="primary"
                size="large"
                gradient
              >
                {user?.role === 'admin' ? 'Ir al panel admin' : 'Ir a mi dashboard'}
              </Button>
            ) : (
              <>
                <Button
                  as="link"
                  to="/register"
                  variant="primary"
                  size="large"
                  gradient
                >
                  Registrarse gratis
                </Button>
                <Button
                  as="link"
                  to="/login"
                  variant="outline"
                  size="large"
                >
                  Iniciar sesión
                </Button>
              </>
            )}
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

// Datos para la sección de características
const features = [
  {
    name: 'Seguridad avanzada',
    description:
      'Toda tu información está protegida con los más altos estándares de seguridad. Utilizamos encriptación de extremo a extremo.',
    icon: Security,
  },
  {
    name: 'Acceso desde cualquier lugar',
    description:
      'Accede a tus datos desde cualquier dispositivo y en cualquier momento. Nuestra plataforma es totalmente responsive.',
    icon: Cloud,
  },
  {
    name: 'Interfaz intuitiva',
    description:
      'Nuestra interfaz ha sido diseñada pensando en la facilidad de uso. No necesitas ser un experto para utilizarla.',
    icon: Dashboard,
  },
  {
    name: 'Soporte 24/7',
    description:
      'Nuestro equipo de soporte está disponible las 24 horas para ayudarte con cualquier problema que puedas tener.',
    icon: Support,
  },
];

// Datos para la sección de estadísticas
const stats = [
  { name: 'Usuarios activos', value: '10K+' },
  { name: 'Países', value: '30+' },
  { name: 'Satisfacción', value: '99%' },
];

export default HomePage;