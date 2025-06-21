import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { clienteAPI } from './clienteAPI';
import type { 
  ClienteState, 
  Cliente, 
  CreateClienteDto, 
  UpdateClienteDto,
  FilterClienteDto,
  AntiguedadSaldosDto,
  SaldoAntiguedad,
  FacturaPendiente
} from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

const initialState: ClienteState = {
  clientes: [],
  selectedCliente: null,
  facturasPendientes: [],
  antiguedadSaldos: [],
  pagination: {
    total: 0,
    limit: 10,
    skip: 0
  },
  isLoading: false,
  error: null
};

// Thunks
export const fetchClientes = createAsyncThunk(
  'cliente/fetchAll',
  async (filters: FilterClienteDto, { rejectWithValue }) => {
    try {
      return await clienteAPI.getAllClientes(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener los clientes');
    }
  }
);

export const fetchClienteById = createAsyncThunk(
  'cliente/fetchById',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await clienteAPI.getClienteById(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener el cliente ${noCliente}`);
    }
  }
);

export const createCliente = createAsyncThunk(
  'cliente/create',
  async (cliente: CreateClienteDto, { rejectWithValue }) => {
    try {
      const response = await clienteAPI.createCliente(cliente);
      toast.success(`Cliente ${cliente.noCliente} creado correctamente`);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear cliente');
      return rejectWithValue(error.response?.data?.message || 'Error al crear cliente');
    }
  }
);

export const updateCliente = createAsyncThunk(
  'cliente/update',
  async ({ noCliente, data }: { noCliente: number, data: UpdateClienteDto }, { rejectWithValue }) => {
    try {
      const response = await clienteAPI.updateCliente(noCliente, data);
      toast.success(`Cliente ${noCliente} actualizado correctamente`);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar cliente');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar cliente ${noCliente}`);
    }
  }
);

export const deleteCliente = createAsyncThunk(
  'cliente/delete',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      await clienteAPI.deleteCliente(noCliente);
      toast.success(`Cliente ${noCliente} eliminado correctamente`);
      return noCliente;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar cliente');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar cliente ${noCliente}`);
    }
  }
);

export const fetchFacturasPendientes = createAsyncThunk(
  'cliente/fetchFacturasPendientes',
  async (noCliente: number, { rejectWithValue }) => {
    try {
      return await clienteAPI.getFacturasPendientes(noCliente);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener facturas del cliente ${noCliente}`);
    }
  }
);

export const fetchAntiguedadSaldos = createAsyncThunk(
  'cliente/fetchAntiguedadSaldos',
  async (params: AntiguedadSaldosDto, { rejectWithValue }) => {
    try {
      return await clienteAPI.getAntiguedadSaldos(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener reporte de antigüedad de saldos');
    }
  }
);

// Slice
const clienteSlice = createSlice({
  name: 'cliente',
  initialState,
  reducers: {
    clearSelectedCliente: (state) => {
      state.selectedCliente = null;
    },
    clearFacturasPendientes: (state) => {
      state.facturasPendientes = [];
    },
    clearAntiguedadSaldos: (state) => {
      state.antiguedadSaldos = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePagination: (state, action: PayloadAction<{ limit?: number, skip?: number }>) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    // Fetch all clientes
    builder
      .addCase(fetchClientes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientes = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchClientes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch cliente by ID
    builder
      .addCase(fetchClienteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClienteById.fulfilled, (state, action: PayloadAction<Cliente>) => {
        state.isLoading = false;
        state.selectedCliente = action.payload;
      })
      .addCase(fetchClienteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create cliente
    builder
      .addCase(createCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCliente.fulfilled, (state, action: PayloadAction<Cliente>) => {
        state.isLoading = false;
        state.clientes.push(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update cliente
    builder
      .addCase(updateCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCliente.fulfilled, (state, action: PayloadAction<Cliente>) => {
        state.isLoading = false;
        state.clientes = state.clientes.map(cliente => 
          cliente.noCliente === action.payload.noCliente ? action.payload : cliente
        );
        state.selectedCliente = action.payload;
      })
      .addCase(updateCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete cliente
    builder
      .addCase(deleteCliente.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCliente.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.clientes = state.clientes.filter(cliente => cliente.noCliente !== action.payload);
        if (state.selectedCliente && state.selectedCliente.noCliente === action.payload) {
          state.selectedCliente = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteCliente.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch facturas pendientes
    builder
      .addCase(fetchFacturasPendientes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacturasPendientes.fulfilled, (state, action: PayloadAction<FacturaPendiente[]>) => {
        state.isLoading = false;
        state.facturasPendientes = action.payload;
      })
      .addCase(fetchFacturasPendientes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch antigüedad de saldos
    builder
      .addCase(fetchAntiguedadSaldos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAntiguedadSaldos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.antiguedadSaldos = action.payload.data;
      })
      .addCase(fetchAntiguedadSaldos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Actions
export const { 
  clearSelectedCliente, 
  clearFacturasPendientes, 
  clearAntiguedadSaldos,
  clearError, 
  updatePagination 
} = clienteSlice.actions;

// Selectors
export const selectClientes = (state: RootState) => state.cliente.clientes;
export const selectSelectedCliente = (state: RootState) => state.cliente.selectedCliente;
export const selectFacturasPendientes = (state: RootState) => state.cliente.facturasPendientes;
export const selectAntiguedadSaldos = (state: RootState) => state.cliente.antiguedadSaldos;
export const selectPagination = (state: RootState) => state.cliente.pagination;
export const selectClienteIsLoading = (state: RootState) => state.cliente.isLoading;
export const selectClienteError = (state: RootState) => state.cliente.error;

export default clienteSlice.reducer;