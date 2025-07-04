import React, { useEffect, useState } from 'react';
import { useBancos } from '../hooks/useBancos';
import BancosTable from '../../../components/banco/BancosTable';
import BancoForm from '../../../components/banco/BancoForm';
import  Button  from '../../../components/common/Button';
import type { Banco, CreateBancoDto, UpdateBancoDto } from '../types';

const BancosPage: React.FC = () => {
  const { 
    bancos, 
    isLoading, 
    error, 
    getAllBancos, 
    addBanco, 
    updateBancoById, 
    removeBanco 
  } = useBancos();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBanco, setSelectedBanco] = useState<Banco | null>(null);

  useEffect(() => {
    getAllBancos();
  }, [getAllBancos]);

  const handleOpenCreateForm = () => {
    setSelectedBanco(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (banco: Banco) => {
    setSelectedBanco(banco);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedBanco(null);
  };

  const handleSubmit = async (data: CreateBancoDto | UpdateBancoDto) => {
    try {
      if (selectedBanco) {
        // Actualización
        await updateBancoById(selectedBanco.id, data as UpdateBancoDto);
      } else {
        // Creación
        await addBanco(data as CreateBancoDto);
      }
      handleCloseForm();
      getAllBancos(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar banco:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este banco?')) {
      try {
        await removeBanco(id);
        getAllBancos(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar banco:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Bancos</h1>
        <Button 
          variant="primary"
          onClick={handleOpenCreateForm}
        >
          Nuevo Banco
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Modal para formulario (usando un enfoque simple) */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedBanco ? 'Editar' : 'Crear'} Banco
            </h2>
            <BancoForm
              banco={selectedBanco || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <BancosTable
        bancos={bancos}
        onEdit={handleOpenEditForm}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BancosPage;