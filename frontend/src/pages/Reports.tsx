import React from 'react';
import { Download, Filter, FileText, HardHat, TrendingUp } from 'lucide-react';
import Button from '../components/Button';
import api from '../api/client';

const Reports: React.FC = () => {
  const handleExportContracts = async () => {
    try {
      const response = await api.get('/reports/contracts/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contratos-${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Falha ao exportar contratos.');
    }
  };

  const handleExportObras = async () => {
    try {
      const response = await api.get('/reports/obras/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `obras-${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Falha ao exportar obras.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Relatórios</h1>
          <p className="text-gray-500 mt-1 font-medium">Extração de dados e inteligência de negócio.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Filter size={18} />}>
            Filtros Avançados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="apple-card hover:border-blue-200 transition-colors cursor-pointer group" onClick={handleExportContracts}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-50 text-blue-500 rounded-3xl group-hover:bg-blue-500 group-hover:text-white transition-all">
              <FileText size={32} />
            </div>
            <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
              <Download size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Base de Contratos</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Exportação completa de todos os contratos vigentes, rascunhos e encerrados, incluindo valores e datas.
          </p>
        </div>

        <div className="apple-card hover:border-orange-200 transition-colors cursor-pointer group" onClick={handleExportObras}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-orange-50 text-orange-500 rounded-3xl group-hover:bg-orange-500 group-hover:text-white transition-all">
              <HardHat size={32} />
            </div>
            <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
              <Download size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Status de Obras</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Relatório consolidado de progresso físico-financeiro, orçamentos e cronogramas de execução.
          </p>
        </div>
      </div>

      <div className="apple-card bg-gray-900 text-white border-none p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-blue-300 mb-6">
            <TrendingUp size={14} /> Analytics Pro
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Inteligência de Dados</h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Precisa de um dashboard customizado ou integração via API com seu BI? Nossa equipe de engenharia pode configurar webhooks e extrações agendadas para sua empresa.
          </p>
          <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 border-none px-8">
            Solicitar Personalização
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
