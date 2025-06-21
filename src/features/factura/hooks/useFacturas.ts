import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchFacturas,
  fetchFacturaById,
  createFactura,
  updateFactura,
  deleteFactura,
  cambiarEstadoFactura,
  fetchFacturasVencidas,
  selectFacturas,
  selectSelectedFactura,
  selectFacturasLoading,
  selectFacturasError,
  clearSelectedFactura
} from '../facturaSlice';
import type { CreateFacturaDto, UpdateFacturaDto, FilterFacturaDto } from '../types';
import { facturaAPI } from '../facturaAPI';

export const useFacturas = () => {
  const dispatch = useAppDispatch();
  const facturas = useAppSelector(selectFacturas);
  const selectedFactura = useAppSelector(selectSelectedFactura);
  const isLoading = useAppSelector(selectFacturasLoading);
  const error = useAppSelector(selectFacturasError);

  const getAllFacturas = useCallback((filters: FilterFacturaDto) => {
    return dispatch(fetchFacturas(filters));
  }, [dispatch]);

  const getFacturaById = useCallback((noFactura: number) => {
    return dispatch(fetchFacturaById(noFactura));
  }, [dispatch]);

  const getFacturasVencidas = useCallback(() => {
    return dispatch(fetchFacturasVencidas());
  }, [dispatch]);

  const getFacturasPendientesPorCliente = useCallback((noCliente: number) => {
    return facturaAPI.getFacturasPendientesPorCliente(noCliente);
  }, []);

  const actualizarFacturasVencidas = useCallback(() => {
    return facturaAPI.actualizarFacturasVencidas();
  }, []);

  const addFactura = useCallback((facturaData: CreateFacturaDto) => {
    return dispatch(createFactura(facturaData)).unwrap();
  }, [dispatch]);

  const updateFacturaById = useCallback((noFactura: number, facturaData: UpdateFacturaDto) => {
    return dispatch(updateFactura({ noFactura, facturaData })).unwrap();
  }, [dispatch]);

  const removeFactura = useCallback((noFactura: number) => {
    return dispatch(deleteFactura(noFactura)).unwrap();
  }, [dispatch]);

  const cambiarEstado = useCallback((noFactura: number, estado: string) => {
    return dispatch(cambiarEstadoFactura({ noFactura, estado })).unwrap();
  }, [dispatch]);

  const clearFactura = useCallback(() => {
    dispatch(clearSelectedFactura());
  }, [dispatch]);

  return {
    // Estado
    facturas,
    selectedFactura,
    isLoading,
    error,
    
    // Acciones
    getAllFacturas,
    getFacturaById,
    getFacturasVencidas,
    getFacturasPendientesPorCliente,
    actualizarFacturasVencidas,
    addFactura,
    updateFacturaById,
    removeFactura,
    cambiarEstado,
    clearFactura
  };
};