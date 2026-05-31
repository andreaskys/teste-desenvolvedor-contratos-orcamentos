import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HardHat, TrendingUp, Calendar, AlertTriangle, 
  CheckCircle2, DollarSign, ArrowRight, Filter,
  Search, Clock, BarChart3, MoreVertical
} from 'lucide-react';
import api from '../api/client';

interface Obra {
  id: string;
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  contract: {
    number: string;
    title: string;
    relatedParty: string;
  };
  costs: { amount: number }[];
  steps: { completed: boolean }[];
}

const ContractManager: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      const response = await api.get('/obras');
      setObras(response.data);
    } catch (error) {
      console.error('Failed to fetch obras', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (obra: Obra) => {
    if (!obra.steps || obra.steps.length === 0) return 0;
    const completed = obra.steps.filter(s => s.completed).length;
    return Math.round((completed / obra.steps.length) * 100);
  };

  const calculateFinancialProgress = (obra: Obra) => {
    const totalCosts = obra.costs?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    return Math.min(Math.round((totalCosts / Number(obra.budget)) * 100), 100);
  };

  const filteredObras = obras.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.contract.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Operational Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#0071E3] font-bold text-xs uppercase tracking-[0.2em]">
            <BarChart3 size={14} />
            <span>Gestão Operacional</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Gerenciador de Contratos</h1>
          <p className="text-gray-500 mt-2 max-w-xl">Acompanhamento físico-financeiro em tempo real de todas as execuções contratuais.</p>
        </div>
        <div className="flex gap-3">
          <button className="apple-button-secondary">
            <Filter size={18} />
            Filtrar Status
          </button>
          <button onClick={() => navigate('/contracts/new')} className="apple-button-primary shadow-lg shadow-[#0071E3]/20">
            Novo Contrato / Obra
          </button>
        </div>
      </div>

      {/* Global Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="apple-card border-none bg-white shadow-sm overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Obras em Execução</p>
              <h3 className="text-3xl font-black text-gray-900">{obras.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-[#0071E3] rounded-2xl group-hover:scale-110 transition-transform">
              <HardHat size={24} />
            </div>
          </div>
        </div>
        <div className="apple-card border-none bg-white shadow-sm overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Aderência ao Prazo</p>
              <h3 className="text-3xl font-black text-gray-900">92%</h3>
            </div>
            <div className="p-3 bg-green-50 text-[#34C759] rounded-2xl group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="apple-card border-none bg-white shadow-sm overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Saúde Financeira</p>
              <h3 className="text-3xl font-black text-[#34C759]">Estável</h3>
            </div>
            <div className="p-3 bg-orange-50 text-[#FF9500] rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por obra, contrato ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="apple-input pl-14 py-5 bg-white border-none shadow-sm focus:shadow-md"
        />
      </div>

      {/* Obras Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Sincronizando painel operacional...</div>
        ) : filteredObras.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100">
            <AlertTriangle size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-bold">Nenhuma obra encontrada nos critérios.</p>
          </div>
        ) : (
          filteredObras.map((obra) => {
            const physicalProgress = calculateProgress(obra);
            const financialProgress = calculateFinancialProgress(obra);
            const isAlert = financialProgress > physicalProgress + 10; // Simple logic: spent 10% more than executed

            return (
              <div 
                key={obra.id}
                onClick={() => navigate(`/obras/${obra.id}`)}
                className="apple-card border-none bg-white shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#F5F5F7] text-gray-900 rounded-2xl group-hover:bg-[#0071E3] group-hover:text-white transition-all">
                        <HardHat size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#0071E3] transition-colors">{obra.name}</h3>
                          {isAlert && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FF3B30]/10 text-[#FF3B30] text-[9px] font-black rounded-full uppercase tracking-tighter animate-pulse">
                              <AlertTriangle size={10} /> Alerta de Custo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                          CT: {obra.contract.number} • {obra.contract.relatedParty}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Progress */}
                  <div className="w-full lg:w-48 space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Físico</span>
                      <span className="text-xs font-black text-gray-900">{physicalProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-900 rounded-full transition-all duration-1000"
                        style={{ width: `${physicalProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Progress */}
                  <div className="w-full lg:w-48 space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financeiro</span>
                      <span className={`text-xs font-black ${isAlert ? 'text-[#FF3B30]' : 'text-[#0071E3]'}`}>{financialProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full bg-gradient-to-r ${isAlert ? 'from-[#FF3B30] to-[#FF453A]' : 'from-[#0071E3] to-[#409CFF]'} rounded-full transition-all duration-1000`}
                        style={{ width: `${financialProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates & Value */}
                  <div className="flex gap-8 lg:px-8 border-l border-gray-50 hidden xl:flex">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Investimento</p>
                      <p className="text-sm font-black text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Entrega</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(obra.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="ml-auto flex items-center gap-4">
                    <button className="p-3 hover:bg-[#F5F5F7] rounded-2xl text-gray-400 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                    <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#0071E3]/10 group-hover:text-[#0071E3] transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-[#0071E3]/5 rounded-[32px] border border-[#0071E3]/10 flex items-center gap-6">
        <div className="p-4 bg-white rounded-2xl text-[#0071E3] shadow-sm">
          <DollarSign size={32} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg">Visão Consolidada</h4>
          <p className="text-gray-500 text-sm">O sistema monitora automaticamente desvios entre o cronograma físico e financeiro para prevenir prejuízos.</p>
        </div>
        <button className="apple-button-secondary bg-white text-gray-900 border-none shadow-sm font-bold">
          Ver Relatório Full
        </button>
      </div>
    </div>
  );
};

export default ContractManager;
