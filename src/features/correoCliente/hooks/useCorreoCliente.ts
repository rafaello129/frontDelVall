import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchCorreos,
  fetchCorreoById,
  fetchCorreosByCliente,
  validateEmail,
  createCorreo,
  updateCorreo,
  deleteCorreo,
  clearSelectedCorreo,
  clearError,
  selectCorreos,
  selectSelectedCorreo,
  selectCorreoIsLoading,
  selectCorreoError
} from '../correoClienteSlice';
import type { CreateCorreoDto, UpdateCorreoDto, EmailValidationResult } from '../types';

export const useCorreoCliente = () => {
  const dispatch = useAppDispatch();
  
  const correos = useAppSelector(selectCorreos);
  const selectedCorreo = useAppSelector(selectSelectedCorreo);
  const isLoading = useAppSelector(selectCorreoIsLoading);
  const error = useAppSelector(selectCorreoError);

  const getAllCorreos = useCallback((noCliente: number) => {
    return dispatch(fetchCorreos(noCliente)).unwrap();
  }, [dispatch]);

  const getCorreoById = useCallback((id: number) => {
    return dispatch(fetchCorreoById(id)).unwrap();
  }, [dispatch]);

  const getCorreosByCliente = useCallback((noCliente: number) => {
    return dispatch(fetchCorreosByCliente(noCliente)).unwrap();
  }, [dispatch]);

  const validateCorreo = useCallback((email: string): Promise<EmailValidationResult> => {
    return dispatch(validateEmail(email)).unwrap();
  }, [dispatch]);

  const addCorreo = useCallback((correo: CreateCorreoDto) => {
    return dispatch(createCorreo(correo)).unwrap();
  }, [dispatch]);

  const editCorreo = useCallback((id: number, data: UpdateCorreoDto) => {
    return dispatch(updateCorreo({ id, data })).unwrap();
  }, [dispatch]);

  const removeCorreo = useCallback((id: number) => {
    return dispatch(deleteCorreo(id)).unwrap();
  }, [dispatch]);

  const clearCorreo = useCallback(() => {
    dispatch(clearSelectedCorreo());
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Estado
    correos,
    selectedCorreo,
    isLoading,
    error,
    
    // Acciones
    getAllCorreos,
    getCorreoById,
    getCorreosByCliente,
    validateCorreo,
    addCorreo,
    editCorreo,
    removeCorreo,
    clearCorreo,
    resetError
  };
};