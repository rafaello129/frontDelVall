// Definición de tipos para la entidad PagoExterno y respuestas de la API
import { TipoPago, Sucursal, TipoPagoExterno } from '../shared/enums';

// Interfaces auxiliares para datos relacionados
export interface BancoResumen {
  id: number;
  nombre: string;
  codigoBancario?: string;
}

export interface ClienteResumen {
  noCliente: number;
  razonSocial: string;
  comercial: string;
}

// Entidad principal
export interface PagoExterno {
  id: number;
  fechaPago: Date;
  monto: number;
  tipoCambio: number;
  montoDolares?: number;
  tipo: TipoPagoExterno;
  noCliente?: number;
  nombrePagador?: string;
  sucursal?: Sucursal;
  concepto?: string;
  codigoTransferencia?: string;
  tipoMovimiento?: string;
  referenciaPago?: string;
  tipoPago: TipoPago;
  bancoId: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
  banco?: BancoResumen;
  cliente?: ClienteResumen;
}

// DTOs para crear/actualizar pagos externos
export interface CreatePagoExternoDto {
  fechaPago: Date;
  monto: number;
  tipoCambio: number;
  montoDolares?: number;
  tipo: TipoPagoExterno;
  noCliente?: number;
  nombrePagador?: string;
  sucursal?: Sucursal;
  concepto?: string;
  codigoTransferencia?: string;
  tipoMovimiento?: string;
  referenciaPago?: string;
  tipoPago: TipoPago;
  bancoId: number;
  notas?: string;
}

export interface UpdatePagoExternoDto {
  fechaPago?: Date;
  monto?: number;
  tipoCambio?: number;
  montoDolares?: number;
  tipo?: TipoPagoExterno;
  noCliente?: number | null;
  nombrePagador?: string;
  sucursal?: Sucursal;
  concepto?: string;
  codigoTransferencia?: string;
  tipoMovimiento?: string;
  referenciaPago?: string;
  tipoPago?: TipoPago;
  bancoId?: number;
  notas?: string;
}

// Filtros para consultar pagos externos
export interface FilterPagoExternoDto {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipo?: TipoPagoExterno;
  noCliente?: number;
  nombrePagador?: string;
  sucursal?: Sucursal;
  concepto?: string;
  tipoMovimiento?: string;
  tipoPago?: TipoPago;
  bancoId?: number;
  montoMinimo?: number;
  montoMaximo?: number;
  incluirCliente?: boolean;
  incluirBanco?: boolean;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}



// Respuestas paginadas
export interface PaginatedPagoExternoResponse {
  data: PagoExterno[];
  total: number;
}






// Updated types for statistics
export interface EstadisticasOptions {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipo?: TipoPagoExterno;
  tipoMovimiento?: string;
  sucursal?: Sucursal;
  bancoId?: number;
  tipoPago?: TipoPago;
  montoMinimo?: number;
  montoMaximo?: number;
  incluirDetalle?: boolean;
  agruparPor?: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año';
  moneda?: 'MXN' | 'USD';
  compararConPeriodoAnterior?: number;
}

export interface ComparacionEstadistica {
  total: number;
  cantidad: number;
  promedio: number;
  diferencia: number;
  porcentaje: number;
}

export interface DetallePorPeriodo {
  periodo: string;
  total: number;
  cantidad: number;
}

export interface EstadisticaAgrupada {
  categoria: string;
  total: number;
  cantidad: number;
  promedio: number;
  minimo?: number;
  maximo?: number;
  tendencia?: number;
  porcentaje?: number;
  comparacion?: ComparacionEstadistica;
  detallesPorPeriodo?: DetallePorPeriodo[];
}

export interface EstadisticasResponse {
  data: EstadisticaAgrupada[];
  total: number;
  cantidad: number;
  promedio: number;
  periodoActual: { fechaDesde: Date; fechaHasta: Date };
  periodoComparacion?: { fechaDesde: Date; fechaHasta: Date };
}

// Legacy types kept for backward compatibility
export interface TotalPorTipoResponse {
  tipo: TipoPagoExterno;
  total: number;
  cantidad: number;
}

export interface TotalPorSucursalResponse {
  sucursal: Sucursal;
  total: number;
  cantidad: number;
}

// Updated state interface
export interface PagoExternoState {
  pagosExternos: PagoExterno[];
  selectedPagoExterno: PagoExterno | null;
  clientePagos: PagoExterno[];
  estadisticasPorTipo: EstadisticaAgrupada[];
  estadisticasPorSucursal: EstadisticaAgrupada[];
  estadisticasMetadata: {
    total: number;
    cantidad: number;
    promedio: number;
    periodoActual?: { fechaDesde: Date; fechaHasta: Date };
    periodoComparacion?: { fechaDesde: Date; fechaHasta: Date };
  };
  isLoading: boolean;
  error: string | null;
}