import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { store, persistor } from './app/store';
import App from './App';
import LoadingSpinner from './components/common/LoadingSpinner';
import theme from './theme/theme';

// Importar estilos globales
import './index.css';


// Crear el root de React
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        {/* PersistGate retrasa la renderización hasta que el estado persiste */}
        <PersistGate loading={<LoadingSpinner fullScreen />} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);