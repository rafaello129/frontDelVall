import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import type { FilterClienteDto } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Chip, Tooltip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Button, Pagination,
  useTheme, CircularProgress, Alert, TableFooter,
  Fade, alpha, Avatar, LinearProgress, Skeleton,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Visibility as VisibilityIcon, 
  Delete as DeleteIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FilterAlt as FilterAltIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Block as BlockIcon
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Activo':
        return {
          color: 'success',
          bgcolor: alpha(theme.palette.success.main, 0.8),
          textColor: '#fff',
          icon: <CheckIcon fontSize="small" />
        };
      case 'Suspendido':
        return {
          color: 'warning',
          bgcolor: alpha(theme.palette.warning.main, 0.8),
          textColor: '#fff',
          icon: <WarningIcon fontSize="small" />
        };
      default:
        return {
          color: 'error',
          bgcolor: alpha(theme.palette.error.main, 0.8),
          textColor: '#fff',
          icon: <BlockIcon fontSize="small" />
        };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading && clientes.length === 0) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <LinearProgress />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          {[1, 2, 3, 4].map(item => (
            <Skeleton key={item} variant="rectangular" height={53} sx={{ my: 0.5 }} />
          ))}
        </Box>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        variant="filled"
        sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {error}
      </Alert>
    );
  }

  if (clientes.length === 0) {
    return (
      <Fade in timeout={500}>
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <FilterAltIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            No se encontraron clientes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No se encontraron clientes con los filtros aplicados. Pruebe modificar los criterios de búsqueda.
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 3, borderRadius: 2 }} 
            component={Link} 
            to="/clientes/nuevo"
          >
            Crear Nuevo Cliente
          </Button>
        </Paper>
      </Fade>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Fade in timeout={300}>
      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {isLoading && <LinearProgress color="primary" />}
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell 
                    onClick={() => handleSort('noCliente')}
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main },
                      py: 1.7
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      No. Cliente
                      {sortColumn === 'noCliente' && (
                        <ArrowDropDownIcon 
                          sx={{ 
                            transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                            color: theme.palette.primary.main
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
                            transition: 'transform 0.2s',
                            color: theme.palette.primary.main
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
                            transition: 'transform 0.2s',
                            color: theme.palette.primary.main
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
                            transition: 'transform 0.2s',
                            color: theme.palette.primary.main
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
                            transition: 'transform 0.2s',
                            color: theme.palette.primary.main
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
                  {clientes.map((cliente, index) => {
                    const statusConfig = getStatusConfig(cliente.status);
                    
                    return (
                      <MotionTableRow
                        key={cliente.noCliente}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.03 // Stagger animation
                        }}
                        exit={{ opacity: 0 }}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04)
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}
                            >
                              {getInitials(cliente.razonSocial)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {cliente.noCliente}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {cliente.razonSocial}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {cliente.comercial || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cliente.sucursal || '-'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              borderColor: alpha(theme.palette.primary.main, 0.2)
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusConfig.icon}
                            label={cliente.status}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              bgcolor: statusConfig.bgcolor,
                              color: statusConfig.textColor
                            }}
                          />
                        </TableCell>
                        {showActions && (
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Ver detalles" arrow>
                                <IconButton
                                  component={Link}
                                  to={`/clientes/${cliente.noCliente}`}
                                  size="small"
                                  sx={{ 
                                    color: theme.palette.info.main,
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.info.main, 0.2),
                                    },
                                    ml: 1
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar cliente" arrow>
                                <IconButton
                                  component={Link}
                                  to={`/clientes/${cliente.noCliente}/editar`}
                                  size="small"
                                  sx={{ 
                                    color: theme.palette.primary.main,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar cliente" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    color: theme.palette.error.main,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    }
                                  }}
                                  onClick={() => openDeleteDialog(cliente.noCliente)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </MotionTableRow>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
              {totalPages > 1 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={showActions ? 6 : 5}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1
                      }}>
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
                          size="medium"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              fontWeight: 500
                            }
                          }}
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
          onClose={() => !isDeleting && setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxWidth: 450,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, pt: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Confirmar eliminación
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2, color: 'text.primary' }}>
              ¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer y también eliminará todos los registros asociados a este cliente.
            </DialogContentText>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Esta acción es permanente y no podrá recuperar los datos posteriormente.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              color="inherit"
              variant="outlined"
              sx={{ borderRadius: 2 }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              sx={{ 
                borderRadius: 2,
                px: 2
              }}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Cliente'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default ClienteList;