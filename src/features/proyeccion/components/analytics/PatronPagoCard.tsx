import React from 'react';
import { 
  Card, 
  CardHeader,
  CardContent,
  Typography, 
  Box, 
  Stack, 
  Divider, 
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  DateRange,
  AttachMoney,
  AccountBalance,
  Payment,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  VerifiedUser,
  Security,
  HourglassEmpty
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '@mui/material/styles';
import type { PatronPago } from '../../types';

interface PatronPagoCardProps {
  patronPago: PatronPago;
  loading?: boolean;
}

export const PatronPagoCard: React.FC<PatronPagoCardProps> = ({ patronPago, loading = false }) => {
  const theme = useTheme();

  // Helper function to get color based on value
  const getConfiabilidadColor = (confiabilidad: string) => {
    switch (confiabilidad) {
      case 'alta': return theme.palette.success.main;
      case 'media': return theme.palette.warning.main;
      case 'baja': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente': return <TrendingUp color="success" />;
      case 'decreciente': return <TrendingDown color="error" />;
      case 'estable': return <TrendingFlat color="primary" />;
      default: return <TrendingFlat color="primary" />;
    }
  };

  return (
    <Card elevation={2}>
      <CardHeader 
        title="Patrón de Pago del Cliente" 
        action={loading && <LinearProgress sx={{ width: 100, mt: 2 }} />}
      />
      <Divider />
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Top metrics */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, 1fr)'
                },
                gap: 3
              }}
            >
              {/* Confiabilidad - Feature Box */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  position: 'relative',
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${getConfiabilidadColor(patronPago.confiabilidad)}22 100%)`
                }}
              >
                <Security sx={{ fontSize: 48, color: getConfiabilidadColor(patronPago.confiabilidad), mb: 1 }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Confiabilidad {patronPago.confiabilidad.charAt(0).toUpperCase() + patronPago.confiabilidad.slice(1)}
                </Typography>
                <Typography variant="body2" align="center">
                  Tasa de puntualidad: {patronPago.tasaPuntualidad.toFixed(1)}%
                </Typography>
              </Paper>

              {/* Próximo pago estimado */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}22 100%)`
                }}
              >
                <HourglassEmpty sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Próximo Pago Estimado
                </Typography>
                <Typography variant="body1" align="center" sx={{ fontWeight: 'bold' }}>
                  {format(new Date(patronPago.proximoPagoEstimado), 'PP', { locale: es })}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1, fontWeight: 'medium' }}>
                  ${patronPago.montoEstimado.toLocaleString('es-MX')}
                </Typography>
              </Paper>

              {/* Tendencia de montos */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.info.light}22 100%)`
                }}
              >
                {getTendenciaIcon(patronPago.tendenciaMonto)}
                <Typography variant="h6" align="center" gutterBottom>
                  Tendencia {patronPago.tendenciaMonto}
                </Typography>
                <Typography variant="body2" align="center">
                  Monto promedio: ${patronPago.montoPromedio.toLocaleString('es-MX')}
                </Typography>
              </Paper>
            </Box>

            {/* Detalles del patrón */}
            <Box>
              <Divider textAlign="left" sx={{ mb: 3 }}>
                <Typography variant="h6" color="text.secondary">
                  Detalles del patrón de pago
                </Typography>
              </Divider>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)'
                  },
                  gap: 3
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <DateRange color="primary" />
                    <Typography variant="body2" color="text.secondary">Frecuencia:</Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {patronPago.frecuenciaDias} días
                  </Typography>
                </Box>

                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <AttachMoney color="primary" />
                    <Typography variant="body2" color="text.secondary">Monto Promedio:</Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    ${patronPago.montoPromedio.toLocaleString('es-MX')}
                  </Typography>
                </Box>

                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <AccountBalance color="primary" />
                    <Typography variant="body2" color="text.secondary">Banco Preferido:</Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {patronPago.bancoPreferido || 'No especificado'}
                  </Typography>
                </Box>

                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Payment color="primary" />
                    <Typography variant="body2" color="text.secondary">Tipo de Pago:</Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {patronPago.tipoPagoPreferido || 'No especificado'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Predicción de pago */}
            <Paper elevation={2} sx={{ p: 3, bgcolor: theme.palette.background.default, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <VerifiedUser color="primary" />
                  <Typography variant="subtitle1" fontWeight="medium">Predicción de Pago</Typography>
                </Stack>
                <Chip 
                  label={`Confiabilidad: ${Math.round((patronPago.tasaPuntualidad + (patronPago.confiabilidad === 'alta' ? 30 : patronPago.confiabilidad === 'media' ? 15 : 0)) / 1.3)}%`}
                  color={patronPago.confiabilidad === 'alta' ? 'success' : patronPago.confiabilidad === 'media' ? 'warning' : 'error'}
                />
              </Stack>
              <Divider sx={{ mb: 2 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                <Typography variant="body1">
                  Fecha estimada: <strong>{format(new Date(patronPago.proximoPagoEstimado), 'PPP', { locale: es })}</strong>
                </Typography>
                <Typography variant="body1">
                  Monto estimado: <strong>${patronPago.montoEstimado.toLocaleString('es-MX')}</strong>
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};