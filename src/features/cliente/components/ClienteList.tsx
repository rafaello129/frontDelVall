import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import type { Cliente, FilterClienteDto } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Chip, Tooltip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Button, Pagination,
  useTheme, CircularProgress, Alert, TableFooter,
  Fade, alpha
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Visibility as VisibilityIcon, 
  Delete as DeleteIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

// Create a motion-enhanced version of TableRow
const MotionTableRow = motion.create(TableRow);

interface ClienteListProps {
  filters?: FilterClienteDto;
  onDelete?: (noCliente: number) => void;
  showActions?: boolean;
}

const ClienteList: React.FC<ClienteListProps> = ({ 
  filters = {}, 
  onDelete, 
  showActions = true 
}) => {
  const theme = useTheme();
  const { 
    clientes, 
    pagination, 
    isLoading, 
    error, 
    getAllClientes, 
    removeCliente, 
    setPagination 
  } = useCliente();

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('razonSocial');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadClientes();
  }, [currentPage, filters, sortColumn, sortOrder]);

  const loadClientes = () => {
    const skip = (currentPage - 1) * pagination.limit;
    getAllClientes({ 
      ...filters, 
      skip, 
      limit: pagination.limit,
      sortBy: sortColumn,
      order: sortOrder
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const openDeleteDialog = (noCliente: number) => {
    setClienteToDelete(noCliente);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!clienteToDelete) return;
    
    setIsDeleting(true);
    try {
      await removeCliente(clienteToDelete);
      if (onDelete) onDelete(clienteToDelete);
      // Check if we should go to a previous page
      if (clientes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        loadClientes();
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    } finally {
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return {
          color: 'success',
          bgcolor: alpha(theme.palette.success.main, 0.8)
        };
      case 'Suspendido':
        return {
          color: 'warning',
          bgcolor: alpha(theme.palette.warning.main, 0.8)
        };
      default:
        return {
          color: 'error',
          bgcolor: alpha(theme.palette.error.main, 0.8)
        };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (clientes.length === 0) {
    return (
      <Fade in timeout={500}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron clientes con los filtros aplicados.
          </Typography>
        </Paper>
      </Fade>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Fade in timeout={300}>
      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            '& .MuiTableRow-root:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04)
            }
          }}
        >
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                  <TableCell 
                    onClick={() => handleSort('noCliente')}
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      No. Cliente
                      {sortColumn === 'noCliente' && (
                        <ArrowDropDownIcon 
                          sx={{ 
                            transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('razonSocial')}
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Razón Social
                      {sortColumn === 'razonSocial' && (
                        <ArrowDropDownIcon 
                          sx={{ 
                            transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('comercial')}
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Nombre Comercial
                      {sortColumn === 'comercial' && (
                        <ArrowDropDownIcon 
                          sx={{ 
                            transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('sucursal')}
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Sucursal
                      {sortColumn === 'sucursal' && (
                        <ArrowDropDownIcon 
                          sx={{ 
                            transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('status')}
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Estado
                      {sortColumn === 'status' && (
                        <ArrowDropDownIcon 
                          sx={{ 
                            transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  {showActions && (
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Acciones
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {clientes.map((cliente, index) => (
                    <MotionTableRow
                      key={cliente.noCliente}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3,
                        delay: index * 0.05 // Stagger animation
                      }}
                      exit={{ opacity: 0 }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {cliente.noCliente}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {cliente.razonSocial}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.comercial || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.sucursal || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cliente.status}
                          size="small"
                          color={getStatusColor(cliente.status).color as any}
                          sx={{
                            fontWeight: 500,
                            bgcolor: getStatusColor(cliente.status).bgcolor
                          }}
                        />
                      </TableCell>
                      {showActions && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="Ver detalles">
                              <IconButton
                                component={Link}
                                to={`/clientes/${cliente.noCliente}`}
                                color="info"
                                size="small"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                component={Link}
                                to={`/clientes/${cliente.noCliente}/editar`}
                                color="primary"
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => openDeleteDialog(cliente.noCliente)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </MotionTableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
              {totalPages > 1 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={showActions ? 6 : 5} sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Mostrando {(currentPage - 1) * pagination.limit + 1} a{' '}
                          {Math.min(currentPage * pagination.limit, pagination.total)}{' '}
                          de {pagination.total} resultados
                        </Typography>
                        <Pagination 
                          count={totalPages} 
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          showFirstButton
                          showLastButton
                          size="small"
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </TableContainer>
        </Paper>

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancelar
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting && <CircularProgress size={16} />}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default ClienteList;