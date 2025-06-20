import { useState } from 'react';
import { useUsers } from '../../../features/users/hooks/useUsers';
import type { UserProfile } from '../../../features/users/types';
import Button from '../../common/Button';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import UserFormCreate from './UserFormCreate';
import UserFormEdit from './UserFormEdit';
import DeleteConfirmModal from './DeleteConfirmModal';

type UsersTabProps = {
  users: UserProfile[];
  currentUser: UserProfile | null;
};

const UsersTab = ({ users, currentUser }: UsersTabProps) => {
  const { updateUser, deleteUser, isLoading } = useUsers();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Manejar cambio de rol
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUser(userId, { role: newRole as 'user' | 'admin' });
      toast.success('Rol actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar el rol');
      console.error('Error al cambiar rol:', err);
    }
  };

  // Manejar eliminación de usuario
  const handleDeleteUserConfirm = async (userId: string) => {
    try {
      await deleteUser(userId);
      setShowDeleteConfirm(null);
    } catch (err) {
      toast.error('Error al eliminar el usuario');
      console.error('Error al eliminar usuario:', err);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Gestión de Usuarios
        </h2>
        {!isCreating && !editingUser && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
            onClick={() => setIsCreating(true)}
          >
            Añadir Usuario
          </Button>
        )}
      </div>

      {/* Formulario para crear usuario */}
      {isCreating && (
        <UserFormCreate 
          onClose={() => setIsCreating(false)} 
        />
      )}

      {/* Formulario para editar usuario */}
      {editingUser && (
        <UserFormEdit 
          user={editingUser} 
          currentUserId={currentUser?.id || ''}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <DeleteConfirmModal 
          onConfirm={() => handleDeleteUserConfirm(showDeleteConfirm)} 
          onCancel={() => setShowDeleteConfirm(null)} 
        />
      )}

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registro
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actualizado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name} 
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={user.id === currentUser?.id || isLoading}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.updatedAt ? formatDate(user.updatedAt) : 'No actualizado'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      disabled={user.id === currentUser?.id || isLoading}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(user.id)}
                      disabled={user.id === currentUser?.id || isLoading}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;