import { toast } from 'react-toastify';
import Button from '../../common/Button';

const SettingsTab = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Configuración del Sistema
      </h2>
      
      <div className="bg-white shadow-sm rounded-md p-4 mb-6">
        <h3 className="text-md font-medium text-gray-900 mb-3">
          Seguridad
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Autenticación de dos factores</p>
              <p className="text-sm text-gray-500">Requiere 2FA para todos los administradores</p>
            </div>
            <div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Bloqueo de cuenta</p>
              <p className="text-sm text-gray-500">Bloquear cuentas después de 5 intentos fallidos</p>
            </div>
            <div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Duración de sesión</p>
              <p className="text-sm text-gray-500">Tiempo antes de que expire la sesión</p>
            </div>
            <div>
              <select 
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                defaultValue="120"
              >
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
                <option value="120">2 horas</option>
                <option value="240">4 horas</option>
                <option value="480">8 horas</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-md p-4 mb-6">
        <h3 className="text-md font-medium text-gray-900 mb-3">
          Registro de Usuarios
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Registro abierto</p>
              <p className="text-sm text-gray-500">Permitir que cualquiera se registre en la plataforma</p>
            </div>
            <div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Verificación de email</p>
              <p className="text-sm text-gray-500">Requerir verificación de email antes de activar la cuenta</p>
            </div>
            <div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => toast.success('Configuración guardada correctamente')}
        >
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;