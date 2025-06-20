import type { Role } from '../auth/types';

// Tipos para representar usuarios
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  createdAt: string;
  updatedAt?: string;
}

// DTOs para crear usuarios
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  passwordconf: string;
  image?: string;
  role?: Role;
}

// DTOs para actualizar usuarios
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  passwordconf?: string;
  image?: string;
  role?: Role;
}

// Estado para el slice de Redux
export interface UsersState {
  users: UserProfile[];
  selectedUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}