import type { Cliente } from "../cliente/types";

// Definición de tipos para correos de clientes
export interface CorreoCliente {
    id: number;
    noCliente: number;
    correo: string;
    cliente?: Cliente; // Cuando se incluye la relación
  }
  
  export interface CreateCorreoDto {
    noCliente: number;
    correo: string;
  }
  
  export interface UpdateCorreoDto {
    noCliente?: number;
    correo?: string;
  }
  
  export interface EmailValidationResult {
    exists: boolean;
    isValid: boolean;
    email: string;
  }
  
  export interface CorreoClienteState {
    correos: CorreoCliente[];
    selectedCorreo: CorreoCliente | null;
    isLoading: boolean;
    error: string | null;
  }