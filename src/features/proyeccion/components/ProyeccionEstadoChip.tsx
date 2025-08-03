import React from 'react';
import { Chip, type ChipProps } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { EstadoProyeccion } from '../types';

interface ProyeccionEstadoChipProps extends Omit<ChipProps, 'label'> {
  estado: EstadoProyeccion;
}

export const ProyeccionEstadoChip: React.FC<ProyeccionEstadoChipProps> = ({ estado, ...props }) => {
  // Determine color and icon based on status
  let color: ChipProps['color'] = 'default';
  let icon = <ScheduleIcon />;

  switch (estado) {
    case EstadoProyeccion.PENDIENTE:
      color = 'info';
      icon = <ScheduleIcon />;
      break;
    case EstadoProyeccion.CUMPLIDA:
      color = 'success';
      icon = <CheckCircleIcon />;
      break;
    case EstadoProyeccion.VENCIDA:
      color = 'error';
      icon = <WarningIcon />;
      break;
    case EstadoProyeccion.CANCELADA:
      color = 'default';
      icon = <CancelIcon />;
      break;
  }

  return (
    <Chip
      label={estado}
      color={color}
      icon={icon}
      size="small"
      {...props}
    />
  );
};