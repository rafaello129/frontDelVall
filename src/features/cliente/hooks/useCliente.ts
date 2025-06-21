import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchClientes,
  fetchClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  fetchFacturasPendientes,
  fetchAntiguedadSaldos,
  clearSelectedCliente,
  clearFacturasPendientes,
  clearAntiguedadSaldos,
  clearError,
  updatePagination,
  selectClientes,
  selectSelectedCliente,
  selectFacturasPendientes,
  selectAntiguedadSaldos,
  selectPagination,
  selectClienteIsLoading,
  selectClienteError
} from '../clienteSlice';
import type { 
  CreateClienteDto, 
  UpdateClienteDto, 
  FilterClienteDto, 
  AntiguedadSaldosDto,
  Cliente 
} from '../types';

export const useCliente = () => {
  const dispatch = useAppDispatch();
  
  const clientes = useAppSelector(selectClientes);
  const selectedCliente = useAppSelector(selectSelectedCliente);
  const facturasPendientes = useAppSelector(selectFacturasPendientes);
  const antiguedadSaldos = useAppSelector(selectAntiguedadSaldos);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectClienteIsLoading);
  const error = useAppSelector(selectClienteError);

  const getAllClientes = useCallback((filters: FilterClienteDto = {}) => {
    // Usar la paginación del estado si no se proporciona
    console.log("hola")
    const defaultFilters: FilterClienteDto = {
      limit: pagination.limit,
      skip: pagination.skip,
      sortBy: 'razonSocial',
      order: 'asc'
    };
    return dispatch(fetchClientes({ ...defaultFilters, ...filters })).unwrap();
  }, [dispatch, pagination]);

  const getClienteById = useCallback((noCliente: number) => {
    return dispatch(fetchClienteById(noCliente)).unwrap();
  }, [dispatch]);

  const getFacturasPendientes = useCallback((noCliente: number) => {
    return dispatch(fetchFacturasPendientes(noCliente)).unwrap();
  }, [dispatch]);

  const getAntiguedadSaldos = useCallback((params: AntiguedadSaldosDto) => {
    return dispatch(fetchAntiguedadSaldos(params)).unwrap();
  }, [dispatch]);

  const addCliente = useCallback((cliente: CreateClienteDto) => {
    return dispatch(createCliente(cliente)).unwrap();
  }, [dispatch]);

  const editCliente = useCallback((noCliente: number, data: UpdateClienteDto) => {
    return dispatch(updateCliente({ noCliente, data })).unwrap();
  }, [dispatch]);

  const removeCliente = useCallback((noCliente: number) => {
    return dispatch(deleteCliente(noCliente)).unwrap();
  }, [dispatch]);

  const clearCliente = useCallback(() => {
    dispatch(clearSelectedCliente());
  }, [dispatch]);

  const clearFacturas = useCallback(() => {
    dispatch(clearFacturasPendientes());
  }, [dispatch]);

  const clearSaldos = useCallback(() => {
    dispatch(clearAntiguedadSaldos());
  }, [dispatch]);

  const setPagination = useCallback((limit?: number, skip?: number) => {
    dispatch(updatePagination({ limit, skip }));
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Estado
    clientes,
    selectedCliente,
    facturasPendientes,
    antiguedadSaldos,
    pagination,
    isLoading,
    error,
    
    // Acciones
    getAllClientes,
    getClienteById,
    getFacturasPendientes,
    getAntiguedadSaldos,
    addCliente,
    editCliente,
    removeCliente,
    clearCliente,
    clearFacturas,
    clearSaldos,
    setPagination,
    resetError
  };
};