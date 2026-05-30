import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, FileText, Send, CheckCircle, Clock } from 'lucide-react';
import api from '../api/client';

interface Contract {
  id: string;
  number: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
}

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await api.get('/contracts');
        setContracts(response.data);
      } catch (error) {
        console.error('Failed to fetch contracts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-green-50 text-green-600 border border-green-100"><CheckCircle size={12} /> Ativo</span>;
      case 'DRAFT':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-50 text-gray-500 border border-gray-100"><Clock size={12} /> Rascunho</span>;
      case 'PENDING_SIGNATURE':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-50 text-orange-600 border border-orange-100"><Send size={12} /> Aguardando Assinatura</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-50 text-gray-500 border border-gray-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-500">Gerencie todos os contratos da sua empresa</p>
        </div>
        <Link to="/contracts/new" className="apple-button-primary flex items-center gap-2">
          <Plus size={20} />
          Novo Contrato
        </Link>
      </div>

      <div className="apple-card">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número ou título..."
              className="apple-input w-full pl-10"
            />
          </div>
          <button className="apple-button-secondary flex items-center gap-2">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-4 px-4">Contrato</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4">Valor</th>
                <th className="pb-4 px-4">Vigência</th>
                <th className="pb-4 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Carregando...</td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Nenhum contrato encontrado.</td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr 
                    key={contract.id} 
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{contract.number}</p>
                          <p className="text-xs text-gray-500">{contract.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
