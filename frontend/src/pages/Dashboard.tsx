import React, { useEffect, useState } from 'react';
import { 
  FileText, HardHat, TrendingUp, Clock, 
  Calendar, CheckCircle, AlertTriangle, DollarSign,
  Plus, BarChart3, PieChart as PieIcon, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/summary');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-gray-400 font-medium animate-pulse tracking-widest text-sm uppercase">Carregando Dashboard...</div>
    </div>
  );

  const { metrics, distributions, recentActivity, latestObras } = data;

  const stats = [
    { label: 'Contratos Vigentes', value: metrics.activeContracts, icon: <FileText className="text-blue-500" />, trend: `de ${metrics.totalContracts} total`, color: 'blue' },
    { label: 'Obras em Curso', value: metrics.totalObras, icon: <HardHat className="text-orange-500" />, trend: 'Status: Ativo', color: 'orange' },
    { label: 'Orcamento Global', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(metrics.totalBudget), icon: <DollarSign className="text-green-500" />, trend: 'Previsto', color: 'green' },
    { label: 'Custo Realizado', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(metrics.totalRealized), icon: <TrendingUp className="text-purple-500" />, trend: 'Acumulado', color: 'purple' },
  ];

  const contractChartData = distributions.contracts.map((d: any) => ({
    name: d.status,
    value: d._count.id
  }));

  const COLORS = ['#0071E3', '#34C759', '#FF9500', '#FF3B30', '#8E8E93'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium text-lg">Consolidado operacional e financeiro do Tenant.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/obras')} leftIcon={<Plus size={18} />}>
            Nova Obra
          </Button>
          <Button onClick={() => navigate('/contracts/new')} leftIcon={<Plus size={18} />}>
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="apple-card border-none bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-gray-50 rounded-[22px] group-hover:scale-110 transition-transform duration-500 shadow-inner">
                {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
              </div>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-gray-50 text-gray-400 uppercase tracking-[0.15em]">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Financial Progress Chart */}
        <div className="lg:col-span-8 apple-card border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-0 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">Evolução de Obras</h3>
              <p className="text-sm text-gray-500 font-medium">Orçado vs. Realizado por projeto</p>
            </div>
            <BarChart3 className="text-gray-300" size={24} />
          </div>
          <div className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributions.obras} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E8E93', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E8E93', fontWeight: 600 }} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                  cursor={{ fill: '#F5F5F7', radius: 10 }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '12px', fontWeight: 700 }} />
                <Bar name="Orçado" dataKey="budget" fill="#0071E3" radius={[8, 8, 0, 0]} barSize={40} />
                <Bar name="Realizado" dataKey="realized" fill="#34C759" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contract Distribution */}
        <div className="lg:col-span-4 apple-card border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col">
          <h3 className="font-bold text-gray-900 text-xl mb-8 tracking-tight flex items-center gap-2">
            <PieIcon size={20} className="text-blue-500" /> Distribuição
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {contractChartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
             {contractChartData.map((item: any, i: number) => (
               <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-[18px]">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{item.name}</span>
                 </div>
                 <span className="font-black text-gray-900 text-sm">{item.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Activity */}
        <div className="apple-card border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-orange-500" /> Atividades Recentes
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>Ver Tudo</Button>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity: any, idx: number) => (
              <div key={idx} className="flex gap-5 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#0071E3] group-hover:bg-[#0071E3] group-hover:text-white transition-all shadow-sm border border-white">
                    <ArrowUpRight size={20} />
                  </div>
                  {idx !== recentActivity.length - 1 && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-50" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#0071E3] transition-colors uppercase tracking-tight">
                    {activity.action.replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{activity.resource}</span>
                    <span className="text-[10px] text-gray-400 font-bold">• {new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Projects */}
        <div className="apple-card border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <HardHat size={20} className="text-purple-500" /> Projetos Recentes
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/obras')}>Gerenciar</Button>
          </div>
          <div className="space-y-4">
            {latestObras.map((obra: any, i: number) => {
              const progress = distributions.obras.find((o: any) => o.name === obra.name)?.percentage || 0;
              return (
                <div 
                  key={i} 
                  className="p-5 bg-gray-50/50 rounded-[28px] hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer border border-transparent hover:border-gray-100 group"
                  onClick={() => navigate(`/obras/${obra.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[#0071E3] transition-colors">{obra.name}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">CT: {obra.contract.number}</p>
                    </div>
                    <span className="p-2 bg-white rounded-xl shadow-sm text-gray-400 group-hover:text-[#0071E3] transition-all">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0071E3] to-[#409CFF] rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(progress, 100)}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Progresso</span>
                    <span className="text-[10px] font-black text-[#0071E3]">{progress.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
