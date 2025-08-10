import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pagoExternoAPI } from './pagoExternoAPI';
import type { 
  PagoExternoState, 
  CreatePagoExternoDto, 
  UpdatePagoExternoDto, 
  FilterPagoExternoDto,

  EstadisticasOptions
} from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

const initialState: PagoExternoState = {
  pagosExternos: [],
  selectedPagoExterno: null,
  clientePagos: [],
  estadisticasPorTipo: [],
  estadisticasMetadata: {
    total: 0,
    cantidad: 0,
    promedio: 0
  },
  estadisticasPorSucursal: [],
  isLoading: false,
  error: null
};

// Thunks
export const fetchPagosExternos = createAsyncThunk(
  'pagoExterno/fetchAll',
  async (args: FilterPagoExternoDto | undefined, { rejectWithValue }) => {
    try {
      return await pagoExternoAPI.getAllPagosExternos(args);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener pagos externos');
    }
  }
);

export const fetchPagoExternoById = createAsyncThunk(
  'pagoExterno/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await pagoExternoAPI.getPagoExternoById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener pago externo con ID ${id}`);
    }
  }
);

export const createPagoExterno = createAsyncThunk(
  'pagoExterno/create',
  async (pagoExternoData: CreatePagoExternoDto, { rejectWithValue }) => {
    try {
      const response = await pagoExternoAPI.createPagoExterno(pagoExternoData);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar pago externo');
      return rejectWithValue(error.response?.data?.message || 'Error al registrar pago externo');
    }
  }
);
export const createManyPagoExterno = createAsyncThunk(
  'pagoExterno/createMany',
  async (pagosExternosData: CreatePagoExternoDto[], { rejectWithValue }) => {
    try {
      const response = await pagoExternoAPI.creatManyPagoExterno(pagosExternosData);
      toast.success('Pagos externos creados exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar pagos externos');
      return rejectWithValue(error.response?.data?.message || 'Error al registrar pagos externos');
    }
  }
);

export const updatePagoExterno = createAsyncThunk(
  'pagoExterno/update',
  async ({ id, pagoExternoData }: { id: number; pagoExternoData: UpdatePagoExternoDto }, { rejectWithValue }) => {
    try {
      const response = await pagoExternoAPI.updatePagoExterno(id, pagoExternoData);
      toast.success('Pago externo actualizado exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar pago externo');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar pago externo con ID ${id}`);
    }
  }
);

export const deletePagoExterno = createAsyncThunk(
  'pagoExterno/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await pagoExternoAPI.deletePagoExterno(id);
      toast.success('Pago externo eliminado exitosamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar pago externo');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar pago externo con ID ${id}`);
    }
  }
);

