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
  Stack,
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
import type { SelectChangeEvent } from '@mui/material/Select';

// Usa el tipo correcto del DTO:
type Algoritmo =
  | 'patron_historico'
  | 'regresion_lineal'
  | 'promedio_movil'
  | 'suavizado_exponencial'
  | 'ml_basico';

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

  // CORRECCIÓN: Usa el tipo específico de SelectChangeEvent
  const handleAlgoritmoChange = (event: SelectChangeEvent<Algoritmo>) => {
    setFormData(prev => ({
      ...prev,
      algoritmo: event.target.value as Algoritmo
    }));
  };

  const handleSliderChange = (name: keyof ProyeccionAutomaticaDto) => (
    _event: Event,
    newValue: number | number[]
  ) => {
    setFormData(prev => ({ ...prev, [name]: newValue as number }));
  };

  const handleInputChange = (name: keyof ProyeccionAutomaticaDto) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        <Stack spacing={3}>
          {/* Cliente */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight="medium">Selección de Cliente</Typography>
              <Tooltip title="Deja vacío para generar proyecciones para todos los clientes activos">
                <HelpOutline fontSize="small" color="action" />
              </Tooltip>
            </Stack>
            <ClienteAutocomplete
              value={formData.noCliente || ''}
              onChange={handleClienteChange}
              helperText="Deja vacío para generar proyecciones para todos los clientes activos"
            />
          </Box>

          {/* Algoritmo y Días Futuro */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3}
          >
            <Box flex={1}>
              <FormControl fullWidth>
                <InputLabel>Algoritmo de Predicción</InputLabel>
                <Select<Algoritmo>
                  value={formData.algoritmo || ''}
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
            </Box>

            <Box flex={1}>
              <Typography gutterBottom fontWeight="medium">
                Días hacia el futuro: {formData.diasFuturo}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
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
                  sx={{ flex: 1 }}
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
              </Stack>
            </Box>
          </Stack>

          {/* Confianza Mínima */}
          <Box>
            <Typography gutterBottom fontWeight="medium">
              Confianza mínima requerida: {formData.confianzaMinima}%
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
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
                sx={{ flex: 1 }}
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
            </Stack>
          </Box>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 3, pt: 2 }}>
        <Button
          startIcon={<Refresh />}
          onClick={handleReset}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Restablecer
        </Button>
        <Button
          startIcon={<AutoAwesome />}
          variant="contained"
          color="primary"
          onClick={handleGenerate}
          disabled={loading}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 3
          }}
        >
          Generar Proyecciones
        </Button>
      </CardActions>
    </Card>
  );
};