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
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { Factura } from '../types';

interface FacturaDetailProps {
  factura: Factura;
  formatCurrency: (value: number) => string;
}

const FacturaDetail: React.FC<FacturaDetailProps> = ({ factura, formatCurrency }) => {
  const theme = useTheme();
  console.log(factura)
  const getStatusChipProps = (status: string) => {
    switch (status) {
      case 'Pagada':
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          color: 'success' as const,
          bgcolor: alpha(theme.palette.success.main, 0.8),
        };
      case 'Vencida':
        return {
          icon: <WarningIcon fontSize="small" />,
          color: 'error' as const,
          bgcolor: alpha(theme.palette.error.main, 0.8),
        };
      case 'Cancelada':
        return {
          icon: <CancelIcon fontSize="small" />,
          color: 'default' as const,
          bgcolor: alpha(theme.palette.grey[500], 0.8),
        };
      default:
        return {
          icon: <WarningIcon fontSize="small" />,
          color: 'warning' as const,
          bgcolor: alpha(theme.palette.warning.main, 0.8),
        };
    }
  };

  const statusChipProps = getStatusChipProps(factura.estado);

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary.main"
            sx={{ letterSpacing: '-0.5px' }}
          >
            Factura #{factura.noFactura}
          </Typography>
          <Tooltip title="Número de factura asignado">
            <InfoOutlinedIcon color="disabled" fontSize="small" />
          </Tooltip>
        </Stack>
        <Chip
          icon={statusChipProps.icon}
          label={factura.estado}
          color={statusChipProps.color}
          sx={{
            fontWeight: 600,
            px: 1.5,
            bgcolor: statusChipProps.bgcolor,
            fontSize: '1rem',
            letterSpacing: 0.2,
          }}
        />
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 2,
      }}>
        <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Fecha de Emisión
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {format(new Date(factura.emision), 'PPP', { locale: es })}
          </Typography>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Cliente
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            #{factura.noCliente} {factura.cliente?.razonSocial}
          </Typography>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Total Factura
          </Typography>
          <Typography variant="body1" fontWeight={600} color="primary.main">
            {formatCurrency(factura.montoTotal)}
          </Typography>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Saldo Pendiente
          </Typography>
          <Typography
            variant="body1"
            fontWeight={600}
            color={factura.saldo > 0 ? 'error.main' : 'success.main'}
          >
            {formatCurrency(factura.saldo)}
          </Typography>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Fecha de Vencimiento
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {format(new Date(factura.fechaVencimiento), 'PPP', { locale: es })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            {formatDistanceToNow(new Date(factura.fechaVencimiento), {
              addSuffix: true,
              locale: es,
            })}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          fontWeight={600}
          gutterBottom
        >
          Concepto de la Factura
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 2,
            fontSize: '1.08rem',
            lineHeight: 1.65,
            borderColor: 'grey.200',
          }}
        >
          {factura.concepto}
        </Paper>
      </Box>
    </Box>
  );
};

export default FacturaDetail;