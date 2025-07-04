import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab
} from '@mui/material';
import { Add, BarChart, TableChart } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchPagosExternos,
  deletePagoExterno,
  selectPagosExternos,
  selectPagosExternosLoading,
  selectPagosExternosError,
  fetchEstadisticasPorTipo,
  fetchEstadisticasPorSucursal,
  selectEstadisticasPorTipo,
  selectEstadisticasPorSucursal,
  selectEstadisticasMetadata
} from '../pagoExternoSlice';
import { PagoExternoList } from '../components/PagoExternoList';
import { PagoExternoFilters } from '../components/PagoExternoFilters';
import { PagoExternoEstadisticas } from '../components/PagoExternoEstadisticas';
import type { FilterPagoExternoDto, EstadisticasOptions } from '../types';
import { toast } from 'react-toastify';

export const PagoExternoListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pagosExternos = useAppSelector(selectPagosExternos);
  const isLoading = useAppSelector(selectPagosExternosLoading);
  const error = useAppSelector(selectPagosExternosError);
  const estadisticasPorTipo = useAppSelector(selectEstadisticasPorTipo);
  const estadisticasPorSucursal = useAppSelector(selectEstadisticasPorSucursal);
  const estadisticasMetadata = useAppSelector(selectEstadisticasMetadata);
  
  const [filters, setFilters] = useState<FilterPagoExternoDto>({
    limit: 10,
    skip: 0,
    sortBy: 'fechaPago',
    order: 'desc',
    incluirCliente: true,
    incluirBanco: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'statistics'>('list');
  const [estadisticasOptions, setEstadisticasOptions] = useState<EstadisticasOptions>({
    fechaDesde: new Date(new Date().setDate(new Date().getDate() - 30)),
    fechaHasta: new Date(),
    incluirDetalle: true,
    agruparPor: 'mes',
    moneda: 'MXN',
    compararConPeriodoAnterior: 30
  });

  // Cargar pagos al inicio o cuando cambien los filtros
  useEffect(() => {
    dispatch(fetchPagosExternos(filters))
      .unwrap()
      .then(response => {
        setTotalItems(response.total);
      })
      .catch(error => {
        toast.error('Error al cargar los pagos externos');
      });
  }, [dispatch, filters]);

  // Cargar estadísticas cuando se cambia a esa vista
  useEffect(() => {
    if (viewMode === 'statistics') {
      loadStatistics();
    }
  }, [dispatch, viewMode]);

  // Mostrar error si hay alguno
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadStatistics = () => {
    dispatch(fetchEstadisticasPorTipo(estadisticasOptions));
    dispatch(fetchEstadisticasPorSucursal(estadisticasOptions));
  };

  const handleEstadisticasOptionsChange = (newOptions: EstadisticasOptions) => {
    setEstadisticasOptions(prev => ({
      ...prev,
      ...newOptions
    }));
    
    // If the options are changed, reload the statistics
    dispatch(fetchEstadisticasPorTipo({
      ...estadisticasOptions,
      ...newOptions
    }));
    dispatch(fetchEstadisticasPorSucursal({
      ...estadisticasOptions,
      ...newOptions
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      skip: (page - 1) * prev.limit!
    }));
  };

  const handleFilterChange = (newFilters: FilterPagoExternoDto) => {
    setCurrentPage(1);
    setFilters({
      ...newFilters,
      limit: filters.limit,
      skip: 0,
      incluirCliente: true,
      incluirBanco: true
    });
  };

  const handleViewDetails = (id: number) => {
    navigate(`/pagos-externos/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/pagos-externos/editar/${id}`);
  };

  const handleDelete = (id: number) => {
    setPagoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pagoToDelete) {
      dispatch(deletePagoExterno(pagoToDelete))
        .unwrap()
        .then(() => {
          setDeleteDialogOpen(false);
          setPagoToDelete(null);
          // Actualizar lista después de eliminar
          dispatch(fetchPagosExternos(filters));
        })
        .catch(error => {
          toast.error('Error al eliminar el pago externo');
        });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Pagos Externos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/pagos-externos/nuevo')}
          >
            Nuevo Pago Externo
          </Button>
        </Box>

        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/">
            Inicio
          </Link>
          <Typography color="text.primary">Pagos Externos</Typography>
        </Breadcrumbs>

        <Tabs
          value={viewMode}
          onChange={(_, newValue) => setViewMode(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab
            value="list"
            label="Lista"
            icon={<TableChart />}
            iconPosition="start"
          />
          <Tab
            value="statistics"
            label="Estadísticas"
            icon={<BarChart />}
            iconPosition="start"
          />
        </Tabs>

        {viewMode === 'list' && (
          <>
            <PagoExternoFilters
              onFilter={handleFilterChange}
              initialFilters={filters}
            />
            
            <PagoExternoList
              pagosExternos={pagosExternos}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentPage={currentPage}
              pageSize={filters.limit}
              isLoading={isLoading}
            />
          </>
        )}

        {viewMode === 'statistics' && (
          <PagoExternoEstadisticas
            estadisticasPorTipo={estadisticasPorTipo}
            estadisticasPorSucursal={estadisticasPorSucursal}
            estadisticasMetadata={estadisticasMetadata}
            options={estadisticasOptions}
            onOptionsChange={handleEstadisticasOptionsChange}
            isLoading={isLoading}
          />
        )}
      </Box>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este pago externo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};