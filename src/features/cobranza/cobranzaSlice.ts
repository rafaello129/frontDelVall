import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { cobranzaAPI } from './cobranzaAPI';
import type { 
  Cobranza, 
  CobranzaState, 
  CreateCobranzaDto, 
  UpdateCobranzaDto, 
  FilterCobranzaDto,
  ReporteCobranza
} from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

const initialState: CobranzaState = {
  cobranzas: [],
  selectedCobranza: null,
  facturaCobranzas: [],
  reporteRegion: null,
  clienteCobranzas: [],
  reporte: null,
  isLoading: false,
  error: null
};

// Thunks
export const fetchReportePorRegion = createAsyncThunk(
  'cobranza/fetchReportePorRegion',
  async ({ fechaDesde, fechaHasta }: { fechaDesde?: Date, fechaHasta?: Date }, { rejectWithValue }) => {
    try {
      return await cobranzaAPI.getReportePorRegion(fechaDesde, fechaHasta);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener reporte de cobranza por región');
    }
  }
);
export const fetchCobranzas = createAsyncThunk(
  'cobranza/fetchAll',
  async (
    args: FilterCobranzaDto | undefined,
    thunkAPI) => {
      const { rejectWithValue } = thunkAPI;
    try {
    
      return await cobranzaAPI.getAllCobranzas(args);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener cobranzas');
    }
  }
);

export const fetchCobranzaById = createAsyncThunk(
  'cobranza/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cobranzaAPI.getCobranzaById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener cobranza con ID ${id}`);
    }
  }
);

export const createCobranza = createAsyncThunk(
  'cobranza/create',
  async (cobranzaData: CreateCobranzaDto, { rejectWithValue }) => {
    try {
      const response = await cobranzaAPI.createCobranza(cobranzaData);
      toast.success('Pago registrado exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar pago');
      return rejectWithValue(error.response?.data?.message || 'Error al registrar pago');
    }
  }
);
export const createbulkCobranza = createAsyncThunk(
  'cobranza/createBulk',
  async (cobranzas: CreateCobranzaDto[], { rejectWithValue }) => {
    try {
      const response = await cobranzaAPI.createbulk(cobranzas);
      toast.success('Pagos registrados exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar pagos');
      return rejectWithValue(error.response?.data?.message || 'Error al registrar pagos');
    }
  }
);
export const updateCobranza = createAsyncThunk(
  'cobranza/update',
  async ({ id, cobranzaData }: { id: number; cobranzaData: UpdateCobranzaDto }, { rejectWithValue }) => {
    try {
      const response = await cobranzaAPI.updateCobranza(id, cobranzaData);
      toast.success('Pago actualizado exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar pago');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar pago con ID ${id}`);
    }
  }
);

export const deleteCobranza = createAsyncThunk(
  'cobranza/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await cobranzaAPI.deleteCobranza(id);
      toast.success('Pago eliminado exitosamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar pago');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar pago con ID ${id}`);
    }
  }
);

export const fetchPagosPorFactura = createAsyncThunk(
  'cobranza/fetchByFactura',
  async (noFactura: string, { rejectWithValue }) => {
    try {
      return await cobranzaAPI.getPagosPorFactura(noFactura);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener pagos de la factura ${noFactura}`);
    }
  }
);

export const fetchPagosPorCliente = createAsyncThunk(
  'cobranza/fetchByCliente',
  async ({ noCliente, filters }: { noCliente: number, filters?: FilterCobranzaDto }, { rejectWithValue }) => {
    try {
      return await cobranzaAPI.getPagosPorCliente(noCliente, filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener pagos del cliente ${noCliente}`);
    }
  }
);

export const fetchReporteCobranza = createAsyncThunk(
  'cobranza/fetchReporte',
  async ({ fechaDesde, fechaHasta }: { fechaDesde: Date, fechaHasta: Date }, { rejectWithValue }) => {
    try {
      return await cobranzaAPI.getReporteCobranza(fechaDesde, fechaHasta);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener reporte de cobranza');
    }
  }
);

// Slice
const cobranzaSlice = createSlice({
  name: 'cobranzas',
  initialState,
  reducers: {
    clearSelectedCobranza: (state) => {
      state.selectedCobranza = null;
    },
    clearCobranzasError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchCobranzas
    builder
      .addCase(fetchCobranzas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCobranzas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cobranzas = action.payload.data;
      })
      .addCase(fetchCobranzas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchCobranzaById
    builder
      .addCase(fetchCobranzaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCobranzaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCobranza = action.payload;
      })
      .addCase(fetchCobranzaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createCobranza
    builder
      .addCase(createCobranza.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCobranza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cobranzas.unshift(action.payload);
      })
      .addCase(createCobranza.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      //createbulkCobranza
      builder
      .addCase(createbulkCobranza.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createbulkCobranza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cobranzas.unshift(...action.payload);
      })
      .addCase(createbulkCobranza.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateCobranza
    builder
      .addCase(updateCobranza.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCobranza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cobranzas = state.cobranzas.map(cobranza => 
          cobranza.id === action.payload.id ? action.payload : cobranza
        );
        if (state.selectedCobranza?.id === action.payload.id) {
          state.selectedCobranza = action.payload;
        }
      })
      .addCase(updateCobranza.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteCobranza
    builder
      .addCase(deleteCobranza.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCobranza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cobranzas = state.cobranzas.filter(cobranza => cobranza.id !== action.payload);
        if (state.selectedCobranza?.id === action.payload) {
          state.selectedCobranza = null;
        }
      })
      .addCase(deleteCobranza.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchPagosPorFactura
    builder
      .addCase(fetchPagosPorFactura.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPagosPorFactura.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturaCobranzas = action.payload.data;
      })
      .addCase(fetchPagosPorFactura.rejected, (state, action) => {
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
        state.clienteCobranzas = action.payload.data;
      })
      .addCase(fetchPagosPorCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchReporteCobranza
    builder
      .addCase(fetchReporteCobranza.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReporteCobranza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reporte = action.payload;
      })
      .addCase(fetchReporteCobranza.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      builder
  .addCase(fetchReportePorRegion.pending, (state) => {
    state.isLoading = true;
    state.error = null;
  })
  .addCase(fetchReportePorRegion.fulfilled, (state, action) => {
    state.isLoading = false;
    state.reporteRegion = action.payload;
  })
  .addCase(fetchReportePorRegion.rejected, (state, action) => {
    state.isLoading = false;
    state.error = action.payload as string;
  });
  },
  
});

export const { clearSelectedCobranza, clearCobranzasError } = cobranzaSlice.actions;

// Selectores
export const selectCobranzas = (state: RootState) => state.cobranzas.cobranzas;
export const selectSelectedCobranza = (state: RootState) => state.cobranzas.selectedCobranza;
export const selectFacturaCobranzas = (state: RootState) => state.cobranzas.facturaCobranzas;
export const selectClienteCobranzas = (state: RootState) => state.cobranzas.clienteCobranzas;
export const selectReporteCobranza = (state: RootState) => state.cobranzas.reporte;
export const selectCobranzasLoading = (state: RootState) => state.cobranzas.isLoading;
export const selectCobranzasError = (state: RootState) => state.cobranzas.error;
export const selectReporteRegion = (state: RootState) => state.cobranzas.reporteRegion;

export default cobranzaSlice.reducer;