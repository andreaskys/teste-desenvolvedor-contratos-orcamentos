import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, HardHat, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/contracts', icon: <FileText size={20} />, label: 'Contratos' },
    { to: '/obras', icon: <HardHat size={20} />, label: 'Obras' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <aside className="w-64 h-screen glass border-r border-gray-200 fixed left-0 top-0 flex flex-col p-4">
      <div className="mb-8 px-4 py-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Growth SaaS
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
      >
        <LogOut size={20} />
        <span className="font-medium">Sair</span>
      </button>
    </aside>
  );
};

export default Sidebar;
