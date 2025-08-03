import { Link } from 'react-router-dom';
import { Box, Container, Typography, IconButton, Divider, Stack } from '@mui/material';
import { GitHub, Twitter, LinkedIn, Mail } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4
          }}
        >
          {/* Brand Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img
                src="/logo.svg"
                alt="Logo Del Valle"
                style={{ height: 32, width: 'auto' }}
              />
              <Typography 
                variant="h6" 
                color="primary" 
                sx={{ ml: 1, fontWeight: 700 }}
              >
                Del Valle
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 2, lineHeight: 1.6 }}
            >
              Plataforma profesional de gestión empresarial. Simplificamos 
              tus procesos para que puedas enfocarte en lo que realmente importa.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton 
                color="primary" 
                href="https://twitter.com" 
                target="_blank"
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton 
                color="primary" 
                href="https://github.com" 
                target="_blank"
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <GitHub fontSize="small" />
              </IconButton>
              <IconButton 
                color="primary" 
                href="https://linkedin.com" 
                target="_blank"
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
              <IconButton 
                color="primary" 
                href="mailto:contacto@delvalle.com"
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Mail fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Links Section */}
          <Box>
            <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 600 }}>
              Enlaces Útiles
            </Typography>
            <Stack spacing={1}>
              <Link 
                to="/about" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Acerca de Nosotros
              </Link>
              <Link 
                to="/features" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Características
              </Link>
              <Link 
                to="/pricing" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Precios
              </Link>
              <Link 
                to="/help" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Centro de Ayuda
              </Link>
            </Stack>
          </Box>

          {/* Legal Section */}
          <Box>
            <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 600 }}>
              Legal
            </Typography>
            <Stack spacing={1}>
              <Link 
                to="/privacy" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Política de Privacidad
              </Link>
              <Link 
                to="/terms" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Términos y Condiciones
              </Link>
              <Link 
                to="/cookies" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Política de Cookies
              </Link>
              <Link 
                to="/contact" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = 'inherit'}
              >
                Contacto
              </Link>
            </Stack>
          </Box>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: { xs: 'center', md: 'space-between' },
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Del Valle. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hecho con ❤️ para una mejor gestión empresarial
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;