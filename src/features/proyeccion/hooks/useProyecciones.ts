import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchProyecciones,
  fetchProyeccionById,
  fetchProyeccionesByCliente,
  fetchProyeccionesVencidas,
  createProyeccion,
  updateProyeccion,
  marcarNotificacionEnviada,
  deleteProyeccion,
  fetchEstadisticasGenerales,
  fetchPatronPago,
  fetchComportamientoCliente,
  fetchRiesgoCliente,
  fetchAnalisisEstacionalidad,
  generarProyeccionesAutomaticas,
  crearProyeccionesDesdeAnalisis,
  clearSelectedProyeccion,
  clearProyeccionError,
  updatePaginationParams,
  clearAnalytics,
  selectProyecciones,
  selectSelectedProyeccion,
  selectProyeccionesVencidas,
  selectPaginationParams,
  selectEstadisticasGenerales,
  selectPatronPago,
  selectComportamientoCliente,
  selectRiesgoCliente,
  selectAnalisisEstacionalidad,
  selectProyeccionesAutomaticas,
  selectProyeccionIsLoading,
  selectProyeccionError
} from '../proyeccionSlice';
import type { 
  CreateProyeccionPagoDto, 
  UpdateProyeccionPagoDto, 
  FilterProyeccionPagoDto,
  EstadisticasProyeccionFilterDto,
  ProyeccionAutomaticaDto
} from '../types';

