import { TipoPago } from '../shared/enums';
import type { Cliente } from '../cliente/types';
import type { Banco } from '../banco/types';

// Existing Enums
export enum EstadoProyeccion {
  PENDIENTE = 'PENDIENTE',
  CUMPLIDA = 'PAGADO',
  CANCELADA = 'CANCELADO',
  VENCIDA = 'VENCIDO'
}

// Main entity
export interface ProyeccionPago {
  id: number;
  noCliente: number;
  fechaProyectada: Date;
  monto: number;
  estado: EstadoProyeccion;
  noFactura?: string;
  tipoCambio?: number;
  montoDolares?: number;
  bancoId?: number;
  tipoPago?: TipoPago;
  conceptoPago?: string;
  notificacionEnviada: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  cliente?: Cliente;
  banco?: Banco;
}

// Simplified DTO for creating a projection - only essential fields required
export interface CreateProyeccionPagoDto {
  noCliente: number;
  fechaProyectada: Date;
  monto: number;
  // All other fields are optional
  estado?: EstadoProyeccion;
  conceptoPago?: string;
  noFactura?: string;
  tipoCambio?: number;
  montoDolares?: number;
  bancoId?: number;
  tipoPago?: TipoPago;
  notificacionEnviada?: boolean;
}

// DTO for updating a projection - all fields optional
export interface UpdateProyeccionPagoDto {
  noCliente?: number;
  fechaProyectada?: Date;
  monto?: number;
  estado?: EstadoProyeccion;
  noFactura?: string;
  tipoCambio?: number;
  montoDolares?: number;
  bancoId?: number;
  tipoPago?: TipoPago;
  conceptoPago?: string;
  notificacionEnviada?: boolean;
}

// DTO for filtering projections
export interface FilterProyeccionPagoDto {
  noCliente?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: EstadoProyeccion;
  noFactura?: string;
  bancoId?: number;
  tipoPago?: TipoPago;
  notificacionEnviada?: boolean;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// State for Redux slice
export interface ProyeccionPagoState {
  proyecciones: ProyeccionPago[];
  selectedProyeccion: ProyeccionPago | null;
  proyeccionesPendientes: ProyeccionPago[];
  proyeccionesVencidas: ProyeccionPago[];
  estadisticasGenerales: EstadisticasGenerales | null;
  patronPago: PatronPago | null;
  analisisComportamiento: AnalisisComportamiento | null;
  evaluacionRiesgo: EvaluacionRiesgo | null;
  analisisEstacionalidad: AnalisisEstacionalidad | null;
  proyeccionesAutomaticas: ProyeccionAutomatica[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Response for paginated queries
export interface PaginatedProyeccionPagoResponse {
  data: ProyeccionPago[];
  total: number;
}

// Analytics interfaces - keeping these for future expansion
export interface EstadisticasProyeccionFilterDto {
  fechaDesde?: Date;
  fechaHasta?: Date;
  noCliente?: number;
  estado?: EstadoProyeccion;
  bancoId?: number;
  tipoPago?: TipoPago;
  montoMinimo?: number;
  montoMaximo?: number;
  incluirDetalle?: boolean;
  agruparPor?: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año';
  moneda?: 'MXN' | 'USD';
  compararConPeriodoAnterior?: number;
}

export interface EstadisticaProyeccionAgrupada {
  categoria: string;
  total: number;
  cantidad: number;
  promedio: number;
  porcentaje?: number;
  tasaExito?: number;
}

export interface EstadisticasGenerales {
  resumen: {
    totalProyecciones: number;
    montoTotal: number;
    montoPromedio: number;
    tasaExito: number;
    porEstado: {
      pendientes: number;
      programadas: number;
      pagadas: number;
      vencidas: number;
      canceladas: number;
    }
  };
  porEstado: EstadisticaProyeccionAgrupada[];
  porCliente: EstadisticaProyeccionAgrupada[];
  porBanco: EstadisticaProyeccionAgrupada[];
  porTipoPago: EstadisticaProyeccionAgrupada[];
  tendenciaTemporal: {
    categoria: string;
    periodo: string;
    total: number;
    cantidad: number;
    promedio: number;
    tasaExito: number;
  }[];
}

export interface PatronPago {
  cliente: number;
  frecuenciaDias: number;
  montoPromedio: number;
  bancoPreferido?: string;
  tipoPagoPreferido?: string;
  tasaPuntualidad: number;
  tendenciaMonto: 'creciente' | 'decreciente' | 'estable';
  confiabilidad: 'alta' | 'media' | 'baja';
  proximoPagoEstimado: Date;
  montoEstimado: number;
}

export interface AnalisisComportamiento {
  cliente: number;
  razonSocial: string;
  clasificacion: string;
  historialPagos: {
    totalPagos: number;
    montoTotal: number;
    montoPromedio: number;
    pagosATiempo: number;
    pagosRetrasados: number;
    tasaPuntualidad: number;
    diasRetrasoPromedio: number;
  };
  proyeccionesCreadas: number;
  proyeccionesCumplidas: number;
  tasaExitoProyecciones: number;
  riesgo: 'bajo' | 'medio' | 'alto';
  recomendaciones: string[];
}

export interface EvaluacionRiesgo {
  cliente: number;
  razonSocial: string;
  evaluacionRiesgo: {
    probabilidadRetraso: number;
    probabilidadIncumplimiento: number;
    factoresRiesgo: string[];
    nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
    recomendaciones: string[];
  };
  recomendacionesAccion: string[];
}

export interface MesEstacionalidad {
  mes: number;
  nombre: string;
  promedioMonto: number;
  cantidadPagos: number;
  factorEstacional: number;
}

export interface AnalisisEstacionalidad {
  analisisEstacional: {
    meses: MesEstacionalidad[];
    tendenciaAnual: 'creciente' | 'decreciente' | 'estable';
    variabilidad: number;
  };
  insights: string[];
  recomendaciones: string[];
}

export interface ProyeccionAutomaticaDto {
  noCliente?: number;
  diasFuturo?: number;
  algoritmo?: 'patron_historico' | 'regresion_lineal' | 'promedio_movil' | 'suavizado_exponencial' | 'ml_basico';
  confianzaMinima?: number;
}

export interface ProyeccionAutomatica {
  noCliente: number;
  fechaProyectada: Date;
  monto: number;
  confianza: number;
  metodologia: string;
  factoresConsiderados: string[];
  bancoSugerido?: number;
  tipoPagoSugerido?: string;
  alerta?: string;
}

export interface EstadisticaAgrupada {
  categoria: string;
  total: number;
  cantidad: number;
  promedio: number;
  porcentaje?: number;
  tasaExito?: number;
}