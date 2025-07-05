import React, { useState } from 'react';
import type { Factura } from '../../features/factura/types';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, Chip, IconButton, Tooltip, TableSortLabel, Box,
  alpha, useTheme, TablePagination, Button, MenuItem, Menu
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon
} from '@mui/icons-material';

interface FacturasTableProps {
  facturas: Factura[];
  onView: (factura: Factura) => void;
  onEdit?: (factura: Factura) => void;
  onDelete?: (factura: Factura) => void;
  isLoading?: boolean;
  showCliente?: boolean;
}

type SortField = 'noFactura' | 'emision' | 'noCliente' | 'estado' | 'montoTotal' | 'saldo' | 'fechaVencimiento';

const FacturasTable: React.FC<FacturasTableProps> = ({
  facturas,
  onView,
  onEdit,
  onDelete,
  showCliente = true
}) => {
  const theme = useTheme();
  const today = new Date();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<SortField>('emision');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  // Format as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Get color class based on status
  const getEstadoChip = (estado: string) => {
    switch (estado) {
      case 'Pagada':
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          color: 'success' as const,
          bgcolor: alpha(theme.palette.success.main, 0.8)
        };
      case 'Vencida':
        return {
          icon: <WarningIcon fontSize="small" />,
          color: 'error' as const,
          bgcolor: alpha(theme.palette.error.main, 0.8)
        };
      case 'Cancelada':
        return {
          icon: <BlockIcon fontSize="small" />,
          color: 'default' as const,
          bgcolor: alpha(theme.palette.text.disabled, 0.8)
        };
      default: // Pending
        return {
          icon: <ScheduleIcon fontSize="small" />,
          color: 'warning' as const,
          bgcolor: alpha(theme.palette.warning.main, 0.8)
        };
    }
  };

  // Calculate days remaining
  const calcularDiasRestantes = (fechaVencimiento: Date | string): number => {
    return differenceInDays(new Date(fechaVencimiento), today);
  };

  // Handle sorting
  const handleRequestSort = (property: SortField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Create sorted data
  const sortedData = React.useMemo(() => {
    return [...facturas].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];
      
      // Special handling for dates
      if (orderBy === 'emision' || orderBy === 'fechaVencimiento') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Compare values
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [facturas, order, orderBy]);

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Action menu handlers
  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, factura: Factura) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedFactura(factura);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedFactura(null);
  };

  // Get paginated data
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (facturas.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No hay facturas registradas
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'noFactura'}
                  direction={orderBy === 'noFactura' ? order : 'asc'}
                  onClick={() => handleRequestSort('noFactura')}
                >
                  No. Factura
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'emision'}
                  direction={orderBy === 'emision' ? order : 'asc'}
                  onClick={() => handleRequestSort('emision')}
                >
                  Emisión
                </TableSortLabel>
              </TableCell>
              {showCliente && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'noCliente'}
                    direction={orderBy === 'noCliente' ? order : 'asc'}
                    onClick={() => handleRequestSort('noCliente')}
                  >
                    Cliente
                  </TableSortLabel>
                </TableCell>
              )}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'estado'}
                  direction={orderBy === 'estado' ? order : 'asc'}
                  onClick={() => handleRequestSort('estado')}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'montoTotal'}
                  direction={orderBy === 'montoTotal' ? order : 'asc'}
                  onClick={() => handleRequestSort('montoTotal')}
                >
                  Total
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'saldo'}
                  direction={orderBy === 'saldo' ? order : 'asc'}
                  onClick={() => handleRequestSort('saldo')}
                >
                  Pendiente
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fechaVencimiento'}
                  direction={orderBy === 'fechaVencimiento' ? order : 'asc'}
                  onClick={() => handleRequestSort('fechaVencimiento')}
                >
                  Vencimiento
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((factura) => {
              const diasRestantes = calcularDiasRestantes(factura.fechaVencimiento);
              const estadoChip = getEstadoChip(factura.estado);
              
              return (
                <TableRow 
                  key={factura.noFactura}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover 
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {factura.noFactura}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(new Date(factura.emision), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  {showCliente && (
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {factura.cliente?.razonSocial || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{factura.noCliente}
                        </Typography>
                      </Box>
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip 
                      label={factura.estado}
                      size="small"
                      icon={estadoChip.icon}
                      color={estadoChip.color}
                      sx={{ 
                        fontWeight: 500,
                        bgcolor: estadoChip.bgcolor
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(factura.montoTotal)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: factura.saldo > 0 ? 'error.main' : 'success.main',
                        fontWeight: 500
                      }}
                    >
                      {formatCurrency(factura.saldo)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(factura.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 
                            diasRestantes < 0 ? 'error.main' :
                            diasRestantes < 5 ? 'warning.main' :
                            'success.main'
                        }}
                      >
                        {diasRestantes < 0 
                          ? `Vencida hace ${Math.abs(diasRestantes)} días` 
                          : `${diasRestantes} días restantes`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small" 
                          onClick={() => onView(factura)}
                          sx={{ color: theme.palette.info.main }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        size="small"
                        aria-label="more"
                        onClick={(e) => handleOpenActionMenu(e, factura)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={facturas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem 
          onClick={() => {
            if (selectedFactura) onView(selectedFactura);
            handleCloseActionMenu();
          }}
          dense
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalles
        </MenuItem>
        
        {onEdit && selectedFactura && 
          selectedFactura.estado !== 'Pagada' && 
          selectedFactura.estado !== 'Cancelada' && (
          <MenuItem 
            onClick={() => {
              if (selectedFactura && onEdit) onEdit(selectedFactura);
              handleCloseActionMenu();
            }}
            dense
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
        )}
        
        {onDelete && selectedFactura && selectedFactura.estado === 'Pendiente' && (
          <MenuItem 
            onClick={() => {
              if (selectedFactura && onDelete) onDelete(selectedFactura);
              handleCloseActionMenu();
            }}
            sx={{ color: 'error.main' }}
            dense
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default FacturasTable;