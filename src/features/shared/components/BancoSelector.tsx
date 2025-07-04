import React, { useEffect } from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  
} from '@mui/material';
import type {
    SelectChangeEvent
  } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { fetchBancos, selectBancos, selectBancosLoading } from '../../banco/bancoSlice';

interface BancoSelectorProps {
  value: number | string;
  onChange: (bancoId: number) => void;
  error?: boolean;
  helperText?: string;
  showEmpty?: boolean;
  size?: 'small' | 'medium';
}

export const BancoSelector: React.FC<BancoSelectorProps> = ({
  value,
  onChange,
  error,
  helperText,
  showEmpty = false,
  size = 'medium'
}) => {
  const dispatch = useAppDispatch();
  const bancos = useAppSelector(selectBancos);
  const loading = useAppSelector(selectBancosLoading);

  useEffect(() => {
    dispatch(fetchBancos({}));
  }, [dispatch]);

  // Use SelectChangeEvent instead of the generic SelectProps['onChange']
  const handleChange = (event: SelectChangeEvent<string | number>) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl fullWidth error={error} size={size}>
      <InputLabel>Banco</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label="Banco"
        disabled={loading}
      >
        {showEmpty && (
          <MenuItem value="">
            <em>Todos los bancos</em>
          </MenuItem>
        )}
        {bancos.map((banco) => (
          <MenuItem key={banco.id} value={banco.id}>
            {banco.nombre} {banco.codigoBancario ? `(${banco.codigoBancario})` : ''}
          </MenuItem>
        ))}
      </Select>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};