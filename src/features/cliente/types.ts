import type { CorreoCliente, CreateCorreoDto } from "../correoCliente/types";
import type { TelefonoCliente, CreateTelefonoDto } from "../telefonoCliente/types";

// Definición de tipos para clientes
export interface Cliente {
    noCliente: number;
    razonSocial: string;
    comercial?: string;
    rfc?: string;
    diasCredito: number;
    limiteCredito?: number;
    clasificacion?: string;
    sucursal?: string;
    status: 'Activo' | 'Inactivo' | 'Suspendido';
    correos?: CorreoCliente[];
    telefonos?: TelefonoCliente[];
    totalFacturas?: number;
    saldoTotal?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface CreateClienteDto {
    noCliente: number;
    razonSocial: string;
    comercial?: string;
    rfc?: string;
    diasCredito: number;
    limiteCredito?: number;
    clasificacion?: string;
    sucursal?: string;
    status?: 'Activo' | 'Inactivo' | 'Suspendido';
    correos?: CreateCorreoDto[];
    telefonos?: CreateTelefonoDto[];
  }
  
  export interface UpdateClienteDto {
    noCliente?: number;
    razonSocial?: string;
    comercial?: string;
    rfc?: string;
    diasCredito?: number;
    limiteCredito?: number;
    clasificacion?: string;
    sucursal?: string;
    status?: 'Activo' | 'Inactivo' | 'Suspendido';
  }
  
  export interface FilterClienteDto {
    noCliente?: number;
    razonSocial?: string;
    comercial?: string;
    sucursal?: string;
    status?: 'Activo' | 'Inactivo' | 'Suspendido';
    clasificacion?: string;
    limit?: number;
    skip?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }
  
  export interface FacturaResumen {
    noFactura: string;
    emision: Date;
    fechaVencimiento: Date;
    saldo: number;
    diasAntiguedad: number;
  }
  
  export interface SaldoAntiguedad {
    noCliente: number;
    razonSocial: string;
    diasCredito: number;
    saldoTotal: number;
    saldo0a30: number;
    saldo31a60: number;
    saldo61a90: number;
    saldoMas90: number;
    facturas?: FacturaResumen[];
  }
  
  export interface AntiguedadSaldosDto {
    noCliente?: number;
    sucursal?: string;
    soloActivos?: boolean;
    clasificacion?: string;
    fechaCorte: Date;
    saldoMinimo?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    incluirFacturas?: boolean;
  }
  
  export interface FacturaPendiente {
    noFactura: string;
    noCliente: number;
    emision: Date;
    fechaVencimiento: Date;
    montoTotal: number;
    saldo: number;
    diasTranscurridos: number;
    diasRestantes: number;
    isVencida: boolean;
  }
  
  export interface ClienteState {
    clientes: Cliente[];
    selectedCliente: Cliente | null;
    facturasPendientes: FacturaPendiente[];
    antiguedadSaldos: SaldoAntiguedad[];
    pagination: {
      total: number;
      limit: number;
      skip: number;
    };
    filteredOptions: {
      noClientes: [],
      razonSocial: [],
      comercial: []
    },
    isLoading: boolean;
    error: string | null;
  }
  export interface PaginatedClientesResponse {
    data: Cliente[];
    total: number;
  }