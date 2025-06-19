import type { TypedUseSelectorHook } from 'react-redux';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use estos hooks tipados en vez de los estándar 'useDispatch' y 'useSelector'
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;