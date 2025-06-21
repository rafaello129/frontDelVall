import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchBancos,
  fetchBancoById,
  createBanco,
  updateBanco,
  deleteBanco,
  selectBancos,
  selectSelectedBanco,
  selectBancosLoading,
  selectBancosError,
  clearSelectedBanco
} from '../bancoSlice';
import type { CreateBancoDto, UpdateBancoDto, FilterBancoDto } from '../types';

export const useBancos = () => {
  const dispatch = useAppDispatch();
  const bancos = useAppSelector(selectBancos);
  const selectedBanco = useAppSelector(selectSelectedBanco);
  const isLoading = useAppSelector(selectBancosLoading);
  const error = useAppSelector(selectBancosError);

  const getAllBancos = useCallback((filters: FilterBancoDto) => {
    return dispatch(fetchBancos(filters));
  }, [dispatch]);

  const getBancoById = useCallback((id: number) => {
    return dispatch(fetchBancoById(id));
  }, [dispatch]);

  const addBanco = useCallback((bancoData: CreateBancoDto) => {
    return dispatch(createBanco(bancoData)).unwrap();
  }, [dispatch]);

  const updateBancoById = useCallback((id: number, bancoData: UpdateBancoDto) => {
    return dispatch(updateBanco({ id, bancoData })).unwrap();
  }, [dispatch]);

  const removeBanco = useCallback((id: number) => {
    return dispatch(deleteBanco(id)).unwrap();
  }, [dispatch]);

  const clearBanco = useCallback(() => {
    dispatch(clearSelectedBanco());
  }, [dispatch]);

  return {
    // Estado
    bancos,
    selectedBanco,
    isLoading,
    error,
    
    // Acciones
    getAllBancos,
    getBancoById,
    addBanco,
    updateBancoById,
    removeBanco,
    clearBanco
  };
};