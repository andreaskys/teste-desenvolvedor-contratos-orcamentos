import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HardHat, TrendingUp, Calendar, CheckCircle2, 
  Plus, AlertCircle, Camera, DollarSign, ListChecks,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import api from '../api/client';

interface Obra {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  contract: {
    number: string;
    title: string;
  };
  steps: any[];
  costs: any[];
  vistorias: any[];
}

const ObraDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'steps' | 'costs' | 'vistorias'>('steps');

  useEffect(() => {
    fetchObra();
  }, [id]);

  const fetchObra = async () => {
    try {
      const response = await api.get(`/obras/${id}`);
      setObra(response.data);
    } catch (error) {
      console.error('Failed to fetch obra', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCosts = () => {
    if (!obra) return 0;
    return obra.costs.reduce((sum, cost) => sum + parseFloat(cost.amount), 0);
  };

  if (loading) return <div className="p-8 text-center">Carregando detalhes da obra...</div>;
  if (!obra) return <div className="p-8 text-center text-red-500">Obra não encontrada.</div>;

  const totalCosts = calculateTotalCosts();
  const costPercentage = (totalCosts / Number(obra.budget)) * 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Navigation */}
      <button 
        onClick={() => navigate('/obras')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium mb-4"
      >
        <ArrowLeft size={16} />
        Voltar para Obras
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
              <HardHat size={20} />
            </div>
            <span className="text-sm font-bold text-gray-400 tracking-widest uppercase">Projeto Operacional</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{obra.name}</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">{obra.description || 'Sem descrição detalhada.'}</p>
        </div>
        
        <div className="flex gap-3">
          <button className="apple-button-secondary flex items-center gap-2">
            Gerar Relatório
          </button>
          <button className="apple-button-primary flex items-center gap-2">
            <Camera size={18} />
            Nova Vistoria
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="apple-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full uppercase">Orçamento</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Orçamento Previsto</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.budget)}
          </h3>
          <p className="text-xs text-gray-400 mt-2">Vinculado ao contrato {obra.contract.number}</p>
        </div>

        <div className="apple-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${costPercentage > 100 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
              {costPercentage.toFixed(1)}% Consumido
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">Custo Real Acumulado</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCosts)}
          </h3>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${costPercentage > 90 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(costPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="apple-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Prazo Estimado</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {new Date(obra.endDate).toLocaleDateString('pt-BR')}
          </h3>
          <p className="text-xs text-gray-400 mt-2">Iniciado em {new Date(obra.startDate).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="apple-card p-0 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {[
            { id: 'steps', label: 'Etapas da Obra', icon: <ListChecks size={18} /> },
            { id: 'costs', label: 'Gestão de Custos', icon: <DollarSign size={18} /> },
            { id: 'vistorias', label: 'Vistorias Técnicas', icon: <Camera size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-8 py-5 text-sm font-bold transition-all border-b-2 ${
                activeTab === tab.id 
                ? 'bg-white border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'steps' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">Cronograma de Atividades</h4>
                <button className="text-sm text-blue-500 font-bold flex items-center gap-1 hover:underline">
                  <Plus size={16} /> Adicionar Etapa
                </button>
              </div>
              <div className="space-y-4">
                {obra.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step.completed ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                      {step.completed ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${step.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{step.title}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                    <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Marcar Concluído
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">Histórico de Lançamentos</h4>
                <button className="text-sm text-blue-500 font-bold flex items-center gap-1 hover:underline">
                  <Plus size={16} /> Lançar Despesa
                </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="pb-4">Categoria</th>
                    <th className="pb-4">Descrição</th>
                    <th className="pb-4">Data</th>
                    <th className="pb-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {obra.costs.map((cost, idx) => (
                    <tr key={idx} className="border-t border-gray-50">
                      <td className="py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase">{cost.category}</span>
                      </td>
                      <td className="py-4 text-gray-900 font-medium">{cost.description}</td>
                      <td className="py-4 text-gray-500">{new Date(cost.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 text-right font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'vistorias' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {obra.vistorias.map((vistoria, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Camera size={18} className="text-blue-500" />
                      <span className="font-bold text-gray-900">{vistoria.type}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{new Date(vistoria.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">{vistoria.description}</p>
                  <div className="flex gap-2">
                    {/* Placeholder for photos */}
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse border-2 border-white shadow-sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObraDetails;
