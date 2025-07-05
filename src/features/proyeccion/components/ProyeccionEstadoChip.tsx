import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { EstadoProyeccion } from '../types';

interface ProyeccionEstadoChipProps extends Omit<ChipProps, 'label' | 'color'> {
  estado: EstadoProyeccion;
}

export const ProyeccionEstadoChip: React.FC<ProyeccionEstadoChipProps> = ({ estado, ...props }) => {
  // Define colors based on the estado
  const getChipColor = (estado: EstadoProyeccion): ChipProps['color'] => {
    switch (estado) {
      case EstadoProyeccion.PENDIENTE:
        return 'primary';
      case EstadoProyeccion.CUMPLIDA:
        return 'success';
      case EstadoProyeccion.CANCELADA:
        return 'error';
      case EstadoProyeccion.VENCIDA:
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={estado} 
      color={getChipColor(estado)} 
      size="small"
      {...props}
    />
  );
};