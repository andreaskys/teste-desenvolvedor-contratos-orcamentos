import React, { useEffect, useState } from 'react';
import { Plus, Search, HardHat, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import api from '../api/client';

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

const Obras: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchObras();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
          <p className="text-gray-500">Acompanhamento operacional e financeiro dos projetos</p>
        </div>
        <button className="apple-button-primary flex items-center gap-2">
          <Plus size={20} />
          Nova Obra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Carregando obras...</div>
        ) : obras.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">Nenhuma obra cadastrada.</div>
        ) : (
          obras.map((obra) => (
            <div key={obra.id} className="apple-card group hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                  <HardHat size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg uppercase">
                  Contrato {obra.contract.number}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{obra.name}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <TrendingUp size={16} />
                    <span>Orçamento</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.budget)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={16} />
                    <span>Início</span>
                  </div>
                  <span className="font-medium text-gray-700">
                    {new Date(obra.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-blue-600 font-bold text-sm">
                <span>Ver Detalhes</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Obras;
