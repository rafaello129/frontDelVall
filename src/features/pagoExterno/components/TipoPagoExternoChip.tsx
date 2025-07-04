import React from 'react';
import { Chip,  } from '@mui/material';
import type {  ChipProps } from '@mui/material';

import { TipoPagoExterno } from '../../shared/enums';

interface TipoPagoExternoChipProps extends Omit<ChipProps, 'label' | 'color'> {
  tipo: TipoPagoExterno;
}

export const TipoPagoExternoChip: React.FC<TipoPagoExternoChipProps> = ({ tipo, ...props }) => {
  // Define colores y labels según el tipo
  const getChipProps = (tipo: TipoPagoExterno): { color: ChipProps['color']; label: string } => {
    switch (tipo) {
      case TipoPagoExterno.COBROS_EFECTIVO_RIVIERA:
        return { color: 'primary', label: 'Cobros Efectivo Riviera' };
      case TipoPagoExterno.COBROS_EFECTIVO_NORTE:
        return { color: 'secondary', label: 'Cobros Efectivo Norte' };
      case TipoPagoExterno.COBROS_PACIFICO_BANCO:
        return { color: 'info', label: 'Cobros Pacífico Banco' };
      case TipoPagoExterno.COBROS_PACIFICO_EFECTIVO:
        return { color: 'success', label: 'Cobros Pacífico Efectivo' };
      case TipoPagoExterno.COBRANZA_NORTE_BANCO:
        return { color: 'warning', label: 'Cobranza Norte Banco' };
      case TipoPagoExterno.COBROS_EFECTIVO_CDMX:
        return { color: 'error', label: 'Cobros Efectivo CDMX' };
      case TipoPagoExterno.CUENTA_NASSIM:
        return { color: 'default', label: 'Cuenta Nassim' };
      default:
        return { color: 'default', label: tipo };
    }
  };

  const { color, label } = getChipProps(tipo);

  return <Chip color={color} label={label} size="small" {...props} />;
};