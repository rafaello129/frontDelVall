import React from 'react';
import { 
  Card, 
  CardHeader,
  CardContent,
  Typography, 
  Box, 
  Divider, 
  Chip,
  Grid,
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
          <Grid container spacing={3}>
            {/* Main metrics */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 2, 
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${getRiesgoColor(comportamiento.riesgo)}22 100%)`
                }}
              >
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                  {getRiesgoIcon(comportamiento.riesgo)}
                  <Typography variant="h6" gutterBottom>
                    Nivel de Riesgo: <strong style={{ color: getRiesgoColor(comportamiento.riesgo) }}>
                      {comportamiento.riesgo.toUpperCase()}
                    </strong>
                  </Typography>
                  
                  <Box width="100%" mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tasa de Puntualidad
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
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
                    </Box>
                  </Box>
                  
                  <Box width="100%" mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Éxito de Proyecciones
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
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
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Chart */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
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
            </Grid>

            {/* Historical metrics */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BarChart color="primary" />
                  <Typography variant="subtitle1">Historial de Pagos</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total de pagos
                    </Typography>
                    <Typography variant="h6">
                      {comportamiento.historialPagos.totalPagos}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Monto total
                    </Typography>
                    <Typography variant="h6">
                      ${comportamiento.historialPagos.montoTotal.toLocaleString('es-MX')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Monto promedio
                    </Typography>
                    <Typography variant="h6">
                      ${comportamiento.historialPagos.montoPromedio.toLocaleString('es-MX')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Días retraso promedio
                    </Typography>
                    <Typography variant="h6">
                      {comportamiento.historialPagos.diasRetrasoPromedio.toFixed(1)} días
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Proyecciones metrics */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PieChart color="primary" />
                  <Typography variant="subtitle1">Proyecciones</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Proyecciones creadas
                    </Typography>
                    <Typography variant="h6">
                      {comportamiento.proyeccionesCreadas}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Proyecciones cumplidas
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="h6">
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
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1}
                      sx={{
                        bgcolor: theme.palette.background.default,
                        p: 1,
                        borderRadius: 1
                      }}
                    >
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
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Recommendations */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Lightbulb color="warning" />
                  <Typography variant="subtitle1">Recomendaciones</Typography>
                </Box>
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
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};