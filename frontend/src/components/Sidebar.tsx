import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, HardHat, Settings, 
  LogOut, Copy, ShieldCheck, PenTool, Plus,
  ShoppingCart, LineChart, Users
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

const Sidebar: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 flex flex-col z-40 bg-white/40 backdrop-blur-2xl border-r border-white/60 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="p-6 pb-2 sticky top-0 bg-white/40 backdrop-blur-2xl z-10">
        <div className="mb-6 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0071E3] to-[#409CFF] rounded-2xl flex items-center justify-center shadow-[0_4px_14px_rgba(0,113,227,0.3)]">
              <span className="text-white font-black text-xl italic">G</span>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Growth</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-6 pb-8">
        
        {/* GROUP 1: Contratos & Assinaturas */}
        <div>
          <p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Contratos & Assinaturas</p>
          <div className="space-y-1">
            <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><LayoutDashboard size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Dashboard Principal</span></>)}
            </NavLink>
            <NavLink to="/contracts" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><FileText size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Contratos</span></>)}
            </NavLink>
            <NavLink to="/templates" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><Copy size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Templates</span></>)}
            </NavLink>
            <NavLink to="/contracts/new" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><Plus size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Novo Contrato</span></>)}
            </NavLink>
            <NavLink to="/assinaturas" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><PenTool size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Assinaturas</span></>)}
            </NavLink>
            <NavLink to="/manager" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><ShieldCheck size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Gerenciador Ativos</span></>)}
            </NavLink>
          </div>
        </div>

        {/* GROUP 2: Obras & Configurações */}
        <div>
          <p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Obras & Configurações</p>
          <div className="space-y-1">
            <NavLink to="/obras" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><HardHat size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Obras</span></>)}
            </NavLink>
            <NavLink to="/purchase-orders" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><ShoppingCart size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Ordens de Compra</span></>)}
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><LineChart size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Relatórios</span></>)}
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><Settings size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Parametrização</span></>)}
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'}`}>
              {({ isActive }) => (<><Users size={18} className={`transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} /><span>Gestão de Usuários</span></>)}
            </NavLink>
          </div>
        </div>

      </nav>

      <div className="p-6 pt-0 mt-auto sticky bottom-0 bg-white/40 backdrop-blur-2xl z-10 border-t border-gray-100/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all duration-300 font-medium group"
        >
          <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
