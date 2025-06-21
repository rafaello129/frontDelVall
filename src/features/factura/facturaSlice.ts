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
  isLoading: false,
  error: null
};

// Thunks
export const fetchFacturas = createAsyncThunk(
  'factura/fetchAll',
  async (filters: FilterFacturaDto, { rejectWithValue }) => {
    try {
      return await facturaAPI.getAllFacturas(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener facturas');
    }
  }
);

export const fetchFacturaById = createAsyncThunk(
  'factura/fetchById',
  async (noFactura: number, { rejectWithValue }) => {
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
  async ({ noFactura, facturaData }: { noFactura: number; facturaData: UpdateFacturaDto }, { rejectWithValue }) => {
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
  async (noFactura: number, { rejectWithValue }) => {
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
  async ({ noFactura, estado }: { noFactura: number; estado: string }, { rejectWithValue }) => {
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

// Slice
const facturaSlice = createSlice({
  name: 'factura',
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
    // Implementación de los reducers para los thunks
    // TODO: Implementar los reducers para manejar las acciones asíncronas
  }
});

export const { clearSelectedFactura, clearFacturasError } = facturaSlice.actions;

// Selectores
export const selectFacturas = (state: RootState) => state.facturas.facturas;
export const selectSelectedFactura = (state: RootState) => state.facturas.selectedFactura;
export const selectFacturasLoading = (state: RootState) => state.facturas.isLoading;
export const selectFacturasError = (state: RootState) => state.facturas.error;

export default facturaSlice.reducer;    