export const fetchPagosPorCliente = createAsyncThunk(
  'pagoExterno/fetchByCliente',
  async ({ noCliente, filters }: { noCliente: number, filters?: FilterPagoExternoDto }, { rejectWithValue }) => {
    try {
      return await pagoExternoAPI.getPagosPorCliente(noCliente, filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener pagos externos del cliente ${noCliente}`);
    }
  }
);

export const fetchEstadisticasPorTipo = createAsyncThunk(
  'pagoExterno/fetchEstadisticasPorTipo',
  async (options: EstadisticasOptions, { rejectWithValue }) => {
    try {
      return await pagoExternoAPI.getTotalPorTipo(options);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estadísticas por tipo');
    }
  }
);

export const fetchEstadisticasPorSucursal = createAsyncThunk(
  'pagoExterno/fetchEstadisticasPorSucursal',
  async (options: EstadisticasOptions, { rejectWithValue }) => {
    try {
      return await pagoExternoAPI.getTotalPorSucursal(options);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estadísticas por sucursal');
    }
  }
);

// Slice
const pagoExternoSlice = createSlice({
  name: 'pagosExternos',
  initialState,
  reducers: {
    clearEstadisticas: (state) => {
      state.estadisticasPorTipo = [];
      state.estadisticasPorSucursal = [];
      state.estadisticasMetadata = {
        total: 0,
        cantidad: 0,
        promedio: 0
      };
    },
    clearSelectedPagoExterno: (state) => {
      state.selectedPagoExterno = null;
    },
    clearPagoExternoError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchPagosExternos
    builder
      .addCase(fetchPagosExternos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPagosExternos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagosExternos = action.payload.data;
      })
      .addCase(fetchPagosExternos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchPagoExternoById
    builder
      .addCase(fetchPagoExternoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPagoExternoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPagoExterno = action.payload;
      })
      .addCase(fetchPagoExternoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createPagoExterno
    builder
      .addCase(createPagoExterno.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPagoExterno.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagosExternos.unshift(action.payload);
      })
      .addCase(createPagoExterno.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      //createManyPagoExterno
    builder
      .addCase(createManyPagoExterno.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createManyPagoExterno.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagosExternos.unshift(...action.payload);
      })
      .addCase(createManyPagoExterno.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updatePagoExterno
    builder
      .addCase(updatePagoExterno.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePagoExterno.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagosExternos = state.pagosExternos.map(pago => 
          pago.id === action.payload.id ? action.payload : pago
        );
        if (state.selectedPagoExterno?.id === action.payload.id) {
          state.selectedPagoExterno = action.payload;
        }
      })
      .addCase(updatePagoExterno.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deletePagoExterno
    builder
      .addCase(deletePagoExterno.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePagoExterno.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pagosExternos = state.pagosExternos.filter(pago => pago.id !== action.payload);
        if (state.selectedPagoExterno?.id === action.payload) {
          state.selectedPagoExterno = null;
        }
      })
      .addCase(deletePagoExterno.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchPagosPorCliente
    builder
      .addCase(fetchPagosPorCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPagosPorCliente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientePagos = action.payload.data;
      })
      .addCase(fetchPagosPorCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchEstadisticasPorTipo
    builder
    .addCase(fetchEstadisticasPorTipo.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchEstadisticasPorTipo.fulfilled, (state, action) => {
      state.isLoading = false;
      state.estadisticasPorTipo = action.payload.data;
      state.estadisticasMetadata = {
        total: action.payload.total,
        cantidad: action.payload.cantidad,
        promedio: action.payload.promedio,
        periodoActual: action.payload.periodoActual,
        periodoComparacion: action.payload.periodoComparacion
      };
    })
    .addCase(fetchEstadisticasPorTipo.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });


    // fetchEstadisticasPorSucursal
    builder
    .addCase(fetchEstadisticasPorSucursal.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchEstadisticasPorSucursal.fulfilled, (state, action) => {
      state.isLoading = false;
      state.estadisticasPorSucursal = action.payload.data;
      state.estadisticasMetadata = {
        total: action.payload.total,
        cantidad: action.payload.cantidad,
        promedio: action.payload.promedio,
        periodoActual: action.payload.periodoActual,
        periodoComparacion: action.payload.periodoComparacion
      };
    })
    .addCase(fetchEstadisticasPorSucursal.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearSelectedPagoExterno, clearPagoExternoError, clearEstadisticas  } = pagoExternoSlice.actions;

// Selectores
export const selectPagosExternos = (state: RootState) => state.pagosExternos.pagosExternos;
export const selectSelectedPagoExterno = (state: RootState) => state.pagosExternos.selectedPagoExterno;
export const selectClientePagos = (state: RootState) => state.pagosExternos.clientePagos;
export const selectEstadisticasPorTipo = (state: RootState) => state.pagosExternos.estadisticasPorTipo;
export const selectEstadisticasPorSucursal = (state: RootState) => state.pagosExternos.estadisticasPorSucursal;
export const selectEstadisticasMetadata = (state: RootState) => state.pagosExternos.estadisticasMetadata;
export const selectPagosExternosLoading = (state: RootState) => state.pagosExternos.isLoading;
export const selectPagosExternosError = (state: RootState) => state.pagosExternos.error;


export default pagoExternoSlice.reducer;