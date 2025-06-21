import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';

import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import clienteReducer from '../features/cliente/clienteSlice';
import telefonoClienteReducer from '../features/telefonoCliente/telefonoClienteSlice';
import correoClienteReducer from '../features/correoCliente/correoClienteSlice';
import bancoReducer from '../features/banco/bancoSlice';
import cobranzaReducer from '../features/cobranza/cobranzaSlice';
import facturaReducer from '../features/factura/facturaSlice';
// Configuración para persistir auth
const authPersistConfig = {
  key: 'auth',
  version: 1,
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    users: usersReducer,
    cliente: clienteReducer,
    telefonoCliente: telefonoClienteReducer,
    correoCliente: correoClienteReducer,
    bancos: bancoReducer,
    cobranzas: cobranzaReducer,
    facturas: facturaReducer,
    // Aquí se añaden otros reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;