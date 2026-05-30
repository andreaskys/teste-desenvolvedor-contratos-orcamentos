import React, { useEffect, useState } from 'react';
import { FileText, HardHat, TrendingUp, Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/contracts'),
      api.get('/obras')
    ]).then(([contractsRes, obrasRes]) => {
      setContracts(contractsRes.data);
      setObras(obrasRes.data);
      setLoading(false);
    });
  }, []);

  const calculateRemainingDays = (endDate: string) => {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
  const pendingSignatures = contracts.filter(c => c.status === 'PENDING_SIGNATURE');
  const expiringSoon = activeContracts.filter(c => calculateRemainingDays(c.endDate) <= 30);
  
  const totalValue = activeContracts.reduce((sum, c) => sum + parseFloat(c.value), 0);

  const stats = [
    { label: 'Contratos Ativos', value: activeContracts.length, icon: <CheckCircle className="text-green-500" />, trend: 'Vigentes' },
    { label: 'Aguardando Assinatura', value: pendingSignatures.length, icon: <Clock className="text-orange-500" />, trend: 'Em fluxo' },
    { label: 'Total sob Gestão', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalValue), icon: <TrendingUp className="text-blue-500" />, trend: 'Valor total' },
    { label: 'Próximos Vencimentos', value: expiringSoon.length, icon: <AlertTriangle className="text-red-500" />, trend: 'Próximos 30 dias' },
  ];

  if (loading) return <div className="p-8 text-center">Carregando Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="apple-card hover:shadow-md transition-shadow cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.label === 'Próximos Vencimentos' && stat.value > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="apple-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Gestão de Contratos Recentes</h3>
            <button onClick={() => navigate('/contracts')} className="text-sm text-blue-500 font-bold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {contracts.slice(0, 5).map((contract) => (
              <div 
                key={contract.id} 
                onClick={() => navigate(`/contracts/${contract.id}`)}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-blue-100 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{contract.number}</p>
                    <p className="text-xs text-gray-500">{contract.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Expira em {calculateRemainingDays(contract.endDate)} dias
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="apple-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Status Operacional (Obras)</h3>
            <button onClick={() => navigate('/obras')} className="text-sm text-blue-500 font-bold hover:underline">Ver todas</button>
          </div>
          <div className="space-y-6">
            {obras.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm italic">Nenhuma obra cadastrada</div>
            ) : (
              obras.slice(0, 4).map((obra, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">{obra.name}</span>
                    <span className="text-gray-400 font-medium">Contrato {obra.contract.number}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                      style={{ width: `70%` }} // Mocking progress
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase tracking-widest font-bold">Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.budget)}</span>
                    <span className="text-blue-500 font-bold">70% CONCLUÍDO</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
