import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  Divider,
  Stack,
  useTheme,
  alpha,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ErrorIcon from '@mui/icons-material/Error';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DescriptionIcon from '@mui/icons-material/Description';
import type { Factura } from '../types';

interface FacturaDetailProps {
  factura: Factura;
  formatCurrency: (value: number) => string;
}

const FacturaDetail: React.FC<FacturaDetailProps> = ({ factura, formatCurrency }) => {
  const theme = useTheme();
  
  const getStatusChipProps = (status: string) => {
    switch (status) {
      case 'Pagada':
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          color: 'success' as const,
          bgcolor: alpha(theme.palette.success.main, 0.8),
          textColor: '#fff'
        };
      case 'Vencida':
        return {
          icon: <ErrorIcon fontSize="small" />,
          color: 'error' as const,
          bgcolor: alpha(theme.palette.error.main, 0.8),
          textColor: '#fff'
        };
      case 'Cancelada':
        return {
          icon: <CancelIcon fontSize="small" />,
          color: 'default' as const,
          bgcolor: alpha(theme.palette.grey[500], 0.8),
          textColor: '#fff'
        };
      default:
        return {
          icon: <WarningIcon fontSize="small" />,
          color: 'warning' as const,
          bgcolor: alpha(theme.palette.warning.main, 0.8),
          textColor: '#fff'
        };
    }
  };

  const statusChipProps = getStatusChipProps(factura.estado);
  const isVencida = factura.estado === 'Vencida' || factura.isVencida;
  const isPagada = factura.estado === 'Pagada';

  return (
    <Box>
      {/* Header with Factura Number and Status */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.main"
            sx={{ letterSpacing: '-0.5px' }}
          >
            Factura #{factura.noFactura}
          </Typography>
          <Tooltip title="Número de factura asignado por el sistema">
            <InfoOutlinedIcon color="disabled" />
          </Tooltip>
        </Stack>
        <Chip
          icon={statusChipProps.icon}
          label={factura.estado}
          sx={{
            fontWeight: 600,
            px: 2,
            py: 2.5,
            fontSize: '1rem',
            letterSpacing: 0.2,
            borderRadius: 3,
            color: statusChipProps.textColor,
            bgcolor: statusChipProps.bgcolor,
          }}
        />
      </Box>
      
      {/* Main Information Cards */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        mb: 4,
      }}>
        {/* Cliente Card */}
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          flex: '1 1 auto',
          width: { xs: '100%', md: 'calc(50% - 12px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PersonIcon 
                  sx={{ 
                    fontSize: 24, 
                    color: theme.palette.primary.main 
                  }} 
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Cliente
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  #{factura.noCliente}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
              {factura.cliente?.razonSocial}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {factura.cliente?.comercial || ""}
            </Typography>
          </CardContent>
        </Card>
        
        {/* Fechas Card */}
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          flex: '1 1 auto',
          width: { xs: '100%', md: 'calc(50% - 12px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarTodayIcon 
                  sx={{ 
                    fontSize: 24, 
                    color: theme.palette.secondary.main 
                  }} 
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fechas
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 auto', width: { xs: '100%', sm: '50%' }, minWidth: '120px', pr: 2, mb: { xs: 2, sm: 0 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Emisión
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {format(new Date(factura.emision), 'PPP', { locale: es })}
                </Typography>
              </Box>
              
              <Box sx={{ flex: '1 1 auto', width: { xs: '100%', sm: '50%' }, minWidth: '120px' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vencimiento
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight={600}
                  color={isVencida ? 'error.main' : 'text.primary'}
                >
                  {format(new Date(factura.fechaVencimiento), 'PPP', { locale: es })}
                </Typography>
              </Box>
            </Box>
            
            {/* Time remaining or overdue */}
            <Box 
              sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: `1px dashed ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {isVencida ? (
                <ErrorIcon fontSize="small" color="error" />
              ) : isPagada ? (
                <DoneAllIcon fontSize="small" color="success" />
              ) : (
                <EventNoteIcon fontSize="small" color="action" />
              )}
              
              <Typography 
                variant="body2" 
                color={
                  isVencida 
                    ? 'error.main' 
                    : isPagada 
                      ? 'success.main' 
                      : 'text.secondary'
                }
                fontWeight={500}
              >
                {isPagada
                  ? 'Factura pagada'
                  : formatDistanceToNow(new Date(factura.fechaVencimiento), {
                      addSuffix: true,
                      locale: es,
                    })
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Financial Information Card */}
      <Card 
        sx={{ 
          borderRadius: 3, 
          mb: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AccountBalanceWalletIcon 
                sx={{ 
                  fontSize: 24, 
                  color: theme.palette.success.main
                }} 
              />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Información Financiera
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 3,
          }}>
            {/* Total Invoice */}
            <Box sx={{ 
              flex: '1 1 auto',
              width: { xs: '100%', sm: 'calc(33.33% - 16px)' },
              minWidth: '180px', 
              mb: { xs: 2, sm: 0 } 
            }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Factura
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {formatCurrency(factura.montoTotal)}
                </Typography>
              </Box>
            </Box>
            
            {/* Amount Paid */}
            <Box sx={{ 
              flex: '1 1 auto',
              width: { xs: '100%', sm: 'calc(33.33% - 16px)' },
              minWidth: '180px',
              mb: { xs: 2, sm: 0 } 
            }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Importe Pagado
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {formatCurrency(factura.montoTotal - factura.saldo)}
                </Typography>
              </Box>
            </Box>
            
            {/* Remaining Balance */}
            <Box sx={{ 
              flex: '1 1 auto',
              width: { xs: '100%', sm: 'calc(33.33% - 16px)' },
              minWidth: '180px',
            }}>
              <Box 
                sx={{ 
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(
                    factura.saldo > 0 
                      ? theme.palette.error.main 
                      : theme.palette.success.main,
                    0.08
                  ),
                  border: `1px solid ${alpha(
                    factura.saldo > 0 
                      ? theme.palette.error.main 
                      : theme.palette.success.main,
                    0.2
                  )}`
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Saldo Pendiente
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={factura.saldo > 0 ? 'error.main' : 'success.main'}
                >
                  {formatCurrency(factura.saldo)}
                </Typography>
              </Box>
            </Box>
          </Box>
            
          {/* Payment Status Info */}
          <Box sx={{ width: '100%', mt: 3 }}>
            <Box 
              sx={{ 
                mt: 1,
                p: 2, 
                borderRadius: 2,
                backgroundColor: alpha(
                  isPagada 
                    ? theme.palette.success.main 
                    : isVencida 
                      ? theme.palette.error.main
                      : theme.palette.warning.main,
                  0.07
                ),
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              {isPagada ? (
                <DoneAllIcon color="success" />
              ) : isVencida ? (
                <ErrorIcon color="error" />
              ) : (
                <WarningIcon color="warning" />
              )}
              
              <Typography variant="body2" fontWeight={500}>
                {isPagada
                  ? 'Esta factura ha sido pagada en su totalidad.'
                  : isVencida
                  ? `Esta factura está vencida y tiene un saldo pendiente de ${formatCurrency(factura.saldo)}.`
                  : `Esta factura está pendiente de pago y vence el ${format(new Date(factura.fechaVencimiento), 'PPP', { locale: es })}.`}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Concept Card */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DescriptionIcon 
                sx={{ 
                  fontSize: 24, 
                  color: theme.palette.info.main 
                }} 
              />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Concepto de la Factura
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              fontSize: '1.08rem',
              lineHeight: 1.65,
              borderColor: theme.palette.divider,
              backgroundColor: alpha(theme.palette.background.default, 0.5)
            }}
          >
            {factura.concepto}
          </Paper>
          
 
        </CardContent>
      </Card>
    </Box>
  );
};

export default FacturaDetail;