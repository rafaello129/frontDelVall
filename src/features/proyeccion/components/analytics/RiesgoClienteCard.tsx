import React from 'react';
import { 
  Card, 
  CardHeader,
  CardContent,
  Typography, 
  Box, 
  Divider, 
  Stack,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Chip
} from '@mui/material';
import {
  Security,
  Warning,
  Error,
  CheckCircle,
  ReportProblem,
  MoneyOff,
  Lightbulb,
  Insights
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer
} from 'recharts';
import type { EvaluacionRiesgo } from '../../types';

interface RiesgoClienteCardProps {
  evaluacionRiesgo: EvaluacionRiesgo;
  loading?: boolean;
}

export const RiesgoClienteCard: React.FC<RiesgoClienteCardProps> = ({ 
  evaluacionRiesgo, 
  loading = false 
}) => {
  const theme = useTheme();

  const getNivelRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return theme.palette.success.main;
      case 'medio': return theme.palette.warning.main;
      case 'alto': return theme.palette.error.main;
      case 'critico': return theme.palette.error.dark;
      default: return theme.palette.primary.main;
    }
  };

  const getNivelRiesgoIcon = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return <CheckCircle color="success" />;
      case 'medio': return <Warning color="warning" />;
      case 'alto': return <Error color="error" />;
      case 'critico': return <ReportProblem sx={{ color: theme.palette.error.dark }} />;
      default: return <Security color="primary" />;
    }
  };

  // Data for the radar chart
  const radarData = [
    {
      subject: 'Retraso',
      value: evaluacionRiesgo.evaluacionRiesgo.probabilidadRetraso,
      fullMark: 100,
    },
    {
      subject: 'Incumplimiento',
      value: evaluacionRiesgo.evaluacionRiesgo.probabilidadIncumplimiento,
      fullMark: 100,
    },
    {
      subject: 'Factores Riesgo',
      value: evaluacionRiesgo.evaluacionRiesgo.factoresRiesgo.length * 20, // Scale based on number of factors
      fullMark: 100,
    },
    {
      subject: 'Nivel Riesgo',
      value: evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo === 'bajo' ? 25 : 
             evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo === 'medio' ? 50 :
             evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo === 'alto' ? 75 : 100,
      fullMark: 100,
    },
  ];

  return (
    <Card elevation={2}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Security color="primary" />
            <Typography variant="h6">Evaluación de Riesgo Crediticio</Typography>
          </Box>
        }
        subheader={`Cliente: ${evaluacionRiesgo.razonSocial}`}
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
            {/* Risk level and radar chart */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Nivel de Riesgo - Feature Box */}
              <Box flex={{ xs: 1, md: 0.4 }}>
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
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${getNivelRiesgoColor(evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo)}22 100%)`
                  }}
                >
                {getNivelRiesgoIcon(evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo)}
                <Typography variant="h6" align="center" gutterBottom mt={1}>
                  Nivel de Riesgo: 
                  <Box component="span" sx={{ 
                    ml: 1,
                    color: getNivelRiesgoColor(evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo),
                    fontWeight: 'bold'
                  }}>
                    {evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo.toUpperCase()}
                  </Box>
                </Typography>
                
                <Box mt={2} width="100%">
                  <Typography variant="body2" gutterBottom>
                    Calificación de Riesgo
                  </Typography>
                  <Rating
                    value={
                      evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo === 'bajo' ? 5 :
                      evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo === 'medio' ? 3 :
                      evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo === 'alto' ? 2 : 1
                    }
                    readOnly
                    max={5}
                    icon={<Security fontSize="inherit" />}
                    emptyIcon={<Security fontSize="inherit" />}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: getNivelRiesgoColor(evaluacionRiesgo.evaluacionRiesgo.nivelRiesgo)
                      },
                      '& .MuiRating-iconEmpty': {
                        color: theme.palette.grey[300]
                      }
                    }}
                  />
                </Box>
                </Paper>
              </Box>
              
              {/* Radar Chart */}
              <Box flex={{ xs: 1, md: 0.6 }}>
                <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Análisis de Riesgo
                  </Typography>
                  <Box height={220}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="70%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Riesgo"
                        dataKey="value"
                        stroke={theme.palette.primary.main}
                        fill={theme.palette.primary.main}
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>
            </Stack>

            {/* Risk probabilities and factors */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Probabilidades */}
              <Box flex={1}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Insights color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">Probabilidades de Riesgo</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2">Probabilidad de Retraso</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {evaluacionRiesgo.evaluacionRiesgo.probabilidadRetraso.toFixed(1)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={evaluacionRiesgo.evaluacionRiesgo.probabilidadRetraso}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 
                              evaluacionRiesgo.evaluacionRiesgo.probabilidadRetraso > 66 ? theme.palette.error.main :
                              evaluacionRiesgo.evaluacionRiesgo.probabilidadRetraso > 33 ? theme.palette.warning.main :
                              theme.palette.success.main
                          }
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2">Probabilidad de Incumplimiento</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {evaluacionRiesgo.evaluacionRiesgo.probabilidadIncumplimiento.toFixed(1)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={evaluacionRiesgo.evaluacionRiesgo.probabilidadIncumplimiento}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 
                              evaluacionRiesgo.evaluacionRiesgo.probabilidadIncumplimiento > 66 ? theme.palette.error.main :
                              evaluacionRiesgo.evaluacionRiesgo.probabilidadIncumplimiento > 33 ? theme.palette.warning.main :
                              theme.palette.success.main
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            
              {/* Factores de riesgo */}
              <Box flex={1}>
                <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <MoneyOff color="error" />
                    <Typography variant="subtitle1" fontWeight="medium">Factores de Riesgo</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {evaluacionRiesgo.evaluacionRiesgo.factoresRiesgo.map((factor, index) => (
                      <Chip 
                        key={index} 
                        label={factor} 
                        color="error" 
                        variant="outlined" 
                        size="small"
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            </Stack>
            {/* Recomendaciones */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Lightbulb color="warning" />
                <Typography variant="subtitle1" fontWeight="medium">Recomendaciones de Acción</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {evaluacionRiesgo.recomendacionesAccion.map((recomendacion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {recomendacion.includes('INMEDIATA') ? (
                        <Error color="error" fontSize="small" />
                      ) : (
                        <Insights color="primary" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={recomendacion} 
                      primaryTypographyProps={{ 
                        fontWeight: recomendacion.includes('INMEDIATA') ? 'bold' : 'normal'
                      }} 
                    />
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