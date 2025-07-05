import React from 'react';
import { 
  Card, 
  CardHeader,
  CardContent,
  Typography, 
  Box, 
  Divider, 
  Grid,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  InsightsOutlined,
  ArrowUpward,
  ArrowDownward,
  TrendingFlat,
  LightbulbOutlined,
  CalendarMonth
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { AnalisisEstacionalidad } from '../../types';

interface EstacionalidadChartProps {
  analisisEstacionalidad: AnalisisEstacionalidad;
  loading?: boolean;
}

export const EstacionalidadChart: React.FC<EstacionalidadChartProps> = ({ 
  analisisEstacionalidad, 
  loading = false 
}) => {
  const theme = useTheme();

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente': return <ArrowUpward color="success" />;
      case 'decreciente': return <ArrowDownward color="error" />;
      case 'estable': return <TrendingFlat color="primary" />;
      default: return <TrendingFlat color="primary" />;
    }
  };

  // Prepare data for the bar chart
  const barChartData = analisisEstacionalidad.analisisEstacional.meses.map(mes => ({
    nombre: mes.nombre.substring(0, 3),
    promedioMonto: mes.promedioMonto,
    factor: mes.factorEstacional
  }));

  // Find months with highest and lowest seasonality
  const maxMes = [...analisisEstacionalidad.analisisEstacional.meses].sort((a, b) => b.factorEstacional - a.factorEstacional)[0];
  const minMes = [...analisisEstacionalidad.analisisEstacional.meses].sort((a, b) => a.factorEstacional - b.factorEstacional)[0];

  return (
    <Card elevation={2}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <InsightsOutlined color="primary" />
            <Typography variant="h6">Análisis de Estacionalidad</Typography>
          </Box>
        }
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
            {/* Tendencia Anual - Feature Box */}
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
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${
                    analisisEstacionalidad.analisisEstacional.tendenciaAnual === 'creciente' ? theme.palette.success.light : 
                    analisisEstacionalidad.analisisEstacional.tendenciaAnual === 'decreciente' ? theme.palette.error.light : 
                    theme.palette.primary.light
                  }22 100%)`
                }}
              >
                {getTendenciaIcon(analisisEstacionalidad.analisisEstacional.tendenciaAnual)}
                <Typography variant="h6" align="center" gutterBottom mt={1}>
                  Tendencia Anual: {' '}
                  <span style={{ 
                    fontWeight: 'bold',
                    color: analisisEstacionalidad.analisisEstacional.tendenciaAnual === 'creciente' ? theme.palette.success.main : 
                          analisisEstacionalidad.analisisEstacional.tendenciaAnual === 'decreciente' ? theme.palette.error.main : 
                          theme.palette.primary.main
                  }}>
                    {analisisEstacionalidad.analisisEstacional.tendenciaAnual.toUpperCase()}
                  </span>
                </Typography>
                
                <Box width="100%" mt={2}>
                  <Typography variant="body2" gutterBottom>
                    Variabilidad Estacional
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, analisisEstacionalidad.analisisEstacional.variabilidad)} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5, 
                        flexGrow: 1,
                        bgcolor: theme.palette.grey[300],
                        '& .MuiLinearProgress-bar': {
                          bgcolor: analisisEstacionalidad.analisisEstacional.variabilidad < 15 
                            ? theme.palette.success.main 
                            : analisisEstacionalidad.analisisEstacional.variabilidad < 30 
                              ? theme.palette.warning.main 
                              : theme.palette.error.main
                        }
                      }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {analisisEstacionalidad.analisisEstacional.variabilidad.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" mt={2} gap={1}>
                  <CalendarMonth color="primary" fontSize="small" />
                  <Typography variant="body2">
                    {analisisEstacionalidad.analisisEstacional.variabilidad > 30 ? 
                      'Alta variabilidad entre meses' :
                      analisisEstacionalidad.analisisEstacional.variabilidad > 15 ? 
                      'Variabilidad moderada entre meses' : 
                      'Baja variabilidad entre meses'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Chart */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Estacionalidad Mensual
                </Typography>
                <Box height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" />
                      <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                      <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                      <RechartsTooltip formatter={(value, name) => [
                        name === 'promedioMonto' ? `$${value.toLocaleString('es-MX')}` : value.toFixed(2), 
                        name === 'promedioMonto' ? 'Monto Promedio' : 'Factor Estacional'
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="promedioMonto" name="Monto Promedio" fill={theme.palette.primary.main} />
                      <Line yAxisId="right" type="monotone" dataKey="factor" name="Factor Estacional" stroke={theme.palette.secondary.main} strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Key Insights */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <InsightsOutlined color="primary" />
                  <Typography variant="subtitle1">Insights Clave</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  {analisisEstacionalidad.insights.map((insight, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InsightsOutlined fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={insight} />
                    </ListItem>
                  ))}
                </List>

                <Box mt={2} p={1} bgcolor={theme.palette.background.default} borderRadius={1}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ArrowUpward fontSize="small" color="success" />
                      <Typography variant="body2">
                        Mejor mes: {maxMes.nombre}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`Factor: ${maxMes.factorEstacional.toFixed(2)}`} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ArrowDownward fontSize="small" color="error" />
                      <Typography variant="body2">
                        Peor mes: {minMes.nombre}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`Factor: ${minMes.factorEstacional.toFixed(2)}`} 
                      size="small" 
                      color="error" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Recommendations */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LightbulbOutlined color="warning" />
                  <Typography variant="subtitle1">Recomendaciones</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  {analisisEstacionalidad.recomendaciones.map((recomendacion, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LightbulbOutlined fontSize="small" color="warning" />
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