import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFacturas } from '../hooks/useFacturas';
import { useCobranzas } from '../../cobranza/hooks/useCobranzas';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Fade,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import FacturaDetail from '../components/FacturaDetail';
import CobranzasRelacionadas from '../../cobranza/components/CobranzasRelacionadas';

const FacturaViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFacturaById, selectedFactura, isLoading, error } = useFacturas();
  const { 
    getPagosPorFactura, 
    facturaCobranzas, 
    isLoading: isLoadingCobranzas, 
    error: errorCobranzas 
  } = useCobranzas();

  useEffect(() => {
    if (id) {
      getFacturaById(id);
      // Convertir a número si es necesario, ya que getPagosPorFactura espera un número
   
        getPagosPorFactura(id);
      
    }
  }, [id, getFacturaById, getPagosPorFactura]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  return (
    <Fade in>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: 'background.default',
          py: { xs: 4, md: 8 },
          px: { xs: 0, sm: 0 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2, sm: 4 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontWeight: 500,
              fontSize: '1.1rem',
              pt: 1,
            }}
          >
            <MuiLink
              component={Link}
              to="/"
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <HomeIcon fontSize="small" /> Inicio
            </MuiLink>
            <MuiLink
              component={Link}
              to="/facturas"
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ReceiptIcon fontSize="small" /> Facturas
            </MuiLink>
            <Typography color="primary.main" fontWeight={600}>
              Ver factura
            </Typography>
          </Breadcrumbs>
          {isLoading ? (
            <Box textAlign="center" mt={8}>
              <CircularProgress size={52} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 5 }}>{error}</Alert>
          ) : !selectedFactura ? (
            <Alert severity="warning" sx={{ mt: 5 }}>No se encontró la factura.</Alert>
          ) : (
            <Fade in>
              <Box
                sx={{
                  px: { xs: 0, sm: 2, md: 4 },
                  py: { xs: 1, sm: 2, md: 4 },
                  width: '100%',
                  background: 'none',
                  boxShadow: 'none',
                }}
              >
                {/* Detalles de la Factura */}
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <FacturaDetail factura={selectedFactura} formatCurrency={formatCurrency} />
                  
                  {selectedFactura.estado !== 'Pagada' && selectedFactura.estado !== 'Cancelada' && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<EditIcon />}
                          size="large"
                          sx={{
                            fontWeight: 600,
                            px: 3,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.13)',
                            textTransform: 'none',
                          }}
                          onClick={() =>
                            navigate(`/facturas/${selectedFactura.noFactura}/editar`)
                          }
                        >
                          Editar
                        </Button>
                      </Stack>
                    </>
                  )}
                </Paper>
                
                {/* Sección de Cobranzas Relacionadas */}
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <CobranzasRelacionadas 
                    cobranzas={facturaCobranzas} 
                    isLoading={isLoadingCobranzas}
                    error={errorCobranzas}
                  />
                  
                  {selectedFactura.estado !== 'Pagada' && selectedFactura.estado !== 'Cancelada' && selectedFactura.saldo > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                          component={Link}
                          to="/cobranza/nueva"
                          variant="contained"
                          color="success"
                          startIcon={<AddIcon />}
                          size="large"
                          state={{ 
                            facturaId: selectedFactura.noFactura, 
                            clienteId: selectedFactura.noCliente 
                          }}
                          sx={{
                            fontWeight: 600,
                            px: 4,
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                          }}
                        >
                          Registrar nuevo pago para esta factura
                        </Button>
                      </Stack>
                    </>
                  )}
                </Paper>
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default FacturaViewPage;