import { createSlice, createAsyncThunk,  } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { usersAPI } from './usersAPI';
import type { CreateUserDto, UpdateUserDto, UsersState, UserProfile } from './types';
import type { RootState } from '../../app/store';
import { toast } from 'react-toastify';

// Estado inicial
const initialState: UsersState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null
};

// Thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await usersAPI.getAllUsers();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await usersAPI.getUserById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener usuario con ID ${id}`);
    }
  }
);

export const fetchUserByEmail = createAsyncThunk(
  'users/fetchUserByEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      return await usersAPI.getUserByEmail(email);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Error al obtener usuario con email ${email}`);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserDto, { rejectWithValue }) => {
    try {
      const response = await usersAPI.createUser(userData);
      toast.success('Usuario creado exitosamente');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
      return rejectWithValue(error.response?.data?.message || 'Error al crear usuario');
    }
  }
);

export const updateUserById = createAsyncThunk(
  'users/updateUserById',
  async ({ id, userData }: { id: string; userData: UpdateUserDto }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.updateUserById(id, userData);
    toast.success('Usuario actualizado exitosamente', { autoClose: 1000 });
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
      return rejectWithValue(error.response?.data?.message || `Error al actualizar usuario con ID ${id}`);
    }
  }
);

export const deleteUserById = createAsyncThunk(
  'users/deleteUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      await usersAPI.deleteUserById(id);
      toast.info('Usuario eliminado exitosamente');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
      return rejectWithValue(error.response?.data?.message || `Error al eliminar usuario con ID ${id}`);
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<UserProfile>) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user by email
    builder
      .addCase(fetchUserByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload;
        state.users = state.users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.users = state.users.filter(user => user.id !== deletedId);
        if (state.selectedUser?.id === deletedId) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Exportar acciones y selectores
export const { clearSelectedUser, clearUsersError, setSelectedUser } = usersSlice.actions;

// Selectores
export const selectUsers = (state: RootState) => state.users.users;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectUsersLoading = (state: RootState) => state.users.isLoading;
export const selectUsersError = (state: RootState) => state.users.error;

export default usersSlice.reducer;