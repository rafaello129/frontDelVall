import React from 'react';
import type { Cobranza } from '../../features/cobranza/types';
import Button from '../common/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';

interface CobranzasTableProps {
  cobranzas: Cobranza[];
  onView?: (cobranza: Cobranza) => void;
  onEdit?: (cobranza: Cobranza) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  showFactura?: boolean;
  showCliente?: boolean;
}

const CobranzasTable: React.FC<CobranzasTableProps> = ({
  cobranzas,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  showFactura = true,
  showCliente = true
}) => {
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        py: 8 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (cobranzas.length === 0) {
    return (
      <Box sx={{ 
        p: 6, 
        textAlign: 'center',
        color: 'text.secondary'
      }}>
        <Typography variant="body1">
          No hay pagos registrados
        </Typography>
      </Box>
    );
  }

  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Get payment type color
  const getTipoPagoColor = (tipoPago: string) => {
    switch (tipoPago) {
      case 'TRANSFERENCIA':
        return 'primary';
      case 'EFECTIVO':
        return 'success';
      case 'CHEQUE':
        return 'warning';
      case 'TARJETA':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'medium' }}>Fecha Pago</TableCell>
            {showFactura && (
              <TableCell sx={{ fontWeight: 'medium' }}>Factura</TableCell>
            )}
            {showCliente && (
              <TableCell sx={{ fontWeight: 'medium' }}>Cliente</TableCell>
            )}
            <TableCell align="right" sx={{ fontWeight: 'medium' }}>Monto</TableCell>
            <TableCell sx={{ fontWeight: 'medium' }}>Tipo de Pago</TableCell>
            <TableCell sx={{ fontWeight: 'medium' }}>Banco</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'medium' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cobranzas.map((cobranza) => (
            <TableRow 
              key={cobranza.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
 
              <TableCell>
                <Typography variant="body2">
                  {format(new Date(cobranza.fechaPago), 'dd-MM-yyyy HH:mm', { locale: es })}
                </Typography>
              </TableCell>
              {showFactura && (
                <TableCell>
                  <Chip
                    size="small"
                    label={cobranza.noFactura}
                    color="default"
                    variant="outlined"
                  />
                </TableCell>
              )}
              {showCliente && (
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {cobranza.nombreComercial}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{cobranza.noCliente}
                    </Typography>
                  </Box>
                </TableCell>
              )}
              <TableCell align="right">
                <Typography variant="body2" fontWeight="medium" color="success.main">
                  {formatCurrency(cobranza.total)}
                </Typography>
                {cobranza.montoDolares && (
                  <Typography variant="caption" color="text.secondary">
                    (${cobranza.montoDolares.toFixed(2)} USD)
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={cobranza.tipoPago}
                  color={getTipoPagoColor(cobranza.tipoPago)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BankIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {cobranza.banco?.nombre || `Banco ${cobranza.bancoId}`}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                { onView &&(  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onView(cobranza)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                  {onEdit && (
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(cobranza)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onDelete && (
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(cobranza.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CobranzasTable;