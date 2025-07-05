import { useCallback } from 'react';
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
  clearSelectedProyeccion,
  clearProyeccionError,
  updatePaginationParams,
  selectProyecciones,
  selectSelectedProyeccion,
  selectProyeccionesVencidas,
  selectPaginationParams,
  selectProyeccionIsLoading,
  selectProyeccionError
} from '../proyeccionSlice';
import type { 
  CreateProyeccionPagoDto, 
  UpdateProyeccionPagoDto, 
  FilterProyeccionPagoDto 
} from '../types';

export const useProyecciones = () => {
  const dispatch = useAppDispatch();
  
  const proyecciones = useAppSelector(selectProyecciones);
  const selectedProyeccion = useAppSelector(selectSelectedProyeccion);
  const proyeccionesVencidas = useAppSelector(selectProyeccionesVencidas);
  const pagination = useAppSelector(selectPaginationParams);
  const isLoading = useAppSelector(selectProyeccionIsLoading);
  const error = useAppSelector(selectProyeccionError);

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

  const clearProyeccion = useCallback(() => {
    dispatch(clearSelectedProyeccion());
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
    isLoading,
    error,
    
    // Acciones
    getAllProyecciones,
    getProyeccionById,
    getProyeccionesByCliente,
    getProyeccionesVencidas,
    addProyeccion,
    editProyeccion,
    markNotificacionEnviada,
    removeProyeccion,
    clearProyeccion,
    setPaginationParams,
    resetError
  };
};