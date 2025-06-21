import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { telefonoClienteAPI } from './telefonoClienteAPI';
import type { TelefonoClienteState, TelefonoCliente, CreateTelefonoDto, UpdateTelefonoDto } from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

const initialState: TelefonoClienteState = {
  telefonos: [],
  selectedTelefono: null,
  isLoading: false,
  error: null
};

// Thunks
export const fetchTelefonos = createAsyncThunk(
  'telefonoCliente/fetchAll',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await telefonoClienteAPI.getAllTelefonos(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener los teléfonos');
    }
  }
);

export const fetchTelefonoById = createAsyncThunk(
  'telefonoCliente/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await telefonoClienteAPI.getTelefonoById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener el teléfono con ID ${id}`);
    }
  }
);

export const fetchTelefonosByCliente = createAsyncThunk(
  'telefonoCliente/fetchByCliente',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await telefonoClienteAPI.getTelefonosByCliente(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener teléfonos del cliente ${noCliente}`);
    }
  }
);

export const createTelefono = createAsyncThunk(
  'telefonoCliente/create',
  async (telefono: CreateTelefonoDto, { rejectWithValue }) => {
    try {
      const response = await telefonoClienteAPI.createTelefono(telefono);
      toast.success('Teléfono creado correctamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear teléfono');
      return rejectWithValue(error.response?.data?.message || 'Error al crear teléfono');
    }
  }
);

export const updateTelefono = createAsyncThunk(
  'telefonoCliente/update',
  async ({ id, data }: { id: number, data: UpdateTelefonoDto }, { rejectWithValue }) => {
    try {
      const response = await telefonoClienteAPI.updateTelefono(id, data);
      toast.success('Teléfono actualizado correctamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar teléfono');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar teléfono con ID ${id}`);
    }
  }
);

export const deleteTelefono = createAsyncThunk(
  'telefonoCliente/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await telefonoClienteAPI.deleteTelefono(id);
      toast.success('Teléfono eliminado correctamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar teléfono');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar teléfono con ID ${id}`);
    }
  }
);

// Slice
const telefonoClienteSlice = createSlice({
  name: 'telefonoCliente',
  initialState,
  reducers: {
    clearSelectedTelefono: (state) => {
      state.selectedTelefono = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all telefonos
    builder
      .addCase(fetchTelefonos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTelefonos.fulfilled, (state, action: PayloadAction<TelefonoCliente[]>) => {
        state.isLoading = false;
        state.telefonos = action.payload;
      })
      .addCase(fetchTelefonos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch telefono by id
    builder
      .addCase(fetchTelefonoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTelefonoById.fulfilled, (state, action: PayloadAction<TelefonoCliente>) => {
        state.isLoading = false;
        state.selectedTelefono = action.payload;
      })
      .addCase(fetchTelefonoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch telefonos by cliente
    builder
      .addCase(fetchTelefonosByCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTelefonosByCliente.fulfilled, (state, action: PayloadAction<TelefonoCliente[]>) => {
        state.isLoading = false;
        state.telefonos = action.payload;
      })
      .addCase(fetchTelefonosByCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create telefono
    builder
      .addCase(createTelefono.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTelefono.fulfilled, (state, action: PayloadAction<TelefonoCliente>) => {
        state.isLoading = false;
        state.telefonos.push(action.payload);
      })
      .addCase(createTelefono.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update telefono
    builder
      .addCase(updateTelefono.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTelefono.fulfilled, (state, action: PayloadAction<TelefonoCliente>) => {
        state.isLoading = false;
        state.telefonos = state.telefonos.map(tel => 
          tel.id === action.payload.id ? action.payload : tel
        );
        state.selectedTelefono = action.payload;
      })
      .addCase(updateTelefono.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete telefono
    builder
      .addCase(deleteTelefono.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTelefono.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.telefonos = state.telefonos.filter(tel => tel.id !== action.payload);
        if (state.selectedTelefono && state.selectedTelefono.id === action.payload) {
          state.selectedTelefono = null;
        }
      })
      .addCase(deleteTelefono.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Actions
export const { clearSelectedTelefono, clearError } = telefonoClienteSlice.actions;

// Selectors
export const selectTelefonos = (state: RootState) => state.telefonoCliente.telefonos;
export const selectSelectedTelefono = (state: RootState) => state.telefonoCliente.selectedTelefono;
export const selectTelefonoIsLoading = (state: RootState) => state.telefonoCliente.isLoading;
export const selectTelefonoError = (state: RootState) => state.telefonoCliente.error;

export default telefonoClienteSlice.reducer;