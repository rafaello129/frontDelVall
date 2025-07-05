import { TipoPago } from '../shared/enums';
import type { Cliente } from '../cliente/types';
import type { Banco } from '../banco/types';

// Enum for EstadoProyeccion
export enum EstadoProyeccion {
  PENDIENTE = 'PENDIENTE',
  CUMPLIDA = 'CUMPLIDA',
  CANCELADA = 'CANCELADA',
  VENCIDA = 'VENCIDA'
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

// DTO for creating a projection
export interface CreateProyeccionPagoDto {
  noCliente: number;
  fechaProyectada: Date;
  monto: number;
  estado?: EstadoProyeccion;
  noFactura?: string;
  tipoCambio?: number;
  montoDolares?: number;
  bancoId?: number;
  tipoPago?: TipoPago;
  conceptoPago?: string;
  notificacionEnviada?: boolean;
}

// DTO for updating a projection
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