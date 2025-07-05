import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchBitacoras,
  fetchBitacoraById,
  fetchBitacorasByCliente,
  fetchBitacorasByProyeccion,
  createBitacora,
  updateBitacora,
  deleteBitacora,
  clearSelectedBitacora,
  clearBitacoraError,
  updateBitacoraPagination,
  selectBitacoras,
  selectSelectedBitacora,
  selectClienteBitacoras,
  selectProyeccionBitacoras,
  selectBitacoraPagination,
  selectBitacoraIsLoading,
  selectBitacoraError
} from '../bitacoraSlice';
import type { 
  CreateBitacoraPagoDto, 
  UpdateBitacoraPagoDto, 
  FilterBitacoraPagoDto 
} from '../types';

export const useBitacora = () => {
  const dispatch = useAppDispatch();
  
  const bitacoras = useAppSelector(selectBitacoras);
  const selectedBitacora = useAppSelector(selectSelectedBitacora);
  const clienteBitacoras = useAppSelector(selectClienteBitacoras);
  const proyeccionBitacoras = useAppSelector(selectProyeccionBitacoras);
  const pagination = useAppSelector(selectBitacoraPagination);
  const isLoading = useAppSelector(selectBitacoraIsLoading);
  const error = useAppSelector(selectBitacoraError);

  const getAllBitacoras = useCallback((filters?: FilterBitacoraPagoDto) => {
    return dispatch(fetchBitacoras({
      ...filters,
      page: filters?.page || pagination.page,
      limit: filters?.limit || pagination.limit
    })).unwrap();
  }, [dispatch, pagination]);

  const getBitacoraById = useCallback((id: number) => {
    return dispatch(fetchBitacoraById(id)).unwrap();
  }, [dispatch]);

  const getBitacorasByCliente = useCallback((noCliente: number) => {
    return dispatch(fetchBitacorasByCliente(noCliente)).unwrap();
  }, [dispatch]);

  const getBitacorasByProyeccion = useCallback((proyeccionId: number) => {
    return dispatch(fetchBitacorasByProyeccion(proyeccionId)).unwrap();
  }, [dispatch]);

  const addBitacora = useCallback((bitacoraData: CreateBitacoraPagoDto) => {
    return dispatch(createBitacora(bitacoraData)).unwrap();
  }, [dispatch]);

  const editBitacora = useCallback((id: number, data: UpdateBitacoraPagoDto) => {
    return dispatch(updateBitacora({ id, data })).unwrap();
  }, [dispatch]);

  const removeBitacora = useCallback((id: number) => {
    return dispatch(deleteBitacora(id)).unwrap();
  }, [dispatch]);

  const clearBitacora = useCallback(() => {
    dispatch(clearSelectedBitacora());
  }, [dispatch]);

  const setPaginationParams = useCallback((page?: number, limit?: number) => {
    dispatch(updateBitacoraPagination({ page, limit }));
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearBitacoraError());
  }, [dispatch]);

  return {
    // Estado
    bitacoras,
    selectedBitacora,
    clienteBitacoras,
    proyeccionBitacoras,
    pagination,
    isLoading,
    error,
    
    // Acciones
    getAllBitacoras,
    getBitacoraById,
    getBitacorasByCliente,
    getBitacorasByProyeccion,
    addBitacora,
    editBitacora,
    removeBitacora,
    clearBitacora,
    setPaginationParams,
    resetError
  };
};