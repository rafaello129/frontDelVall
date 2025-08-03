import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  useTheme,
  alpha,
  Skeleton,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventNoteIcon from '@mui/icons-material/EventNote';
import type { Cobranza } from '../types';

interface CobranzasRelacionadasProps {
  cobranzas: Cobranza[];
  isLoading: boolean;
  error: string | null;
}

const CobranzasRelacionadas: React.FC<CobranzasRelacionadasProps> = ({ 
  cobranzas, 
  isLoading, 
  error 
}) => {
  const theme = useTheme();
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 1 }} />
        <Box sx={{ mt: 1 }}>
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rectangular" width="100%" height={40} sx={{ my: 0.5, borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
    );
  }
  
  if (cobranzas.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Esta factura no tiene pagos registrados.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight={600} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: theme.palette.primary.main 
          }}
        >
          <AttachMoneyIcon />
          Pagos Asociados
        </Typography>
        <Box>
          <Typography variant="body2">
            Total: {cobranzas.length} {cobranzas.length === 1 ? 'pago' : 'pagos'}
          </Typography>
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        variant="outlined" 
        sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="tabla de pagos">
          <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <EventNoteIcon fontSize="small" /> Fecha
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Monto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tipo de Pago</TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <AccountBalanceIcon fontSize="small" /> Banco
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cobranzas.map((cobranza) => (
              <TableRow
                key={cobranza.id}
                sx={{
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell component="th" scope="row">
                  <Typography fontWeight={500}>
                    {format(new Date(cobranza.fechaPago), 'PPP', { locale: es })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(cobranza.fechaPago), 'p', { locale: es })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600} color="success.main">
                    {formatCurrency(cobranza.total)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={cobranza.tipoPago} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {cobranza.banco?.nombre || `Banco #${cobranza.bancoId}`}
                </TableCell>
                <TableCell align="center">
                  <Button
                    component={RouterLink}
                    to={`/cobranza/${cobranza.id}`}
                    startIcon={<VisibilityIcon />}
                    size="small"
                    sx={{ borderRadius: 8, textTransform: 'none' }}
                  >
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CobranzasRelacionadas;