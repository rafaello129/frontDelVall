import { privateApi } from '../../services/api';
import type { 
  Factura, 
  CreateFacturaDto, 
  UpdateFacturaDto, 
  FilterFacturaDto, 
  CambioEstadoDto,
  PaginatedFacturasResponse,
  FacturasClienteResponse
} from './types';

const BASE_URL = '/factura';

export const facturaAPI = {
  // Obtener todas las facturas con filtros opcional
  getAllFacturas: async (filters?: FilterFacturaDto): Promise<PaginatedFacturasResponse> => {
    const response = await privateApi.get(BASE_URL, { params: filters });
    return response.data;
  },

  // Obtener una factura por número
  getFacturaById: async (noFactura: string): Promise<Factura> => {
    const response = await privateApi.get(`${BASE_URL}/${noFactura}`);
    return response.data;
  },

  // Crear una nueva factura (solo admin)
  createFactura: async (facturaData: CreateFacturaDto): Promise<Factura> => {
    const response = await privateApi.post(BASE_URL, facturaData);
    return response.data;
  },
  createBulk: async (facturas: CreateFacturaDto[]): Promise<Factura[]> => {
    const response = await privateApi.post(`${BASE_URL}/bulk`, facturas);
    return response.data;
  },
  // Actualizar una factura por número
  updateFactura: async (noFactura: string, facturaData: UpdateFacturaDto): Promise<Factura> => {
    const response = await privateApi.patch(`${BASE_URL}/${noFactura}`, facturaData);
    return response.data;
  },

  // Eliminar una factura
  deleteFactura: async (noFactura: string): Promise<{ message: string }> => {
    const response = await privateApi.delete(`${BASE_URL}/${noFactura}`);
    return response.data;
  },

  // Cambiar estado de factura
  cambiarEstado: async (noFactura: string, cambioEstadoDto: CambioEstadoDto): Promise<Factura> => {
    const response = await privateApi.patch(`${BASE_URL}/${noFactura}/estado`, cambioEstadoDto);
    return response.data;
  },

  // Obtener facturas vencidas
  getFacturasVencidas: async (): Promise<PaginatedFacturasResponse> => {
    const response = await privateApi.get(`${BASE_URL}/vencidas`);
    return response.data;
  },

  // Obtener facturas pendientes por cliente
  getFacturasPendientesPorCliente: async (noCliente: number): Promise<any> => {
    const response = await privateApi.get(`${BASE_URL}/cliente/${noCliente}`);
    return response.data;
  },

  // Actualizar facturas vencidas
  actualizarFacturasVencidas: async (): Promise<{ facturasActualizadas: number }> => {
    const response = await privateApi.post(`${BASE_URL}/actualizar-vencidas`);
    return response.data;
  }
};  