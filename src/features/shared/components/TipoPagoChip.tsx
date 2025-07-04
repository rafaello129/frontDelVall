import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

import { TipoPago } from '../../shared/enums';

interface TipoPagoChipProps extends Omit<ChipProps, 'label' | 'color'> {
  tipoPago: TipoPago;
}

export const TipoPagoChip: React.FC<TipoPagoChipProps> = ({ tipoPago, ...props }) => {
  // Define colores según el tipo de pago
  const getChipColor = (tipo: TipoPago): ChipProps['color'] => {
    switch (tipo) {
      case TipoPago.EFECTIVO:
        return 'success';
      case TipoPago.CHEQUE:
        return 'warning';
      case TipoPago.TRANSFERENCIA:
        return 'info';
      case TipoPago.TARJETA:
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={tipoPago} 
      color={getChipColor(tipoPago)} 
      size="small"
      {...props}
    />
  );
};