import React from 'react';
import { 
  Card, 
  CardHeader,
  CardContent,
  Typography, 
  Box, 
  Divider, 
  Chip,
  Stack,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Assessment,
  CheckCircle,
  Warning,
  Error,
  Lightbulb,
  TrendingUp,
  PieChart,
  BarChart,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import type { AnalisisComportamiento } from '../../types';

interface ComportamientoClienteCardProps {
  comportamiento: AnalisisComportamiento;
  loading?: boolean;
}

export const ComportamientoClienteCard: React.FC<ComportamientoClienteCardProps> = ({ 
  comportamiento, 
  loading = false 
}) => {
  const theme = useTheme();

  const getRiesgoColor = (riesgo: string) => {
    switch (riesgo) {
      case 'bajo': return theme.palette.success.main;
      case 'medio': return theme.palette.warning.main;
      case 'alto': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const getRiesgoIcon = (riesgo: string) => {
    switch (riesgo) {
      case 'bajo': return <CheckCircle color="success" />;
      case 'medio': return <Warning color="warning" />;
      case 'alto': return <Error color="error" />;
      default: return <Assessment color="primary" />;
    }
  };

  // Data for the radial chart
  const chartData = [
    {
      name: 'Pagos a Tiempo',
      value: comportamiento.historialPagos.pagosATiempo,
      fill: theme.palette.success.main,
    },
    {
      name: 'Pagos Retrasados',
      value: comportamiento.historialPagos.pagosRetrasados,
      fill: theme.palette.warning.main,
    },
    {
      name: 'Proyecciones Cumplidas',
      value: comportamiento.proyeccionesCumplidas,
      fill: theme.palette.primary.main,
    },
    {
      name: 'Proyecciones No Cumplidas',
      value: comportamiento.proyeccionesCreadas - comportamiento.proyeccionesCumplidas,
      fill: theme.palette.error.main,
    },
  ];

  return (
    <Card elevation={2}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Assessment color="primary" />
            <Typography variant="h6">Análisis de Comportamiento</Typography>
          </Box>
        }
        subheader={`Cliente: ${comportamiento.razonSocial} - Clasificación: ${comportamiento.clasificacion}`}
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
            {/* Main metrics and chart */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Risk metrics */}
              <Box flex={{ xs: 1, md: 0.4 }}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${getRiesgoColor(comportamiento.riesgo)}22 100%)`
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    {getRiesgoIcon(comportamiento.riesgo)}
                    <Typography variant="h6" textAlign="center">
                      Nivel de Riesgo: <strong style={{ color: getRiesgoColor(comportamiento.riesgo) }}>
                        {comportamiento.riesgo.toUpperCase()}
                      </strong>
                    </Typography>
                    
                    <Box width="100%">
                      <Typography variant="subtitle2" gutterBottom>
                        Tasa de Puntualidad
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinearProgress 
                          variant="determinate" 
                          value={comportamiento.historialPagos.tasaPuntualidad} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5, 
                            flexGrow: 1,
                            bgcolor: theme.palette.grey[300],
                            '& .MuiLinearProgress-bar': {
                              bgcolor: comportamiento.historialPagos.tasaPuntualidad > 75 
                                ? theme.palette.success.main 
                                : comportamiento.historialPagos.tasaPuntualidad > 50 
                                  ? theme.palette.warning.main 
                                  : theme.palette.error.main
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {comportamiento.historialPagos.tasaPuntualidad.toFixed(1)}%
                        </Typography>
                      </Stack>
                    </Box>
                    
                    <Box width="100%">
                      <Typography variant="subtitle2" gutterBottom>
                        Éxito de Proyecciones
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinearProgress 
                          variant="determinate" 
                          value={comportamiento.tasaExitoProyecciones} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5, 
                            flexGrow: 1,
                            bgcolor: theme.palette.grey[300],
                            '& .MuiLinearProgress-bar': {
                              bgcolor: comportamiento.tasaExitoProyecciones > 75 
                                ? theme.palette.success.main 
                                : comportamiento.tasaExitoProyecciones > 50 
                                  ? theme.palette.warning.main 
                                  : theme.palette.error.main
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {comportamiento.tasaExitoProyecciones.toFixed(1)}%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Box>

              {/* Chart */}
              <Box flex={{ xs: 1, md: 0.6 }}>
                <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Comportamiento de Pagos y Proyecciones
                  </Typography>
                  <Box height={220}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="10%" 
                      outerRadius="80%" 
                      barSize={20} 
                      data={chartData}
                    >
                      <RadialBar
                        label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                        background
                        dataKey="value"
                      />
                      <Tooltip formatter={(value) => [value, 'Cantidad']} />
                      <Legend 
                        iconSize={10}
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>
            </Stack>

            {/* Historical and projection metrics */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Historical metrics */}
              <Box flex={1}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <BarChart color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">Historial de Pagos</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total de pagos
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {comportamiento.historialPagos.totalPagos}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monto total
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${comportamiento.historialPagos.montoTotal.toLocaleString('es-MX')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monto promedio
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${comportamiento.historialPagos.montoPromedio.toLocaleString('es-MX')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Días retraso promedio
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {comportamiento.historialPagos.diasRetrasoPromedio.toFixed(1)} días
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Proyecciones metrics */}
              <Box flex={1}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <PieChart color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">Proyecciones</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Proyecciones creadas
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {comportamiento.proyeccionesCreadas}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Proyecciones cumplidas
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="h6" fontWeight="bold">
                            {comportamiento.proyeccionesCumplidas}
                          </Typography>
                          <Chip 
                            label={`${comportamiento.tasaExitoProyecciones.toFixed(0)}%`}
                            size="small"
                            color={
                              comportamiento.tasaExitoProyecciones > 75 
                                ? 'success' 
                                : comportamiento.tasaExitoProyecciones > 50 
                                  ? 'warning' 
                                  : 'error'
                            }
                          />
                        </Stack>
                      </Box>
                    </Box>
                    
                    <Box 
                      sx={{
                        bgcolor: theme.palette.background.default,
                        p: 2,
                        borderRadius: 1
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        {comportamiento.tasaExitoProyecciones > comportamiento.historialPagos.tasaPuntualidad ? (
                          <>
                            <ArrowUpward color="success" />
                            <Typography variant="body2">
                              Tendencia de mejora en cumplimiento de proyecciones
                            </Typography>
                          </>
                        ) : (
                          <>
                            <ArrowDownward color="error" />
                            <Typography variant="body2">
                              Tendencia de deterioro en cumplimiento de proyecciones
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Stack>

            {/* Recommendations */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Lightbulb color="warning" />
                <Typography variant="subtitle1" fontWeight="medium">Recomendaciones</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {comportamiento.recomendaciones.map((recomendacion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrendingUp color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={recomendacion} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};