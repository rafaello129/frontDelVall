// Definición de tipos para las entidades y respuestas de la API
import { TipoPago, Sucursal } from '../shared/enums';

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
  noFactura: string;
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
  fechaPago: Date; //
  noFactura: string;//
  noCliente: number;//
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
  noFactura?: string;
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
  noFactura?: string;
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
  limit: number;
  skip: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// Estado para el slice de Redux
// Actualizar el tipo de estado de Cobranza para incluir los nuevos campos
export interface CobranzaState {
  cobranzas: Cobranza[];
  selectedCobranza: Cobranza | null;
  facturaCobranzas: Cobranza[]; // Para pagos por factura
  clienteCobranzas: Cobranza[]; // Para pagos por cliente
  reporte: ReporteCobranza | null; // Para reportes
  reporteRegion: ReporteCobranzaPorRegion | null; // Con la nueva estructura
  isLoading: boolean;
  error: string | null;
}
export type ReporteCobranzaPorRegion = {
  fechas: string[];
  totalGeneral: number;
  totalBancos: number; // Total de cobranzas normales de bancos
  regionesTotales: Record<string, number>;
  cobranzasPorFechaRegion: {
    fecha: string;
    total: number;
    porRegion: Record<string, number>;
  }[];
  // Nuevos campos para pagos externos
  pagoExternosPorTipo: Record<string, {
    total: number;
    porRegion: Record<string, number>;
  }>;
  totalFinal: number; // Total general incluyendo pagos externos
};
// Respuestas paginadas
export interface PaginatedCobranzasResponse {
  data: Cobranza[];
  total: number;
}
export enum TipoPagoExterno {
  COBROS_EFECTIVO_RIVIERA = 'COBROS_EFECTIVO_RIVIERA',
  COBROS_EFECTIVO_NORTE = 'COBROS_EFECTIVO_NORTE',
  COBROS_PACIFICO_BANCO = 'COBROS_PACIFICO_BANCO',
  COBROS_PACIFICO_EFECTIVO = 'COBROS_PACIFICO_EFECTIVO',
  COBRANZA_NORTE_BANCO = 'COBRANZA_NORTE_BANCO',
  COBROS_EFECTIVO_CDMX = 'COBROS_EFECTIVO_CDMX',
  CUENTA_NASSIM = 'CUENTA_NASSIM'
}
// Respuesta para reportes
export interface ReporteCobranza {
  totalCobranza: number;
  porTipoPago: Record<string, number>;
  porSucursal: Record<string, number>;
  porBanco: Record<string, number>;
  cobranzasDiarias: Array<{
    fecha: string;
    total: number;
    count?: number;
  }>;
}