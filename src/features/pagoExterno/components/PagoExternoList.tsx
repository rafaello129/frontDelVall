import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Pagination,
  Tooltip
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PagoExterno } from '../types';
import { formatCurrency } from '../../../utils/format';
import { TipoPagoChip } from '../../shared/components/TipoPagoChip';
import { SucursalBadge } from '../../shared/components/SucursalBadge';
import { TipoPagoExternoChip } from './TipoPagoExternoChip';

interface PagoExternoListProps {
  pagosExternos: PagoExterno[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetails: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  currentPage?: number;
  pageSize?: number;
  isLoading?: boolean;
}

export const PagoExternoList: React.FC<PagoExternoListProps> = ({
  pagosExternos,
  totalItems,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
  currentPage = 1,
  pageSize = 10,
  isLoading = false
}) => {
  const [page, setPage] = useState(currentPage);
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    onPageChange(newPage);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Cargando pagos externos...</Typography>
      </Box>
    );
  }

  if (pagosExternos.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No hay pagos externos para mostrar</Typography>
        <Typography variant="body2" color="textSecondary">
          Intenta ajustar los filtros o crear un nuevo pago externo
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Cliente/Pagador</TableCell>
              <TableCell>Sucursal</TableCell>
              <TableCell>Tipo de Pago</TableCell>
              <TableCell>Banco</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosExternos.map((pago) => (
              <TableRow key={pago.id} hover>
                <TableCell>
                  {format(new Date(pago.fechaPago), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  <TipoPagoExternoChip tipo={pago.tipo} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(pago.monto)}
                    </Typography>
                    {pago.montoDolares && (
                      <Typography variant="caption" color="textSecondary">
                        USD {formatCurrency(pago.montoDolares)}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {pago.cliente ? (
                    <Tooltip title={pago.cliente.razonSocial}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {pago.cliente.comercial || pago.cliente.razonSocial}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      {pago.nombrePagador || 'Sin pagador'}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {pago.sucursal ? (
                    <SucursalBadge sucursal={pago.sucursal} />
                  ) : (
                    <Chip size="small" label="N/A" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  <TipoPagoChip tipoPago={pago.tipoPago} />
                </TableCell>
                <TableCell>
                  {pago.banco?.nombre || `Banco ID: ${pago.bancoId}`}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver detalles">
                    <IconButton 
                      size="small" 
                      onClick={() => onViewDetails(pago.id)}
                      color="info"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(pago.id)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(pago.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handleChangePage} 
          color="primary" 
        />
      </Box>
    </Box>
  );
};