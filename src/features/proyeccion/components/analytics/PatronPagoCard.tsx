import React from 'react';
import { 
  Card, 
  CardHeader,
  CardContent,
  Typography, 
  Box, 
  Grid, 
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
          <Grid container spacing={3}>
            {/* Confiabilidad - Feature Box */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  position: 'relative',
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
            </Grid>

            {/* Próximo pago estimado */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
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
            </Grid>

            {/* Tendencia de montos */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
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
            </Grid>

            {/* Detalles del patrón */}
            <Grid item xs={12}>
              <Divider textAlign="left">Detalles del patrón de pago</Divider>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DateRange color="primary" />
                      <Typography variant="body2">Frecuencia:</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium" pl={4}>
                      {patronPago.frecuenciaDias} días
                    </Typography>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AttachMoney color="primary" />
                      <Typography variant="body2">Monto Promedio:</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium" pl={4}>
                      ${patronPago.montoPromedio.toLocaleString('es-MX')}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalance color="primary" />
                      <Typography variant="body2">Banco Preferido:</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium" pl={4}>
                      {patronPago.bancoPreferido || 'No especificado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Payment color="primary" />
                      <Typography variant="body2">Tipo de Pago:</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium" pl={4}>
                      {patronPago.tipoPagoPreferido || 'No especificado'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Predicción de pago */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <VerifiedUser color="primary" />
                    <Typography variant="subtitle1">Predicción de Pago</Typography>
                  </Box>
                  <Chip 
                    label={`Confiabilidad: ${Math.round((patronPago.tasaPuntualidad + (patronPago.confiabilidad === 'alta' ? 30 : patronPago.confiabilidad === 'media' ? 15 : 0)) / 1.3)}%`}
                    color={patronPago.confiabilidad === 'alta' ? 'success' : patronPago.confiabilidad === 'media' ? 'warning' : 'error'}
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                  <Typography variant="body1">
                    Fecha estimada: <strong>{format(new Date(patronPago.proximoPagoEstimado), 'PPP', { locale: es })}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Monto estimado: <strong>${patronPago.montoEstimado.toLocaleString('es-MX')}</strong>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};