import type { UserProfile } from '../../../features/users/types';
import { format } from 'date-fns';

type StatsTabProps = {
  users: UserProfile[];
};

const StatsTab = ({ users }: StatsTabProps) => {
  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Obtener usuarios recientes - crea una copia antes de ordenar
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Estadísticas del Sistema
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total de Usuarios
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {users.length}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Usuarios Admin
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {users.filter(user => user.role === 'admin').length}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Nuevos Registros (Últimos 30 días)
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {users.filter(user => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return new Date(user.createdAt) > thirtyDaysAgo;
              }).length}
            </dd>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Usuarios Recientes
          </h3>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentUsers.map(user => (
                <li key={user.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
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
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
              {users.length === 0 && (
                <li className="py-4 text-center text-sm text-gray-500">
                  No hay usuarios registrados
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;