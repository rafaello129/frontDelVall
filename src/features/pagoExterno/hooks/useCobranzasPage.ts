// src/hooks/usePagosExternos.ts
import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../app/store';
import { 
  fetchPagosExternos,
  fetchPagoExternoById,
  createPagoExterno,
  updatePagoExterno,
  deletePagoExterno,
  fetchPagosPorCliente,
  fetchEstadisticasPorTipo,
  fetchEstadisticasPorSucursal,
  clearSelectedPagoExterno,
  clearPagoExternoError,
  clearEstadisticas,
  selectPagosExternos,
  selectSelectedPagoExterno,
  selectClientePagos,
  selectEstadisticasPorTipo,
  selectEstadisticasPorSucursal,
  selectEstadisticasMetadata,
  selectPagosExternosLoading,
  selectPagosExternosError
} from '../pagoExternoSlice';

import type { 
  PagoExterno,
  CreatePagoExternoDto,
  UpdatePagoExternoDto,
  FilterPagoExternoDto,
  EstadisticasOptions,
  EstadisticaAgrupada,
  PaginatedPagoExternoResponse
} from '../types';

/**
 * Custom hook for managing Pagos Externos (External Payments)
 */
export const usePagosExternos = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state for handling additional UI needs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Select all the data from Redux store
  const pagosExternos = useSelector(selectPagosExternos);
  const selectedPagoExterno = useSelector(selectSelectedPagoExterno);
  const clientePagos = useSelector(selectClientePagos);
  const estadisticasPorTipo = useSelector(selectEstadisticasPorTipo);
  const estadisticasPorSucursal = useSelector(selectEstadisticasPorSucursal);
  const estadisticasMetadata = useSelector(selectEstadisticasMetadata);
  const isLoading = useSelector(selectPagosExternosLoading);
  const reduxError = useSelector(selectPagosExternosError);
  
  // Clear error state when component unmounts or when needed
  useEffect(() => {
    return () => {
      dispatch(clearPagoExternoError());
    };
  }, [dispatch]);

  // Combined error from local state and Redux state
  const error = localError || reduxError;
  
  /**
   * Fetches all pagos externos with optional filters
   */
  const getPagosExternos = useCallback(async (filters?: FilterPagoExternoDto): Promise<PaginatedPagoExternoResponse | undefined> => {
    try {
      setLocalError(null);
      const resultAction = await dispatch(fetchPagosExternos(filters));
      if (fetchPagosExternos.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
    } catch (error: any) {
      setLocalError(error.message || 'Error al obtener pagos externos');
    }
    return undefined;
  }, [dispatch]);

  /**
   * Fetches a single pago externo by ID
   */
  const getPagoExternoById = useCallback(async (id: number): Promise<PagoExterno | undefined> => {
    try {
      setLocalError(null);
      const resultAction = await dispatch(fetchPagoExternoById(id));
      if (fetchPagoExternoById.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
    } catch (error: any) {
      setLocalError(error.message || `Error al obtener pago externo con ID ${id}`);
    }
    return undefined;
  }, [dispatch]);

  /**
   * Creates a new pago externo
   */
  const createNewPagoExterno = useCallback(async (data: CreatePagoExternoDto): Promise<PagoExterno | undefined> => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      const resultAction = await dispatch(createPagoExterno(data));
      if (createPagoExterno.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
    } catch (error: any) {
      setLocalError(error.message || 'Error al crear pago externo');
    } finally {
      setIsSubmitting(false);
    }
    return undefined;
  }, [dispatch]);

  /**
   * Updates an existing pago externo
   */
  const updateExistingPagoExterno = useCallback(async (id: number, data: UpdatePagoExternoDto): Promise<PagoExterno | undefined> => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      const resultAction = await dispatch(updatePagoExterno({ id, pagoExternoData: data }));
      if (updatePagoExterno.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
    } catch (error: any) {
      setLocalError(error.message || `Error al actualizar pago externo con ID ${id}`);
    } finally {
      setIsSubmitting(false);
    }
    return undefined;
  }, [dispatch]);

  /**
   * Deletes a pago externo by ID
   */
  const removepagoExterno = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLocalError(null);
      const resultAction = await dispatch(deletePagoExterno(id));
      if (deletePagoExterno.fulfilled.match(resultAction)) {
        return true;
      }
      return false;
    } catch (error: any) {
      setLocalError(error.message || `Error al eliminar pago externo con ID ${id}`);
      return false;
    }
  }, [dispatch]);

  /**
   * Fetches pagos externos associated with a specific client
   */
  const getPagosPorCliente = useCallback(async (noCliente: number, filters?: FilterPagoExternoDto) => {
    try {
      setLocalError(null);
      const resultAction = await dispatch(fetchPagosPorCliente({ noCliente, filters }));
      if (fetchPagosPorCliente.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
    } catch (error: any) {
      setLocalError(error.message || `Error al obtener pagos del cliente ${noCliente}`);
    }
    return { data: [], total: 0 };
  }, [dispatch]);

  /**
   * Gets statistics grouped by type
   */
  const getTotalPorTipo = useCallback(async (options?: EstadisticasOptions) => {
    try {
      setLocalError(null);
      const resultAction = await dispatch(fetchEstadisticasPorTipo(options || {}));
      if (fetchEstadisticasPorTipo.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
    } catch (error: any) {
      setLocalError(error.message || 'Error al obtener estadísticas por tipo');
    }
  }, [dispatch]);

  /**
   * Gets statistics grouped by branch office
   */
  const getTotalPorSucursal = useCallback(async (options?: EstadisticasOptions) => {
    try {
      setLocalError(null);
      const resultAction = await dispatch(fetchEstadisticasPorSucursal(options || {}));
      if (fetchEstadisticasPorSucursal.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
    } catch (error: any) {
      setLocalError(error.message || 'Error al obtener estadísticas por sucursal');
    }
  }, [dispatch]);

  /**
   * Clears the selected pago externo from state
   */
  const clearPagoExternoSelection = useCallback(() => {
    dispatch(clearSelectedPagoExterno());
  }, [dispatch]);

  /**
   * Clears statistics data from state
   */
  const clearEstadisticasData = useCallback(() => {
    dispatch(clearEstadisticas());
  }, [dispatch]);

  /**
   * Clears any error messages
   */
  const clearErrors = useCallback(() => {
    setLocalError(null);
    dispatch(clearPagoExternoError());
  }, [dispatch]);

  /**
   * Processes statistics data for visualization
   * This is a utility function to help format the data for charts
   */
  const processEstadisticasForCharts = useCallback((estadisticas: EstadisticaAgrupada[]) => {
    return {
      labels: estadisticas.map(item => item.categoria.replace(/_/g, ' ')),
      data: estadisticas.map(item => item.total),
      percentages: estadisticas.map(item => item.porcentaje || 0),
      totals: {
        monto: estadisticasMetadata.total,
        cantidad: estadisticasMetadata.cantidad,
        promedio: estadisticasMetadata.promedio
      }
    };
  }, [estadisticasMetadata]);

  return {
    // Data
    pagosExternos,
    selectedPagoExterno,
    clientePagos,
    estadisticasPorTipo,
    estadisticasPorSucursal,
    estadisticasMetadata,
    
    // Status
    isLoading,
    isSubmitting,
    error,
    
    // CRUD Operations
    getPagosExternos,
    getPagoExternoById,
    createPagoExterno: createNewPagoExterno,
    updatePagoExterno: updateExistingPagoExterno,
    deletePagoExterno: removepagoExterno,
    
    // Client-specific operations
    getPagosPorCliente,
    
    // Statistics operations
    getTotalPorTipo,
    getTotalPorSucursal,
    processEstadisticasForCharts,
    
    // State management helpers
    clearPagoExternoSelection,
    clearEstadisticasData,
    clearErrors
  };
};