import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Bell, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Configurações salvas com sucesso no Tenant!');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#0071E3] font-bold text-xs uppercase tracking-[0.2em]">
            <SettingsIcon size={14} />
            <span>Parametrização</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Configurações</h1>
          <p className="text-gray-500 mt-2 max-w-xl">Gerencie as preferências globais e regras de negócio da sua empresa.</p>
        </div>
        <Button 
          onClick={handleSave} 
          isLoading={loading}
          leftIcon={<Save size={18} />}
        >
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar (Local) */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-[#0071E3] font-bold transition-all">
            <Building size={18} /> Dados da Empresa
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-white hover:shadow-sm transition-all font-medium">
            <Bell size={18} /> Notificações & Alertas
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-white hover:shadow-sm transition-all font-medium">
            <Shield size={18} /> Segurança & APIs
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="apple-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Perfil Corporativo (Tenant)</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Razão Social</label>
                <input type="text" defaultValue="Growth Construtora e Incorporadora S/A" className="apple-input w-full max-w-md bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">CNPJ</label>
                <input type="text" defaultValue="42.123.456/0001-89" disabled className="apple-input w-full max-w-md bg-gray-100 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1 font-medium">O CNPJ raiz não pode ser alterado. Entre em contato com o suporte.</p>
              </div>
            </div>
          </div>

          <div className="apple-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Regras de Negócio</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#0071E3] focus:ring-[#0071E3]" />
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-[#0071E3] transition-colors">Aprovação Dupla em Ordens de Compra</p>
                  <p className="text-xs text-gray-500 font-medium">Exigir aprovação de um Manager para O.Cs acima de R$ 10.000,00.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#0071E3] focus:ring-[#0071E3]" />
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-[#0071E3] transition-colors">Alertas Automáticos de Vencimento</p>
                  <p className="text-xs text-gray-500 font-medium">Notificar gestores 30 dias antes do vencimento de qualquer contrato ativo.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
