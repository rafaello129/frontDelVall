import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bancoAPI } from './bancoAPI';
import type { BancoState, CreateBancoDto, UpdateBancoDto, FilterBancoDto } from './types';
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
  async ( args: FilterBancoDto | undefined,
    thunkAPI) => {
      const { rejectWithValue } = thunkAPI;
    try {
      return await bancoAPI.getAllBancos(args);
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
  name: 'bancos',
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
    // Fetch all bancos
    builder
      .addCase(fetchBancos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBancos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bancos = action.payload.data;
      })
      .addCase(fetchBancos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch banco by ID
    builder
      .addCase(fetchBancoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBancoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBanco = action.payload;
      })
      .addCase(fetchBancoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create banco
    builder
      .addCase(createBanco.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBanco.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bancos.push(action.payload);
      })
      .addCase(createBanco.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update banco
    builder
      .addCase(updateBanco.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBanco.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bancos = state.bancos.map(banco => 
          banco.id === action.payload.id ? action.payload : banco
        );
        if (state.selectedBanco?.id === action.payload.id) {
          state.selectedBanco = action.payload;
        }
      })
      .addCase(updateBanco.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete banco
    builder
      .addCase(deleteBanco.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBanco.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bancos = state.bancos.filter(banco => banco.id !== action.payload);
        if (state.selectedBanco?.id === action.payload) {
          state.selectedBanco = null;
        }
      })
      .addCase(deleteBanco.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedBanco, clearBancosError } = bancoSlice.actions;

// Selectores
export const selectBancos = (state: RootState) => state.bancos.bancos;
export const selectSelectedBanco = (state: RootState) => state.bancos.selectedBanco;
export const selectBancosLoading = (state: RootState) => state.bancos.isLoading;
export const selectBancosError = (state: RootState) => state.bancos.error;

export default bancoSlice.reducer;