import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage por defecto
import authReducer from '../features/auth/authSlice';

// Configuración para persistir el estado de autenticación
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['auth'], // Solo persistir el slice 'auth'
};

const rootReducer = combineReducers({
  auth: authReducer,
  // Aquí puedes agregar más reducers para otras funcionalidades
});

// Aplicar la persistencia al rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones de redux-persist que no son serializables
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Crear el persistor para PersistGate
export const persistor = persistStore(store);

// Tipos de inferencia para usar en el resto de la app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;