import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { facturaAPI } from './facturaAPI';
import type { 
  Factura, 
  FacturaState, 
  CreateFacturaDto, 
  UpdateFacturaDto, 
  FilterFacturaDto, 
  CambioEstadoDto
} from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

const initialState: FacturaState = {
  facturas: [],
  selectedFactura: null,
  facturasVencidas: [],
  facturasPendientes: [],
  isLoading: false,
  error: null
};

// Thunks
export const fetchFacturas = createAsyncThunk(
  'factura/fetchAll',
  async (
    args: FilterFacturaDto | undefined,
    thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await facturaAPI.getAllFacturas(args);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener facturas');
    }
  }
);

export const fetchFacturaById = createAsyncThunk(
  'factura/fetchById',
  async (noFactura: string, { rejectWithValue }) => {
    try {
      return await facturaAPI.getFacturaById(noFactura);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener factura ${noFactura}`);
    }
  }
);

export const createFactura = createAsyncThunk(
  'factura/create',
  async (facturaData: CreateFacturaDto, { rejectWithValue }) => {
    try {
      const response = await facturaAPI.createFactura(facturaData);
      toast.success('Factura creada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear factura');
      return rejectWithValue(error.response?.data?.message || 'Error al crear factura');
    }
  }
);

export const updateFactura = createAsyncThunk(
  'factura/update',
  async ({ noFactura, facturaData }: { noFactura: string; facturaData: UpdateFacturaDto }, { rejectWithValue }) => {
    try {
      const response = await facturaAPI.updateFactura(noFactura, facturaData);
      toast.success('Factura actualizada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar factura');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar factura ${noFactura}`);
    }
  }
);

export const deleteFactura = createAsyncThunk(
  'factura/delete',
  async (noFactura: string, { rejectWithValue }) => {
    try {
      await facturaAPI.deleteFactura(noFactura);
      toast.success('Factura eliminada exitosamente');
      return noFactura;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar factura');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar factura ${noFactura}`);
    }
  }
);

export const cambiarEstadoFactura = createAsyncThunk(
  'factura/cambiarEstado',
  async ({ noFactura, estado }: { noFactura: string; estado: string }, { rejectWithValue }) => {
    try {
      const response = await facturaAPI.cambiarEstado(noFactura, { estado });
      toast.success(`Estado de factura actualizado a: ${estado}`);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado de factura');
      return rejectWithValue(error.response?.data?.message || `Error al cambiar estado de factura ${noFactura}`);
    }
  }
);

export const fetchFacturasVencidas = createAsyncThunk(
  'factura/fetchVencidas',
  async (_, { rejectWithValue }) => {
    try {
      return await facturaAPI.getFacturasVencidas();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener facturas vencidas');
    }
  }
);

export const fetchFacturasPendientesPorCliente = createAsyncThunk(
  'factura/fetchPendientesPorCliente',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await facturaAPI.getFacturasPendientesPorCliente(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener facturas pendientes del cliente ${noCliente}`);
    }
  }
);

export const actualizarFacturasVencidas = createAsyncThunk(
  'factura/actualizarVencidas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await facturaAPI.actualizarFacturasVencidas();
      toast.success(`Se actualizaron ${response.facturasActualizadas} facturas vencidas`);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar facturas vencidas');
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar facturas vencidas');
    }
  }
);

// Slice
const facturaSlice = createSlice({
  name: 'facturas',
  initialState,
  reducers: {
    clearSelectedFactura: (state) => {
      state.selectedFactura = null;
    },
    clearFacturasError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchFacturas
    builder
      .addCase(fetchFacturas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacturas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturas = action.payload.data;
      })
      .addCase(fetchFacturas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchFacturaById
    builder
      .addCase(fetchFacturaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacturaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedFactura = action.payload;
      })
      .addCase(fetchFacturaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createFactura
    builder
      .addCase(createFactura.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFactura.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturas.unshift(action.payload);
      })
      .addCase(createFactura.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateFactura
    builder
      .addCase(updateFactura.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFactura.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturas = state.facturas.map(factura => 
          factura.noFactura === action.payload.noFactura ? action.payload : factura
        );
        if (state.selectedFactura?.noFactura === action.payload.noFactura) {
          state.selectedFactura = action.payload;
        }
      })
      .addCase(updateFactura.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteFactura
    builder
      .addCase(deleteFactura.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFactura.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturas = state.facturas.filter(factura => factura.noFactura !== action.payload);
        if (state.selectedFactura?.noFactura === action.payload) {
          state.selectedFactura = null;
        }
      })
      .addCase(deleteFactura.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // cambiarEstadoFactura
    builder
      .addCase(cambiarEstadoFactura.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cambiarEstadoFactura.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturas = state.facturas.map(factura => 
          factura.noFactura === action.payload.noFactura ? action.payload : factura
        );
        if (state.selectedFactura?.noFactura === action.payload.noFactura) {
          state.selectedFactura = action.payload;
        }
      })
      .addCase(cambiarEstadoFactura.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchFacturasVencidas
    builder
      .addCase(fetchFacturasVencidas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacturasVencidas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturasVencidas = action.payload.data;
      })
      .addCase(fetchFacturasVencidas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchFacturasPendientesPorCliente
    builder
      .addCase(fetchFacturasPendientesPorCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacturasPendientesPorCliente.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facturasPendientes = action.payload.data;
      })
      .addCase(fetchFacturasPendientesPorCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // actualizarFacturasVencidas
    builder
      .addCase(actualizarFacturasVencidas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(actualizarFacturasVencidas.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(actualizarFacturasVencidas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedFactura, clearFacturasError } = facturaSlice.actions;

// Selectores
export const selectFacturas = (state: RootState) => state.facturas.facturas;
export const selectSelectedFactura = (state: RootState) => state.facturas.selectedFactura;
export const selectFacturasVencidas = (state: RootState) => state.facturas.facturasVencidas;
export const selectFacturasPendientes = (state: RootState) => state.facturas.facturasPendientes;
export const selectFacturasLoading = (state: RootState) => state.facturas.isLoading;
export const selectFacturasError = (state: RootState) => state.facturas.error;

export default facturaSlice.reducer;