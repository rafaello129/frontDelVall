import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

import { Sucursal } from '../../shared/enums';

interface SucursalBadgeProps extends Omit<ChipProps, 'label' | 'color'> {
  sucursal: Sucursal;
}

export const SucursalBadge: React.FC<SucursalBadgeProps> = ({ sucursal, ...props }) => {
  // Define colores según la sucursal
  const getChipColor = (sucursal: Sucursal): ChipProps['color'] => {
    switch (sucursal) {
      case Sucursal.CANCUN:
        return 'info';
      case Sucursal.VALLARTA:
        return 'success';
      case Sucursal.CABOS:
        return 'warning';
      case Sucursal.ACAPULCO:
        return 'error';
      case Sucursal.TEPEAPULCO:
        return 'secondary';
      case Sucursal.BLUELINE:
        return 'primary';
      case Sucursal.YUCATAN:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={sucursal} 
      color={getChipColor(sucursal)} 
      size="small"
      {...props}
    />
  );
};