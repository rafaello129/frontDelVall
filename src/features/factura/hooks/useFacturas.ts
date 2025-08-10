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
  fetchFacturasPendientesPorCliente,
  actualizarFacturasVencidas,
  selectFacturas,
  selectSelectedFactura,
  selectFacturasVencidas,
  selectFacturasPendientes,
  selectFacturasLoading,
  selectFacturasError,
  clearSelectedFactura,
  createBulkFactura,
  selectTotalFacturas
} from '../facturaSlice';
import type { CreateFacturaDto, FilterFacturaDto, UpdateFacturaDto } from '../types';

export const useFacturas = () => {
  const dispatch = useAppDispatch();
  const facturas = useAppSelector(selectFacturas);
  const totalFacturas = useAppSelector(selectTotalFacturas);
  const selectedFactura = useAppSelector(selectSelectedFactura);
  const facturasVencidas = useAppSelector(selectFacturasVencidas);
  const facturasPendientes = useAppSelector(selectFacturasPendientes);
  const isLoading = useAppSelector(selectFacturasLoading);
  const error = useAppSelector(selectFacturasError);

  const getAllFacturas = useCallback((filters?: FilterFacturaDto) => {
    return dispatch(fetchFacturas(filters));
  }, [dispatch]);

  const getFacturaById = useCallback((noFactura: string) => {
    return dispatch(fetchFacturaById(noFactura));
  }, [dispatch]);

  const addFactura = useCallback((facturaData: CreateFacturaDto) => {
    return dispatch(createFactura(facturaData)).unwrap();
  }, [dispatch]);
  const addBulkFacturas = useCallback((facturas: CreateFacturaDto[]) => {
    return dispatch(createBulkFactura(facturas)).unwrap();
  }, [dispatch]);
  const updateFacturaById = useCallback((noFactura: string, facturaData: UpdateFacturaDto) => {
    return dispatch(updateFactura({ noFactura, facturaData })).unwrap();
  }, [dispatch]);

  const removeFactura = useCallback((noFactura: string) => {
    return dispatch(deleteFactura(noFactura)).unwrap();
  }, [dispatch]);

  const cambiarEstado = useCallback((noFactura: string, estado: string) => {
    return dispatch(cambiarEstadoFactura({ noFactura, estado })).unwrap();
  }, [dispatch]);

  const getFacturasVencidas = useCallback(() => {
    return dispatch(fetchFacturasVencidas());
  }, [dispatch]);

  const getFacturasPendientesPorCliente = useCallback((noCliente: number) => {
    return dispatch(fetchFacturasPendientesPorCliente(noCliente));
  }, [dispatch]);

  const actualizarVencidas = useCallback(() => {
    return dispatch(actualizarFacturasVencidas());
  }, [dispatch]);

  const clearFactura = useCallback(() => {
    dispatch(clearSelectedFactura());
  }, [dispatch]);

  return {
    // Estado
    facturas,
    selectedFactura,
    totalFacturas,
    facturasVencidas,
    facturasPendientes,
    isLoading,
    error,
    
    // Acciones
    getAllFacturas,
    getFacturaById,
    addFactura,
    addBulkFacturas,
    updateFacturaById,
    removeFactura,
    cambiarEstado,
    getFacturasVencidas,
    getFacturasPendientesPorCliente,
    actualizarVencidas,
    clearFactura
  };
};