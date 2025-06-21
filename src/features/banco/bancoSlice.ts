import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { bancoAPI } from './bancoAPI';
import type { Banco, BancoState, CreateBancoDto, UpdateBancoDto, FilterBancoDto } from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

const initialState: BancoState = {
  bancos: [],
  selectedBanco: null,
  isLoading: false,
  error: null
};

// Thunks
export const fetchBancos = createAsyncThunk(
  'banco/fetchAll',
  async (filters: FilterBancoDto, { rejectWithValue }) => {
    try {
      return await bancoAPI.getAllBancos(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener bancos');
    }
  }
);

export const fetchBancoById = createAsyncThunk(
  'banco/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await bancoAPI.getBancoById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener banco con ID ${id}`);
    }
  }
);

export const createBanco = createAsyncThunk(
  'banco/create',
  async (bancoData: CreateBancoDto, { rejectWithValue }) => {
    try {
      const response = await bancoAPI.createBanco(bancoData);
      toast.success('Banco creado exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear banco');
      return rejectWithValue(error.response?.data?.message || 'Error al crear banco');
    }
  }
);

export const updateBanco = createAsyncThunk(
  'banco/update',
  async ({ id, bancoData }: { id: number; bancoData: UpdateBancoDto }, { rejectWithValue }) => {
    try {
      const response = await bancoAPI.updateBanco(id, bancoData);
      toast.success('Banco actualizado exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar banco');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar banco con ID ${id}`);
    }
  }
);

export const deleteBanco = createAsyncThunk(
  'banco/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await bancoAPI.deleteBanco(id);
      toast.success('Banco eliminado exitosamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar banco');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar banco con ID ${id}`);
    }
  }
);

// Slice
const bancoSlice = createSlice({
  name: 'banco',
  initialState,
  reducers: {
    clearSelectedBanco: (state) => {
      state.selectedBanco = null;
    },
    clearBancosError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Implementación de los reducers para los thunks
    // TODO: Implementar los reducers para manejar las acciones asíncronas
  }
});

export const { clearSelectedBanco, clearBancosError } = bancoSlice.actions;

// Selectores
export const selectBancos = (state: RootState) => state.bancos.bancos;
export const selectSelectedBanco = (state: RootState) => state.bancos.selectedBanco;
export const selectBancosLoading = (state: RootState) => state.bancos.isLoading;
export const selectBancosError = (state: RootState) => state.bancos.error;

export default bancoSlice.reducer;