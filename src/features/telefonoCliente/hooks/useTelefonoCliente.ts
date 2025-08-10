import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchTelefonos,
  fetchTelefonoById,
  fetchTelefonosByCliente,
  createTelefono,
  updateTelefono,
  deleteTelefono,
  clearSelectedTelefono,
  clearError,
  selectTelefonos,
  selectSelectedTelefono,
  selectTelefonoIsLoading,
  selectTelefonoError
} from '../telefonoClienteSlice';
import type { CreateTelefonoDto, UpdateTelefonoDto } from '../types';

export const useTelefonoCliente = () => {
  const dispatch = useAppDispatch();
  
  const telefonos = useAppSelector(selectTelefonos);
  const selectedTelefono = useAppSelector(selectSelectedTelefono);
  const isLoading = useAppSelector(selectTelefonoIsLoading);
  const error = useAppSelector(selectTelefonoError);

  const getAllTelefonos = useCallback((noCliente: number) => {
    return dispatch(fetchTelefonos(noCliente)).unwrap();
  }, [dispatch]);

  const getTelefonoById = useCallback((id: number) => {
    return dispatch(fetchTelefonoById(id)).unwrap();
  }, [dispatch]);

  const getTelefonosByCliente = useCallback((noCliente: number) => {
    return dispatch(fetchTelefonosByCliente(noCliente)).unwrap();
  }, [dispatch]);

  const addTelefono = useCallback((telefono: CreateTelefonoDto) => {
    return dispatch(createTelefono(telefono)).unwrap();
  }, [dispatch]);

  const editTelefono = useCallback((id: number, data: UpdateTelefonoDto) => {
    return dispatch(updateTelefono({ id, data })).unwrap();
  }, [dispatch]);

  const removeTelefono = useCallback((id: number) => {
    return dispatch(deleteTelefono(id)).unwrap();
  }, [dispatch]);

  const clearTelefono = useCallback(() => {
    dispatch(clearSelectedTelefono());
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Estado
    telefonos,
    selectedTelefono,
    isLoading,
    error,
    
    // Acciones
    getAllTelefonos,
    getTelefonoById,
    getTelefonosByCliente,
    addTelefono,
    editTelefono,
    removeTelefono,
    clearTelefono,
    resetError
  };
};