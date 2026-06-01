import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HardHat, TrendingUp, Calendar, CheckCircle2, 
  Plus, AlertCircle, Camera, DollarSign, ListChecks,
  ChevronRight, ArrowLeft, ShoppingCart, Check, BarChart2,
  Clock, FileText, X, History, RefreshCw
} from 'lucide-react';
import api from '../api/client';
import Button from '../components/Button';
import toast from 'react-hot-toast';

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
  purchaseOrders: any[];
  manutencoes: any[];
}

type WorkflowStep = 'dashboard' | 'vistoria-inicial' | 'execucao' | 'custos' | 'oc' | 'manutencoes' | 'vistoria-final';

const workflowConfig: { id: WorkflowStep; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Visão Geral', icon: <BarChart2 size={18} /> },
  { id: 'vistoria-inicial', label: 'Vistoria Inicial', icon: <Camera size={18} /> },
  { id: 'execucao', label: 'Execução', icon: <ListChecks size={18} /> },
  { id: 'custos', label: 'Custos', icon: <DollarSign size={18} /> },
  { id: 'oc', label: 'O.C.', icon: <ShoppingCart size={18} /> },
  { id: 'manutencoes', label: 'Manutenção', icon: <History size={18} /> },
  { id: 'vistoria-final', label: 'Vistoria Final', icon: <CheckCircle2 size={18} /> }
];

const ObraDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkflowStep>('dashboard');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modals
  const [costModal, setCostModal] = useState(false);
  const [stepModal, setStepModal] = useState(false);
  const [vistoriaModal, setVistoriaModal] = useState(false);
  const [poModal, setPoModal] = useState(false);
  const [manutencaoModal, setManutencaoModal] = useState(false);

  // Form States
  const [costData, setCostData] = useState({ category: 'Material', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [stepData, setStepData] = useState({ title: '', description: '', order: '' });
  const [vistoriaData, setVistoriaData] = useState({ type: 'Vistoria Inicial', description: '' });
  const [poData, setPoData] = useState({ number: '', vendor: '', amount: '', payingCnpj: '' });
  const [manutencaoData, setManutencaoData] = useState({ description: '', provider: '', cost: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchObra();
  }, [id]);

  const generatePoNumber = () => `OC-${Math.floor(10000 + Math.random() * 90000)}`;

  const fetchObra = async () => {
    try {
      const response = await api.get(`/obras/${id}`);
      setObra(response.data);
    } catch (error) {
      console.error('Failed to fetch obra', error);
      toast.error('Erro ao carregar obra.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCosts = () => {
    if (!obra) return 0;
    const directCosts = obra.costs.reduce((sum, cost) => sum + parseFloat(cost.amount), 0);
    const maintenanceCosts = obra.manutencoes?.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0) || 0;
    return directCosts + maintenanceCosts;
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(costData.amount);
    if (isNaN(amount) || amount <= 0) return toast.error('Informe um valor válido.');
    
    setActionLoading(true);
    try {
      await api.post(`/obras/${id}/costs`, { 
        ...costData, 
        amount,
        date: new Date(costData.date).toISOString() 
      });
      await fetchObra();
      setCostModal(false);
      setCostData({ category: 'Material', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      toast.success('Custo lançado com sucesso!');
    } catch (err: any) { 
      toast.error(err.response?.data?.error || 'Erro ao lançar custo.'); 
    } finally { setActionLoading(false); }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post(`/obras/${id}/steps`, { ...stepData, order: parseInt(stepData.order) });
      await fetchObra();
      setStepModal(false);
      setStepData({ title: '', description: '', order: '' });
      toast.success('Etapa adicionada!');
    } catch (err: any) { 
      toast.error(err.response?.data?.error || 'Erro ao adicionar etapa.'); 
    } finally { setActionLoading(false); }
  };

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    try {
      await api.patch(`/obras/${id}/steps/${stepId}`, { completed: !completed });
      await fetchObra();
      toast.success('Status atualizado!');
    } catch (err) { toast.error('Erro ao atualizar etapa.'); }
  };

  const handleAddVistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let photos: string[] = [];
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('entityType', 'VISTORIA');
        
        const uploadRes = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photos.push(uploadRes.data.filename);
      }

      await api.post(`/obras/${id}/vistorias`, { ...vistoriaData, photos });
      await fetchObra();
      setVistoriaModal(false);
      setVistoriaData({ type: 'Vistoria Inicial', description: '' });
      setSelectedFile(null);
      toast.success('Vistoria registrada!');
    } catch (err: any) { 
      toast.error(err.response?.data?.error || 'Erro ao registrar vistoria.'); 
    } finally { setActionLoading(false); }
  };

  const handleAddPO = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(poData.amount);
    if (isNaN(amount) || amount <= 0) return toast.error('Informe um valor válido.');

    setActionLoading(true);
    try {
      await api.post(`/obras/${id}/purchase-orders`, { ...poData, amount });
      await fetchObra();
      setPoModal(false);
      toast.success('O.C. emitida com sucesso!');
    } catch (err: any) { 
      toast.error(err.response?.data?.error || 'Erro ao gerar O.C.'); 
    } finally { setActionLoading(false); }
  };

  const handleAddManutencao = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(manutencaoData.cost);
    if (isNaN(cost) || cost <= 0) return toast.error('Informe um valor válido.');

    setActionLoading(true);
    try {
      await api.post(`/obras/${id}/manutencoes`, { 
        ...manutencaoData, 
        cost,
        date: new Date(manutencaoData.date).toISOString()
      });
      await fetchObra();
      setManutencaoModal(false);
      setManutencaoData({ description: '', provider: '', cost: '', date: new Date().toISOString().split('T')[0] });
      toast.success('Manutenção registrada!');
    } catch (err: any) { 
      toast.error(err.response?.data?.error || 'Erro ao registrar manutenção.'); 
    } finally { setActionLoading(false); }
  };

  if (loading) return <div className="p-8 text-center">Carregando detalhes da obra...</div>;
  if (!obra) return <div className="p-8 text-center text-red-500">Obra não encontrada.</div>;

  const totalCosts = calculateTotalCosts();
  const costPercentage = (totalCosts / Number(obra.budget)) * 100;
  const activeStepIndex = workflowConfig.findIndex(s => s.id === activeTab);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
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
          <Button variant="secondary">
            Gerar Relatório
          </Button>
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

      {/* Roteiro da Obra (Workflow Stepper) */}
      <div className="apple-card p-0 overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-none">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Roteiro Operacional da Obra</h3>
          
          {/* Stepper Visual */}
          <div className="flex items-center justify-between relative mb-8 overflow-x-auto pb-4 no-scrollbar">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full z-0 min-w-[600px]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0071E3] rounded-full z-0 transition-all duration-500 min-w-[600px]" style={{ width: `${(activeStepIndex / (workflowConfig.length - 1)) * 100}%` }} />
            
            {workflowConfig.map((step, index) => {
              const isCompleted = index < activeStepIndex;
              const isActive = index === activeStepIndex;
              return (
                <div 
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className="relative z-10 flex flex-col items-center gap-3 cursor-pointer group min-w-[100px]"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-4 ${
                    isActive ? 'bg-[#0071E3] text-white border-white scale-110 shadow-lg shadow-[#0071E3]/30' :
                    isCompleted ? 'bg-[#34C759] text-white border-white' :
                    'bg-white text-gray-300 border-gray-100 group-hover:border-[#0071E3]/30 group-hover:text-[#0071E3]'
                  }`}>
                    {isCompleted ? <Check size={20} strokeWidth={3} /> : step.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    isActive ? 'text-[#0071E3]' :
                    isCompleted ? 'text-[#34C759]' :
                    'text-gray-400 group-hover:text-[#0071E3]'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">Visão Geral do Projeto</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Status atualizado de todas as fases do Roteiro Operacional.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Execução Status */}
                <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-[#0071E3]/10 text-[#0071E3] rounded-xl">
                        <ListChecks size={20} />
                      </div>
                      <span className="font-bold text-gray-900">Execução</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <h3 className="text-3xl font-black text-gray-900">
                        {obra.steps.length > 0 
                          ? Math.round((obra.steps.filter(s => s.completed).length / obra.steps.length) * 100) 
                          : 0}%
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-6">
                      {obra.steps.filter(s => s.completed).length}/{obra.steps.length} concluídas.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('execucao')} className="w-full">Ver Cronograma</Button>
                </div>

                {/* Vistoria Status */}
                <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-orange-100 text-orange-500 rounded-xl">
                        <Camera size={20} />
                      </div>
                      <span className="font-bold text-gray-900">Vistorias</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <h3 className="text-3xl font-black text-gray-900">{obra.vistorias.length}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-6">
                      {obra.vistorias.some(v => v.type.includes('Final')) ? 'Vistoria Final Realizada' : 'Pendente de Finalização'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('vistoria-inicial')} className="w-full">Ver Vistorias</Button>
                </div>

                {/* OC Status */}
                <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                        <ShoppingCart size={20} />
                      </div>
                      <span className="font-bold text-gray-900">Suprimentos</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <h3 className="text-3xl font-black text-gray-900">{obra.purchaseOrders?.length || 0}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-6">
                      Aprovadas: {obra.purchaseOrders?.filter(po => po.status === 'APPROVED').length || 0}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('oc')} className="w-full">Ver O.C.s</Button>
                </div>

                {/* Manutenção Status */}
                <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl">
                        <History size={20} />
                      </div>
                      <span className="font-bold text-gray-900">Manutenções</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <h3 className="text-3xl font-black text-gray-900">{obra.manutencoes?.length || 0}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-6">
                      Última: {obra.manutencoes?.length > 0 ? new Date(obra.manutencoes[obra.manutencoes.length - 1].date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('manutencoes')} className="w-full">Ver Histórico</Button>
                </div>
              </div>

              {/* Tabela Resumo Financeiro */}
              <div className="mt-8 rounded-[24px] border border-gray-100 overflow-hidden bg-white">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-gray-400" />
                    <h4 className="font-bold text-gray-900">Resumo Financeiro Recente</h4>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('custos')} className="text-[#0071E3]">Ver Detalhes</Button>
                </div>
                {obra.costs.length === 0 && (obra.manutencoes?.length || 0) === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400 font-medium">Nenhuma despesa lançada recentemente.</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {obra.costs.slice(-3).map((cost, idx) => (
                      <div key={`cost-${idx}`} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{cost.description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Custo Direto • {new Date(cost.date).toLocaleDateString()}</p>
                        </div>
                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost.amount)}
                        </span>
                      </div>
                    ))}
                    {obra.manutencoes?.slice(-2).map((m, idx) => (
                      <div key={`maint-${idx}`} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{m.description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Manutenção • {new Date(m.date).toLocaleDateString()}</p>
                        </div>
                        <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.cost || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vistoria-inicial' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">Vistoria Inicial</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Registros fotográficos e laudo de início de projeto.</p>
                </div>
                <Button onClick={() => setVistoriaModal(true)} leftIcon={<Plus size={18} />}>
                  Nova Vistoria
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {obra.vistorias.filter(v => v.type.includes('Inicial')).length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    Nenhuma vistoria inicial registrada. Adicione a primeira para liberar a execução.
                  </div>
                ) : (
                  obra.vistorias.filter(v => v.type.includes('Inicial')).map((vistoria, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Camera size={18} className="text-[#0071E3]" />
                          <span className="font-bold text-gray-900">{vistoria.type}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-md shadow-sm">
                          {new Date(vistoria.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed font-medium">{vistoria.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        {(vistoria.photos as string[] || []).map((photo: string, pIdx: number) => (
                          <div key={pIdx} className="w-20 h-20 rounded-2xl bg-white border-2 border-white shadow-sm overflow-hidden">
                            <img src={`http://localhost:3001/api/files/${photo}`} alt="Vistoria" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {(!vistoria.photos || (vistoria.photos as string[]).length === 0) && (
                           <div className="w-20 h-20 rounded-2xl bg-gray-200/80 border-2 border-white shadow-sm flex items-center justify-center text-gray-400">
                            <Camera size={20} className="opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'execucao' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">Execução e Cronograma</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Acompanhamento das etapas construtivas da obra.</p>
                </div>
                <Button onClick={() => setStepModal(true)} leftIcon={<Plus size={18} />}>
                  Adicionar Etapa
                </Button>
              </div>
              <div className="space-y-4">
                {obra.steps.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    Nenhuma etapa cadastrada no cronograma de execução.
                  </div>
                ) : (
                  obra.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-5 rounded-[24px] bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-gray-200 transition-all group">
                      <div 
                        onClick={() => handleToggleStep(step.id, step.completed)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer border-2 ${step.completed ? 'bg-[#34C759] border-[#34C759] text-white' : 'bg-white border-gray-200 text-gray-300 hover:border-[#0071E3]'}`}
                      >
                        {step.completed ? <Check size={20} strokeWidth={3} /> : <Check size={20} className="opacity-0 group-hover:opacity-50" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-base ${step.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{step.title}</p>
                        <p className={`text-sm mt-0.5 ${step.completed ? 'text-gray-300 line-through' : 'text-gray-500 font-medium'}`}>{step.description}</p>
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">FASE {step.order}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'custos' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">Gestão de Custos</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Lançamentos de despesas e controle orçamentário.</p>
                </div>
                <Button onClick={() => setCostModal(true)} leftIcon={<Plus size={18} />}>
                  Lançar Despesa
                </Button>
              </div>
              {obra.costs.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  Nenhum custo lançado no sistema para esta obra.
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-gray-100">
                  <table className="w-full text-left bg-white">
                    <thead>
                      <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/80 border-b border-gray-100">
                        <th className="p-5">Categoria</th>
                        <th className="p-5">Descrição</th>
                        <th className="p-5">Data</th>
                        <th className="p-5 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium divide-y divide-gray-50">
                      {obra.costs.map((cost, idx) => (
                        <tr key={idx} className="hover:bg-[#0071E3]/5 transition-colors">
                          <td className="p-5">
                            <span className="px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-600 uppercase tracking-widest">{cost.category}</span>
                          </td>
                          <td className="p-5 text-gray-900">{cost.description}</td>
                          <td className="p-5 text-gray-500">{new Date(cost.date).toLocaleDateString('pt-BR')}</td>
                          <td className="p-5 text-right font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'oc' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">Ordens de Compra (O.C.)</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Gestão de suprimentos e aprovação de materiais.</p>
                </div>
                <Button onClick={() => {
                  setPoData({ ...poData, number: generatePoNumber() });
                  setPoModal(true);
                }} leftIcon={<Plus size={18} />}>
                  Gerar O.C.
                </Button>
              </div>

              {obra.purchaseOrders && obra.purchaseOrders.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {obra.purchaseOrders.map((po, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-[24px] bg-gray-50 border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-[#0071E3] rounded-2xl">
                          <ShoppingCart size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight">O.C. #{po.number}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">Fornecedor: {po.vendor} • Pagador: {po.payingCnpj || 'Padrão'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(po.amount)}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase tracking-widest inline-block ${
                            po.status === 'APPROVED' ? 'bg-[#34C759]/10 text-[#34C759]' : 
                            po.status === 'PENDING' ? 'bg-[#FF9500]/10 text-[#FF9500]' : 
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {po.status === 'APPROVED' ? 'Aprovada' : po.status === 'PENDING' ? 'Pendente' : po.status}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  Nenhuma Ordem de Compra emitida para esta obra.
                </div>
              )}
            </div>
          )}

          {activeTab === 'manutencoes' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">Registro de Manutenções</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Histórico completo de intervenções e manutenções prediais.</p>
                </div>
                <Button onClick={() => setManutencaoModal(true)} leftIcon={<Plus size={18} />}>
                  Registrar Manutenção
                </Button>
              </div>

              {obra.manutencoes && obra.manutencoes.length > 0 ? (
                <div className="space-y-4">
                  {obra.manutencoes.map((m, idx) => (
                    <div key={idx} className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex justify-between items-center hover:border-gray-300 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl">
                          <History size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{m.description}</p>
                          <p className="text-sm text-gray-500 font-medium">Realizado por: {m.provider || 'N/A'} em {new Date(m.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.cost || 0)}
                        </p>
                        <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest">Intervenção</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  Nenhuma intervenção de manutenção registrada no histórico.
                </div>
              )}
            </div>
          )}

          {activeTab === 'vistoria-final' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">Vistoria Final & Entrega</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Auditoria de encerramento e emissão do termo de aceite.</p>
                </div>
                <Button variant="success" onClick={() => { setVistoriaData({ ...vistoriaData, type: 'Vistoria Final' }); setVistoriaModal(true); }} leftIcon={<CheckCircle2 size={18} />}>
                   Realizar Entrega
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {obra.vistorias.filter(v => v.type.includes('Final')).length === 0 ? (
                  <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    A Vistoria Final ainda não foi realizada. Execute esta ação ao concluir todas as etapas do roteiro.
                  </div>
                ) : (
                  obra.vistorias.filter(v => v.type.includes('Final')).map((vistoria, idx) => (
                    <div key={idx} className="p-8 rounded-[32px] bg-green-50/50 border border-[#34C759]/20 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-[#34C759]/10 rounded-bl-full -mr-4 -mt-4 flex items-center justify-center">
                        <CheckCircle2 size={48} className="text-[#34C759] ml-6 mb-6 opacity-50" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-[#34C759] text-white rounded-2xl shadow-lg shadow-[#34C759]/30">
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-900 text-xl tracking-tight">Laudo Final Aprovado</span>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Realizada em {new Date(vistoria.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed max-w-3xl mb-8">{vistoria.description}</p>
                        <div className="flex gap-3 flex-wrap">
                          {(vistoria.photos as string[] || []).map((photo: string, pIdx: number) => (
                            <div key={pIdx} className="w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:border-[#34C759] transition-colors cursor-pointer">
                              <img src={`http://localhost:3001/api/files/${photo}`} alt="Vistoria Final" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      {costModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Lançar Despesa</h3>
              <button onClick={() => setCostModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCost} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoria</label>
                <select className="apple-input w-full" value={costData.category} onChange={e => setCostData({...costData, category: e.target.value})}>
                  <option>Material</option><option>Mão de Obra</option><option>Logística</option><option>Taxas</option><option>Outros</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
                <input required className="apple-input w-full" value={costData.description} onChange={e => setCostData({...costData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor (R$)</label>
                  <input type="number" step="0.01" required className="apple-input w-full" value={costData.amount} onChange={e => setCostData({...costData, amount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data</label>
                  <input type="date" className="apple-input w-full" value={costData.date} onChange={e => setCostData({...costData, date: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setCostModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" isLoading={actionLoading}>Confirmar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stepModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Nova Etapa</h3>
              <button onClick={() => setStepModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStep} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título da Etapa</label>
                <input required className="apple-input w-full" value={stepData.title} onChange={e => setStepData({...stepData, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição Breve</label>
                <textarea className="apple-input w-full h-20 resize-none" value={stepData.description} onChange={e => setStepData({...stepData, description: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ordem no Cronograma</label>
                <input type="number" required className="apple-input w-full" value={stepData.order} onChange={e => setStepData({...stepData, order: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setStepModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" isLoading={actionLoading}>Adicionar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vistoriaModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Registrar Vistoria</h3>
              <button onClick={() => setVistoriaModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddVistoria} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Vistoria</label>
                <select className="apple-input w-full" value={vistoriaData.type} onChange={e => setVistoriaData({...vistoriaData, type: e.target.value})}>
                  <option>Vistoria Inicial</option><option>Acompanhamento</option><option>Vistoria Final</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Relatório Descritivo</label>
                <textarea required className="apple-input w-full h-32 resize-none" placeholder="Descreva o estado do local, observações técnicas..." value={vistoriaData.description} onChange={e => setVistoriaData({...vistoriaData, description: e.target.value})} />
              </div>
              
              <div className="relative">
                <input 
                  type="file" 
                  id="photo-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <label 
                  htmlFor="photo-upload" 
                  className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${selectedFile ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}
                >
                  <Camera size={32} className={selectedFile ? 'text-blue-500' : 'opacity-30'} />
                  <p className="text-sm font-bold">{selectedFile ? selectedFile.name : 'Anexar Foto do Local'}</p>
                  <p className="text-[10px] uppercase tracking-widest">Suporta JPG, PNG (Max 5MB)</p>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setVistoriaModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" isLoading={actionLoading}>Salvar Laudo</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {poModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Nova Ordem de Compra</h3>
              <button onClick={() => setPoModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPO} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número</label>
                  <div className="flex gap-2">
                    <input readOnly className="apple-input w-full bg-gray-50 text-xs" value={poData.number} />
                    <Button variant="ghost" size="sm" type="button" onClick={() => setPoData({...poData, number: generatePoNumber()})} className="px-2"><RefreshCw size={14} /></Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">CNPJ Pagador</label>
                  <input placeholder="XX.XXX.XXX/XXXX-XX" className="apple-input w-full" value={poData.payingCnpj} onChange={e => setPoData({...poData, payingCnpj: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fornecedor</label>
                <input required className="apple-input w-full" value={poData.vendor} onChange={e => setPoData({...poData, vendor: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor Total (R$)</label>
                <input type="number" step="0.01" required className="apple-input w-full" value={poData.amount} onChange={e => setPoData({...poData, amount: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setPoModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" isLoading={actionLoading}>Emitir O.C.</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {manutencaoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Registrar Manutenção</h3>
              <button onClick={() => setManutencaoModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddManutencao} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição da Intervenção</label>
                <input required className="apple-input w-full" value={manutencaoData.description} onChange={e => setManutencaoData({...manutencaoData, description: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prestador de Serviço</label>
                <input className="apple-input w-full" value={manutencaoData.provider} onChange={e => setManutencaoData({...manutencaoData, provider: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custo (R$)</label>
                  <input type="number" step="0.01" className="apple-input w-full" value={manutencaoData.cost} onChange={e => setManutencaoData({...manutencaoData, cost: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data</label>
                  <input type="date" className="apple-input w-full" value={manutencaoData.date} onChange={e => setManutencaoData({...manutencaoData, date: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setManutencaoModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" isLoading={actionLoading}>Registrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ObraDetails;
