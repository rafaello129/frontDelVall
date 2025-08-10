import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/auth/authSlice';
import { useUsers } from '../../features/users/hooks/useUsers';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import UsersTab from './admin/UsersTab';
import StatsTab from './admin/StatsTab';
import SettingsTab from './admin/SettingsTab';

type ActiveTabType = 'users' | 'stats' | 'settings';

const AdminPage = () => {
  const currentUser = useAppSelector(selectUser);
  const { 
    users, 
    isLoading, 
    error, 
    getAllUsers
  } = useUsers();
  
  const [activeTab, setActiveTab] = useState<ActiveTabType>('users');

  // Cargar datos de usuarios al montar el componente
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  // Mostrar error si existe
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'users':
        return <UsersTab users={users} currentUser={currentUser} />;
      case 'stats':
        return <StatsTab users={users} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <UsersTab users={users} currentUser={currentUser} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Encabezado */}
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona usuarios, estadísticas y configuraciones del sistema
          </p>
        </div>

        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <TabButton 
              isActive={activeTab === 'users'} 
              onClick={() => setActiveTab('users')} 
              label="Usuarios" 
            />
            <TabButton 
              isActive={activeTab === 'stats'} 
              onClick={() => setActiveTab('stats')} 
              label="Estadísticas" 
            />
            <TabButton 
              isActive={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              label="Configuración" 
            />
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-4">
          {isLoading && activeTab !== 'settings' ? (
            <LoadingSpinner message={`Cargando ${activeTab === 'users' ? 'usuarios' : 'estadísticas'}...`} />
          ) : (
            renderActiveTab()
          )}
        </div>
      </div>
    </div>
  );
};

// Componente TabButton para las pestañas de navegación
const TabButton = ({ isActive, onClick, label }: { isActive: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {label}
  </button>
);

export default AdminPage;