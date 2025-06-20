import type {  PayloadAction } from '@reduxjs/toolkit';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import axios from 'axios';

// Tipos
export interface User {
  updatedAt: string;
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  passwordconf: string;
}

interface LoginUserDto {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const API_URL = import.meta.env.VITE_API_URL;

// Thunks para autenticación
export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterUserDto,
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/register`,
      userData
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue('Error al registrar usuario');
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginUserDto,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      credentials
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue('Credenciales incorrectas');
  }
});

export const refreshToken = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string; state: RootState }
>('auth/refreshToken', async (_, { rejectWithValue, getState }) => {
  // Obtener el token actual del estado
  const { token } = getState().auth;

  if (!token) {
    return rejectWithValue('No hay token disponible');
  }

  try {
    // Configurar el header con el token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get<AuthResponse>(
      `${API_URL}/auth/refresh-token`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue('Error al refrescar el token');
  }
});

// Slice de autenticación
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error al registrar usuario';
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Credenciales incorrectas';
      });

    // Refresh token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        // Si falla la actualización del token, cerrar sesión
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Error al refrescar el token';
      });
  },
});

// Exportar acciones
export const { logout, clearError } = authSlice.actions;

// Selectores
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;