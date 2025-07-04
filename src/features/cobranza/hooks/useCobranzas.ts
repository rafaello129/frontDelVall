import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchCobranzas,
  fetchCobranzaById,
  createCobranza,
  updateCobranza,
  deleteCobranza,
  fetchPagosPorFactura,
  fetchPagosPorCliente,
  fetchReporteCobranza,
  selectCobranzas,
  selectSelectedCobranza,
  fetchReportePorRegion,
  selectReporteRegion,
  selectFacturaCobranzas,
  selectClienteCobranzas,
  selectReporteCobranza,
  selectCobranzasLoading,
  selectCobranzasError,
  clearSelectedCobranza
} from '../cobranzaSlice';
import type { CreateCobranzaDto, FilterCobranzaDto, UpdateCobranzaDto } from '../types';

export const useCobranzas = () => {
  const dispatch = useAppDispatch();
  const cobranzas = useAppSelector(selectCobranzas);
  const selectedCobranza = useAppSelector(selectSelectedCobranza);
  const facturaCobranzas = useAppSelector(selectFacturaCobranzas);
  const clienteCobranzas = useAppSelector(selectClienteCobranzas);
  const reporte = useAppSelector(selectReporteCobranza);
  const isLoading = useAppSelector(selectCobranzasLoading);
  const error = useAppSelector(selectCobranzasError);
  const reporteRegion = useAppSelector(selectReporteRegion);
  
  const getReportePorRegion = useCallback((params: { fechaDesde?: Date, fechaHasta?: Date } = {}) => {
    return dispatch(fetchReportePorRegion(params));
  }, [dispatch]);
  const getAllCobranzas = useCallback((filters?: FilterCobranzaDto) => {
    return dispatch(fetchCobranzas(filters));
  }, [dispatch]);

  const getCobranzaById = useCallback((id: number) => {
    return dispatch(fetchCobranzaById(id));
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

  const getPagosPorFactura = useCallback((noFactura: number) => {
    return dispatch(fetchPagosPorFactura(noFactura));
  }, [dispatch]);

  const getPagosPorCliente = useCallback((noCliente: number, filters?: FilterCobranzaDto) => {
    return dispatch(fetchPagosPorCliente({ noCliente, filters }));
  }, [dispatch]);

  const getReporteCobranza = useCallback((params: { fechaDesde: Date, fechaHasta: Date }) => {
    return dispatch(fetchReporteCobranza(params));
  }, [dispatch]);

  const clearCobranza = useCallback(() => {
    dispatch(clearSelectedCobranza());
  }, [dispatch]);

  return {
    // Estado
    cobranzas,
    selectedCobranza,
    facturaCobranzas,
    clienteCobranzas,
    reporteRegion,
    reporte,
    isLoading,
    error,
    
    // Acciones
    getAllCobranzas,
    getCobranzaById,
    addCobranza,
    updateCobranzaById,
    removeCobranza,
    getPagosPorFactura,
    getPagosPorCliente,
    getReporteCobranza,
    getReportePorRegion,
    clearCobranza
  };
};