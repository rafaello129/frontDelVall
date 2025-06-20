import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchAllUsers, 
  fetchUserById, 
  fetchUserByEmail, 
  createUser, 
  updateUserById, 
  deleteUserById,
  selectUsers,
  selectSelectedUser,
  selectUsersLoading,
  selectUsersError,
  clearSelectedUser
} from '../usersSlice';
import type { CreateUserDto, UpdateUserDto } from '../types';

export const useUsers = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const selectedUser = useAppSelector(selectSelectedUser);
  const isLoading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);

  const getAllUsers = useCallback(() => {
    return dispatch(fetchAllUsers());
  }, [dispatch]);

  const getUserById = useCallback((id: string) => {
    return dispatch(fetchUserById(id));
  }, [dispatch]);

  const getUserByEmail = useCallback((email: string) => {
    return dispatch(fetchUserByEmail(email));
  }, [dispatch]);

  const addUser = useCallback((userData: CreateUserDto) => {
    return dispatch(createUser(userData)).unwrap();
  }, [dispatch]);

  const updateUser = useCallback((id: string, userData: UpdateUserDto) => {
    return dispatch(updateUserById({ id, userData })).unwrap();
  }, [dispatch]);

  const deleteUser = useCallback((id: string) => {
    return dispatch(deleteUserById(id)).unwrap();
  }, [dispatch]);

  const clearUser = useCallback(() => {
    dispatch(clearSelectedUser());
  }, [dispatch]);

  return {
    // Estado
    users,
    selectedUser,
    isLoading,
    error,
    
    // Acciones
    getAllUsers,
    getUserById,
    getUserByEmail,
    addUser,
    updateUser,
    deleteUser,
    clearUser
  };
};