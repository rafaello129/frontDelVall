import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Grid,
  Avatar,
  Tooltip,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  AutoAwesome,
  AddCircle,
  InfoOutlined,
  PriorityHigh,
  AddTask,
  Percent,
  CalendarMonth,
  AttachMoney,
  Lightbulb,
  AccountBalance,
  Payment
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '@mui/material/styles';
import type { ProyeccionAutomatica } from '../../types';

interface ProyeccionesAutomaticasListProps {
  proyeccionesAutomaticas: ProyeccionAutomatica[];
  onCreateSelected?: (proyeccion: ProyeccionAutomatica) => void;
  onCreateAll?: () => void;
  loading?: boolean;
}

export const ProyeccionesAutomaticasList: React.FC<ProyeccionesAutomaticasListProps> = ({
  proyeccionesAutomaticas,
  onCreateSelected,
  onCreateAll,
  loading = false
}) => {
  const theme = useTheme();

  // Function to determine confianza level color
  const getConfianzaColor = (confianza: number) => {
    if (confianza >= 80) return theme.palette.success.main;
    if (confianza >= 60) return theme.palette.info.main;
    if (confianza >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Card elevation={2}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <AutoAwesome color="primary" />
            <Typography variant="h6">Proyecciones Generadas por IA</Typography>
          </Box>
        }
        subheader={`${proyeccionesAutomaticas.length} proyecciones automáticas generadas`}
        action={loading && <LinearProgress sx={{ width: 100, mt: 2 }} />}
      />
      <Divider />
      <CardContent sx={{ maxHeight: '60vh', overflowY: 'auto', p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        ) : proyeccionesAutomaticas.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4} px={2}>
            <AutoAwesome color="disabled" sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No hay proyecciones automáticas generadas.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              Utiliza el formulario para generar nuevas proyecciones basadas en el análisis de patrones de pago.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ p: 2 }}>
            {proyeccionesAutomaticas.map((proyeccion, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: proyeccion.alerta 
                      ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.warning.light}22 100%)`
                      : undefined
                  }}
                >
                  {/* Confianza Indicator */}
                  <Box position="absolute" top={16} right={16}>
                    <Tooltip title="Nivel de confianza">
                      <Box display="flex" alignItems="center">
                        <Percent fontSize="small" sx={{ color: getConfianzaColor(proyeccion.confianza) }} />
                        <Typography 
                          variant="body2" 
                          sx={{ fontWeight: 'bold', color: getConfianzaColor(proyeccion.confianza) }}
                        >
                          {proyeccion.confianza.toFixed(0)}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                  
                  {/* Cliente Info */}
                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        fontSize: 14
                      }}
                    >
                      {proyeccion.noCliente.toString().substring(0, 2)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" noWrap>
                        Cliente #{proyeccion.noCliente}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proyeccion.metodologia}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Main Data */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CalendarMonth fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Fecha:
                        </Typography>
                      </Box>
                      <Typography variant="body1" pl={3}>
                        {format(new Date(proyeccion.fechaProyectada), 'dd MMM yyyy', { locale: es })}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AttachMoney fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Monto:
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium" pl={3}>
                        ${proyeccion.monto.toLocaleString('es-MX')}
                      </Typography>
                    </Grid>
                    
                    {proyeccion.bancoSugerido && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccountBalance fontSize="small" color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            Banco:
                          </Typography>
                        </Box>
                        <Typography variant="body1" pl={3}>
                          {proyeccion.bancoSugerido}
                        </Typography>
                      </Grid>
                    )}
                    
                    {proyeccion.tipoPagoSugerido && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Payment fontSize="small" color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            Tipo:
                          </Typography>
                        </Box>
                        <Typography variant="body1" pl={3}>
                          {proyeccion.tipoPagoSugerido}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  
                  {/* Alert if exists */}
                  {proyeccion.alerta && (
                    <Box 
                      mt={2} 
                      p={1} 
                      borderRadius={1} 
                      bgcolor={theme.palette.warning.light + '22'}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <PriorityHigh fontSize="small" color="warning" />
                      <Typography variant="body2" color="text.secondary">
                        {proyeccion.alerta}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Factores considerados */}
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Lightbulb fontSize="small" />
                      Factores considerados:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {proyeccion.factoresConsiderados.slice(0, 3).map((factor, i) => (
                        <Chip 
                          key={i} 
                          label={factor} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                      {proyeccion.factoresConsiderados.length > 3 && (
                        <Tooltip title={proyeccion.factoresConsiderados.slice(3).join(', ')}>
                          <Chip 
                            label={`+${proyeccion.factoresConsiderados.length - 3}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Create button */}
                  <Box mt="auto" pt={2} display="flex" justifyContent="flex-end">
                    <Button
                      startIcon={<AddTask />}
                      variant="contained"
                      size="small"
                      color="primary"
                      disabled={!onCreateSelected}
                      onClick={() => onCreateSelected && onCreateSelected(proyeccion)}
                    >
                      Crear Proyección
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
      {proyeccionesAutomaticas.length > 0 && onCreateAll && (
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
            startIcon={<AddCircle />}
            variant="contained"
            color="primary"
            onClick={onCreateAll}
            disabled={loading}
          >
            Crear Todas las Proyecciones
          </Button>
        </CardActions>
      )}
    </Card>
  );
};