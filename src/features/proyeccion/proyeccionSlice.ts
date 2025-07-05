import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { proyeccionPagoAPI } from './proyeccionAPI';
import type { 
  ProyeccionPago,
  ProyeccionPagoState, 
  CreateProyeccionPagoDto, 
  UpdateProyeccionPagoDto,
  FilterProyeccionPagoDto
} from './types';
import type { RootState } from '../../app/store';

// Initial state
const initialState: ProyeccionPagoState = {
  proyecciones: [],
  selectedProyeccion: null,
  proyeccionesPendientes: [],
  proyeccionesVencidas: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10
  },
  isLoading: false,
  error: null
};

// Async thunks
export const fetchProyecciones = createAsyncThunk(
  'proyeccion/fetchAll',
  async (filters: FilterProyeccionPagoDto = {}, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getAllProyecciones(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener proyecciones');
    }
  }
);

export const fetchProyeccionById = createAsyncThunk(
  'proyeccion/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getProyeccionById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener proyección ${id}`);
    }
  }
);

export const fetchProyeccionesByCliente = createAsyncThunk(
  'proyeccion/fetchByCliente',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getProyeccionesByCliente(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener proyecciones del cliente ${noCliente}`);
    }
  }
);

export const fetchProyeccionesVencidas = createAsyncThunk(
  'proyeccion/fetchVencidas',
  async (_, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getProyeccionesVencidas();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener proyecciones vencidas');
    }
  }
);

export const createProyeccion = createAsyncThunk(
  'proyeccion/create',
  async (proyeccionData: CreateProyeccionPagoDto, { rejectWithValue }) => {
    try {
      const response = await proyeccionPagoAPI.createProyeccion(proyeccionData);
      toast.success('Proyección de pago creada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear proyección de pago');
      return rejectWithValue(error.response?.data?.message || 'Error al crear proyección de pago');
    }
  }
);

export const updateProyeccion = createAsyncThunk(
  'proyeccion/update',
  async ({ id, data }: { id: number; data: UpdateProyeccionPagoDto }, { rejectWithValue }) => {
    try {
      const response = await proyeccionPagoAPI.updateProyeccion(id, data);
      toast.success('Proyección de pago actualizada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar proyección de pago');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar proyección ${id}`);
    }
  }
);

export const marcarNotificacionEnviada = createAsyncThunk(
  'proyeccion/marcarNotificacionEnviada',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await proyeccionPagoAPI.marcarNotificacionEnviada(id);
      toast.success('Notificación marcada como enviada');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al marcar notificación como enviada');
      return rejectWithValue(error.response?.data?.message || `Error al marcar notificación para proyección ${id}`);
    }
  }
);

export const deleteProyeccion = createAsyncThunk(
  'proyeccion/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await proyeccionPagoAPI.deleteProyeccion(id);
      toast.success('Proyección de pago eliminada exitosamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar proyección de pago');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar proyección ${id}`);
    }
  }
);

// Slice
const proyeccionSlice = createSlice({
  name: 'proyeccion',
  initialState,
  reducers: {
    clearSelectedProyeccion: (state) => {
      state.selectedProyeccion = null;
    },
    clearProyeccionError: (state) => {
      state.error = null;
    },
    updatePaginationParams: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      if (action.payload.page) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.limit) {
        state.pagination.limit = action.payload.limit;
      }
    }
  },
  extraReducers: (builder) => {
    // fetchProyecciones
    builder
      .addCase(fetchProyecciones.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProyecciones.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyecciones = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchProyecciones.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchProyeccionById
    builder
      .addCase(fetchProyeccionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProyeccionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProyeccion = action.payload;
      })
      .addCase(fetchProyeccionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchProyeccionesByCliente
    builder
      .addCase(fetchProyeccionesByCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProyeccionesByCliente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyecciones = action.payload;
      })
      .addCase(fetchProyeccionesByCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchProyeccionesVencidas
    builder
      .addCase(fetchProyeccionesVencidas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProyeccionesVencidas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyeccionesVencidas = action.payload;
      })
      .addCase(fetchProyeccionesVencidas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createProyeccion
    builder
      .addCase(createProyeccion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProyeccion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyecciones.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProyeccion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateProyeccion
    builder
      .addCase(updateProyeccion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProyeccion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyecciones = state.proyecciones.map(proyeccion => 
          proyeccion.id === action.payload.id ? action.payload : proyeccion
        );
        if (state.selectedProyeccion?.id === action.payload.id) {
          state.selectedProyeccion = action.payload;
        }
      })
      .addCase(updateProyeccion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // marcarNotificacionEnviada
    builder
      .addCase(marcarNotificacionEnviada.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(marcarNotificacionEnviada.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyecciones = state.proyecciones.map(proyeccion => 
          proyeccion.id === action.payload.id ? action.payload : proyeccion
        );
        if (state.selectedProyeccion?.id === action.payload.id) {
          state.selectedProyeccion = action.payload;
        }
      })
      .addCase(marcarNotificacionEnviada.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteProyeccion
    builder
      .addCase(deleteProyeccion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProyeccion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyecciones = state.proyecciones.filter(proyeccion => proyeccion.id !== action.payload);
        if (state.selectedProyeccion?.id === action.payload) {
          state.selectedProyeccion = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteProyeccion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { 
  clearSelectedProyeccion, 
  clearProyeccionError, 
  updatePaginationParams 
} = proyeccionSlice.actions;

// Selectors
export const selectProyecciones = (state: RootState) => state.proyeccion.proyecciones;
export const selectSelectedProyeccion = (state: RootState) => state.proyeccion.selectedProyeccion;
export const selectProyeccionesVencidas = (state: RootState) => state.proyeccion.proyeccionesVencidas;
export const selectPaginationParams = (state: RootState) => state.proyeccion.pagination;
export const selectProyeccionIsLoading = (state: RootState) => state.proyeccion.isLoading;
export const selectProyeccionError = (state: RootState) => state.proyeccion.error;

export default proyeccionSlice.reducer;