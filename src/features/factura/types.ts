// Definición de tipos para las entidades y respuestas de la API

export interface ClienteResumen {
    noCliente: number;
    razonSocial: string;
    comercial: string;
  }
  
  export interface Factura {
    diasVencimiento: number | undefined;
    noFactura: string;
    emision: Date;
    noCliente: number;
    estado: string;
    saldo: number;
    montoTotal: number;
    concepto: string;
    fechaVencimiento: Date;
    cliente?: ClienteResumen;
    diasTranscurridos?: number;
    diasRestantes?: number;
    isVencida?: boolean;
    saldoCalculado: number;
  }
  
  // DTOs para crear/actualizar facturas
  export interface CreateFacturaDto {
    noFactura: string;
    emision: Date;
    noCliente: number;
    estado: string;
    saldo: number;
    concepto: string;
    fechaVencimiento: Date;
  }
  
  export interface UpdateFacturaDto {
    estado?: string;
    saldo?: number;
    concepto?: string;
    fechaVencimiento?: Date;
  }
  
  export interface CambioEstadoDto {
    estado: string;
  }
  
  export interface PagoFacturaDto {
    monto: number;
  }
  
  // Filtros para consultar facturas
  export interface FilterFacturaDto {
    noFactura?: string;
    noCliente?: number;
    estado?: string;
    emisionDesde?: Date;
    emisionHasta?: Date;
    vencimientoDesde?: Date;
    vencimientoHasta?: Date;
    saldoMinimo?: number;
    soloVencidas?: boolean;
    incluirCliente?: boolean;
    limit?: number;
    skip?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }
  
 // Estado para el slice de Redux
export interface FacturaState {
  facturas: Factura[];
  selectedFactura: Factura | null;
  facturasVencidas: Factura[]; // Para facturas vencidas
  facturasPendientes: Factura[]; // Para facturas pendientes por cliente
  isLoading: boolean;
  error: string | null;
}
  
  // Respuestas paginadas
  export interface PaginatedFacturasResponse {
    data: Factura[];
    total: number;
  }
  
  // Respuesta para facturas por cliente
  export interface FacturasClienteResponse {
    data: Factura[];
    total: number;
    totalSaldo: number;
  }