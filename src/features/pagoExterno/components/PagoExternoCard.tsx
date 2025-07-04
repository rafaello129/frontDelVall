import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PagoExterno } from '../types';
import { formatCurrency } from '../../../utils/format';
import { TipoPagoExternoChip } from './TipoPagoExternoChip';

interface PagoExternoCardProps {
  pagoExterno: PagoExterno;
  onClick: (id: number) => void;
}

export const PagoExternoCard: React.FC<PagoExternoCardProps> = ({ pagoExterno, onClick }) => {
  return (
    <Card sx={{ mb: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
      <CardActionArea onClick={() => onClick(pagoExterno.id)}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h6" component="div">
                {formatCurrency(pagoExterno.monto)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {pagoExterno.montoDolares && `USD ${formatCurrency(pagoExterno.montoDolares)}`}
              </Typography>
            </Box>
            <TipoPagoExternoChip tipo={pagoExterno.tipo} />
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {pagoExterno.cliente 
                ? `Cliente: ${pagoExterno.cliente.comercial || pagoExterno.cliente.razonSocial}`
                : `Pagador: ${pagoExterno.nombrePagador || 'No especificado'}`
              }
            </Typography>
          </Box>
          
          {pagoExterno.concepto && (
            <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
              {pagoExterno.concepto}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(pagoExterno.fechaPago), 'dd/MM/yyyy', { locale: es })}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {pagoExterno.sucursal && (
                <Chip 
                  label={pagoExterno.sucursal} 
                  size="small" 
                  variant="outlined"
                />
              )}
              <Chip 
                label={pagoExterno.banco?.nombre || `Banco ${pagoExterno.bancoId}`} 
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};