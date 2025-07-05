import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Slider,
  Divider,
  FormControlLabel,
  Switch,
  Grid,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome,
  TipsAndUpdates,
  HelpOutline,
  Refresh
} from '@mui/icons-material';
import { ClienteAutocomplete } from '../../../shared/components/ClienteAutocomplete';
import type { ProyeccionAutomaticaDto } from '../../types';

interface ProyeccionAutomaticaFormProps {
  onGenerate: (config: ProyeccionAutomaticaDto) => void;
  loading?: boolean;
  initialValues?: ProyeccionAutomaticaDto;
}

export const ProyeccionAutomaticaForm: React.FC<ProyeccionAutomaticaFormProps> = ({
  onGenerate,
  loading = false,
  initialValues
}) => {
  const [formData, setFormData] = useState<ProyeccionAutomaticaDto>(initialValues || {
    noCliente: undefined,
    diasFuturo: 30,
    algoritmo: 'patron_historico',
    confianzaMinima: 70
  });

  const handleClienteChange = (clienteId: number | null) => {
    setFormData(prev => ({ ...prev, noCliente: clienteId || undefined }));
  };

  const handleAlgoritmoChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setFormData(prev => ({ ...prev, algoritmo: event.target.value as string }));
  };

  const handleSliderChange = (name: string) => (event: Event, newValue: number | number[]) => {
    setFormData(prev => ({ ...prev, [name]: newValue as number }));
  };

  const handleInputChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenerate = () => {
    onGenerate(formData);
  };

  const handleReset = () => {
    setFormData({
      noCliente: undefined,
      diasFuturo: 30,
      algoritmo: 'patron_historico',
      confianzaMinima: 70
    });
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <TipsAndUpdates color="primary" />
            <Typography variant="h6">Configurar Proyección Automática</Typography>
          </Box>
        }
        action={loading && <LinearProgress sx={{ width: 100, mt: 2 }} />}
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {/* Cliente */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle1">Selección de Cliente</Typography>
              <Tooltip title="Deja vacío para generar proyecciones para todos los clientes activos">
                <HelpOutline fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <ClienteAutocomplete
              value={formData.noCliente || ''}
              onChange={handleClienteChange}
              placeholder="Seleccionar cliente (opcional)"
              helperText="Deja vacío para generar proyecciones para todos los clientes activos"
            />
          </Grid>

          {/* Algoritmo */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Algoritmo de Predicción</InputLabel>
              <Select
                value={formData.algoritmo}
                onChange={handleAlgoritmoChange}
                label="Algoritmo de Predicción"
              >
                <MenuItem value="patron_historico">Patrón Histórico (Básico)</MenuItem>
                <MenuItem value="regresion_lineal">Regresión Lineal (Avanzado)</MenuItem>
                <MenuItem value="promedio_movil">Promedio Móvil</MenuItem>
                <MenuItem value="suavizado_exponencial">Suavizado Exponencial (Holt-Winters)</MenuItem>
                <MenuItem value="ml_basico">ML Básico</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Días Futuro */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
              Días hacia el futuro: {formData.diasFuturo}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Slider
                value={formData.diasFuturo}
                min={1}
                max={90}
                step={1}
                onChange={handleSliderChange('diasFuturo')}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: '1d' },
                  { value: 30, label: '30d' },
                  { value: 60, label: '60d' },
                  { value: 90, label: '90d' },
                ]}
              />
              <TextField
                value={formData.diasFuturo}
                onChange={handleInputChange('diasFuturo')}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 90,
                  type: 'number',
                }}
                sx={{ width: '80px' }}
              />
            </Box>
          </Grid>

          {/* Confianza Mínima */}
          <Grid item xs={12}>
            <Typography gutterBottom>
              Confianza mínima requerida: {formData.confianzaMinima}%
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Slider
                value={formData.confianzaMinima}
                min={0}
                max={100}
                step={5}
                onChange={handleSliderChange('confianzaMinima')}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 70, label: '70%' },
                  { value: 100, label: '100%' },
                ]}
              />
              <TextField
                value={formData.confianzaMinima}
                onChange={handleInputChange('confianzaMinima')}
                inputProps={{
                  step: 5,
                  min: 0,
                  max: 100,
                  type: 'number',
                }}
                InputProps={{
                  endAdornment: '%',
                }}
                sx={{ width: '80px' }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          startIcon={<Refresh />}
          onClick={handleReset}
          disabled={loading}
        >
          Restablecer
        </Button>
        <Button
          startIcon={<AutoAwesome />}
          variant="contained"
          color="primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          Generar Proyecciones
        </Button>
      </CardActions>
    </Card>
  );
};