import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Chip,
  Button,
  Avatar,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  ArrowBack, 
  CalendarToday, 
  Category, 
  CurrencyExchange, 
  AccountBalance,
  Person,
  LocationOn,
  Payment,
  Subtitles,
  AccountBalanceWallet,
  SwapHoriz,
  History,
  CreditCard,
  AttachMoney
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PagoExterno } from '../types';
import { formatCurrency } from '../../../utils/format';
import { TipoPagoChip } from '../../shared/components/TipoPagoChip';
import { SucursalBadge } from '../../shared/components/SucursalBadge';
import { TipoPagoExternoChip } from './TipoPagoExternoChip';

interface PagoExternoDetailProps {
  pagoExterno: PagoExterno;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export const PagoExternoDetail: React.FC<PagoExternoDetailProps> = ({
  pagoExterno,
  onEdit,
  onDelete,
  onBack
}) => {
  const theme = useTheme();

  // Utilidad para renderizar una línea de detalles con icono
  const DetailItem = ({ 
    icon, 
    label, 
    value, 
    chip, 
    color 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value?: React.ReactNode; 
    chip?: React.ReactNode;
    color?: string;
  }) => (
    <Box sx={{ 
      mb: 2.5,
      display: 'flex',
      alignItems: 'flex-start'
    }}>
      <Avatar 
        sx={{ 
          width: 34, 
          height: 34, 
          bgcolor: alpha(color || theme.palette.primary.main, 0.12),
          color: color || theme.palette.primary.main,
          mr: 1.5,
          p: 0.5
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          sx={{ fontSize: '0.775rem', mb: 0.5 }}
        >
          {label}
        </Typography>
        {chip ? (
          chip
        ) : (
          <Typography variant="body2" sx={{ fontWeight: value ? 'normal' : 'light' }}>
            {value || 'No especificado'}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'visible',
        transition: 'box-shadow 0.3s ease',
        '&:hover': { boxShadow: 6 }
      }}
    >
      {/* Header con gradiente y acciones */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.85)} 100%)`,
          color: 'white',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ 
            bgcolor: alpha('#fff', 0.15), 
            color: 'white',
            mr: 2,
            width: 42,
            height: 42
          }}>
            <AttachMoney />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" fontWeight="500">
              Pago Externo #{pagoExterno.id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, mr: 0.5, opacity: 0.8 }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {format(new Date(pagoExterno.fechaPago), 'dd MMMM yyyy', { locale: es })}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="text"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ 
              bgcolor: alpha('#fff', 0.1), 
              '&:hover': { bgcolor: alpha('#fff', 0.2) },
              borderRadius: 1.5
            }}
          >
            Volver
          </Button>
          <Button
            variant="text"
            color="inherit"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{ 
              bgcolor: alpha('#fff', 0.1), 
              '&:hover': { bgcolor: alpha('#fff', 0.2) },
              borderRadius: 1.5
            }}
          >
            Editar
          </Button>
          <Button
            variant="text"
            color="inherit"
            startIcon={<Delete />}
            onClick={onDelete}
            sx={{ 
              bgcolor: alpha('#fff', 0.1), 
              '&:hover': { bgcolor: alpha('#fff', 0.2) },
              borderRadius: 1.5
            }}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Monto destacado */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3, 
            p: 2.5, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.success.light, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}
        >
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Monto Total
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h3" component="div" fontWeight="500" color="success.dark">
              {formatCurrency(pagoExterno.monto)}
            </Typography>
            {pagoExterno.montoDolares && (
              <Typography variant="subtitle1" component="div" color="text.secondary">
                ({formatCurrency(pagoExterno.montoDolares)} USD)
              </Typography>
            )}
          </Box>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <TipoPagoExternoChip tipo={pagoExterno.tipo} />
            <TipoPagoChip tipoPago={pagoExterno.tipoPago} />
          </Box>
        </Paper>

        {/* Contenido principal */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0, md: 4 } }}>
          {/* Columna izquierda */}
          <Box sx={{ flex: '1 1 320px', minWidth: { xs: '100%', md: '300px' } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                '&:before': {
                  content: '""',
                  display: 'block',
                  width: 3,
                  height: 18,
                  bgcolor: 'primary.main',
                  mr: 1,
                  borderRadius: 1
                }
              }}
            >
              Información Principal
            </Typography>

            <DetailItem 
              icon={<Person />} 
              label={pagoExterno.cliente ? 'Cliente' : 'Nombre del Pagador'} 
              value={pagoExterno.cliente
                ? `${pagoExterno.cliente.razonSocial} (${pagoExterno.cliente.noCliente})`
                : pagoExterno.nombrePagador}
              color={theme.palette.info.main}
            />

            <DetailItem 
              icon={<Category />} 
              label="Tipo de Pago Externo"
              chip={<TipoPagoExternoChip tipo={pagoExterno.tipo} />}
              color={theme.palette.secondary.main}
            />

            <DetailItem 
              icon={<LocationOn />} 
              label="Sucursal"
              chip={pagoExterno.sucursal ? (
                <SucursalBadge sucursal={pagoExterno.sucursal} />
              ) : (
                <Chip size="small" label="No especificada" variant="outlined" />
              )}
              color={theme.palette.warning.main}
            />

            <DetailItem 
              icon={<CurrencyExchange />} 
              label="Tipo de Cambio" 
              value={pagoExterno.tipoCambio ? `$${pagoExterno.tipoCambio} MXN/USD` : undefined}
              color={theme.palette.success.main}
            />
            
            <DetailItem 
              icon={<Subtitles />} 
              label="Concepto" 
              value={pagoExterno.concepto}
              color={theme.palette.primary.main}
            />
          </Box>

          {/* Columna derecha */}
          <Box sx={{ flex: '1 1 320px', minWidth: { xs: '100%', md: '300px' } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                '&:before': {
                  content: '""',
                  display: 'block',
                  width: 3,
                  height: 18,
                  bgcolor: 'secondary.main',
                  mr: 1,
                  borderRadius: 1
                }
              }}
            >
              Detalles de Transacción
            </Typography>

            <DetailItem 
              icon={<AccountBalance />} 
              label="Banco" 
              value={pagoExterno.banco
                ? `${pagoExterno.banco.nombre} ${pagoExterno.banco.codigoBancario ? `(${pagoExterno.banco.codigoBancario})` : ''}`
                : `Banco ID: ${pagoExterno.bancoId}`}
              color={theme.palette.info.dark}
            />

            <DetailItem 
              icon={<Payment />} 
              label="Tipo de Pago"
              chip={<TipoPagoChip tipoPago={pagoExterno.tipoPago} />}
              color={theme.palette.primary.dark}
            />

            <DetailItem 
              icon={<CreditCard />} 
              label="Código de Transferencia" 
              value={pagoExterno.codigoTransferencia}
              color={theme.palette.error.main}
            />

            <DetailItem 
              icon={<SwapHoriz />} 
              label="Tipo de Movimiento" 
              value={pagoExterno.tipoMovimiento}
              color={theme.palette.warning.dark}
            />

            <DetailItem 
              icon={<AccountBalanceWallet />} 
              label="Referencia de Pago" 
              value={pagoExterno.referenciaPago}
              color={theme.palette.secondary.dark}
            />
          </Box>
        </Box>

        {/* Notas */}
        {pagoExterno.notas && (
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                '&:before': {
                  content: '""',
                  display: 'block',
                  width: 3,
                  height: 18,
                  bgcolor: theme.palette.info.main,
                  mr: 1,
                  borderRadius: 1
                }
              }}
            >
              Notas
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.info.light, 0.07),
                borderRadius: 2,
                borderLeft: `3px solid ${theme.palette.info.main}`
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {pagoExterno.notas}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Información de creación y actualización */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <History fontSize="small" sx={{ mr: 1, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="caption" color="text.secondary">
              Creado: {format(new Date(pagoExterno.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <History fontSize="small" sx={{ mr: 1, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="caption" color="text.secondary">
              Actualizado: {format(new Date(pagoExterno.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};