import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { bitacoraAPI } from './bitacoraAPI';
import type { 
  BitacoraPago,
  BitacoraState, 
  CreateBitacoraPagoDto, 
  UpdateBitacoraPagoDto,
  FilterBitacoraPagoDto
} from './types';
import type { RootState } from '../../app/store';

// Initial state
const initialState: BitacoraState = {
  bitacoras: [],
  selectedBitacora: null,
  clienteBitacoras: [],
  proyeccionBitacoras: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10
  },
  isLoading: false,
  error: null
};

// Async thunks
export const fetchBitacoras = createAsyncThunk(
  'bitacora/fetchAll',
  async (filters: FilterBitacoraPagoDto = {}, { rejectWithValue }) => {
    try {
      return await bitacoraAPI.getAllBitacoras(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener entradas de bitácora');
    }
  }
);

export const fetchBitacoraById = createAsyncThunk(
  'bitacora/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await bitacoraAPI.getBitacoraById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener entrada de bitácora ${id}`);
    }
  }
);

export const fetchBitacorasByCliente = createAsyncThunk(
  'bitacora/fetchByCliente',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await bitacoraAPI.getBitacorasByCliente(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener bitácora del cliente ${noCliente}`);
    }
  }
);

export const fetchBitacorasByProyeccion = createAsyncThunk(
  'bitacora/fetchByProyeccion',
  async (proyeccionId: number, { rejectWithValue }) => {
    try {
      return await bitacoraAPI.getBitacorasByProyeccion(proyeccionId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener bitácora de la proyección ${proyeccionId}`);
    }
  }
);

export const createBitacora = createAsyncThunk(
  'bitacora/create',
  async (bitacoraData: CreateBitacoraPagoDto, { rejectWithValue }) => {
    try {
      const response = await bitacoraAPI.createBitacora(bitacoraData);
      toast.success('Entrada de bitácora creada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear entrada de bitácora');
      return rejectWithValue(error.response?.data?.message || 'Error al crear entrada de bitácora');
    }
  }
);

export const updateBitacora = createAsyncThunk(
  'bitacora/update',
  async ({ id, data }: { id: number; data: UpdateBitacoraPagoDto }, { rejectWithValue }) => {
    try {
      const response = await bitacoraAPI.updateBitacora(id, data);
      toast.success('Entrada de bitácora actualizada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar entrada de bitácora');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar entrada de bitácora ${id}`);
    }
  }
);

export const deleteBitacora = createAsyncThunk(
  'bitacora/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await bitacoraAPI.deleteBitacora(id);
      toast.success('Entrada de bitácora eliminada exitosamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar entrada de bitácora');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar entrada de bitácora ${id}`);
    }
  }
);

// Slice
const bitacoraSlice = createSlice({
  name: 'bitacora',
  initialState,
  reducers: {
    clearSelectedBitacora: (state) => {
      state.selectedBitacora = null;
    },
    clearBitacoraError: (state) => {
      state.error = null;
    },
    updateBitacoraPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      if (action.payload.page) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.limit) {
        state.pagination.limit = action.payload.limit;
      }
    }
  },
  extraReducers: (builder) => {
    // fetchBitacoras
    builder
      .addCase(fetchBitacoras.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBitacoras.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bitacoras = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchBitacoras.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchBitacoraById
    builder
      .addCase(fetchBitacoraById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBitacoraById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBitacora = action.payload;
      })
      .addCase(fetchBitacoraById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchBitacorasByCliente
    builder
      .addCase(fetchBitacorasByCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBitacorasByCliente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clienteBitacoras = action.payload;
      })
      .addCase(fetchBitacorasByCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchBitacorasByProyeccion
    builder
      .addCase(fetchBitacorasByProyeccion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBitacorasByProyeccion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyeccionBitacoras = action.payload;
      })
      .addCase(fetchBitacorasByProyeccion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createBitacora
    builder
      .addCase(createBitacora.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBitacora.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bitacoras.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createBitacora.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateBitacora
    builder
      .addCase(updateBitacora.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBitacora.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bitacoras = state.bitacoras.map(bitacora => 
          bitacora.id === action.payload.id ? action.payload : bitacora
        );
        if (state.selectedBitacora?.id === action.payload.id) {
          state.selectedBitacora = action.payload;
        }
      })
      .addCase(updateBitacora.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteBitacora
    builder
      .addCase(deleteBitacora.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBitacora.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bitacoras = state.bitacoras.filter(bitacora => bitacora.id !== action.payload);
        if (state.selectedBitacora?.id === action.payload) {
          state.selectedBitacora = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteBitacora.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { 
  clearSelectedBitacora, 
  clearBitacoraError, 
  updateBitacoraPagination 
} = bitacoraSlice.actions;

// Selectors
export const selectBitacoras = (state: RootState) => state.bitacora.bitacoras;
export const selectSelectedBitacora = (state: RootState) => state.bitacora.selectedBitacora;
export const selectClienteBitacoras = (state: RootState) => state.bitacora.clienteBitacoras;
export const selectProyeccionBitacoras = (state: RootState) => state.bitacora.proyeccionBitacoras;
export const selectBitacoraPagination = (state: RootState) => state.bitacora.pagination;
export const selectBitacoraIsLoading = (state: RootState) => state.bitacora.isLoading;
export const selectBitacoraError = (state: RootState) => state.bitacora.error;

export default bitacoraSlice.reducer;