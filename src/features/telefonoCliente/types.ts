import type { Cliente } from "../cliente/types";

// Definición de tipos para teléfonos de clientes
export interface TelefonoCliente {
    id: number;
    noCliente: number;
    telefono: string;
    cliente?: Cliente; // Cuando se incluye la relación
  }
  
  export interface CreateTelefonoDto {
    noCliente: number;
    telefono: string;
  }
  
  export interface UpdateTelefonoDto {
    noCliente?: number;
    telefono?: string;
  }
  
  export interface TelefonoClienteState {
    telefonos: TelefonoCliente[];
    selectedTelefono: TelefonoCliente | null;
    isLoading: boolean;
    error: string | null;
  }