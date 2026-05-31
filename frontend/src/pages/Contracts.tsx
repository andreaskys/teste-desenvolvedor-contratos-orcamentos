import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, FileText, Send, CheckCircle, Clock, Trash2, Edit3, X } from 'lucide-react';
import api from '../api/client';

interface Contract {
  id: string;
  number: string;
  title: string;
  relatedParty?: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
}

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL_PENDING');

  useEffect(() => {
    fetchContracts();
  }, []);

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

  const filteredContracts = contracts.filter((contract) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      contract.number.toLowerCase().includes(searchLower) ||
      contract.title.toLowerCase().includes(searchLower) ||
      (contract.relatedParty || '').toLowerCase().includes(searchLower);

    let matchesFilter = true;
    if (statusFilter === 'ALL_PENDING') {
      matchesFilter = contract.status !== 'SIGNED' && contract.status !== 'ACTIVE';
    } else if (statusFilter === 'SIGNED') {
      matchesFilter = contract.status === 'SIGNED' || contract.status === 'ACTIVE';
    } else if (statusFilter !== 'ALL') {
      matchesFilter = contract.status === statusFilter;
    }

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir este rascunho?')) return;
    
    try {
      await api.delete(`/contracts/${id}`);
      fetchContracts();
      setActiveMenu(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir contrato.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SIGNED':
      case 'ACTIVE':
        return <span className="flex items-center w-fit gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 uppercase tracking-widest"><CheckCircle size={12} /> Assinado</span>;
      case 'DRAFT':
        return <span className="flex items-center w-fit gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest"><Clock size={12} /> Rascunho</span>;
      case 'PENDING_SIGNATURE':
        return <span className="flex items-center w-fit gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20 uppercase tracking-widest"><Send size={12} /> Aguardando Assinatura</span>;
      case 'EXPIRED':
        return <span className="flex items-center w-fit gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 uppercase tracking-widest"><X size={12} /> Expirado</span>;
      default:
        return <span className="px-3 py-1.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contratos</h1>
          <p className="text-gray-500 mt-1">Gerencie todos os contratos da sua empresa</p>
        </div>
        <Link to="/contracts/new" className="apple-button-primary">
          <Plus size={20} strokeWidth={3} />
          <span>Novo Contrato</span>
        </Link>
      </div>

      <div className="apple-card p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100/50 bg-gray-50/30 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número, título ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="apple-input w-full pl-12 bg-white shadow-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="apple-input bg-white cursor-pointer min-w-[240px] text-gray-700 font-medium shadow-sm"
            >
              <option value="ALL_PENDING">Pendentes e Rascunhos</option>
              <option value="PENDING_SIGNATURE">Aguardando Assinatura</option>
              <option value="DRAFT">Rascunhos</option>
              <option value="EXPIRED">Expirados</option>
              <option value="SIGNED">Assinados (Vigentes)</option>
              <option value="ALL">Todos os Contratos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="py-4 px-6">Documento</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Valor</th>
                <th className="py-4 px-6">Vigência</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">Carregando...</td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">Nenhum contrato encontrado.</td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr 
                    key={contract.id} 
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                    className="group hover:bg-[#0071E3]/5 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#0071E3] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,113,227,0.3)] transition-all duration-300">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[#0071E3] transition-colors">{contract.number}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{contract.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                      {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === contract.id ? null : contract.id);
                        }}
                        className={`p-2 transition-colors rounded-full ${activeMenu === contract.id ? 'bg-[#0071E3] text-white' : 'text-gray-300 group-hover:text-[#0071E3] hover:bg-[#0071E3]/10'}`}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenu === contract.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                          <div className="absolute right-6 top-14 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2 space-y-1 text-left relative z-30">
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${contract.id}`); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                              >
                                <Edit3 size={16} className="text-gray-400" />
                                Detalhes / Editar
                              </button>
                              
                              {contract.status === 'DRAFT' && (
                                <button 
                                  onClick={(e) => handleDelete(e, contract.id)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                  <Trash2 size={16} />
                                  Excluir Rascunho
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
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
