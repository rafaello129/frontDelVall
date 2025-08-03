import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFacturas } from '../../factura/hooks/useFacturas';
import type { Cliente, FacturaPendiente } from '../types';
import { 
  Box, Paper, TableContainer, Table, TableHead, TableRow, 
  TableCell, TableBody, TableFooter, CircularProgress,
  Alert, Button, Chip, IconButton, Tooltip, useTheme,
  Typography
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useExportCarteraClienteExcel } from '../../../hooks/useExcelExportCarteraCliente';

interface FacturasPendientesTableProps {
  noCliente: number;
  cliente : Cliente;
}

const FacturasPendientesTable: React.FC<FacturasPendientesTableProps> = ({ noCliente, cliente }) => {
  const theme = useTheme();
  const { getFacturasPendientesPorCliente } = useFacturas();
  const [facturas, setFacturas] = useState<FacturaPendiente[]>([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { exportCarteraClienteExcel } = useExportCarteraClienteExcel();
  const handleExport = () => {
    console.log(facturas)
    exportCarteraClienteExcel(cliente, facturas);
  };
  useEffect(() => {
    const fetchFacturas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getFacturasPendientesPorCliente(noCliente);
        // Fix for the data structure - adjust according to actual API response
        if (response.payload) {
          setFacturas(response.payload.data || []);
          setTotalSaldo(response.payload.totalSaldo || 0);
        } 
        console.log(response.payload)
      } catch (err: any) {
        setError(err.message || 'Error al obtener las facturas pendientes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacturas();
  }, [noCliente, getFacturasPendientesPorCliente]);

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mt: 2 }}
      >
        {error}
      </Alert>
    );
  }

  if (facturas.length === 0) {
    return (
      <Box textAlign="center" p={4} bgcolor={theme.palette.background.default} borderRadius={1}>
        <Typography variant="body1" color="text.secondary">
          No hay facturas pendientes para este cliente
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Box sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
        <Box display="flex" justifyContent="flex-end" mt={1}>
        <Button
          variant="contained"
          color="primary"
           onClick={handleExport}
        >
          Exportar Excel
        </Button>
          </Box>
      </Box>
      <Table size="small" aria-label="facturas pendientes">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
            <TableCell>No. Factura</TableCell>
            <TableCell>Emisión</TableCell>
            <TableCell>Vencimiento</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Saldo</TableCell>
            <TableCell>Días</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {facturas.map((factura) => (
            <TableRow 
              key={factura.noFactura}
              sx={factura.isVencida ? {
                backgroundColor: theme.palette.mode === 'light' 
                  ? alpha(theme.palette.error.light, 0.1)
                  : alpha(theme.palette.error.dark, 0.2)
              } : {}}
            >
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="medium">
                  {factura.noFactura}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(factura.emision)}</TableCell>
              <TableCell>{formatDate(factura.fechaVencimiento)}</TableCell>
              <TableCell align="right">{formatCurrency(factura.montoTotal)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(factura.saldo)}
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {factura.diasTranscurridos}
                  {factura.isVencida && (
                    <Tooltip title="Factura vencida">
                      <WarningIcon color="error" fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={factura.isVencida ? 'Vencida' : 'Al día'}
                  size="small"
                  color={factura.isVencida ? 'error' : 'success'}
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title="Ver factura">
                    <IconButton 
                      component={Link} 
                      to={`/facturasView/${factura.noFactura}`}
                      size="small"
                      color="info"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow sx={{ 
            backgroundColor: theme.palette.action.hover,
            '& .MuiTableCell-root': { 
              fontWeight: 'bold',
              py: 1.5
            }
          }}>
            <TableCell colSpan={3} align="right">
              Total Saldo:
            </TableCell>
            <TableCell align="right" colSpan={2}>
              <Typography variant="subtitle2" color="primary.main">
                {formatCurrency(totalSaldo)}
              </Typography>
            </TableCell>
            <TableCell colSpan={3}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

// Add the missing alpha function
const alpha = (color: string, opacity: number): string => {
  // Simple implementation that assumes color is in hex format
  // For a real app, you might want to use a proper color library
  if (color.startsWith('#')) {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  }
  return color;
};

export default FacturasPendientesTable;