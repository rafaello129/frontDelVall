import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFacturas } from '../../factura/hooks/useFacturas';
import type { Cliente, FacturaPendiente } from '../types';
import { 
  Box,  
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  TableFooter, 
  CircularProgress,
  Alert, 
  Button, 
  Chip, 
  IconButton, 
  Tooltip, 
  useTheme,
  Typography,
  alpha,
  Skeleton,
  Card,
  CardHeader,
  LinearProgress,
  TablePagination
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  FileDownload as FileDownloadIcon,
  Receipt as ReceiptIcon,
  DateRange as DateRangeIcon,
  LocalAtm as LocalAtmIcon
} from '@mui/icons-material';
import { useExportCarteraClienteExcel } from '../../../hooks/useExcelExportCarteraCliente';

interface FacturasPendientesTableProps {
  noCliente: number;
  cliente: Cliente;
}

const FacturasPendientesTable: React.FC<FacturasPendientesTableProps> = ({ noCliente, cliente }) => {
  const theme = useTheme();
  const { getFacturasPendientesPorCliente } = useFacturas();
  const [facturas, setFacturas] = useState<FacturaPendiente[]>([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { exportCarteraClienteExcel } = useExportCarteraClienteExcel();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100000);
  
  // Count variables for stats
  const vencidasCount = facturas.filter(f => f.isVencida).length;
  const porVencerCount = facturas.filter(f => !f.isVencida).length;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportCarteraClienteExcel(cliente, facturas);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
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

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sliced data for pagination
  const currentFacturas = facturas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <LinearProgress />
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={180} height={32} />
            </Box>
          }
          action={
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
          }
        />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
          {[1, 2, 3].map(item => (
            <Skeleton key={item} variant="rectangular" height={52} sx={{ my: 1, borderRadius: 1 }} />
          ))}
        </Box>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        variant="filled"
        sx={{ 
          mt: 2, 
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {error}
      </Alert>
    );
  }

  if (facturas.length === 0) {
    return (
      <Card sx={{ 
        p: 4, 
        textAlign: 'center', 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <ReceiptIcon 
          sx={{ 
            fontSize: 60, 
            color: alpha(theme.palette.primary.main, 0.2),
            mb: 2
          }} 
        />
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          No hay facturas pendientes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
          Este cliente no tiene facturas pendientes de pago en este momento.
        </Typography>
        <Button
          variant="outlined"
          component={Link}
          to={`/facturas/nueva?clienteId=${noCliente}`}
          sx={{ 
            mt: 2, 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Crear Nueva Factura
        </Button>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header with stats */}
      <Box sx={{ 
        p: 3, 
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Facturas Pendientes
            </Typography>
            <Chip 
              label={facturas.length} 
              color="primary" 
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
            disabled={isExporting}
            onClick={handleExport}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </Button>
        </Box>
        
        {/* Stats Row */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
        }}>
          {/* Total Saldo */}
          <Box sx={{ 
            flex: '1 1 auto',
            minWidth: { xs: '100%', sm: 'calc(33% - 8px)' },
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            p: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalAtmIcon color="primary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Saldo Total Pendiente
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
              {formatCurrency(totalSaldo)}
            </Typography>
          </Box>
          
          {/* Facturas vencidas */}
          <Box sx={{ 
            flex: '1 1 auto',
            minWidth: { xs: '100%', sm: 'calc(33% - 8px)' },
            backgroundColor: alpha(theme.palette.error.main, 0.04),
            borderRadius: 2,
            p: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Facturas Vencidas
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" color="error.main" sx={{ mt: 1 }}>
              {vencidasCount} {vencidasCount === 1 ? 'factura' : 'facturas'}
            </Typography>
          </Box>
          
          {/* Facturas por vencer */}
          <Box sx={{ 
            flex: '1 1 auto',
            minWidth: { xs: '100%', sm: 'calc(33% - 8px)' },
            backgroundColor: alpha(theme.palette.success.main, 0.04),
            borderRadius: 2,
            p: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DateRangeIcon color="success" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Facturas Al Día
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
              {porVencerCount} {porVencerCount === 1 ? 'factura' : 'facturas'}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Table Section */}
      <TableContainer>
        <Table size="medium" aria-label="facturas pendientes">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 600 }}>No. Factura</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Emisión</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vencimiento</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Saldo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Días</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentFacturas.map((factura) => (
              <TableRow 
                key={factura.noFactura}
                sx={{
                  backgroundColor: factura.isVencida ? 
                    alpha(theme.palette.error.main, 0.05) : 
                    'inherit',
                  '&:hover': {
                    backgroundColor: factura.isVencida ? 
                      alpha(theme.palette.error.main, 0.1) : 
                      alpha(theme.palette.action.hover, 0.8)
                  }
                }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium" sx={{ 
                    color: factura.isVencida ? theme.palette.error.dark : theme.palette.text.primary 
                  }}>
                    {factura.noFactura}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{formatDate(factura.emision)}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      color={factura.isVencida ? 'error.main' : 'text.primary'}
                      fontWeight={factura.isVencida ? 'medium' : 'regular'}
                    >
                      {formatDate(factura.fechaVencimiento)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{formatCurrency(factura.montoTotal)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={factura.isVencida ? 'error.main' : theme.palette.primary.main}
                  >
                    {formatCurrency(factura.saldo)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="body2" 
                      fontWeight={factura.isVencida ? 'bold' : 'regular'}
                      color={factura.isVencida ? 'error.main' : 'text.primary'}
                    >
                      {factura.diasTranscurridos}
                    </Typography>
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
                    sx={{ 
                      fontWeight: 600,
                      px: 0.5
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Ver factura" arrow>
                      <IconButton 
                        component={Link} 
                        to={`/facturasView/${factura.noFactura}`}
                        size="small"
                        sx={{ 
                          color: theme.palette.info.main,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.info.main, 0.2),
                          }
                        }}
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
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              '& .MuiTableCell-root': { 
                fontWeight: 'bold',
                py: 2
              }
            }}>
              <TableCell colSpan={3} align="right">
                Total Saldo Pendiente:
              </TableCell>
              <TableCell align="right" colSpan={2}>
                <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                  {formatCurrency(totalSaldo)}
                </Typography>
              </TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {facturas.length > rowsPerPage && (
        <Box sx={{ 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default
        }}>
          <TablePagination
            component="div"
            count={facturas.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
            sx={{
              '& .MuiTablePagination-select': {
                borderRadius: 1,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 500
              }
            }}
          />
        </Box>
      )}
    </Card>
  );
};

export default FacturasPendientesTable;