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
  isLoading: false,
  error: null
};

// Thunks
export const fetchCobranzas = createAsyncThunk(
  'cobranza/fetchAll',
  async (filters: FilterCobranzaDto, { rejectWithValue }) => {
    try {
      return await cobranzaAPI.getAllCobranzas(filters);
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
      toast.success('Cobranza registrada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar cobranza');
      return rejectWithValue(error.response?.data?.message || 'Error al registrar cobranza');
    }
  }
);

export const updateCobranza = createAsyncThunk(
  'cobranza/update',
  async ({ id, cobranzaData }: { id: number; cobranzaData: UpdateCobranzaDto }, { rejectWithValue }) => {
    try {
      const response = await cobranzaAPI.updateCobranza(id, cobranzaData);
      toast.success('Cobranza actualizada exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar cobranza');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar cobranza con ID ${id}`);
    }
  }
);

export const deleteCobranza = createAsyncThunk(
  'cobranza/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await cobranzaAPI.deleteCobranza(id);
      toast.success('Cobranza eliminada exitosamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar cobranza');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar cobranza con ID ${id}`);
    }
  }
);

// Thunks adicionales para operaciones específicas
export const fetchPagosPorFactura = createAsyncThunk(
  'cobranza/fetchByFactura',
  async (noFactura: number, { rejectWithValue }) => {
    try {
      return await cobranzaAPI.getPagosPorFactura(noFactura);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener pagos de la factura ${noFactura}`);
    }
  }
);

// Slice
const cobranzaSlice = createSlice({
  name: 'cobranza',
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
    // Implementación de los reducers para los thunks
    // TODO: Implementar los reducers para manejar las acciones asíncronas
  }
});

export const { clearSelectedCobranza, clearCobranzasError } = cobranzaSlice.actions;

// Selectores
export const selectCobranzas = (state: RootState) => state.cobranzas.cobranzas;
export const selectSelectedCobranza = (state: RootState) => state.cobranzas.selectedCobranza;
export const selectCobranzasLoading = (state: RootState) => state.cobranzas.isLoading;
export const selectCobranzasError = (state: RootState) => state.cobranzas.error;

export default cobranzaSlice.reducer;