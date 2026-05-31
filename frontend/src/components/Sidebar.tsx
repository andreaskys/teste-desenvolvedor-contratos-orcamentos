import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, HardHat, Settings, LogOut, Copy, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

const Sidebar: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/contracts', icon: <FileText size={20} />, label: 'Contratos' },
    { to: '/manager', icon: <BarChart3 size={20} />, label: 'Gerenciador' },
    { to: '/vigentes', icon: <ShieldCheck size={20} />, label: 'Vigentes' },
    { to: '/templates', icon: <Copy size={20} />, label: 'Templates' },
    { to: '/obras', icon: <HardHat size={20} />, label: 'Obras' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 flex flex-col p-6 z-40 bg-white/40 backdrop-blur-2xl border-r border-white/60">
      <div className="mb-10 px-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0071E3] to-[#409CFF] rounded-2xl flex items-center justify-center shadow-[0_4px_14px_rgba(0,113,227,0.3)]">
            <span className="text-white font-black text-xl italic">G</span>
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Growth</span>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-white/80 text-[#0071E3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 font-semibold'
                  : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {React.cloneElement(item.icon as React.ReactElement, { 
                  className: `transition-colors duration-300 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}` 
                })}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all duration-300 font-medium"
      >
        <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
        <span>Sair</span>
      </button>
    </aside>
  );
};

export default Sidebar;
