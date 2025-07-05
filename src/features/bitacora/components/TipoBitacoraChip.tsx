import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { TipoBitacora } from '../types';

interface TipoBitacoraChipProps extends Omit<ChipProps, 'label' | 'color'> {
  tipo: TipoBitacora;
}

export const TipoBitacoraChip: React.FC<TipoBitacoraChipProps> = ({ tipo, ...props }) => {
  // Define colors based on the tipo
  const getChipColor = (tipo: TipoBitacora): ChipProps['color'] => {
    switch (tipo) {
      case TipoBitacora.COMENTARIO:
        return 'default';
      case TipoBitacora.CONTACTO:
        return 'primary';
      case TipoBitacora.SEGUIMIENTO:
        return 'info';
      case TipoBitacora.COMPROMISO:
        return 'success';
      case TipoBitacora.RECORDATORIO:
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={tipo} 
      color={getChipColor(tipo)} 
      size="small"
      {...props}
    />
  );
};