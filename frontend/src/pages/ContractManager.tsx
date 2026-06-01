import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, Search, Filter, AlertTriangle, 
  MoreVertical, FileText, CheckCircle, Clock,
  Eye, RefreshCw, XCircle, FilePlus, ShieldCheck, Plus
} from 'lucide-react';
import api from '../api/client';
import Button from '../components/Button';

interface Contract {
  id: string;
  number: string;
  title: string;
  relatedParty: string;
  contractType: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
}

const ContractManager: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const mode = location.pathname.includes('/manager') ? 'ACTIVE' : location.pathname.includes('/assinaturas') ? 'PENDING' : 'ALL';

  // Modal States
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [addendumModalOpen, setAddendumModalOpen] = useState(false);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [newEndDate, setNewEndDate] = useState('');
  const [newValue, setNewValue] = useState<number | ''>('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleRenew = async () => {
    if (!selectedContract || !newEndDate) return;
    setActionLoading(true);
    try {
      await api.put(`/contracts/${selectedContract.id}`, {
        endDate: newEndDate,
        status: 'ACTIVE',
        actionType: 'RENEW'
      });
      await fetchContracts();
      setRenewModalOpen(false);
      setNewEndDate('');
      setSelectedContract(null);
    } catch (error) {
      console.error('Failed to renew contract', error);
      alert('Erro ao renovar contrato.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddendum = async () => {
    if (!selectedContract) return;
    setActionLoading(true);
    try {
      const payload: any = { actionType: 'ADDENDUM' };
      if (newEndDate) payload.endDate = newEndDate;
      if (newValue !== '') payload.value = Number(newValue);

      await api.put(`/contracts/${selectedContract.id}`, payload);
      await fetchContracts();
      setAddendumModalOpen(false);
      setNewEndDate('');
      setNewValue('');
      setSelectedContract(null);
    } catch (error) {
      console.error('Failed to generate addendum', error);
      alert('Erro ao gerar aditivo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!selectedContract) return;
    setActionLoading(true);
    try {
      await api.put(`/contracts/${selectedContract.id}`, {
        status: 'CANCELLED',
        actionType: 'TERMINATE'
      });
      await fetchContracts();
      setTerminateModalOpen(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Failed to terminate contract', error);
      alert('Erro ao encerrar contrato.');
    } finally {
      setActionLoading(false);
    }
  };

  const openRenew = (contract: Contract) => {
    setSelectedContract(contract);
    setNewEndDate(contract.endDate.split('T')[0]);
    setRenewModalOpen(true);
    setActiveMenu(null);
  };

  const openAddendum = (contract: Contract) => {
    setSelectedContract(contract);
    setNewEndDate(contract.endDate.split('T')[0]);
    setNewValue(contract.value);
    setAddendumModalOpen(true);
    setActiveMenu(null);
  };

  const openTerminate = (contract: Contract) => {
    setSelectedContract(contract);
    setTerminateModalOpen(true);
    setActiveMenu(null);
  };

  const getRemainingValidity = (endDate: string, status: string) => {
    if (status === 'CANCELLED' || status === 'EXPIRED') return { text: '-', color: 'text-gray-400' };

    const end = new Date(endDate);
    const now = new Date();
    
    end.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Vencido há ${Math.abs(diffDays)} dias`, color: 'text-red-500' };
    if (diffDays === 0) return { text: 'Vence hoje', color: 'text-orange-500' };
    if (diffDays <= 30) return { text: `${diffDays} dias restantes`, color: 'text-orange-500' };
    
    const months = Math.floor(diffDays / 30);
    if (months > 0) {
      return { text: `${months} ${months === 1 ? 'mês' : 'meses'}`, color: 'text-green-500' };
    }
    return { text: `${diffDays} dias`, color: 'text-green-500' };
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    end.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === 'CANCELLED') {
      return <span className="flex items-center w-fit gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500 uppercase"><XCircle size={12} /> Encerrado</span>;
    }
    if (status === 'EXPIRED' || (status === 'ACTIVE' && diffDays < 0)) {
      return <span className="flex items-center w-fit gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-600 uppercase"><AlertTriangle size={12} /> Expirado</span>;
    }
    if (status === 'ACTIVE' && diffDays <= 30) {
      return <span className="flex items-center w-fit gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-orange-100 text-orange-600 uppercase"><Clock size={12} /> Vencendo</span>;
    }
    if (status === 'ACTIVE' || status === 'SIGNED') {
      return <span className="flex items-center w-fit gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-600 uppercase"><CheckCircle size={12} /> Ativo</span>;
    }
    if (status === 'PENDING_SIGNATURE') {
      return <span className="flex items-center w-fit gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-600 uppercase"><Clock size={12} /> Aguardando Assinatura</span>;
    }

    return <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500 uppercase">{status}</span>;
  };

  const getPageContent = () => {
    if (mode === 'ACTIVE') return { title: 'Gerenciador Ativos', desc: 'Monitoramento exclusivo de contratos em vigência.', badge: 'Gerenciador' };
    if (mode === 'PENDING') return { title: 'Fila de Assinaturas', desc: 'Contratos pendentes aguardando assinatura das partes.', badge: 'Assinaturas' };
    return { title: 'Contratos', desc: 'Listagem geral de contratos criados, histórico e filtros.', badge: 'Listagem' };
  };

  const content = getPageContent();

  let baseContracts = contracts;
  if (mode === 'ACTIVE') {
    baseContracts = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'SIGNED');
  } else if (mode === 'PENDING') {
    baseContracts = contracts.filter(c => c.status === 'PENDING_SIGNATURE');
  }

  const filteredContracts = baseContracts.filter(c => {
    const matchesSearch = c.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.relatedParty && c.relatedParty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.contractType && c.contractType.toLowerCase().includes(searchTerm.toLowerCase()));
      
    if (mode === 'ALL' && statusFilter !== 'ALL') {
      return matchesSearch && c.status === statusFilter;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#0071E3] font-bold text-xs uppercase tracking-[0.2em]">
            <BarChart3 size={14} />
            <span>{content.badge}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{content.title}</h1>
          <p className="text-gray-500 mt-2 max-w-xl">{content.desc}</p>
        </div>
        <div className="flex gap-3 relative">
          <Button variant="secondary" leftIcon={<Filter size={18} />}>
            Filtros
          </Button>
          <Button 
            onClick={() => navigate('/contracts/new')}
            leftIcon={<Plus size={18} />}
          >
            Novo Contrato
          </Button>
        </div>
      </div>

      <div className="apple-card p-0 bg-white shadow-sm border-none relative z-10">
        <div className="p-6 border-b border-gray-100/50 bg-gray-50/30 flex flex-col md:flex-row gap-4 rounded-t-[32px]">
          <div className="flex flex-1 gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar por parte relacionada, tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="apple-input w-full pl-12 bg-white shadow-sm"
              />
            </div>
            
            {mode === 'ALL' && (
              <div className="relative z-50">
                <Button 
                  variant="secondary"
                  onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                  className={statusFilter !== 'ALL' ? 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20' : ''}
                  leftIcon={<Filter size={18} className={statusFilter !== 'ALL' ? 'text-[#0071E3]' : ''} />}
                >
                  Filtros
                </Button>

                {showFiltersDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowFiltersDropdown(false)} />
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-white/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
                      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtrar por Status</p>
                        {statusFilter !== 'ALL' && (
                          <button 
                            onClick={() => { setStatusFilter('ALL'); setShowFiltersDropdown(false); }}
                            className="text-[10px] font-bold text-[#0071E3] hover:underline uppercase tracking-widest"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        {[
                          { val: 'ALL', label: 'Todos os Status' },
                          { val: 'DRAFT', label: 'Rascunhos' },
                          { val: 'PENDING_SIGNATURE', label: 'Aguardando Assinatura' },
                          { val: 'ACTIVE', label: 'Ativos' },
                          { val: 'SIGNED', label: 'Assinados' },
                          { val: 'EXPIRED', label: 'Expirados' },
                          { val: 'CANCELLED', label: 'Encerrados' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            onClick={() => { setStatusFilter(opt.val); setShowFiltersDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${statusFilter === opt.val ? 'bg-[#0071E3] text-white font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-b-[32px]">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="py-4 px-6">Parte Relacionada</th>
                <th className="py-4 px-6">Tipo de Contrato</th>
                <th className="py-4 px-6">Valor do Contrato</th>
                <th className="py-4 px-6">Data de Início</th>
                <th className="py-4 px-6">Data de Encerramento</th>
                <th className="py-4 px-6">Vigência Restante</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">Carregando painel de acompanhamento...</td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">Nenhum contrato encontrado.</td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  const validity = getRemainingValidity(contract.endDate, contract.status);
                  return (
                    <tr 
                      key={contract.id} 
                      className="group hover:bg-[#0071E3]/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-[#0071E3] group-hover:text-white transition-all">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{contract.relatedParty || 'Não Informado'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{contract.number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                        {contract.contractType || 'Outros'}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-bold ${validity.color}`}>
                          {validity.text}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(contract.status, contract.endDate)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + 8,
                              right: window.innerWidth - rect.right
                            });
                            setActiveMenu(activeMenu === contract.id ? null : contract.id);
                          }}
                          className={`p-2 transition-colors rounded-full ${activeMenu === contract.id ? 'bg-[#0071E3] text-white' : 'text-gray-300 hover:text-[#0071E3] hover:bg-[#0071E3]/10'}`}
                        >
                          <MoreVertical size={20} />
                        </button>

                        {activeMenu === contract.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                            <div 
                              className="fixed z-[70] w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                              style={{ top: menuPosition.top, right: menuPosition.right }}
                            >
                              <div className="p-2 space-y-1 text-left relative z-30">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${contract.id}`); }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                  <Eye size={16} className="text-[#0071E3]" />
                                  Visualizar
                                </button>
                                {contract.status !== 'CANCELLED' && (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openRenew(contract); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                      <RefreshCw size={16} className="text-green-500" />
                                      Renovar
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openAddendum(contract); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                      <FilePlus size={16} className="text-orange-500" />
                                      Gerar Aditivo
                                    </button>
                                    <div className="h-px bg-gray-100 my-1" />
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openTerminate(contract); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                      <XCircle size={16} className="text-red-500" />
                                      Encerrar
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-8 bg-[#0071E3]/5 rounded-[32px] border border-[#0071E3]/10">
        <h4 className="font-bold text-gray-900 text-lg mb-4">Análise Consolidada do Painel</h4>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#0071E3] font-black">•</span>
            <strong>Status Automatizado:</strong> Contratos próximos ao vencimento (≤ 30 dias) são alertados automaticamente como "Vencendo".
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0071E3] font-black">•</span>
            <strong>Ações Rápidas (Acesso Direto):</strong> As ações de "Visualizar, Renovar, Encerrar e Gerar Aditivo" estão disponíveis no menu contextual (três pontos) de cada registro, permitindo acesso imediato sem mudança de tela.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0071E3] font-black">•</span>
            <strong>Cálculo de Vigência:</strong> A "Vigência Restante" é calculada em tempo real com base na data de encerramento do contrato e a data atual, convertendo para dias e meses.
          </li>
        </ul>
      </div>

      {/* RENEW MODAL */}
      {renewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Renovar Contrato</h3>
              <p className="text-sm text-gray-500 mt-1">Estenda a vigência do contrato selecionado.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contrato</label>
                <p className="text-gray-900 font-medium">{selectedContract?.number} - {selectedContract?.relatedParty}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nova Data de Encerramento</label>
                <input 
                  type="date" 
                  value={newEndDate}
                  onChange={e => setNewEndDate(e.target.value)}
                  className="apple-input w-full"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-3">
              <Button 
                variant="ghost"
                onClick={() => setRenewModalOpen(false)}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleRenew}
                variant="success"
                isLoading={actionLoading}
              >
                Confirmar Renovação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADDENDUM MODAL */}
      {addendumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Gerar Aditivo</h3>
              <p className="text-sm text-gray-500 mt-1">Ajuste valores ou prazos do contrato.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contrato</label>
                <p className="text-gray-900 font-medium">{selectedContract?.number} - {selectedContract?.relatedParty}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Novo Valor (Opcional)</label>
                <input 
                  type="number" 
                  value={newValue}
                  onChange={e => setNewValue(Number(e.target.value))}
                  placeholder="Ex: 50000.00"
                  className="apple-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nova Data de Encerramento (Opcional)</label>
                <input 
                  type="date" 
                  value={newEndDate}
                  onChange={e => setNewEndDate(e.target.value)}
                  className="apple-input w-full"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-3">
              <Button 
                variant="ghost"
                onClick={() => setAddendumModalOpen(false)}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddendum}
                variant="warning"
                isLoading={actionLoading}
              >
                Aplicar Aditivo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TERMINATE MODAL */}
      {terminateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Encerrar Contrato</h3>
              <p className="text-sm text-gray-500 mt-1">Deseja realmente encerrar este contrato?</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 font-medium">
                O contrato <strong>{selectedContract?.number}</strong> será marcado como <span className="text-red-500 font-bold">Encerrado</span>. Esta ação mudará o status do contrato e ele deixará de ser monitorado.
              </p>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-3">
              <Button 
                variant="ghost"
                onClick={() => setTerminateModalOpen(false)}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTerminate}
                variant="destructive"
                isLoading={actionLoading}
              >
                Encerrar Contrato
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContractManager;
