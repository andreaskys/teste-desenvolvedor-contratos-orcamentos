import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, CheckCircle, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import api from '../api/client';

interface Contract {
  id: string;
  number: string;
  title: string;
  relatedParty: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
}

const ActiveContracts: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await api.get('/contracts');
        // Filter only SIGNED contracts for this repository
        const active = response.data.filter((c: any) => c.status === 'SIGNED' || c.status === 'ACTIVE');
        setContracts(active);
      } catch (error) {
        console.error('Failed to fetch contracts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#34C759]/10 rounded-xl">
              <ShieldCheck size={24} className="text-[#34C759]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contratos Vigentes</h1>
          </div>
          <p className="text-gray-500 mt-2">Repositório de documentos formalizados e ativos</p>
        </div>
      </div>

      <div className="apple-card bg-gray-50/50 p-6">
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar vigentes..."
              className="apple-input w-full pl-12 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-400 font-medium">Carregando repositório...</div>
          ) : contracts.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
              <ShieldCheck size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-semibold text-lg">Nenhum contrato vigente no momento.</p>
              <p className="text-sm text-gray-400 mt-2">Os contratos aparecem aqui após serem assinados.</p>
            </div>
          ) : (
            contracts.map((contract) => (
              <div 
                key={contract.id}
                onClick={() => navigate(`/contracts/${contract.id}`)}
                className="group p-8 rounded-[32px] bg-white border border-gray-100 hover:border-[#0071E3]/30 hover:shadow-[0_8px_30px_rgba(0,113,227,0.12)] transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                  <ExternalLink size={18} className="text-[#0071E3]" />
                </div>

                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#0071E3] group-hover:text-white transition-all duration-300 shadow-sm">
                    <FileText size={24} />
                  </div>
                  <div className="pr-8">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#0071E3] transition-colors tracking-tight">{contract.number}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">{contract.relatedParty}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Total</span>
                    <span className="text-sm font-bold text-gray-900">
                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vigência</span>
                    <span className="text-sm font-semibold text-gray-600">{new Date(contract.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#34C759]/10 px-3 py-1.5 rounded-full">
                    <CheckCircle size={14} className="text-[#34C759]" />
                    <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest">Vigente</span>
                  </div>
                  <button className="p-2.5 bg-gray-50 hover:bg-[#0071E3]/10 rounded-full text-gray-400 hover:text-[#0071E3] transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveContracts;
