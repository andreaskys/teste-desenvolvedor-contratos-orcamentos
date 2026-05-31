import React, { useEffect, useState } from 'react';
import { FileText, HardHat, TrendingUp, Clock, Calendar, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

  const activeContracts = contracts.filter(c => c.status === 'SIGNED' || c.status === 'ACTIVE');
  const pendingSignatures = contracts.filter(c => c.status === 'PENDING_SIGNATURE');
  const expiringSoon = activeContracts.filter(c => calculateRemainingDays(c.endDate) <= 30);
  
  const totalValue = activeContracts.reduce((sum, c) => sum + parseFloat(c.value), 0);

  const stats = [
    { label: 'Contratos Vigentes', value: activeContracts.length, icon: <CheckCircle className="text-[#34C759]" />, trend: 'Ativos' },
    { label: 'Aguardando Assinatura', value: pendingSignatures.length, icon: <Clock className="text-[#FF9500]" />, trend: 'Em fluxo' },
    { label: 'Total sob Gestão', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalValue), icon: <TrendingUp className="text-[#0071E3]" />, trend: 'Valor total' },
    { label: 'Próximos Vencimentos', value: expiringSoon.length, icon: <AlertTriangle className="text-[#FF3B30]" />, trend: 'Próximos 30 dias' },
  ];

  const chartData = obras.map(obra => ({
    name: obra.name,
    budget: parseFloat(obra.budget),
    spent: obra.costs ? obra.costs.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) : 0
  }));

  const COLORS = ['#0071E3', '#FF9500', '#F2F2F7'];

  if (loading) return <div className="p-8 text-center font-medium text-gray-500">Carregando Dashboard...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="apple-card border-none bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 bg-[#F5F5F7] text-gray-900 rounded-2xl">{stat.icon}</div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                stat.label === 'Próximos Vencimentos' && stat.value > 0 ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#F5F5F7] text-gray-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="apple-card lg:col-span-8 border-none shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Performance Financeira</h3>
              <p className="text-sm text-gray-500 mt-1">Comparativo de custos por obra</p>
            </div>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 text-gray-400"><div className="w-3 h-3 bg-[#0071E3] rounded-sm" /> Orçado</div>
              <div className="flex items-center gap-2 text-gray-400"><div className="w-3 h-3 bg-[#34C759] rounded-sm" /> Realizado</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="99%" height="99%" minHeight={1} minWidth={1}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E8E93' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E8E93' }} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#F2F2F7' }}
                />
                <Bar dataKey="budget" fill="#0071E3" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="spent" fill="#34C759" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="apple-card lg:col-span-4 border-none shadow-sm">
          <h3 className="text-xl font-bold mb-8 text-gray-900 tracking-tight">Distribuição</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="99%" height="99%" minHeight={1} minWidth={1}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Vigentes', value: activeContracts.length },
                    { name: 'Pendentes', value: pendingSignatures.length },
                    { name: 'Rascunhos', value: contracts.filter(c => c.status === 'DRAFT').length },
                  ]}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
             {['Vigentes', 'Pendentes', 'Rascunhos'].map((label, i) => (
               <div key={label} className="flex items-center justify-between p-3.5 bg-[#F5F5F7] rounded-2xl">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                   <span className="text-sm font-semibold text-gray-600">{label}</span>
                 </div>
                 <span className="font-bold text-gray-900">{i === 0 ? activeContracts.length : i === 1 ? pendingSignatures.length : contracts.filter(c => c.status === 'DRAFT').length}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="apple-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Gestão de Contratos Recentes</h3>
            <button onClick={() => navigate('/contracts')} className="text-xs text-[#0071E3] font-bold hover:bg-[#0071E3]/10 px-3 py-1.5 rounded-full transition-colors">Ver todos</button>
          </div>
          <div className="space-y-3">
            {contracts.slice(0, 5).map((contract) => (
              <div 
                key={contract.id} 
                onClick={() => navigate(`/contracts/${contract.id}`)}
                className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white hover:shadow-md border border-gray-100/50 hover:border-gray-200 rounded-[20px] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#0071E3] group-hover:shadow-[0_2px_8px_rgba(0,113,227,0.15)] transition-all">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm group-hover:text-[#0071E3] transition-colors">{contract.number}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{contract.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
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
            <button onClick={() => navigate('/obras')} className="text-xs text-[#0071E3] font-bold hover:bg-[#0071E3]/10 px-3 py-1.5 rounded-full transition-colors">Ver todas</button>
          </div>
          <div className="space-y-6">
            {obras.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm font-medium">Nenhuma obra cadastrada</div>
            ) : (
              obras.slice(0, 4).map((obra, i) => {
                const spent = obra.costs ? obra.costs.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) : 0;
                const progress = Math.min((spent / parseFloat(obra.budget)) * 100, 100);
                return (
                  <div key={i} className="space-y-3 cursor-pointer group p-4 bg-gray-50/30 rounded-[20px] hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all" onClick={() => navigate(`/obras/${obra.id}`)}>
                    <div className="flex justify-between text-sm items-center">
                      <span className="font-bold text-gray-800 group-hover:text-[#0071E3] transition-colors">{obra.name}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold uppercase tracking-widest">CT: {obra.contract.number}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full bg-gradient-to-r from-[#0071E3] to-[#409CFF] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,113,227,0.4)]`} 
                        style={{ width: `${progress || 5}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 uppercase tracking-widest font-bold">Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.budget)}</span>
                      <span className="text-[#0071E3] font-bold bg-[#0071E3]/10 px-2 py-0.5 rounded-full">{progress.toFixed(0)}% CONSUMIDO</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
