import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Divider,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Avatar
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PagoExterno } from '../types';
import { formatCurrency } from '../../../utils/format';
import { TipoPagoExternoChip } from './TipoPagoExternoChip';
import {
  AccountBalance as BankIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Event as EventIcon
} from '@mui/icons-material';

interface PagoExternoCardProps {
  pagoExterno: PagoExterno;
  onClick: (id: number) => void;
}

export const PagoExternoCard: React.FC<PagoExternoCardProps> = ({ pagoExterno, onClick }) => {
  const theme = useTheme();
  
  // Get client initial for avatar
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Determine card border color based on tipo
  const getBorderColor = () => {
    if (pagoExterno.tipo.includes('COBROS')) {
      return theme.palette.primary.main;
    } else if (pagoExterno.tipo.includes('PAGOS')) {
      return theme.palette.secondary.main;
    } else {
      return theme.palette.info.main;
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: '4px solid', 
        borderLeftColor: getBorderColor(),
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)'
        }
      }}
      elevation={2}
    >
      <CardActionArea 
        onClick={() => onClick(pagoExterno.id)}
        sx={{
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.03)
          }
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 2 
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar 
                sx={{ 
                  bgcolor: alpha(getBorderColor(), 0.1),
                  color: getBorderColor(),
                  fontWeight: 'bold',
                  width: 40,
                  height: 40
                }}
              >
                {pagoExterno.cliente 
                  ? getInitial(pagoExterno.cliente.comercial || pagoExterno.cliente.razonSocial)
                  : getInitial(pagoExterno.nombrePagador || 'P')}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {formatCurrency(pagoExterno.monto)}
                </Typography>
                {pagoExterno.montoDolares && (
                  <Typography variant="caption" fontWeight={500} color="primary.main">
                    USD {formatCurrency(pagoExterno.montoDolares)}
                  </Typography>
                )}
              </Box>
            </Stack>
            <TipoPagoExternoChip tipo={pagoExterno.tipo} />
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" color="action" />
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {pagoExterno.cliente 
                  ? <Tooltip title={pagoExterno.cliente.razonSocial}>
                      <span>{pagoExterno.cliente.comercial || pagoExterno.cliente.razonSocial}</span>
                    </Tooltip>
                  : <span>{pagoExterno.nombrePagador || 'Sin pagador'}</span>
                }
              </Typography>
            </Stack>
          </Box>
          
          {pagoExterno.concepto && (
            <Box sx={{ mb: 1.5 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {pagoExterno.concepto}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mt: 2,
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5 
            }}>
              <EventIcon fontSize="small" sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {format(new Date(pagoExterno.fechaPago), 'd MMM yyyy', { locale: es })}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              {pagoExterno.sucursal && (
                <Tooltip title={`Sucursal: ${pagoExterno.sucursal}`}>
                  <Chip 
                    icon={<LocationIcon sx={{ fontSize: '0.8rem !important' }} />}
                    label={pagoExterno.sucursal} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      height: 24,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.7rem'
                      }
                    }}
                  />
                </Tooltip>
              )}
              
              <Tooltip title={`Banco: ${pagoExterno.banco?.nombre || `Banco ${pagoExterno.bancoId}`}`}>
                <Chip 
                  icon={<BankIcon sx={{ fontSize: '0.8rem !important' }} />}
                  label={pagoExterno.banco?.nombre || `Banco ${pagoExterno.bancoId}`} 
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ 
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.7rem'
                    }
                  }}
                />
              </Tooltip>
            </Stack>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};