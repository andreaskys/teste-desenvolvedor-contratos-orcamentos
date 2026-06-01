import React, { useEffect, useState } from 'react';
import { Plus, Search, HardHat, TrendingUp, Calendar, ArrowRight, X } from 'lucide-react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

interface Obra {
  id: string;
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  contract: {
    number: string;
  };
}

interface Contract {
  id: string;
  number: string;
  title: string;
}

const Obras: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    contractId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [obrasRes, contractsRes] = await Promise.all([
        api.get('/obras'),
        api.get('/contracts') // Need to fetch contracts to link them
      ]);
      setObras(obrasRes.data);
      // Filter out only valid contracts to link to Obras
      setContracts(contractsRes.data.filter((c: any) => c.status === 'SIGNED' || c.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      await api.post('/obras', payload);
      await fetchData();
      setModalOpen(false);
      setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', contractId: '' });
    } catch (error) {
      console.error('Error creating obra:', error);
      alert('Erro ao criar obra. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#0071E3] font-bold text-xs uppercase tracking-[0.2em]">
            <HardHat size={14} />
            <span>Módulos Integrados</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Obras</h1>
          <p className="text-gray-500 mt-2">Acompanhamento operacional e financeiro vinculado a contratos.</p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          leftIcon={<Plus size={20} strokeWidth={3} />}
        >
          Nova Obra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">Carregando obras...</div>
        ) : obras.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white/60 rounded-[32px] border border-white">
            Nenhuma obra cadastrada no sistema. Comece vinculando uma obra a um contrato vigente.
          </div>
        ) : (
          obras.map((obra) => (
            <div 
              key={obra.id} 
              onClick={() => navigate(`/obras/${obra.id}`)}
              className="apple-card group hover:shadow-[0_15px_35px_rgba(0,113,227,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none bg-white/80 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-gradient-to-br from-[#FF9500] to-[#FF9F0A] text-white rounded-2xl shadow-[0_4px_12px_rgba(255,149,0,0.3)]">
                  <HardHat size={24} />
                </div>
                <span className="text-[10px] font-bold text-[#0071E3] bg-[#0071E3]/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#0071E3]/10">
                  CT: {obra.contract.number}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#0071E3] transition-colors">{obra.name}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm p-3 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500">
                    <TrendingUp size={16} className="text-[#34C759]" />
                    <span className="font-medium">Orçamento</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.budget)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm p-3 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={16} className="text-[#0071E3]" />
                    <span className="font-medium">Início</span>
                  </div>
                  <span className="font-bold text-gray-700">
                    {new Date(obra.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[#0071E3] font-bold text-sm">
                <span className="uppercase tracking-widest text-[10px]">Acessar Painel da Obra</span>
                <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 flex items-center justify-center group-hover:bg-[#0071E3] group-hover:text-white transition-colors">
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Nova Obra</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Vincule um projeto a um contrato ativo.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="obra-form" onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contrato Vinculado</label>
                  <select 
                    required
                    value={formData.contractId}
                    onChange={(e) => setFormData({...formData, contractId: e.target.value})}
                    className="apple-input bg-gray-50"
                  >
                    <option value="" disabled>Selecione um contrato vigente...</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>{c.number} - {c.title}</option>
                    ))}
                  </select>
                  {contracts.length === 0 && (
                    <p className="text-xs text-red-500 mt-1 font-medium">* Nenhum contrato ativo/assinado disponível para vinculação.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome da Obra</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Reforma Estrutural Bloco C"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="apple-input bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição (Opcional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Detalhes adicionais sobre o projeto..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="apple-input bg-gray-50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Orçamento Previsto (R$)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    placeholder="Ex: 150000.00"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="apple-input bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data de Início</label>
                    <input 
                      type="date" 
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="apple-input bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prazo Final</label>
                    <input 
                      type="date" 
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="apple-input bg-gray-50"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 shrink-0">
              <Button 
                variant="ghost"
                onClick={() => setModalOpen(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                form="obra-form"
                type="submit"
                className="flex-1"
                isLoading={submitting}
                disabled={contracts.length === 0}
              >
                Iniciar Obra
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Obras;

