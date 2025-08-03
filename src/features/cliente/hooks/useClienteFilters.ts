import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchClientesForFilters,
  selectClientesFilterOptions,
  selectClientesLoading,
  selectClientesError
} from '../clienteSlice';

export const useClienteFilters = () => {
  const dispatch = useAppDispatch();
  const filterOptions = useAppSelector(selectClientesFilterOptions);
  const isLoading = useAppSelector(selectClientesLoading);
  const error = useAppSelector(selectClientesError);

  useEffect(() => {
    // Cargar clientes para filtros solo si no hay opciones disponibles
    if (
      filterOptions.noClientes.length === 0 &&
      filterOptions.razonSocial.length === 0 &&
      filterOptions.comercial.length === 0 &&
      !isLoading
    ) {
      dispatch(fetchClientesForFilters());
    }
  }, [dispatch, filterOptions, isLoading]);

  return {
    filterOptions,
    isLoading,
    error,
    reloadFilterOptions: () => dispatch(fetchClientesForFilters())
  };
};