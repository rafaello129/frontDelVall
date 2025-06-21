// Definición de tipos para las entidades y respuestas de la API

export interface Banco {
    id: number;
    nombre: string;
    codigoBancario?: string;
    activo: boolean;
  }
  
  // DTOs para crear/actualizar bancos
  export interface CreateBancoDto {
    nombre: string;
    codigoBancario?: string;
    activo?: boolean;
  }
  
  export interface UpdateBancoDto {
    nombre?: string;
    codigoBancario?: string;
    activo?: boolean;
  }
  
  // Filtros para consultar bancos
  export interface FilterBancoDto {
    nombre?: string;
    codigoBancario?: string;
    activo?: boolean;
    limit?: number;
    skip?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }
  
  // Estado para el slice de Redux
  export interface BancoState {
    bancos: Banco[];
    selectedBanco: Banco | null;
    isLoading: boolean;
    error: string | null;
  }
  
  // Respuestas paginadas
  export interface PaginatedBancosResponse {
    data: Banco[];
    total: number;
  }