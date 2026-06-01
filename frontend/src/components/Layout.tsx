import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

const Layout: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex w-full overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 lg:pl-72 w-full min-h-screen flex flex-col">
        <div className="p-6 md:p-10 w-full max-w-[1600px] mx-auto flex-1">
          <header className="mb-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white/60 backdrop-blur-md px-8 py-6 rounded-[24px] border border-white/40 shadow-sm relative z-30">
            <div>
              <h2 className="text-gray-500 font-medium text-sm">Bem-vindo de volta,</h2>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-1">{user?.name}</h1>
            </div>
            <div className="flex items-center gap-5">
              <NotificationBell />
              <div className="h-10 w-[1px] bg-gray-200/50 hidden sm:block mx-1" />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user?.company.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#409CFF] flex items-center justify-center text-white text-xl font-bold shadow-[0_8px_20px_rgba(0,113,227,0.2)]">
                {user?.name.charAt(0)}
              </div>
            </div>
          </header>
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
