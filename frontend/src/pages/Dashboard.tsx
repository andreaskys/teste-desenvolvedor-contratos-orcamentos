import React from 'react';
import { FileText, HardHat, TrendingUp, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Contratos Ativos', value: '12', icon: <FileText className="text-blue-500" />, trend: '+2 este mês' },
    { label: 'Obras em Andamento', value: '4', icon: <HardHat className="text-orange-500" />, trend: 'Em dia' },
    { label: 'Valor Total', value: 'R$ 1.2M', icon: <TrendingUp className="text-green-500" />, trend: '+15%' },
    { label: 'Vencimentos Proximos', value: '3', icon: <Clock className="text-red-500" />, trend: 'Atenção' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="apple-card hover:shadow-md transition-shadow cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
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
          <h3 className="text-lg font-bold mb-6">Contratos Recentes</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                    <FileText size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Contrato 00{i+1}/2024</p>
                    <p className="text-xs text-gray-500">Empresa Parceira LTDA</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">Ativo</span>
              </div>
            ))}
          </div>
        </div>

        <div className="apple-card">
          <h3 className="text-lg font-bold mb-6">Status das Obras</h3>
          <div className="space-y-6">
            {[
              { name: 'Edifício Central', progress: 75 },
              { name: 'Residencial Aurora', progress: 30 },
              { name: 'Shopping Sul', progress: 10 },
            ].map((obra, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{obra.name}</span>
                  <span className="text-gray-500">{obra.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${obra.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
