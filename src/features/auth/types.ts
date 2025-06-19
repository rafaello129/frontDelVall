// Definición de tipos para las entidades y respuestas de la API

// Roles disponibles (del enum del schema de Prisma)
export type Role = 'admin' | 'user';

// Entidad de usuario que recibimos del backend
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
  createdAt: string;
  emailVerified?: string | null;
}

// DTO para registro de usuario
export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  passwordconf: string;
}

// DTO para login de usuario
export interface LoginUserDto {
  email: string;
  password: string;
}

// Respuesta de la API para operaciones de autenticación
export interface LoginResponse {
  user: User;
  token: string;
}

// Estado de autenticación para el slice de Redux
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Payload para JWT
export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}