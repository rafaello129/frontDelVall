import { Sucursal } from '../shared/enums';
import type { Cliente } from '../cliente/types';
import type { ProyeccionPago } from '../proyeccion/types';

// Enum for TipoBitacora
export enum TipoBitacora {
  COMENTARIO = 'COMENTARIO',
  CONTACTO = 'CONTACTO',
  SEGUIMIENTO = 'SEGUIMIENTO',
  COMPROMISO = 'COMPROMISO',
  RECORDATORIO = 'RECORDATORIO'
}

// Main entity
export interface BitacoraPago {
  id: number;
  fecha: Date;
  noCliente: number;
  razonSocial: string;
  comercial: string;
  sucursal?: Sucursal;
  ubicacion?: string;
  banco?: string;
  moneda?: string;
  envioCorreo?: string;
  comentario?: string;
  contestacion?: string;
  timbrado?: string;
  proyeccionId?: number;
  tipo: TipoBitacora;
  telefono?: string;
  clasificacion?: string;
  createdAt: Date;
  updatedAt: Date;
  creadoPor?: string;
  
  // Relations
  cliente?: Cliente;
  proyeccionPago?: ProyeccionPago;
}

// DTO for creating a bitacora entry
export interface CreateBitacoraPagoDto {
  fecha?: Date;
  noCliente: number;
  razonSocial: string;
  comercial: string;
  sucursal?: Sucursal;
  ubicacion?: string;
  banco?: string;
  moneda?: string;
  envioCorreo?: string;
  comentario?: string;
  contestacion?: string;
  timbrado?: string;
  proyeccionId?: number;
  tipo: TipoBitacora;
  telefono?: string;
  clasificacion?: string;
  creadoPor?: string;
}

// DTO for updating a bitacora entry
export interface UpdateBitacoraPagoDto {
  fecha?: Date;
  noCliente?: number;
  razonSocial?: string;
  comercial?: string;
  sucursal?: Sucursal;
  ubicacion?: string;
  banco?: string;
  moneda?: string;
  envioCorreo?: string;
  comentario?: string;
  contestacion?: string;
  timbrado?: string;
  proyeccionId?: number;
  tipo?: TipoBitacora;
  telefono?: string;
  clasificacion?: string;
  creadoPor?: string;
}

// DTO for filtering bitacora entries
export interface FilterBitacoraPagoDto {
  noCliente?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipo?: TipoBitacora;
  sucursal?: Sucursal;
  proyeccionId?: number;
  searchTerm?: string;
  banco?: string;
  moneda?: string;
  creadoPor?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// State for Redux slice
export interface BitacoraState {
  bitacoras: BitacoraPago[];
  selectedBitacora: BitacoraPago | null;
  clienteBitacoras: BitacoraPago[];
  proyeccionBitacoras: BitacoraPago[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Response for paginated queries
export interface PaginatedBitacoraResponse {
  data: BitacoraPago[];
  total: number;
}