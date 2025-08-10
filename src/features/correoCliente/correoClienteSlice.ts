import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { correoClienteAPI } from './correoClienteAPI';
import type { CorreoClienteState, CorreoCliente, CreateCorreoDto, UpdateCorreoDto } from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

const initialState: CorreoClienteState = {
  correos: [],
  selectedCorreo: null,
  isLoading: false,
  error: null
};

// Thunks
export const fetchCorreos = createAsyncThunk(
  'correoCliente/fetchAll',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await correoClienteAPI.getAllCorreos(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener los correos');
    }
  }
);

export const fetchCorreoById = createAsyncThunk(
  'correoCliente/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await correoClienteAPI.getCorreoById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener el correo con ID ${id}`);
    }
  }
);

export const fetchCorreosByCliente = createAsyncThunk(
  'correoCliente/fetchByCliente',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await correoClienteAPI.getCorreosByCliente(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener correos del cliente ${noCliente}`);
    }
  }
);

export const validateEmail = createAsyncThunk(
  'correoCliente/validateEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      return await correoClienteAPI.validateEmail(email);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al validar correo electrónico');
    }
  }
);

export const createCorreo = createAsyncThunk(
  'correoCliente/create',
  async (correo: CreateCorreoDto, { rejectWithValue }) => {
    try {
      const response = await correoClienteAPI.createCorreo(correo);
      toast.success('Correo electrónico creado correctamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear correo electrónico');
      return rejectWithValue(error.response?.data?.message || 'Error al crear correo electrónico');
    }
  }
);

export const updateCorreo = createAsyncThunk(
  'correoCliente/update',
  async ({ id, data }: { id: number, data: UpdateCorreoDto }, { rejectWithValue }) => {
    try {
      const response = await correoClienteAPI.updateCorreo(id, data);
      toast.success('Correo electrónico actualizado correctamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar correo electrónico');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar correo con ID ${id}`);
    }
  }
);

export const deleteCorreo = createAsyncThunk(
  'correoCliente/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await correoClienteAPI.deleteCorreo(id);
      toast.success('Correo electrónico eliminado correctamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar correo electrónico');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar correo con ID ${id}`);
    }
  }
);

// Slice
const correoClienteSlice = createSlice({
  name: 'correoCliente',
  initialState,
  reducers: {
    clearSelectedCorreo: (state) => {
      state.selectedCorreo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all correos
    builder
      .addCase(fetchCorreos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCorreos.fulfilled, (state, action: PayloadAction<CorreoCliente[]>) => {
        state.isLoading = false;
        state.correos = action.payload;
      })
      .addCase(fetchCorreos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch correo by id
    builder
      .addCase(fetchCorreoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCorreoById.fulfilled, (state, action: PayloadAction<CorreoCliente>) => {
        state.isLoading = false;
        state.selectedCorreo = action.payload;
      })
      .addCase(fetchCorreoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch correos by cliente
    builder
      .addCase(fetchCorreosByCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCorreosByCliente.fulfilled, (state, action: PayloadAction<CorreoCliente[]>) => {
        state.isLoading = false;
        state.correos = action.payload;
      })
      .addCase(fetchCorreosByCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Validate email
    // No necesitamos guardar resultado en el estado, se puede manejar con unwrap() en el componente

    // Create correo
    builder
      .addCase(createCorreo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCorreo.fulfilled, (state, action: PayloadAction<CorreoCliente>) => {
        state.isLoading = false;
        state.correos.push(action.payload);
      })
      .addCase(createCorreo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update correo
    builder
      .addCase(updateCorreo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCorreo.fulfilled, (state, action: PayloadAction<CorreoCliente>) => {
        state.isLoading = false;
        state.correos = state.correos.map(correo => 
          correo.id === action.payload.id ? action.payload : correo
        );
        state.selectedCorreo = action.payload;
      })
      .addCase(updateCorreo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete correo
    builder
      .addCase(deleteCorreo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCorreo.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.correos = state.correos.filter(correo => correo.id !== action.payload);
        if (state.selectedCorreo && state.selectedCorreo.id === action.payload) {
          state.selectedCorreo = null;
        }
      })
      .addCase(deleteCorreo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Actions
export const { clearSelectedCorreo, clearError } = correoClienteSlice.actions;

// Selectors
export const selectCorreos = (state: RootState) => state.correoCliente.correos;
export const selectSelectedCorreo = (state: RootState) => state.correoCliente.selectedCorreo;
export const selectCorreoIsLoading = (state: RootState) => state.correoCliente.isLoading;
export const selectCorreoError = (state: RootState) => state.correoCliente.error;

export default correoClienteSlice.reducer;