export const useProyecciones = () => {
  const dispatch = useAppDispatch();
  
  // Local loading states for specific operations
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [loadingPatron, setLoadingPatron] = useState(false);
  const [loadingComportamiento, setLoadingComportamiento] = useState(false);
  const [loadingRiesgo, setLoadingRiesgo] = useState(false);
  const [loadingEstacionalidad, setLoadingEstacionalidad] = useState(false);
  const [loadingAutomaticas, setLoadingAutomaticas] = useState(false);
  
  // Select state from Redux
  const proyecciones = useAppSelector(selectProyecciones);
  const selectedProyeccion = useAppSelector(selectSelectedProyeccion);
  const proyeccionesVencidas = useAppSelector(selectProyeccionesVencidas);
  const pagination = useAppSelector(selectPaginationParams);
  const estadisticasGenerales = useAppSelector(selectEstadisticasGenerales);
  const patronPago = useAppSelector(selectPatronPago);
  const comportamientoCliente = useAppSelector(selectComportamientoCliente);
  const riesgoCliente = useAppSelector(selectRiesgoCliente);
  const analisisEstacionalidad = useAppSelector(selectAnalisisEstacionalidad);
  const proyeccionesAutomaticas = useAppSelector(selectProyeccionesAutomaticas);
  const isLoading = useAppSelector(selectProyeccionIsLoading);
  const error = useAppSelector(selectProyeccionError);

  // Existing methods
  const getAllProyecciones = useCallback((filters?: FilterProyeccionPagoDto) => {
    return dispatch(fetchProyecciones({
      ...filters,
      page: filters?.page || pagination.page,
      limit: filters?.limit || pagination.limit
    })).unwrap();
  }, [dispatch, pagination]);

  const getProyeccionById = useCallback((id: number) => {
    return dispatch(fetchProyeccionById(id)).unwrap();
  }, [dispatch]);

  const getProyeccionesByCliente = useCallback((noCliente: number) => {
    return dispatch(fetchProyeccionesByCliente(noCliente)).unwrap();
  }, [dispatch]);

  const getProyeccionesVencidas = useCallback(() => {
    return dispatch(fetchProyeccionesVencidas()).unwrap();
  }, [dispatch]);

  const addProyeccion = useCallback((proyeccionData: CreateProyeccionPagoDto) => {
    return dispatch(createProyeccion(proyeccionData)).unwrap();
  }, [dispatch]);

  const editProyeccion = useCallback((id: number, data: UpdateProyeccionPagoDto) => {
    return dispatch(updateProyeccion({ id, data })).unwrap();
  }, [dispatch]);

  const markNotificacionEnviada = useCallback((id: number) => {
    return dispatch(marcarNotificacionEnviada(id)).unwrap();
  }, [dispatch]);

  const removeProyeccion = useCallback((id: number) => {
    return dispatch(deleteProyeccion(id)).unwrap();
  }, [dispatch]);

  // NEW METHODS FOR ANALYTICS AND AI FEATURES

  const getEstadisticasGenerales = useCallback(async (filters: EstadisticasProyeccionFilterDto) => {
    try {
      setLoadingEstadisticas(true);
      return await dispatch(fetchEstadisticasGenerales(filters)).unwrap();
    } finally {
      setLoadingEstadisticas(false);
    }
  }, [dispatch]);

  const getPatronPagoCliente = useCallback(async (noCliente: number) => {
    try {
      setLoadingPatron(true);
      return await dispatch(fetchPatronPago(noCliente)).unwrap();
    } finally {
      setLoadingPatron(false);
    }
  }, [dispatch]);

  const getComportamientoCliente = useCallback(async (noCliente: number) => {
    try {
      setLoadingComportamiento(true);
      return await dispatch(fetchComportamientoCliente(noCliente)).unwrap();
    } finally {
      setLoadingComportamiento(false);
    }
  }, [dispatch]);

  const getRiesgoCliente = useCallback(async (noCliente: number) => {
    try {
      setLoadingRiesgo(true);
      return await dispatch(fetchRiesgoCliente(noCliente)).unwrap();
    } finally {
      setLoadingRiesgo(false);
    }
  }, [dispatch]);

  const getAnalisisEstacionalidad = useCallback(async (params: { fechaDesde?: string, fechaHasta?: string, sucursal?: string }) => {
    try {
      setLoadingEstacionalidad(true);
      return await dispatch(fetchAnalisisEstacionalidad(params)).unwrap();
    } finally {
      setLoadingEstacionalidad(false);
    }
  }, [dispatch]);

  const generarProyecciones = useCallback(async (config: ProyeccionAutomaticaDto) => {
    try {
      setLoadingAutomaticas(true);
      return await dispatch(generarProyeccionesAutomaticas(config)).unwrap();
    } finally {
      setLoadingAutomaticas(false);
    }
  }, [dispatch]);

  const crearProyecciones = useCallback(async (config: ProyeccionAutomaticaDto) => {
    try {
      setLoadingAutomaticas(true);
      return await dispatch(crearProyeccionesDesdeAnalisis(config)).unwrap();
    } finally {
      setLoadingAutomaticas(false);
    }
  }, [dispatch]);

  // Utility methods
  const clearProyeccion = useCallback(() => {
    dispatch(clearSelectedProyeccion());
  }, [dispatch]);

  const clearAnalyticsData = useCallback(() => {
    dispatch(clearAnalytics());
  }, [dispatch]);

  const setPaginationParams = useCallback((page?: number, limit?: number) => {
    dispatch(updatePaginationParams({ page, limit }));
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearProyeccionError());
  }, [dispatch]);

  return {
    // Estado
    proyecciones,
    selectedProyeccion,
    proyeccionesVencidas,
    pagination,
    estadisticasGenerales,
    patronPago,
    comportamientoCliente,
    riesgoCliente,
    analisisEstacionalidad,
    proyeccionesAutomaticas,
    isLoading,
    error,
    
    // Estados de carga específicos
    loadingEstadisticas,
    loadingPatron,
    loadingComportamiento,
    loadingRiesgo,
    loadingEstacionalidad,
    loadingAutomaticas,
    
    // Acciones básicas
    getAllProyecciones,
    getProyeccionById,
    getProyeccionesByCliente,
    getProyeccionesVencidas,
    addProyeccion,
    editProyeccion,
    markNotificacionEnviada,
    removeProyeccion,
    
    // Nuevas acciones para analytics e IA
    getEstadisticasGenerales,
    getPatronPagoCliente,
    getComportamientoCliente,
    getRiesgoCliente,
    getAnalisisEstacionalidad,
    generarProyecciones,
    crearProyecciones,
    
    // Utilidades
    clearProyeccion,
    clearAnalyticsData,
    setPaginationParams,
    resetError
  };
};