import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchClientes, selectClientes as selectClientesLista } from '../../cliente/clienteSlice';

interface ClienteAutocompleteProps {
  value: number | string | null;
  onChange: (clienteId: number | null) => void;
  error?: boolean;
  helperText?: string;
  showEmpty?: boolean;
  size?: 'small' | 'medium';
}

export const ClienteAutocomplete: React.FC<ClienteAutocompleteProps> = ({
  value,
  onChange,
  error,
  helperText,
  showEmpty = false,
  size = 'medium'
}) => {
  const dispatch = useAppDispatch();
  const clientes = useAppSelector(selectClientesLista);
  const [loading, setLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchClientes({ limit: 100 }))
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (value && clientes.length > 0) {
      const cliente = clientes.find(c => c.noCliente === Number(value));
      setSelectedCliente(cliente || null);
    } else {
      setSelectedCliente(null);
    }
  }, [value, clientes]);

  return (
    <Autocomplete
      options={clientes}
      getOptionLabel={(option) => 
        typeof option === 'string' ? option : `${option.comercial || option.razonSocial} (${option.noCliente})`
      }
      isOptionEqualToValue={(option, value) => 
        option.noCliente === value.noCliente
      }
      loading={loading}
      value={selectedCliente}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.noCliente : null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Cliente"
          fullWidth
          error={error}
          helperText={helperText}
          size={size}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};