import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { proyeccionPagoAPI } from './proyeccionAPI';
import type { 
  ProyeccionPago,
  ProyeccionPagoState, 
  CreateProyeccionPagoDto, 
  UpdateProyeccionPagoDto,
  FilterProyeccionPagoDto,
  EstadisticasProyeccionFilterDto,
  ProyeccionAutomaticaDto
} from './types';
import type { RootState } from '../../app/store';

// Initial state
const initialState: ProyeccionPagoState = {
  proyecciones: [],
  selectedProyeccion: null,
  proyeccionesPendientes: [],
  proyeccionesVencidas: [],
  estadisticasGenerales: null,
  patronPago: null,
  analisisComportamiento: null,
  evaluacionRiesgo: null,
  analisisEstacionalidad: null,
  proyeccionesAutomaticas: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10
  },
  isLoading: false,
  error: null
};

// Existing async thunks
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

// NEW ASYNC THUNKS FOR ANALYTICS AND AI FEATURES

export const fetchEstadisticasGenerales = createAsyncThunk(
  'proyeccion/fetchEstadisticasGenerales',
  async (filters: EstadisticasProyeccionFilterDto = {}, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getEstadisticasGenerales(filters);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al obtener estadísticas generales');
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estadísticas generales');
    }
  }
);

export const fetchPatronPago = createAsyncThunk(
  'proyeccion/fetchPatronPago',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getPatronPagoCliente(noCliente);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Error al obtener patrón de pago del cliente ${noCliente}`);
      return rejectWithValue(error.response?.data?.message || `Error al obtener patrón de pago del cliente ${noCliente}`);
    }
  }
);

export const fetchComportamientoCliente = createAsyncThunk(
  'proyeccion/fetchComportamientoCliente',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getComportamientoCliente(noCliente);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Error al obtener análisis de comportamiento del cliente ${noCliente}`);
      return rejectWithValue(error.response?.data?.message || `Error al obtener análisis de comportamiento del cliente ${noCliente}`);
    }
  }
);

export const fetchRiesgoCliente = createAsyncThunk(
  'proyeccion/fetchRiesgoCliente',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getRiesgoCliente(noCliente);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Error al obtener evaluación de riesgo del cliente ${noCliente}`);
      return rejectWithValue(error.response?.data?.message || `Error al obtener evaluación de riesgo del cliente ${noCliente}`);
    }
  }
);

export const fetchAnalisisEstacionalidad = createAsyncThunk(
  'proyeccion/fetchAnalisisEstacionalidad',
  async (params: { fechaDesde?: string, fechaHasta?: string, sucursal?: string }, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.getAnalisisEstacionalidad(params);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al obtener análisis de estacionalidad');
      return rejectWithValue(error.response?.data?.message || 'Error al obtener análisis de estacionalidad');
    }
  }
);

export const generarProyeccionesAutomaticas = createAsyncThunk(
  'proyeccion/generarProyeccionesAutomaticas',
  async (config: ProyeccionAutomaticaDto, { rejectWithValue }) => {
    try {
      return await proyeccionPagoAPI.generarProyeccionesAutomaticas(config);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar proyecciones automáticas');
      return rejectWithValue(error.response?.data?.message || 'Error al generar proyecciones automáticas');
    }
  }
);

export const crearProyeccionesDesdeAnalisis = createAsyncThunk(
  'proyeccion/crearProyeccionesDesdeAnalisis',
  async (config: ProyeccionAutomaticaDto, { rejectWithValue }) => {
    try {
      const result = await proyeccionPagoAPI.crearProyeccionesDesdeAnalisis(config);
      toast.success(`Se han creado ${result.proyeccionesCreadas} proyecciones automáticamente`);
      return result;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear proyecciones desde análisis');
      return rejectWithValue(error.response?.data?.message || 'Error al crear proyecciones desde análisis');
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
    },
    clearAnalytics: (state) => {
      state.estadisticasGenerales = null;
      state.patronPago = null;
      state.analisisComportamiento = null;
      state.evaluacionRiesgo = null;
      state.analisisEstacionalidad = null;
      state.proyeccionesAutomaticas = [];
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
    // NEW REDUCERS FOR ANALYTICS AND AI FEATURES

    // fetchEstadisticasGenerales
    builder
      .addCase(fetchEstadisticasGenerales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEstadisticasGenerales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.estadisticasGenerales = action.payload;
      })
      .addCase(fetchEstadisticasGenerales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchPatronPago
    builder
      .addCase(fetchPatronPago.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatronPago.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patronPago = action.payload;
      })
      .addCase(fetchPatronPago.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchComportamientoCliente
    builder
      .addCase(fetchComportamientoCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComportamientoCliente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analisisComportamiento = action.payload;
      })
      .addCase(fetchComportamientoCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchRiesgoCliente
    builder
      .addCase(fetchRiesgoCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRiesgoCliente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.evaluacionRiesgo = action.payload;
      })
      .addCase(fetchRiesgoCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchAnalisisEstacionalidad
    builder
      .addCase(fetchAnalisisEstacionalidad.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalisisEstacionalidad.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analisisEstacionalidad = action.payload;
      })
      .addCase(fetchAnalisisEstacionalidad.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // generarProyeccionesAutomaticas
    builder
      .addCase(generarProyeccionesAutomaticas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generarProyeccionesAutomaticas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proyeccionesAutomaticas = action.payload;
      })
      .addCase(generarProyeccionesAutomaticas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // crearProyeccionesDesdeAnalisis
    builder
      .addCase(crearProyeccionesDesdeAnalisis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(crearProyeccionesDesdeAnalisis.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update proyecciones list with the newly created ones
        state.proyecciones = [...action.payload.detalles, ...state.proyecciones];
      })
      .addCase(crearProyeccionesDesdeAnalisis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Handle other existing cases...
    // ...
  },
});

// Actions
export const { 
  clearSelectedProyeccion, 
  clearProyeccionError, 
  updatePaginationParams,
  clearAnalytics
} = proyeccionSlice.actions;

// Selectors
export const selectProyecciones = (state: RootState) => state.proyeccion.proyecciones;
export const selectSelectedProyeccion = (state: RootState) => state.proyeccion.selectedProyeccion;
export const selectProyeccionesVencidas = (state: RootState) => state.proyeccion.proyeccionesVencidas;
export const selectPaginationParams = (state: RootState) => state.proyeccion.pagination;
export const selectEstadisticasGenerales = (state: RootState) => state.proyeccion.estadisticasGenerales;
export const selectPatronPago = (state: RootState) => state.proyeccion.patronPago;
export const selectComportamientoCliente = (state: RootState) => state.proyeccion.analisisComportamiento;
export const selectRiesgoCliente = (state: RootState) => state.proyeccion.evaluacionRiesgo;
export const selectAnalisisEstacionalidad = (state: RootState) => state.proyeccion.analisisEstacionalidad;
export const selectProyeccionesAutomaticas = (state: RootState) => state.proyeccion.proyeccionesAutomaticas;
export const selectProyeccionIsLoading = (state: RootState) => state.proyeccion.isLoading;
export const selectProyeccionError = (state: RootState) => state.proyeccion.error;

export default proyeccionSlice.reducer;