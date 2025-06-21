import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchCobranzas,
  fetchCobranzaById,
  createCobranza,
  updateCobranza,
  deleteCobranza,
  fetchPagosPorFactura,
  selectCobranzas,
  selectSelectedCobranza,
  selectCobranzasLoading,
  selectCobranzasError,
  clearSelectedCobranza
} from '../cobranzaSlice';
import type { CreateCobranzaDto, UpdateCobranzaDto, FilterCobranzaDto } from '../types';

export const useCobranzas = () => {
  const dispatch = useAppDispatch();
  const cobranzas = useAppSelector(selectCobranzas);
  const selectedCobranza = useAppSelector(selectSelectedCobranza);
  const isLoading = useAppSelector(selectCobranzasLoading);
  const error = useAppSelector(selectCobranzasError);

  const getAllCobranzas = useCallback((filters: FilterCobranzaDto) => {
    return dispatch(fetchCobranzas(filters));
  }, [dispatch]);

  const getCobranzaById = useCallback((id: number) => {
    return dispatch(fetchCobranzaById(id));
  }, [dispatch]);

  const getPagosPorFactura = useCallback((noFactura: number) => {
    return dispatch(fetchPagosPorFactura(noFactura));
  }, [dispatch]);

  const addCobranza = useCallback((cobranzaData: CreateCobranzaDto) => {
    return dispatch(createCobranza(cobranzaData)).unwrap();
  }, [dispatch]);

  const updateCobranzaById = useCallback((id: number, cobranzaData: UpdateCobranzaDto) => {
    return dispatch(updateCobranza({ id, cobranzaData })).unwrap();
  }, [dispatch]);

  const removeCobranza = useCallback((id: number) => {
    return dispatch(deleteCobranza(id)).unwrap();
  }, [dispatch]);

  const clearCobranza = useCallback(() => {
    dispatch(clearSelectedCobranza());
  }, [dispatch]);

  return {
    // Estado
    cobranzas,
    selectedCobranza,
    isLoading,
    error,
    
    // Acciones
    getAllCobranzas,
    getCobranzaById,
    getPagosPorFactura,
    addCobranza,
    updateCobranzaById,
    removeCobranza,
    clearCobranza
  };
};