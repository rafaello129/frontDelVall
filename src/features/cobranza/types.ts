// Definición de tipos para las entidades y respuestas de la API
import { TipoPago, Sucursal } from './enums';

// Interfaces auxiliares para datos relacionados
export interface BancoResumen {
  id: number;
  nombre: string;
}

export interface FacturaResumen {
  noFactura: number;
  emision: Date;
  saldo: number;
  saldoPendiente?: number;
}

export interface ClienteResumen {
  noCliente: number;
  razonSocial: string;
  comercial: string;
}

// Entidad principal
export interface Cobranza {
  id: number;
  fechaPago: Date;
  noFactura: number;
  noCliente: number;
  razonSocial: string;
  nombreComercial: string;
  sucursal: Sucursal;
  total: number;
  tipoCambio: number;
  montoDolares?: number;
  referenciaPago?: string;
  tipoPago: TipoPago;
  bancoId: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
  banco?: BancoResumen;
  factura?: FacturaResumen;
  cliente?: ClienteResumen;
}

// DTOs para crear/actualizar cobranzas
export interface CreateCobranzaDto {
  fechaPago: Date;
  noFactura: number;
  noCliente: number;
  total: number;
  tipoCambio: number;
  montoDolares?: number;
  referenciaPago?: string;
  tipoPago: TipoPago;
  bancoId: number;
  notas?: string;
}

export interface UpdateCobranzaDto {
  fechaPago?: Date;
  total?: number;
  tipoCambio?: number;
  montoDolares?: number;
  referenciaPago?: string;
  tipoPago?: TipoPago;
  bancoId?: number;
  notas?: string;
}

// Filtros para consultar cobranzas
export interface FilterCobranzaDto {
  id?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  noFactura?: number;
  noCliente?: number;
  razonSocial?: string;
  sucursal?: Sucursal;
  montoMinimo?: number;
  montoMaximo?: number;
  tipoPago?: TipoPago;
  bancoId?: number;
  incluirFactura?: boolean;
  incluirCliente?: boolean;
  incluirBanco?: boolean;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// Estado para el slice de Redux
export interface CobranzaState {
  cobranzas: Cobranza[];
  selectedCobranza: Cobranza | null;
  isLoading: boolean;
  error: string | null;
}

// Respuestas paginadas
export interface PaginatedCobranzasResponse {
  data: Cobranza[];
  total: number;
}

// Respuesta para reportes
export interface ReporteCobranza {
  totalCobranza: number;
  porTipoPago: Record<string, number>;
  porSucursal: Record<string, number>;
  porBanco: Record<string, number>;
  cobranzasDiarias: {
    fecha: string;
    total: number;
  }[];
}